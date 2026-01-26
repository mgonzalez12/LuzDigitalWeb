'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, Star, Menu, X, Search, Home, BookOpen, Bookmark, Heart, MoreVertical } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { VersionSelectorModal } from './VersionSelectorModal';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logout } from '@/lib/features/authSlice';
import { supabase } from '@/lib/supabase';

export function HorizontalNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);

  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);

  const moreRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const userName = (user?.user_metadata as any)?.name || user?.email?.split('@')[0] || 'Usuario';
  const userEmail = user?.email || '';

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar sidebar al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Cargar progreso de lectura
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const loadProgress = async () => {
      const { data: settings } = await supabase
        .from('user_settings')
        .select('preferred_version_code')
        .eq('user_id', user.id)
        .maybeSingle();

      const version = (settings as any)?.preferred_version_code || 'rv1960';

      const [{ count: readCount }, { count: totalCount }] = await Promise.all([
        supabase
          .from('user_chapter_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('version_code', version),
        supabase
          .from('bible_chapters')
          .select('*', { count: 'exact', head: true })
          .eq('version_code', version),
      ]);

      if (totalCount && totalCount > 0) {
        const progress = Math.round(((readCount || 0) / totalCount) * 1000) / 10;
        setReadingProgress(progress);
      } else {
        setReadingProgress(0);
      }
    };

    loadProgress();
    const onUpdated = () => loadProgress();
    window.addEventListener('luz:reading-updated', onUpdated);
    return () => window.removeEventListener('luz:reading-updated', onUpdated);
  }, [isAuthenticated, user?.id]);

  // Cargar avatar
  useEffect(() => {
    if (!user) {
      setAvatarLoading(false);
      return;
    }

    const meta = (user.user_metadata as any) ?? {};
    const avatarUrl =
      (typeof meta.avatar_url === 'string' && meta.avatar_url) ||
      (typeof meta.picture === 'string' && meta.picture) ||
      (typeof meta.avatar === 'string' && meta.avatar) ||
      null;

    setAvatar(avatarUrl);
    setAvatarLoading(false);
  }, [user]);

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

  const handleLogout = async () => {
    await dispatch(logout());
    setMobileMenuOpen(false);
    setProfileOpen(false);
    router.push('/login');
  };

  const openMenu = (menu: 'more' | 'profile') => {
    if (menu === 'more') {
      setMoreOpen(!moreOpen);
      setProfileOpen(false);
    } else {
      setProfileOpen(!profileOpen);
      setMoreOpen(false);
    }
  };

  const navItems = [
    { id: 'dashboard', href: '/dashboard', label: 'Inicio', icon: Home },
    { id: 'library', label: 'Biblioteca', icon: BookOpen, isButton: true },
    { id: 'search', href: '/busqueda', label: 'Búsqueda', icon: Search },
    { id: 'bookmarks', href: '/marcadores', label: 'Marcadores', icon: Bookmark },
    { id: 'favorites', href: '/favoritos', label: 'Favoritos', icon: Heart },
  ];

  const moreItems = [
    { id: 'settings', href: '/configuracion', label: 'Configuración' },
  ];

  const profileItems = [
    { id: 'profile', href: '/perfil', label: 'Mi perfil' },
    { id: 'settings', href: '/configuracion', label: 'Configuración' },
    { id: 'help', href: '/ayuda', label: 'Ayuda y soporte' },
    { id: 'logout', label: 'Cerrar Sesión' },
  ];

  // Si está cargando, mostrar skeleton
  if (loading) {
    return (
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed left-0 right-0 top-0 z-50 bg-black/40 backdrop-blur-xl"
        style={{ position: 'fixed' }}
      >
        <div className="mx-auto max-w-7xl px-6 py-4">
          <nav className="flex items-center justify-between rounded-full border border-white/10 bg-black/20 px-6 py-3 backdrop-blur-xl">
            <div className="w-32 h-8 bg-white/20 rounded animate-pulse"></div>
            <div className="w-24 h-6 bg-white/20 rounded animate-pulse"></div>
          </nav>
        </div>
      </motion.header>
    );
  }

  return (
    <>
      {/* Mobile Menu - Sidebar Permanente */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-[280px] bg-gradient-to-b from-[#0a0a0f] to-[#0d1420] border-r border-white/10 shadow-2xl z-50 lg:hidden overflow-y-auto"
          >
            {/* Header del Sidebar */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0a0a0f]/50 backdrop-blur-sm sticky top-0 z-10">
              <Link href="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                <img
                  src="/prueba_logo_luzDigital_sin_fondo.png"
                  alt="Luz Digital"
                  className="flex-shrink-0"
                  style={{
                    width: '60px !important',
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
              {/* User Info Mobile - Solo si está autenticado */}
              {isAuthenticated && (
                <>
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10 px-2">
                    {avatarLoading ? (
                      <div className="w-12 h-12 rounded-full bg-white/20 animate-pulse"></div>
                    ) : avatar ? (
                      <Image
                        src={avatar}
                        alt={userName}
                        width={48}
                        height={48}
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {userName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-white">{userName}</div>
                      <div className="text-xs text-gray-400">Lector Web</div>
                    </div>
                  </div>

                  {/* Progress Bar Mobile - Solo si está autenticado */}
                  <div className="mb-4 pb-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-400">Plan de Lectura</span>
                      <span className="text-xs font-bold text-blue-400">{readingProgress}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${readingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation Links Mobile */}
              {navItems.map((item) => {
                if (item.isButton && item.id === 'library') {
                  const isLibraryActive = pathname?.startsWith('/version/') || pathname?.startsWith('/leer/') || pathname?.startsWith('/v/');
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isLibraryActive
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      onClick={() => {
                        setIsLibraryModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  );
                }

                const Icon = item.icon;
                const isActive = item.href && (pathname === item.href || pathname?.startsWith(item.href + '/'));
                const requiresAuth = item.id === 'bookmarks' || item.id === 'favorites' || item.id === 'dashboard';
                const href = !isAuthenticated && requiresAuth ? '/login' : (item.href || '#');
                return (
                  <Link
                    key={item.id}
                    href={href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

              <hr className="border-white/10 my-2" />

              {/* More Items Mobile - Solo si está autenticado */}
              {isAuthenticated && moreItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href || '#'}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <hr className="border-white/10 my-2" />

              {/* Login/Logout Mobile */}
              {isAuthenticated ? (
                <button
                  className="w-full text-left rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all mt-2"
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </button>
              ) : (
                <div className="flex flex-col gap-2 mt-4">
                  <Link
                    href="/login"
                    className="w-full text-center rounded-xl px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/10 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="w-full text-center rounded-xl px-4 py-3 text-sm font-medium bg-white text-black hover:bg-gray-100 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 z-50 bg-black/40 backdrop-blur-xl transition-all ${mobileMenuOpen ? 'hidden lg:block left-0 right-0' : 'left-0 right-0'
          }`}
        style={{ position: 'fixed' }}
      >
        <div className="mx-auto max-w-7xl px-6 py-4">
          <nav className="flex items-center justify-between rounded-full border border-white/10 bg-black/20 px-6 py-3 backdrop-blur-xl">
            {/* Logo */}
            <div className="flex items-center gap-4 flex-1">
              <Link href="/" className="flex items-center gap-3">
                <img
                  src="/prueba_logo_luzDigital_sin_fondo.png"
                  alt="Luz Digital"
                  className="flex-shrink-0"
                  style={{
                    width: '60px !important',
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
            </div>

            {/* Mobile/Tablet - Icono de Hamburguesa a la derecha */}
            <div className="lg:hidden flex items-center">
              <button
                className="p-2 rounded-full text-white hover:bg-white/10 transition-all"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                if (item.isButton && item.id === 'library') {
                  const isLibraryActive = pathname?.startsWith('/version/') || pathname?.startsWith('/leer/') || pathname?.startsWith('/v/');
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-colors ${isLibraryActive
                          ? 'bg-white text-black'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      onClick={() => setIsLibraryModalOpen(true)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                }

                const Icon = item.icon;
                const isActive = item.href && (pathname === item.href || pathname?.startsWith(item.href + '/'));
                // Links que requieren login redirigen al login si no está autenticado
                const requiresAuth = item.id === 'bookmarks' || item.id === 'favorites' || item.id === 'dashboard';
                const href = !isAuthenticated && requiresAuth ? '/login' : (item.href || '#');
                return (
                  <Link
                    key={item.id}
                    href={href}
                    className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-colors ${isActive
                        ? 'bg-white text-black'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              {/* More Dropdown - Solo si está autenticado */}
              {isAuthenticated && (
                <div className="relative" ref={moreRef}>
                  <button
                    className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-colors ${moreOpen ? 'bg-white text-black' : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    onClick={() => openMenu('more')}
                  >
                    <MoreVertical className="h-4 w-4" />
                    Más
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {moreOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                      {moreItems.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href || '#'}
                          className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          onClick={() => setMoreOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Side Icons */}
            <div className="hidden lg:flex items-center gap-3">
              <NotificationDropdown />

              {/* Profile Dropdown - Solo si está autenticado */}
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    className={`rounded-full overflow-hidden border-2 transition-all ${profileOpen ? 'border-blue-400' : 'border-transparent'
                      }`}
                    style={{
                      width: '50px',
                      height: '50px',
                      minWidth: '50px',
                      minHeight: '50px',
                      maxWidth: '50px',
                      maxHeight: '50px'
                    }}
                    onClick={() => openMenu('profile')}
                  >
                    {avatarLoading ? (
                      <div className="w-full h-full bg-slate-700 animate-pulse rounded-full flex items-center justify-center">
                        <div className="w-5 h-5 bg-slate-500 rounded-full"></div>
                      </div>
                    ) : avatar ? (
                      <Image
                        src={avatar}
                        alt="Profile"
                        width={50}
                        height={50}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {userName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center">
                          <div className="rounded-full overflow-hidden mr-3 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold" style={{
                            width: '50px',
                            height: '50px',
                            minWidth: '50px',
                            minHeight: '50px'
                          }}>
                            {avatar ? (
                              <Image
                                src={avatar}
                                alt="Profile"
                                width={50}
                                height={50}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              userName.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{userName}</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{userEmail}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        {profileItems.map((item) =>
                          item.id === 'logout' ? (
                            <button
                              key={item.id}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={handleLogout}
                            >
                              {item.label}
                            </button>
                          ) : (
                            <Link
                              key={item.id}
                              href={item.href || '#'}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              onClick={() => setProfileOpen(false)}
                            >
                              {item.label}
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Botones de login cuando no está autenticado
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <button className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                      Iniciar Sesión
                    </button>
                  </Link>
                  <Link href="/registro">
                    <button className="px-4 py-2 text-sm bg-white text-black rounded-full hover:bg-gray-100 transition-colors">
                      Registrarse
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Version Selector Modal */}
      <VersionSelectorModal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
      />
    </>
  );
}
