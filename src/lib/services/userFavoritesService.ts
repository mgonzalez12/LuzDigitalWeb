import { supabase } from '../supabase';

export interface FavoriteRow {
  user_id: string;
  version_code: string;
  book_slug: string;
  chapter_number: number;
  created_at: string;
}

export interface BookMeta {
  version_code: string;
  slug: string;
  name: string;
  testament: 'old' | 'new';
  chapter_count: number;
}

export interface ChapterData {
  testament: string;
  name: string;
  num_chapters: number;
  chapter: number;
  vers: Array<{ number: number; verse: string }>;
}

/**
 * Servicio para operaciones relacionadas con favoritos del usuario
 */
export class UserFavoritesService {
  /**
   * Obtiene todos los favoritos del usuario
   */
  static async getUserFavorites(userId: string): Promise<FavoriteRow[]> {
    const { data, error } = await supabase
      .from('user_chapter_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user favorites:', error);
      return [];
    }

    return (data ?? []) as FavoriteRow[];
  }

  /**
   * Obtiene metadata de libros para las versiones especificadas
   */
  static async getBooksMeta(versionCodes: string[]): Promise<Map<string, BookMeta>> {
    if (versionCodes.length === 0) {
      return new Map();
    }

    const { data, error } = await supabase
      .from('bible_books')
      .select('version_code,slug,name,testament,chapter_count')
      .in('version_code', versionCodes);

    if (error) {
      console.error('Error fetching books meta:', error);
      return new Map();
    }

    return new Map(
      (data ?? []).map((b: any) => [`${b.version_code}:${b.slug}`, b as BookMeta])
    );
  }

  /**
   * Obtiene datos de capítulos en paralelo desde la API externa
   * Esto es mucho más rápido que hacerlo secuencialmente
   */
  static async getChaptersData(
    favorites: FavoriteRow[],
    signal?: AbortSignal
  ): Promise<Map<string, ChapterData>> {
    // Crear claves únicas para evitar fetches duplicados
    const keys = favorites.map(
      (r) => `${r.version_code}:${r.book_slug}:${r.chapter_number}`
    );
    const uniqueKeys = Array.from(new Set(keys));

    // Hacer todos los fetches en paralelo
    const fetchPromises = uniqueKeys.map(async (key) => {
      const [v, b, ch] = key.split(':');
      try {
        const res = await fetch(`https://bible-api.deno.dev/api/read/${v}/${b}/${ch}`, {
          signal,
        });
        if (!res.ok) return null;
        const data = (await res.json()) as ChapterData;
        return { key, data };
      } catch (error) {
        // Ignorar errores (puede ser abortado o fallar)
        return null;
      }
    });

    const results = await Promise.all(fetchPromises);
    const cache = new Map<string, ChapterData>();

    results.forEach((result) => {
      if (result) {
        cache.set(result.key, result.data);
      }
    });

    return cache;
  }

  /**
   * Elimina un favorito
   */
  static async deleteFavorite(
    userId: string,
    versionCode: string,
    bookSlug: string,
    chapterNumber: number
  ): Promise<void> {
    const { error } = await supabase
      .from('user_chapter_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('version_code', versionCode)
      .eq('book_slug', bookSlug)
      .eq('chapter_number', chapterNumber);

    if (error) {
      console.error('Error deleting favorite:', error);
      throw error;
    }
  }

  /**
   * Obtiene favoritos con toda la información necesaria en una sola llamada optimizada
   */
  static async getFavoritesWithData(
    userId: string,
    signal?: AbortSignal
  ): Promise<{
    favorites: FavoriteRow[];
    booksMeta: Map<string, BookMeta>;
    chapterCache: Map<string, ChapterData>;
  }> {
    // Obtener favoritos
    const favorites = await this.getUserFavorites(userId);

    if (favorites.length === 0) {
      return {
        favorites: [],
        booksMeta: new Map(),
        chapterCache: new Map(),
      };
    }

    // Obtener versiones únicas
    const versions = Array.from(new Set(favorites.map((r) => r.version_code)));

    // Hacer ambas consultas en paralelo
    const [booksMeta, chapterCache] = await Promise.all([
      this.getBooksMeta(versions),
      this.getChaptersData(favorites, signal),
    ]);

    return {
      favorites,
      booksMeta,
      chapterCache,
    };
  }
}
