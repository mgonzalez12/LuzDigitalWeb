'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, Star, Menu, X, Search, Home, BookOpen, Bookmark, Heart, MoreVertical } from 'lucide-react';
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
        setReadingProgress(Math.round(((readCount || 0) / totalCount) * 100));
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
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed left-0 right-0 top-0 z-50 bg-black/40 backdrop-blur-xl"
        style={{ position: 'fixed' }}
      >
        <div className="mx-auto max-w-7xl px-6 py-4">
          <nav className="flex items-center justify-between rounded-full border border-white/10 bg-black/20 px-6 py-3 backdrop-blur-xl">
            {/* Logo and User Info */}
            <div className="flex items-center gap-4">
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

              {/* Mobile Menu Button */}
              <button
                className="ml-4 lg:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                      className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-colors ${
                        isLibraryActive
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
                    className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-colors ${
                      isActive
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
                    className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-colors ${
                      moreOpen ? 'bg-white text-black' : 'text-gray-300 hover:text-white hover:bg-white/10'
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
              <Link
                href="/busqueda"
                className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Buscar"
              >
                <Search className="h-4 w-4" />
              </Link>

              {/* Profile Dropdown - Solo si está autenticado */}
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                <button
                  className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                    profileOpen ? 'border-blue-400' : 'border-transparent'
                  }`}
                  onClick={() => openMenu('profile')}
                >
                  {avatarLoading ? (
                    <div className="w-full h-full bg-slate-700 animate-pulse rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-slate-500 rounded-full"></div>
                    </div>
                  ) : avatar ? (
                    <Image
                      src={avatar}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {userName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {avatar ? (
                            <Image
                              src={avatar}
                              alt="Profile"
                              width={40}
                              height={40}
                              className="object-cover"
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

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 rounded-2xl border border-white/10 bg-black/90 p-4 backdrop-blur-xl lg:hidden"
            >
              <div className="flex flex-col gap-2">
                {/* User Info Mobile - Solo si está autenticado */}
                {isAuthenticated && (
                  <>
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
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
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-gray-300 hover:bg-white/10 ${
                          isLibraryActive ? 'bg-white/10 text-white' : ''
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
                  // Links que requieren login redirigen al login si no está autenticado
                  const requiresAuth = item.id === 'bookmarks' || item.id === 'favorites' || item.id === 'dashboard';
                  const href = !isAuthenticated && requiresAuth ? '/login' : (item.href || '#');
                  return (
                    <Link
                      key={item.id}
                      href={href}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-gray-300 hover:bg-white/10 ${
                        isActive ? 'bg-white/10 text-white' : ''
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}

                <hr className="border-white/10" />

                {/* More Items Mobile - Solo si está autenticado */}
                {isAuthenticated && moreItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href || '#'}
                    className="rounded-lg px-4 py-2 text-gray-300 hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                <hr className="border-white/10" />

                {/* Login/Logout Mobile */}
                {isAuthenticated ? (
                  <button
                    className="w-full text-left rounded-lg px-4 py-2 text-red-400 hover:bg-red-500/10"
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="w-full text-center rounded-lg px-4 py-2 text-gray-300 hover:bg-white/10"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/registro"
                      className="w-full text-center rounded-lg px-4 py-2 bg-white text-black hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
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
