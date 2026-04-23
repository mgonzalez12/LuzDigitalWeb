import { createMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Recuperar Contraseña - Luz Digital',
  description: 'Recupera el acceso a tu cuenta de Luz Digital. Te enviaremos un correo con instrucciones para restablecer tu contraseña.',
  keywords: [
    'recuperar contraseña',
    'olvidé contraseña',
    'restablecer acceso',
    'recuperación cuenta',
  ],
  url: '/recuperar-contrasena',
  noindex: true,
});

export default function RecuperarContrasenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
