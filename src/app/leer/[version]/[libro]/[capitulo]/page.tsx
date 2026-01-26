'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HorizontalNavbar } from '@/components/HorizontalNavbar';
import { FloatingActions } from '@/components/FloatingActions';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBibleChapter } from '@/lib/features/bibleChapterSlice';
import { ChapterContentSkeleton } from '@/components/skeletons/ChapterContentSkeleton';
import Link from 'next/link';
import { BibleChapterService } from '@/lib/services/bibleChapterService';
import { UserChapterService } from '@/lib/services/userChapterService';
import { UserReadingService } from '@/lib/services/userReadingService';

export default function LeerCapituloPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const version = params.version as string;
  const libro = params.libro as string;
  const capitulo = params.capitulo as string;
  const chapterNumber = Number(capitulo);
  
  const { currentChapter, loading, error } = useAppSelector((state) => state.bibleChapter);
  const [showError, setShowError] = useState(false);
  const [chapterImageUrl, setChapterImageUrl] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<number>>(new Set());
  const [verseFontSize, setVerseFontSize] = useState(18);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (version && libro && capitulo) {
      setShowError(false); // Reset error state
      
      const promise = dispatch(fetchBibleChapter({ version, book: libro, chapter: capitulo }));
      
      // Timeout para mostrar error solo después de 5 segundos
      const errorTimeout = setTimeout(() => {
        if (error && !currentChapter) {
          setShowError(true);
        }
      }, 5000);
      
      // Cleanup
      return () => {
        promise.abort();
        clearTimeout(errorTimeout);
      };
    }
  }, [version, libro, capitulo, dispatch]);

  // Actualizar showError cuando haya error real después del timeout
  useEffect(() => {
    if (error && !loading && !currentChapter) {
      const timer = setTimeout(() => {
        setShowError(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else if (currentChapter) {
      setShowError(false);
    }
  }, [error, loading, currentChapter]);

  // Cargar imagen del capítulo + estado de favorito + bookmarks del capítulo actual
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!version || !libro || !Number.isFinite(chapterNumber)) return;

      // Imagen es pública (aunque no haya sesión)
      const imageUrl = await BibleChapterService.getChapterImageUrl(
        version,
        libro,
        chapterNumber
      );

      if (!cancelled) {
        setChapterImageUrl(imageUrl);
      }

      if (!isAuthenticated || !user?.id) {
        if (!cancelled) {
          setIsFavorite(false);
          setIsRead(false);
          setBookmarkedVerses(new Set());
        }
        return;
      }

      // Obtener todo el estado del usuario para el capítulo en una sola llamada
      const userState = await UserChapterService.getChapterUserState(
        user.id,
        version,
        libro,
        chapterNumber
      );

      if (cancelled) return;
      setIsFavorite(userState.isFavorite);
      setIsRead(userState.isRead);
      setBookmarkedVerses(userState.bookmarkedVerses);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [version, libro, chapterNumber, isAuthenticated, user?.id]);

  // Cargar racha (para mostrar en la barra superior) - misma fuente que "Racha de Lectura"
  useEffect(() => {
    let cancelled = false;

    const toKeyUtc = (d: Date) => d.toISOString().slice(0, 10);
    const computeStreakFromDays = (days: Array<{ day: string }>) => {
      const daySet = new Set(days.map((d) => d.day));
      const current = new Date();
      current.setUTCHours(0, 0, 0, 0);
      let count = 0;
      while (daySet.has(toKeyUtc(current))) {
        count += 1;
        current.setTime(current.getTime() - 86400000);
      }
      return count;
    };

    const load = async () => {
      if (!isAuthenticated || !user?.id) {
        if (!cancelled) setStreakDays(0);
        return;
      }
      const readingDays = await UserReadingService.getReadingDays(user.id);

      if (cancelled) return;
      const days = readingDays.slice(0, 60).map(d => ({ day: d.day }));
      setStreakDays(computeStreakFromDays(days));
    };

    load();
    const onUpdated = () => load();
    window.addEventListener('luz:reading-updated', onUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener('luz:reading-updated', onUpdated);
    };
  }, [isAuthenticated, user?.id]);

  // Cerrar menú de compartir al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showShareMenu]);

  // Nota: NO marcamos como leído automáticamente.
  // El usuario debe presionar "Marcar como leído".

  // Mostrar skeleton si está cargando O si hay error pero no han pasado 5 segundos
  if (loading || (!currentChapter && !showError)) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <HorizontalNavbar />
        
        <main className="flex-1 relative z-10 pt-24">
          {/* Top Bar Skeleton */}
          <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 px-4 md:px-8 py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 animate-pulse">
                <div className="h-4 bg-slate-700/50 rounded w-32"></div>
                <div className="h-4 bg-slate-700/30 rounded w-20"></div>
                <div className="h-4 bg-slate-700/30 rounded w-24"></div>
              </div>
              <div className="flex gap-4 animate-pulse">
                <div className="h-10 bg-slate-700/50 rounded-lg w-28"></div>
                <div className="h-10 bg-blue-500/30 rounded-lg w-40"></div>
              </div>
            </div>
          </div>

          <ChapterContentSkeleton />
        </main>

      </div>
    );
  }

  // Solo mostrar error después de 5 segundos si realmente falló
  if (showError || !currentChapter) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden">
        <HorizontalNavbar />
        <main className="flex-1 flex items-center justify-center pt-6">
          <div className="text-center text-red-400">
            <p className="text-xl mb-4">Error al cargar el capítulo</p>
            <p className="text-sm mb-6">{error || 'Capítulo no encontrado'}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Volver
            </button>
          </div>
        </main>
      </div>
    );
  }

  const testament = currentChapter.testament === 'old' ? 'Antiguo Testamento' : 'Nuevo Testamento';
  const bookName = currentChapter.name;

  const handleDecreaseFont = () => setVerseFontSize((s) => Math.max(14, s - 1));
  const handleIncreaseFont = () => setVerseFontSize((s) => Math.min(26, s + 1));

  // Generar texto completo del capítulo para compartir
  const getChapterText = () => {
    if (!currentChapter) return '';
    const verses = currentChapter.vers.map(v => `${v.number} ${v.verse}`).join(' ');
    return `${bookName} ${currentChapter.chapter}\n\n${verses}`;
  };

  // Funciones de compartir
  const handleShareTwitter = () => {
    const text = getChapterText();
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    setShowShareMenu(false);
  };

  const handleShareFacebook = async () => {
    const text = getChapterText();
    const url = window.location.href;
    
    // Abrir Facebook directamente (NO usar navigator.share para Facebook)
    // Nota: Facebook no permite pasar texto directamente en la URL por seguridad
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
    
    // Copiar el texto completo al portapapeles automáticamente
    // El usuario puede pegar el texto en el cuadro de publicación de Facebook
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 5000);
    } catch (err) {
      console.error('Error al copiar texto:', err);
      // Fallback para navegadores antiguos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 5000);
      } catch (fallbackErr) {
        console.error('Error en fallback de copiar:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
    
    setShowShareMenu(false);
  };

  const handleShareEmail = () => {
    const text = getChapterText();
    const url = window.location.href;
    const subject = encodeURIComponent(`${bookName} ${currentChapter.chapter}`);
    const body = encodeURIComponent(`${text}\n\n${url}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    setShowShareMenu(false);
  };

  const handleCopyText = async () => {
    const text = getChapterText();
    if (!text) {
      console.error('No hay texto para copiar');
      return;
    }

    // Verificar si estamos en un contexto seguro (HTTPS o localhost)
    const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    
    // Intentar usar la API moderna del portapapeles
    if (isSecureContext && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 3000);
        return;
      } catch (err: any) {
        // Si falla, continuar con el fallback
        console.log('Clipboard API falló, usando fallback:', err.message);
      }
    }

    // Fallback: usar textarea y execCommand
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      
      // Seleccionar el texto
      if (navigator.userAgent.match(/ipad|iphone/i)) {
        // Para iOS
        const range = document.createRange();
        range.selectNodeContents(textArea);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        textArea.setSelectionRange(0, 999999);
      } else {
        textArea.select();
      }
      
      // Copiar
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 3000);
      } else {
        console.error('No se pudo copiar el texto');
        alert('No se pudo copiar el texto. Por favor, selecciónalo manualmente.');
      }
    } catch (fallbackErr) {
      console.error('Error en fallback de copiar:', fallbackErr);
      alert('Error al copiar. Por favor, selecciona y copia el texto manualmente.');
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !user?.id) return;
    const isFavoriteAfterToggle = await UserChapterService.toggleChapterFavorite(
      user.id,
      version,
      libro,
      chapterNumber
    );
    setIsFavorite(isFavoriteAfterToggle);
  };

  const handleMarkAsRead = async () => {
    if (!isAuthenticated || !user?.id || isRead || isMarkingRead) return;
    setIsMarkingRead(true);
    try {
      await UserChapterService.markChapterAsRead(
        user.id,
        version,
        libro,
        chapterNumber
      );
      setIsRead(true);
      // Refrescar widgets (racha/progreso) en otras pantallas
      window.dispatchEvent(new Event('luz:reading-updated'));
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleToggleBookmarkVerse = async (verseNumber: number) => {
    if (!isAuthenticated || !user?.id) return;
    const isBookmarked = await UserChapterService.toggleVerseBookmark(
      user.id,
      version,
      libro,
      chapterNumber,
      verseNumber
    );

    setBookmarkedVerses((prev) => {
      const next = new Set(prev);
      if (isBookmarked) next.add(verseNumber);
      else next.delete(verseNumber);
      return next;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <HorizontalNavbar />

      {/* Main Content */}
      <main className="flex-1 relative z-10 pb-32 pt-24">
        <div className="max-w-full md:max-w-5xl lg:max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 space-y-8">
          {/* Toast de feedback para copiar */}
          {copyFeedback && (
            <div className="fixed top-36 right-4 z-[10001] bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Texto copiado al portapapeles</span>
            </div>
          )}

          {/* Top Bar Card */}
          <div className="bg-slate-900/35 backdrop-blur-sm border border-slate-800/60 rounded-3xl p-6 md:p-8 relative">
            <div
              className="absolute inset-0 opacity-40 pointer-events-none rounded-3xl overflow-hidden"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 0%, rgba(245,158,11,0.08), transparent 60%), radial-gradient(circle at 70% 20%, rgba(59,130,246,0.10), transparent 60%)",
              }}
            />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-sm flex-wrap">
                <Link href="/" className="text-slate-400 hover:text-blue-400">
                  {testament}
                </Link>
                <span className="text-slate-600">{'>'}</span>
                <Link href={`/version/${version}`} className="text-slate-400 hover:text-blue-400 capitalize">
                  {bookName}
                </Link>
                <span className="text-slate-600">{'>'}</span>
                <span className="text-white font-medium">
                  Capítulo {currentChapter.chapter}
                </span>
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-2 md:gap-4 flex-wrap relative">
                {/* Streak */}
                <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2c1.658 3.313 3.333 6.667 5 10-1.667 3.333-3.333 6.667-5 10-1.667-3.333-3.333-6.667-5-10 1.667-3.333 3.333-6.667 5-10zm-3 12c0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.104-.897-2-2-2s-2 .896-2 2z"/>
                  </svg>
                  <span className="text-xs md:text-sm font-semibold text-orange-600 whitespace-nowrap">
                    RACHA {streakDays} Días
                  </span>
                </div>

                {/* Copy Button - Solo icono */}
                <button
                  onClick={handleCopyText}
                  className="px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 rounded-lg transition-all flex items-center justify-center"
                  title="Copiar texto del capítulo"
                  aria-label="Copiar texto del capítulo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>

                {/* Share Button */}
                <div className="relative" ref={shareMenuRef} style={{ zIndex: 100 }}>
                  <button 
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="px-4 md:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap"
                  >
                    Compartir Versículo
                  </button>
                  
                  {showShareMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-2xl border border-gray-200" style={{ zIndex: 10000 }}>
                      {/* Triángulo indicador (apunta hacia arriba) */}
                      <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                      
                      <button
                        onClick={handleShareTwitter}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </div>
                        <span>Twitter</span>
                      </button>
                      
                      <button
                        onClick={handleShareFacebook}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </div>
                        <span>Facebook</span>
                      </button>
                      
                      <button
                        onClick={handleShareEmail}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span>Email</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
     

          {/* Chapter Title */}
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 capitalize">
              {bookName} {currentChapter.chapter}
            </h1>
            <p className="text-slate-400">
              {currentChapter.num_chapters} capítulos en total
            </p>
          </div>

          {/* Featured Image Card */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <div className="aspect-[21/11] relative">
              {chapterImageUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-[50%_20%]"
                  style={{ backgroundImage: `url(${chapterImageUrl})` }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900" />
              )}
            </div>
          </div>

          {/* Actions under image */}
          {isAuthenticated && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`flex-1 inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full border transition-all ${
                  isFavorite
                    ? 'border-amber-300/40 bg-amber-500/10 text-amber-100'
                    : 'border-amber-300/30 bg-transparent text-amber-100/90 hover:bg-amber-500/10'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="text-base font-medium">
                  {isFavorite ? 'En Favoritos' : 'Agregar a Favoritos'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleMarkAsRead}
                disabled={isRead || isMarkingRead}
                className={`flex-1 inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full border transition-all ${
                  isRead
                    ? 'border-amber-300/20 bg-white/5 text-slate-300 cursor-not-allowed'
                    : 'border-amber-300/30 bg-transparent text-slate-200 hover:bg-white/5'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 4h10a2 2 0 012 2v14H5V6a2 2 0 012-2z" />
                </svg>
                <span className="text-base font-medium">
                  {isRead ? 'Leído' : isMarkingRead ? 'Marcando…' : 'Marcar como Leído'}
                </span>
              </button>
            </div>
          )}

          {/* Chapter Navigation */}
          <div className="flex items-center justify-between">
            {currentChapter.chapter > 1 && (
              <Link
                href={`/leer/${version}/${libro}/${Number(capitulo) - 1}`}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Capítulo {Number(capitulo) - 1}
              </Link>
            )}
            
            {currentChapter.chapter < currentChapter.num_chapters && (
              <Link
                href={`/leer/${version}/${libro}/${Number(capitulo) + 1}`}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-all ml-auto"
              >
                Capítulo {Number(capitulo) + 1}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>

          {/* Verses */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-slate-700/50">
            <div className="space-y-6">
              {currentChapter.vers.map((verse) => (
                <div key={verse.id} className="flex gap-4 group hover:bg-slate-800/30 -mx-4 px-4 py-2 rounded-lg transition-colors">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500/10 text-blue-400 font-bold text-sm rounded-lg">
                    {verse.number}
                  </span>
                  <p
                    className="flex-1 leading-relaxed text-slate-200"
                    style={{ fontSize: `${verseFontSize}px` }}
                  >
                    {verse.verse}
                  </p>
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => handleToggleBookmarkVerse(Number(verse.number))}
                      className={`flex-shrink-0 w-9 h-9 rounded-lg border transition-all flex items-center justify-center ${
                        bookmarkedVerses.has(Number(verse.number))
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                          : 'bg-slate-800/30 border-slate-700/40 text-slate-400 hover:text-white hover:bg-slate-700/30 opacity-0 group-hover:opacity-100'
                      }`}
                      aria-label={
                        bookmarkedVerses.has(Number(verse.number))
                          ? 'Quitar marcador'
                          : 'Agregar marcador'
                      }
                    >
                      <svg
                        className="w-5 h-5"
                        fill={bookmarkedVerses.has(Number(verse.number)) ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Section */}
          <div className="relative overflow-hidden rounded-2xl p-8 border border-slate-700/50">
            {chapterImageUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-bottom opacity-35"
                style={{ backgroundImage: `url(${chapterImageUrl})` }}
              />
            ) : (
              <div className="absolute inset-0 bg-slate-900/50" />
            )}
            {/* Capa para mantener legibilidad */}
            <div className="absolute inset-0 bg-slate-950/55" />

            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-semibold text-white mb-10">
                Información del Capítulo
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Libro */}
                <div className="bg-black/40 rounded-lg p-6 border border-white/5 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-300/20 flex items-center justify-center text-amber-200">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 tracking-widest uppercase">Libro</div>
                      <div className="text-1xl font-semibold text-white capitalize">{bookName}</div>
                    </div>
                  </div>
                </div>

                {/* Capítulo */}
                <div className="bg-black/40 rounded-lg p-6 border border-white/5 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-300/20 flex items-center justify-center text-amber-200">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 11h10M7 15h6M6 5h12a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 tracking-widest uppercase">Capítulo</div>
                      <div className="text-1xl font-semibold text-white">
                        {currentChapter.chapter} de {currentChapter.num_chapters}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testamento */}
                <div className="bg-black/40 rounded-lg p-6 border border-white/5 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-300/20 flex items-center justify-center text-amber-200">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 11h8M8 15h6M6 4h12a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 tracking-widest uppercase">Testamento</div>
                      <div className="text-1xl font-semibold text-white">{testament}</div>
                    </div>
                  </div>
                </div>

                {/* Versículos */}
                <div className="bg-black/40 rounded-lg p-6 border border-white/5 shadow-lg md:col-span-1">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-300/20 flex items-center justify-center text-amber-200">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 11h10M7 15h6M5 4h14v16H5V4z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 tracking-widest uppercase">Versículos</div>
                      <div className="text-1xl font-semibold text-white">{currentChapter.vers.length}</div>
                    </div>
                  </div>
                </div>

                {/* Versión */}
                <div className="bg-black/40 rounded-lg p-6 border border-white/5 shadow-lg md:col-span-2">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-300/20 flex items-center justify-center text-amber-200">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5h14v14H5V5z M9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 tracking-widest uppercase">Versión</div>
                      <div className="text-1xl font-semibold text-white uppercase">{version}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapter Navigation - Below Info Card */}
          <div className="flex items-center justify-between mt-6">
            {currentChapter.chapter > 1 && (
              <Link
                href={`/leer/${version}/${libro}/${Number(capitulo) - 1}`}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Capítulo {Number(capitulo) - 1}
              </Link>
            )}
            
            {currentChapter.chapter < currentChapter.num_chapters && (
              <Link
                href={`/leer/${version}/${libro}/${Number(capitulo) + 1}`}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-all ml-auto"
              >
                Capítulo {Number(capitulo) + 1}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Floating Actions */}
      <FloatingActions
        fontSize={verseFontSize}
        onDecreaseFont={handleDecreaseFont}
        onIncreaseFont={handleIncreaseFont}
      />
    </div>
  );
}
