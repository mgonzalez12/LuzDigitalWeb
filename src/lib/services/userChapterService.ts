import { supabase } from '../supabase';

/**
 * Servicio para operaciones de usuario relacionadas con capítulos
 * (favoritos, lectura, bookmarks)
 */
export class UserChapterService {
  /**
   * Alterna el estado de favorito de un capítulo
   * @returns true si el capítulo es favorito después de la operación, false si no
   */
  static async toggleChapterFavorite(
    userId: string,
    versionCode: string,
    bookSlug: string,
    chapterNumber: number
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('toggle_chapter_favorite', {
      p_version_code: versionCode,
      p_book_slug: bookSlug,
      p_chapter_number: chapterNumber,
    });

    if (error) {
      console.error('Error toggling chapter favorite:', error);
      return false;
    }

    return !!data;
  }

  /**
   * Marca un capítulo como leído
   */
  static async markChapterAsRead(
    userId: string,
    versionCode: string,
    bookSlug: string,
    chapterNumber: number
  ): Promise<void> {
    const { error } = await supabase.rpc('mark_chapter_read', {
      p_version_code: versionCode,
      p_book_slug: bookSlug,
      p_chapter_number: chapterNumber,
    });

    if (error) {
      console.error('Error marking chapter as read:', error);
      throw error;
    }
  }

  /**
   * Alterna el bookmark de un versículo
   * @returns true si el versículo está marcado después de la operación, false si no
   */
  static async toggleVerseBookmark(
    userId: string,
    versionCode: string,
    bookSlug: string,
    chapterNumber: number,
    verseNumber: number
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('toggle_verse_bookmark', {
      p_version_code: versionCode,
      p_book_slug: bookSlug,
      p_chapter_number: chapterNumber,
      p_verse_number: verseNumber,
    });

    if (error) {
      console.error('Error toggling verse bookmark:', error);
      return false;
    }

    return !!data;
  }

  /**
   * Obtiene el estado de favorito de un capítulo
   */
  static async getChapterFavoriteStatus(
    userId: string,
    versionCode: string,
    bookSlug: string,
    chapterNumber: number
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_chapter_favorites')
      .select('chapter_number')
      .eq('user_id', userId)
      .eq('version_code', versionCode)
      .eq('book_slug', bookSlug)
      .eq('chapter_number', chapterNumber)
      .maybeSingle();

    if (error) {
      console.error('Error fetching chapter favorite status:', error);
      return false;
    }

    return !!data;
  }

  /**
   * Obtiene los versículos marcados (bookmarks) de un capítulo
   */
  static async getChapterBookmarkedVerses(
    userId: string,
    versionCode: string,
    bookSlug: string,
    chapterNumber: number
  ): Promise<Set<number>> {
    const { data, error } = await supabase
      .from('user_verse_bookmarks')
      .select('verse_number')
      .eq('user_id', userId)
      .eq('version_code', versionCode)
      .eq('book_slug', bookSlug)
      .eq('chapter_number', chapterNumber);

    if (error) {
      console.error('Error fetching bookmarked verses:', error);
      return new Set();
    }

    return new Set(data?.map((row) => row.verse_number) ?? []);
  }

  /**
   * Obtiene el estado de lectura de un capítulo
   */
  static async getChapterReadStatus(
    userId: string,
    versionCode: string,
    bookSlug: string,
    chapterNumber: number
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_chapter_progress')
      .select('reads_count')
      .eq('user_id', userId)
      .eq('version_code', versionCode)
      .eq('book_slug', bookSlug)
      .eq('chapter_number', chapterNumber)
      .maybeSingle();

    if (error) {
      console.error('Error fetching chapter read status:', error);
      return false;
    }

    return (data?.reads_count ?? 0) > 0;
  }

  /**
   * Obtiene toda la información del estado del usuario para un capítulo
   * (favorito, leído, bookmarks) en una sola consulta
   */
  static async getChapterUserState(
    userId: string,
    versionCode: string,
    bookSlug: string,
    chapterNumber: number
  ): Promise<{
    isFavorite: boolean;
    isRead: boolean;
    bookmarkedVerses: Set<number>;
  }> {
    const [favoriteData, bookmarkData, progressData] = await Promise.all([
      supabase
        .from('user_chapter_favorites')
        .select('chapter_number')
        .eq('user_id', userId)
        .eq('version_code', versionCode)
        .eq('book_slug', bookSlug)
        .eq('chapter_number', chapterNumber)
        .maybeSingle(),
      supabase
        .from('user_verse_bookmarks')
        .select('verse_number')
        .eq('user_id', userId)
        .eq('version_code', versionCode)
        .eq('book_slug', bookSlug)
        .eq('chapter_number', chapterNumber),
      supabase
        .from('user_chapter_progress')
        .select('reads_count')
        .eq('user_id', userId)
        .eq('version_code', versionCode)
        .eq('book_slug', bookSlug)
        .eq('chapter_number', chapterNumber)
        .maybeSingle(),
    ]);

    return {
      isFavorite: !!favoriteData.data,
      isRead: (progressData.data?.reads_count ?? 0) > 0,
      bookmarkedVerses: new Set(
        bookmarkData.data?.map((row) => row.verse_number) ?? []
      ),
    };
  }
}
