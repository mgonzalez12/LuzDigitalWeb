import { createMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Comunidad - Conecta con Otros Creyentes',
  description: 'Próximamente: Únete a nuestra comunidad de creyentes para compartir reflexiones, discusiones bíblicas y conectar con otros en tu fe.',
  keywords: [
    'comunidad cristiana',
    'foro bíblico',
    'discusión bíblica',
    'compartir reflexiones',
    'fe cristiana',
    'comunidad de creyentes',
  ],
  url: '/comunidad',
});

export default function ComunidadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
