'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Star, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/lib/hooks';
import { UserDropdown } from './UserDropdown';

const navItems = [
  { label: 'Capítulos', href: '#capitulos' },
  { label: 'Recursos', href: '#recursos', hasDropdown: true },
  { label: 'Comunidad', href: '#comunidad', hasDropdown: true },
  { label: 'Búsqueda', href: '/busqueda' },
];

export default function HomeNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed left-0 right-0 top-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-black/20 px-6 py-3 backdrop-blur-xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                <circle cx="12" cy="12" r="4" fill="currentColor" />
                <path d="M12 2 L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 18 L12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M4.93 4.93 L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M16.24 16.24 L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M2 12 L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M18 12 L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M4.93 19.07 L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M16.24 7.76 L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
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
                {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden items-center gap-3 md:flex">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
            >
              <Star className="h-4 w-4" />
              Star Us
            </a>
            {!loading && (
              <>
                {isAuthenticated ? (
                  <UserDropdown />
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="text-sm text-gray-300 hover:bg-white/10 hover:text-white">
                        INICIAR SESIÓN
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button className="rounded-full bg-white px-5 text-sm font-medium text-black hover:bg-gray-100">
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
            className="text-white md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-2xl border border-white/10 bg-black/90 p-4 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-lg px-4 py-2 text-gray-300 hover:bg-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <hr className="border-white/10" />
              {!loading && (
                <>
                  {isAuthenticated ? (
                    <div className="px-4 py-2">
                      <UserDropdown />
                    </div>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-white/10">
                          INICIAR SESIÓN
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button className="w-full rounded-full bg-white text-black hover:bg-gray-100">
                          COMENZAR
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
