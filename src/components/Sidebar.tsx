'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VersionSelectorModal } from './VersionSelectorModal';

export function Sidebar() {
  const pathname = usePathname();
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

  const navItems = [
    { href: '/', label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Biblioteca', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', isButton: true },
    { href: '/busqueda', label: 'Búsqueda', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { href: '/perfil', label: 'Perfil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { href: '/marcadores', label: 'Marcadores', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
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
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-slate-900 dark:bg-zinc-950 border-r border-slate-800 dark:border-zinc-800 flex flex-col z-40
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-blue-500">
                <circle cx="12" cy="12" r="4" fill="currentColor"/>
                <path d="M12 2 L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 18 L12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M4.93 4.93 L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16.24 16.24 L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 12 L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18 12 L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M4.93 19.07 L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16.24 7.76 L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
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
        <div className="px-6 py-4 border-t border-slate-800 dark:border-zinc-800">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Plan de Lectura</span>
              <span className="text-xs font-bold text-blue-500">85%</span>
            </div>
            <div className="h-2 bg-slate-800 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          <p className="text-sm text-white font-medium">Camino de Sabiduría</p>
        </div>

        {/* Configuración */}
        <div className="px-3 pb-6">
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
        </div>
      </aside>
    </>
  );
}
