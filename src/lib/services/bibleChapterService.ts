import { supabase } from '../supabase';

export interface ChapterData {
  book_name: string;
  chapter_number: number;
  image_url?: string | null;
}

/**
 * Servicio para consultas relacionadas con capítulos bíblicos
 */
export class BibleChapterService {
  /**
   * Obtiene información de un capítulo específico
   */
  static async getChapterData(
    versionCode: string,
    bookSlug: string,
    chapterNumber: number
  ): Promise<ChapterData | null> {
    const { data, error } = await supabase
      .from('bible_chapters')
      .select('book_name, chapter_number, image_url')
      .eq('version_code', versionCode)
      .eq('book_slug', bookSlug)
      .eq('chapter_number', chapterNumber)
      .maybeSingle();

    if (error) {
      console.error('Error fetching chapter data:', error);
      return null;
    }

    return data;
  }

  /**
   * Obtiene solo la URL de la imagen de un capítulo
   */
  static async getChapterImageUrl(
    versionCode: string,
    bookSlug: string,
    chapterNumber: number
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from('bible_chapters')
      .select('image_url')
      .eq('version_code', versionCode)
      .eq('book_slug', bookSlug)
      .eq('chapter_number', chapterNumber)
      .maybeSingle();

    if (error) {
      console.error('Error fetching chapter image:', error);
      return null;
    }

    return data?.image_url ?? null;
  }
}
