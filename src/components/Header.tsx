'use client';

import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
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
            <span className="text-lg font-semibold">Luz Digital</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#capitulos" className="text-sm hover:text-blue-500 transition-colors">Capítulos</Link>
            <Link href="#recursos" className="text-sm hover:text-blue-500 transition-colors">Recursos</Link>
            <Link href="#comunidad" className="text-sm hover:text-blue-500 transition-colors">Comunidad</Link>
            <Link href="/busqueda" className="text-sm hover:text-blue-500 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Link 
              href="#iniciar" 
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-all glow-blue"
            >
              Comenzar ahora
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
