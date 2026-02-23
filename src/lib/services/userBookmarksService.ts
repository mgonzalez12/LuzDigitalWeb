import { supabase } from '../supabase';
import { CacheService } from './cacheService';

export interface BookmarkRow {
  user_id: string;
  version_code: string;
  book_slug: string;
  chapter_number: number;
  verse_number: number;
  note: string | null;
  created_at: string;
}

export interface BookMeta {
  version_code: string;
  slug: string;
  name: string;
  testament: 'old' | 'new';
}

export interface ChapterData {
  testament: string;
  name: string;
  num_chapters: number;
  chapter: number;
  vers: Array<{ number: number; verse: string }>;
}

type BookmarksWithData = {
  bookmarks: BookmarkRow[];
  booksMeta: Map<string, BookMeta>;
  chapterCache: Map<string, ChapterData>;
};

type BookmarksWithDataRaw = {
  bookmarks: BookmarkRow[];
  booksMeta: [string, BookMeta][];
  chapterCache: [string, ChapterData][];
};

function toRaw(d: BookmarksWithData): BookmarksWithDataRaw {
  return {
    bookmarks: d.bookmarks,
    booksMeta: Array.from(d.booksMeta.entries()),
    chapterCache: Array.from(d.chapterCache.entries()),
  };
}

function fromRaw(r: BookmarksWithDataRaw): BookmarksWithData {
  return {
    bookmarks: r.bookmarks,
    booksMeta: new Map(r.booksMeta),
    chapterCache: new Map(r.chapterCache),
  };
}

function cacheKey(userId: string) {
  return `bookmarks_${userId}`;
}

export class UserBookmarksService {
  static async getUserBookmarks(userId: string): Promise<BookmarkRow[]> {
    const { data, error } = await supabase
      .from('user_verse_bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user bookmarks:', error);
      return [];
    }

    return (data ?? []) as BookmarkRow[];
  }

  static async getBooksMeta(versionCodes: string[]): Promise<Map<string, BookMeta>> {
    if (versionCodes.length === 0) return new Map();

    const { data, error } = await supabase
      .from('bible_books')
      .select('version_code,slug,name,testament')
      .in('version_code', versionCodes);

    if (error) {
      console.error('Error fetching books meta:', error);
      return new Map();
    }

    return new Map(
      (data ?? []).map((b: any) => [`${b.version_code}:${b.slug}`, b as BookMeta])
    );
  }

  static async getChaptersData(
    bookmarks: BookmarkRow[],
    signal?: AbortSignal
  ): Promise<Map<string, ChapterData>> {
    const keys = bookmarks.map(
      (r) => `${r.version_code}:${r.book_slug}:${r.chapter_number}`
    );
    const uniqueKeys = Array.from(new Set(keys));

    const fetchPromises = uniqueKeys.map(async (key) => {
      const [v, b, ch] = key.split(':');
      try {
        const res = await fetch(`https://bible-api.deno.dev/api/read/${v}/${b}/${ch}`, { signal });
        if (!res.ok) return null;
        const data = (await res.json()) as ChapterData;
        return { key, data };
      } catch {
        return null;
      }
    });

    const results = await Promise.all(fetchPromises);
    const cache = new Map<string, ChapterData>();
    results.forEach((r) => { if (r) cache.set(r.key, r.data); });
    return cache;
  }

  static async deleteBookmark(
    userId: string,
    versionCode: string,
    bookSlug: string,
    chapterNumber: number,
    verseNumber: number
  ): Promise<void> {
    const { error } = await supabase
      .from('user_verse_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('version_code', versionCode)
      .eq('book_slug', bookSlug)
      .eq('chapter_number', chapterNumber)
      .eq('verse_number', verseNumber);

    if (error) {
      console.error('Error deleting bookmark:', error);
      throw error;
    }

    CacheService.invalidate(cacheKey(userId));
  }

  /**
   * Obtiene marcadores con caché en memoria.
   * Devuelve caché instantáneamente y re-valida en background.
   */
  static async getBookmarksWithData(
    userId: string,
    signal?: AbortSignal
  ): Promise<BookmarksWithData> {
    const cached = CacheService.get<BookmarksWithDataRaw>(cacheKey(userId));
    if (cached) {
      this.revalidateInBackground(userId);
      return fromRaw(cached);
    }

    const result = await this.fetchFresh(userId, signal);
    CacheService.set(cacheKey(userId), toRaw(result));
    return result;
  }

  static invalidateCache(userId: string) {
    CacheService.invalidate(cacheKey(userId));
  }

  private static async fetchFresh(
    userId: string,
    signal?: AbortSignal
  ): Promise<BookmarksWithData> {
    const bookmarks = await this.getUserBookmarks(userId);

    if (bookmarks.length === 0) {
      return { bookmarks: [], booksMeta: new Map(), chapterCache: new Map() };
    }

    const versions = Array.from(new Set(bookmarks.map((r) => r.version_code)));

    const [booksMeta, chapterCache] = await Promise.all([
      this.getBooksMeta(versions),
      this.getChaptersData(bookmarks, signal),
    ]);

    return { bookmarks, booksMeta, chapterCache };
  }

  private static async revalidateInBackground(userId: string) {
    try {
      const fresh = await this.fetchFresh(userId);
      const cached = CacheService.get<BookmarksWithDataRaw>(cacheKey(userId));

      const cachedCount = cached?.bookmarks?.length ?? -1;
      if (fresh.bookmarks.length !== cachedCount) {
        CacheService.set(cacheKey(userId), toRaw(fresh));
        window.dispatchEvent(new CustomEvent('luz:bookmarks-updated'));
      }
    } catch {
      // Background revalidation falló, no pasa nada
    }
  }
}
