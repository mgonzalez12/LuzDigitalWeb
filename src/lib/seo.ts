import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luzdigital.app';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

export function createMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  noindex = false,
}: SEOProps): Metadata {
  const fullTitle = title.includes('Luz Digital') ? title : `${title} | Luz Digital`;
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const ogImage = image || `${baseUrl}/og-image.jpg`;
  
  const defaultKeywords = [
    'Biblia',
    'lectura bíblica',
    'cristiano',
    'espiritualidad',
    'Biblia digital',
    'versículos bíblicos',
    'estudio bíblico',
    'fe cristiana',
  ];

  const allKeywords = [...defaultKeywords, ...keywords].join(', ');

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: 'Luz Digital' }],
    creator: 'Luz Digital',
    publisher: 'Luz Digital',
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: 'Luz Digital',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'es_ES',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: '@luzdigital',
    },
    alternates: {
      canonical: fullUrl,
    },
    other: {
      'theme-color': '#0a0a0f',
    },
  };
}
