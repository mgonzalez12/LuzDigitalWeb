'use client';

import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";
import { UserDropdown } from "./UserDropdown";

export function Header() {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/prueba_logo_luzDigital_sin_fondo.png"
              alt="Luz Digital"
              className="flex-shrink-0"
              style={{
                width: '80px !important',
                    height: '60px !important',
                    minWidth: '60px',
                    minHeight: '60px',
                    maxWidth: '80px',
                    maxHeight: '60px',
                    objectFit: 'contain',
                    display: 'block',
                    flexShrink: 0
              }}
            />
            <span className="text-lg font-semibold">Luz Digital</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#comunidad" className="text-sm hover:text-blue-500 transition-colors">Comunidad</Link>
            <Link href="/busqueda" className="text-sm hover:text-blue-500 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </Link>
          </nav>

          {/* CTA Button or User Dropdown */}
          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {isAuthenticated ? (
                  <UserDropdown />
                ) : (
                  <Link 
                    href="/login" 
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-all glow-blue"
                  >
                    Comenzar ahora
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
