import { createMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Iniciar Sesión - Luz Digital',
  description: 'Inicia sesión en Luz Digital para acceder a tu progreso de lectura, favoritos, marcadores y todas las funciones personalizadas.',
  keywords: [
    'iniciar sesión',
    'login bíblico',
    'acceso usuario',
    'cuenta bíblica',
  ],
  url: '/login',
  noindex: true,
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
