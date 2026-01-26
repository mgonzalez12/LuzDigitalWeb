import { createMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Mis Marcadores - Versículos Guardados',
  description: 'Gestiona tus versículos marcados y guardados. Organiza tus pasajes favoritos para acceso rápido y estudio personal.',
  keywords: [
    'marcadores bíblicos',
    'versículos guardados',
    'marcadores personales',
    'versículos marcados',
    'pasajes guardados',
  ],
  url: '/marcadores',
  noindex: true,
});

export default function MarcadoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
