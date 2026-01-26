import { createMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Registrarse - Crear Cuenta en Luz Digital',
  description: 'Crea tu cuenta gratuita en Luz Digital y comienza tu viaje espiritual. Accede a herramientas de lectura, seguimiento de progreso y más.',
  keywords: [
    'registro bíblico',
    'crear cuenta',
    'registrarse',
    'cuenta gratuita',
    'nuevo usuario',
  ],
  url: '/registro',
  noindex: true,
});

export default function RegistroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
