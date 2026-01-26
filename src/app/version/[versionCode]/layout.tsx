import { createMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

interface Props {
  params: Promise<{
    versionCode: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { versionCode } = await params;
  
  let versionName = versionCode.toUpperCase();

  try {
    const { data: versionData } = await supabase
      .from('bible_versions')
      .select('name')
      .eq('code', versionCode)
      .maybeSingle();

    if (versionData?.name) {
      versionName = versionData.name;
    }
  } catch (error) {
    console.error('Error fetching version data for SEO:', error);
  }

  const title = `Biblioteca - ${versionName}`;
  const description = `Explora todos los libros de la Biblia en la versión ${versionName}. Navega por el Antiguo y Nuevo Testamento con una interfaz moderna y elegante.`;
  
  return createMetadata({
    title,
    description,
    keywords: [
      `Biblia ${versionName}`,
      'biblioteca bíblica',
      'libros de la biblia',
      'antiguo testamento',
      'nuevo testamento',
      versionCode.toLowerCase(),
    ],
    url: `/version/${versionCode}`,
  });
}

export default function VersionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
