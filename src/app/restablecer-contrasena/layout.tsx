import { createMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Restablecer Contraseña - Luz Digital',
  description: 'Establece una nueva contraseña para tu cuenta de Luz Digital.',
  keywords: [
    'restablecer contraseña',
    'nueva contraseña',
    'cambiar contraseña',
  ],
  url: '/restablecer-contrasena',
  noindex: true,
});

export default function RestablecerContrasenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
