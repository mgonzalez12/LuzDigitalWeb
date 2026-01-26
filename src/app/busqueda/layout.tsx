import { createMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Búsqueda de Versículos Bíblicos',
  description: 'Busca versículos, pasajes y referencias bíblicas en múltiples versiones. Encuentra la Palabra que necesitas con nuestra herramienta de búsqueda avanzada.',
  keywords: [
    'buscar versículos',
    'búsqueda bíblica',
    'versículos bíblicos',
    'referencias bíblicas',
    'buscar en la biblia',
    'pasajes bíblicos',
  ],
  url: '/busqueda',
});

export default function BusquedaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
