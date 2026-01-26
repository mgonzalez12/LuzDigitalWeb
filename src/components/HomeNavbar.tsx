'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Star, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/lib/hooks';
import { NotificationDropdown } from './NotificationDropdown';
import { UserDropdown } from './UserDropdown';

const navItems = [
  { label: 'Comunidad', href: '/comunidad'},
  { label: 'Búsqueda', href: '/busqueda' },
];

export default function HomeNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  // Aplicar clase al body cuando el menú móvil está abierto para desplazar contenido
  useEffect(() => {
    if (mobileMenuOpen) {
      document.documentElement.classList.add('sidebar-open');
    } else {
      document.documentElement.classList.remove('sidebar-open');
    }
    return () => {
      document.documentElement.classList.remove('sidebar-open');
    };
  }, [mobileMenuOpen]);

  // Cerrar sidebar al hacer scroll o cambiar de ruta
  useEffect(() => {
    const handleScroll = () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Mobile Menu - Sidebar Horizontal */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-[280px] bg-gradient-to-b from-[#0a0a0f] to-[#0d1420] border-r border-white/10 shadow-2xl z-50 md:hidden overflow-y-auto"
          >
          {/* Header del Sidebar */}
          <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0a0a0f]/50 backdrop-blur-sm sticky top-0 z-10">
            <Link href="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
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
              <span className="text-lg font-semibold text-white">Luz Digital</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col gap-1 p-4">
            {/* Navigation Links Mobile */}
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <hr className="border-white/10 my-2" />

            {/* Auth Section Mobile */}
            {!loading && (
              <>
                {isAuthenticated ? (
                  <div className="px-4 py-2">
                    <UserDropdown />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-4">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-white/10 rounded-xl px-4 py-3 text-sm font-medium">
                        INICIAR SESIÓN
                      </Button>
                    </Link>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full rounded-xl bg-white text-black hover:bg-gray-100 px-4 py-3 text-sm font-medium">
                        COMENZAR
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
          </motion.div>
        </>
      )}

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 z-50 transition-all ${
          mobileMenuOpen ? 'hidden md:block left-0 right-0' : 'left-0 right-0'
        }`}
      >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-black/20 px-6 py-3 backdrop-blur-xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
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
            <span className="text-lg font-semibold text-white">Luz Digital</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm text-gray-300 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden items-center gap-3 md:flex">
           
            {!loading && (
              <>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <NotificationDropdown />
                <UserDropdown />
              </div>
            ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="text-sm text-gray-300 hover:bg-white/10 hover:text-white">
                        INICIAR SESIÓN
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button className="rounded-md bg-white px-5 text-sm font-medium text-black hover:bg-gray-100">
                        COMENZAR
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="text-white md:hidden ml-auto"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>
      </div>
    </motion.header>
    </>
  );
}
