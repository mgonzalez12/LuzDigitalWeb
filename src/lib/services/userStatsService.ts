import { supabase } from '../supabase';

export interface ActivityItem {
  type: 'read' | 'bookmark' | 'favorite';
  at: string;
  version_code: string;
  book_slug: string;
  chapter_number: number;
  verse_number?: number;
  label: string;
  badge: string;
  color: string;
}

export interface BookInfo {
  name: string;
  testament: string;
}

/**
 * Servicio para estadísticas y actividad del usuario
 */
export class UserStatsService {
  /**
   * Obtiene los días de lectura del usuario (para estadísticas)
   */
  static async getReadingDays(userId: string, limit: number = 120): Promise<Array<{ day: string }>> {
    const { data, error } = await supabase
      .from('user_reading_days')
      .select('day')
      .eq('user_id', userId)
      .order('day', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching reading days:', error);
      return [];
    }

    return (data ?? []) as Array<{ day: string }>;
  }

  /**
   * Obtiene el conteo de capítulos leídos por el usuario en una versión específica
   */
  static async getChaptersReadCount(
    userId: string,
    versionCode: string
  ): Promise<number> {
    const { count, error } = await supabase
      .from('user_chapter_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('version_code', versionCode);

    if (error) {
      console.error('Error fetching chapters read count:', error);
      return 0;
    }

    return count ?? 0;
  }

  /**
   * Obtiene el conteo total de capítulos en una versión específica
   */
  static async getTotalChaptersCount(versionCode: string): Promise<number> {
    const { count, error } = await supabase
      .from('bible_chapters')
      .select('*', { count: 'exact', head: true })
      .eq('version_code', versionCode);

    if (error) {
      console.error('Error fetching total chapters count:', error);
      return 0;
    }

    return count ?? 0;
  }

  /**
   * Obtiene el conteo de versículos guardados (bookmarks) del usuario
   */
  static async getBookmarksCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('user_verse_bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching bookmarks count:', error);
      return 0;
    }

    return count ?? 0;
  }

  /**
   * Obtiene la actividad reciente del usuario (lecturas, bookmarks, favoritos)
   */
  static async getRecentActivity(userId: string): Promise<{
    reads: Array<{
      version_code: string;
      book_slug: string;
      chapter_number: number;
      last_read_at: string;
    }>;
    bookmarks: Array<{
      version_code: string;
      book_slug: string;
      chapter_number: number;
      verse_number: number;
      created_at: string;
    }>;
    favorites: Array<{
      version_code: string;
      book_slug: string;
      chapter_number: number;
      created_at: string;
    }>;
  }> {
    const [readsResult, bookmarksResult, favoritesResult] = await Promise.all([
      supabase
        .from('user_chapter_progress')
        .select('version_code,book_slug,chapter_number,last_read_at')
        .eq('user_id', userId)
        .order('last_read_at', { ascending: false })
        .limit(10),
      supabase
        .from('user_verse_bookmarks')
        .select('version_code,book_slug,chapter_number,verse_number,created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('user_chapter_favorites')
        .select('version_code,book_slug,chapter_number,created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    return {
      reads: (readsResult.data ?? []) as Array<{
        version_code: string;
        book_slug: string;
        chapter_number: number;
        last_read_at: string;
      }>,
      bookmarks: (bookmarksResult.data ?? []) as Array<{
        version_code: string;
        book_slug: string;
        chapter_number: number;
        verse_number: number;
        created_at: string;
      }>,
      favorites: (favoritesResult.data ?? []) as Array<{
        version_code: string;
        book_slug: string;
        chapter_number: number;
        created_at: string;
      }>,
    };
  }

  /**
   * Obtiene información de libros bíblicos (nombre, testamento) por versión
   */
  static async getBooksInfo(
    versionCodes: string[]
  ): Promise<Map<string, BookInfo>> {
    if (versionCodes.length === 0) {
      return new Map();
    }

    const { data, error } = await supabase
      .from('bible_books')
      .select('version_code,slug,name,testament')
      .in('version_code', versionCodes);

    if (error) {
      console.error('Error fetching books info:', error);
      return new Map();
    }

    return new Map(
      (data ?? []).map((b: any) => [
        `${b.version_code}:${b.slug}`,
        { name: b.name, testament: b.testament },
      ])
    );
  }
}
