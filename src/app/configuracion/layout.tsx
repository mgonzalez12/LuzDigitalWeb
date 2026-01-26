import { createMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Configuración - Personaliza tu Experiencia',
  description: 'Personaliza tu experiencia de lectura bíblica. Configura tu versión preferida, recordatorios, sonidos ambientales y más en Luz Digital.',
  keywords: [
    'configuración bíblica',
    'preferencias lectura',
    'ajustes bíblicos',
    'personalización',
    'configuración usuario',
  ],
  url: '/configuracion',
  noindex: true,
});

export default function ConfiguracionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
