import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luzdigitals.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/comunidad`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/busqueda`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Obtener todas las versiones de la Biblia
  let versionPages: MetadataRoute.Sitemap = [];
  try {
    const { data: versions } = await supabase
      .from('bible_versions')
      .select('code')
      .order('code', { ascending: true });

    if (versions && versions.length > 0) {
      versionPages = versions.map((version) => ({
        url: `${baseUrl}/version/${version.code}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Error fetching versions for sitemap:', error);
  }

  // Obtener todos los capítulos de la Biblia para las páginas de lectura
  let chapterPages: MetadataRoute.Sitemap = [];
  try {
    const { data: chapters } = await supabase
      .from('bible_chapters')
      .select('version_code, book_slug, chapter_number')
      .order('version_code', { ascending: true })
      .limit(50000); // Limitar para evitar sitemaps demasiado grandes

    if (chapters && chapters.length > 0) {
      // Agrupar por versión y libro para optimizar
      const uniqueChapters = new Map<string, { version: string; book: string; chapter: number }>();
      
      chapters.forEach((chapter) => {
        const key = `${chapter.version_code}-${chapter.book_slug}-${chapter.chapter_number}`;
        if (!uniqueChapters.has(key)) {
          uniqueChapters.set(key, {
            version: chapter.version_code,
            book: chapter.book_slug,
            chapter: chapter.chapter_number,
          });
        }
      });

      chapterPages = Array.from(uniqueChapters.values()).map((item) => ({
        url: `${baseUrl}/leer/${item.version}/${item.book}/${item.chapter}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Error fetching chapters for sitemap:', error);
  }

  // Combinar todas las páginas
  return [...staticPages, ...versionPages, ...chapterPages];
}
