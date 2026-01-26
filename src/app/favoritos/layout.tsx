import { createMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Mis Favoritos - Capítulos Guardados',
  description: 'Revisa y gestiona tus capítulos bíblicos favoritos. Accede rápidamente a los pasajes que más te inspiran en tu fe.',
  keywords: [
    'favoritos bíblicos',
    'capítulos favoritos',
    'versículos guardados',
    'pasajes favoritos',
    'marcadores bíblicos',
  ],
  url: '/favoritos',
  noindex: true,
});

export default function FavoritosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
