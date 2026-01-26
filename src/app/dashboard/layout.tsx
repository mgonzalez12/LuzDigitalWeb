import { createMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Dashboard - Mi Progreso de Lectura',
  description: 'Gestiona tu progreso de lectura bíblica, revisa tus estadísticas, logros y continúa tu plan de lectura en Luz Digital.',
  keywords: [
    'dashboard bíblico',
    'progreso lectura',
    'estadísticas bíblicas',
    'plan de lectura',
    'racha de lectura',
    'logros bíblicos',
  ],
  url: '/dashboard',
  noindex: true, // Dashboard es privado, no indexar
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
