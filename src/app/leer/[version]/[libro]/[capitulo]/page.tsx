'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { FloatingActions } from '@/components/FloatingActions';
import { VerseOfDayCard } from '@/components/VerseOfDayCard';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBibleChapter } from '@/lib/features/bibleChapterSlice';
import { ChapterContentSkeleton } from '@/components/skeletons/ChapterContentSkeleton';
import Link from 'next/link';

export default function LeerCapituloPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const version = params.version as string;
  const libro = params.libro as string;
  const capitulo = params.capitulo as string;
  
  const { currentChapter, loading, error } = useAppSelector((state) => state.bibleChapter);
  const [showError, setShowError] = useState(false);

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

  // Mostrar skeleton si está cargando O si hay error pero no han pasado 5 segundos
  if (loading || (!currentChapter && !showError)) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <Sidebar />
        
        <main className="flex-1 lg:ml-64 relative z-10">
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

        <FloatingActions />
      </div>
    );
  }

  // Solo mostrar error después de 5 segundos si realmente falló
  if (showError || !currentChapter) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden">
        <Sidebar />
        <main className="flex-1 lg:ml-64 flex items-center justify-center">
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
  const firstVerse = currentChapter.vers[0];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 relative z-10">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
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
            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
              {/* Streak */}
              <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c1.658 3.313 3.333 6.667 5 10-1.667 3.333-3.333 6.667-5 10-1.667-3.333-3.333-6.667-5-10 1.667-3.333 3.333-6.667 5-10zm-3 12c0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.104-.897-2-2-2s-2 .896-2 2z"/>
                </svg>
                <span className="text-xs md:text-sm font-semibold text-orange-600 whitespace-nowrap">
                  RACHA 7 Días
                </span>
              </div>

              {/* Share Button */}
              <button className="px-4 md:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap">
                Compartir Versículo
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-full md:max-w-5xl lg:max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 space-y-8">
          {/* Verse of the Day */}
          <VerseOfDayCard />

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
            <div className="aspect-[21/9] bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzFmMmE0OCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzQzMzhiYSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==')] opacity-50"></div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 text-center capitalize">
                {bookName} {currentChapter.chapter}
              </h2>
              {firstVerse?.study && (
                <p className="text-lg text-blue-100 text-center">
                  {firstVerse.study}
                </p>
              )}
            </div>
          </div>

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
                  <p className="flex-1 text-lg leading-relaxed text-slate-200">
                    {verse.verse}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Section */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                Información del Capítulo
              </h3>
            </div>
            <div className="space-y-2 text-slate-400">
              <p>• Libro: <span className="text-white capitalize">{bookName}</span></p>
              <p>• Capítulo: <span className="text-white">{currentChapter.chapter} de {currentChapter.num_chapters}</span></p>
              <p>• Testamento: <span className="text-white">{testament}</span></p>
              <p>• Versículos: <span className="text-white">{currentChapter.vers.length}</span></p>
              <p>• Versión: <span className="text-white uppercase">{version}</span></p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Actions */}
      <FloatingActions />
    </div>
  );
}
