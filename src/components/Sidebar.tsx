'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { VersionSelectorModal } from './VersionSelectorModal';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logout } from '@/lib/features/authSlice';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar sidebar al cambiar de ruta (solo en móvil/tablet)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevenir scroll del body cuando el sidebar está abierto en móvil
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    await dispatch(logout());
    setIsOpen(false);
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Biblioteca', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', isButton: true },
    { href: '/busqueda', label: 'Búsqueda', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { href: '/perfil', label: 'Perfil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { href: '/marcadores', label: 'Marcadores', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
    { href: '/favoritos', label: 'Favoritos', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0a1 1 0 00.95.69h.999c.969 0 1.371 1.24.588 1.81l-.809.588a1 1 0 00-.364 1.118l.309.951c.3.921-.755 1.688-1.538 1.118l-.809-.588a1 1 0 00-1.176 0l-.809.588c-.783.57-1.838-.197-1.538-1.118l.309-.951a1 1 0 00-.364-1.118l-.809-.588c-.783-.57-.38-1.81.588-1.81h.999a1 1 0 00.95-.69z M12 14l.6 1.8H15l-1.95 1.2.75 2.1L12 17.7 10.2 19.1l.75-2.1L9 15.8h2.4L12 14z' },
  ];

  return (
    <>
      {/* Botón Hamburger - Solo visible en tablet y móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-700/50 text-white hover:bg-slate-800 transition-all shadow-lg"
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay oscuro - Solo en móvil/tablet cuando está abierto */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-0 h-screen w-64 flex flex-col z-40
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: 'linear-gradient(to bottom, #1e293b, #0f172a)',
          backgroundImage: `
            linear-gradient(to bottom, #1e293b, #0f172a),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(30, 41, 59, 0.4) 2px,
              rgba(30, 41, 59, 0.4) 4px
            )
          `,
          backgroundBlendMode: 'normal',
          borderRight: '1px solid rgba(30, 41, 59, 0.5)'
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/prueba_logo_luzDigital_sin_fondo.png"
              alt="Luz Digital"
              className="flex-shrink-0"
              style={{
                width: '60px !important',
                height: '60px !important',
                minWidth: '60px',
                minHeight: '60px',
                maxWidth: '60px',
                maxHeight: '60px',
                objectFit: 'contain',
                display: 'block',
                flexShrink: 0
              }}
            />
            <div>
              <div className="text-sm font-bold text-white">Luz Digital</div>
              <div className="text-xs text-slate-400">LECTOR WEB</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {navItems.map((item, index) => {
            if (item.isButton && item.label === 'Biblioteca') {
              // Botón especial para Biblioteca que abre el modal
              // Está activo si estamos en rutas /version/* o /leer/*
              const isLibraryActive = pathname?.startsWith('/version/') || pathname?.startsWith('/leer/') || pathname?.startsWith('/v/');
            
            return (
              <button
                key={`library-${index}`}
                onClick={() => setIsLibraryModalOpen(true)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isLibraryActive
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          }

          // Links normales para otros items
          const isActive = item.href && (pathname === item.href || pathname?.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href || `nav-${index}`}
              href={item.href || '#'}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-500/10 text-blue-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Version Selector Modal */}
      <VersionSelectorModal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
      />

        {/* Plan de Lectura */}
        <div className="px-6 py-4 border-t border-slate-700/50">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Plan de Lectura</span>
              <span className="text-xs font-bold text-blue-500">85%</span>
            </div>
            <div className="h-2 bg-slate-800/60 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" style={{ width: '85%' }}></div>
            </div>
          </div>
          <p className="text-sm text-white font-medium">Camino de Sabiduría</p>
        </div>

        {/* Configuración y Cerrar Sesión */}
        <div className="px-3 pb-6 space-y-2">
          {/* Configuración - Solo visible si está autenticado */}
          {isAuthenticated && (
            <Link
              href="/configuracion"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 dark:hover:bg-zinc-800/50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Configuración</span>
            </Link>
          )}

          {/* Cerrar Sesión - Solo visible si está autenticado */}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
