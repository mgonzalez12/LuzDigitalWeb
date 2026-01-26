import { createMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { BibleChapterService } from '@/lib/services/bibleChapterService';

interface Props {
  params: Promise<{
    version: string;
    libro: string;
    capitulo: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { version, libro, capitulo } = await params;
  
  // Obtener información del capítulo desde la base de datos
  let bookName = libro;
  let chapterNumber = capitulo;
  let imageUrl: string | undefined;

  try {
    const chapterData = await BibleChapterService.getChapterData(
      version,
      libro,
      parseInt(capitulo)
    );

    if (chapterData) {
      bookName = chapterData.book_name || libro;
      chapterNumber = String(chapterData.chapter_number);
      imageUrl = chapterData.image_url || undefined;
    }
  } catch (error) {
    console.error('Error fetching chapter data for SEO:', error);
  }

  const title = `${bookName} ${chapterNumber} - ${version.toUpperCase()}`;
  const description = `Lee ${bookName} capítulo ${chapterNumber} en ${version.toUpperCase()}. Accede a versículos bíblicos completos con una experiencia de lectura moderna y elegante.`;
  
  return createMetadata({
    title,
    description,
    keywords: [
      `${bookName} ${chapterNumber}`,
      `Biblia ${version.toUpperCase()}`,
      'versículos bíblicos',
      'lectura bíblica',
      'capítulo bíblico',
      'estudio bíblico',
      bookName.toLowerCase(),
    ],
    url: `/leer/${version}/${libro}/${capitulo}`,
    type: 'article',
    image: imageUrl,
  });
}

export default function LeerCapituloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
