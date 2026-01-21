'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { FloatingActions } from '@/components/FloatingActions';
import { VerseOfDayCard } from '@/components/VerseOfDayCard';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBibleVerses } from '@/lib/features/bibleVersesSlice';
import { ChapterContentSkeleton } from '@/components/skeletons/ChapterContentSkeleton';
import Link from 'next/link';

export default function VersiculoPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const version = params.version as string;
  const libro = params.libro as string;
  const capitulo = params.capitulo as string;
  const versiculo = params.versiculo as string;
  
  const { currentVerses, loading, error } = useAppSelector((state) => state.bibleVerses);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (version && libro && capitulo && versiculo) {
      setShowError(false); // Reset error state
      
      const promise = dispatch(fetchBibleVerses({ 
        version, 
        book: libro, 
        chapter: capitulo, 
        verseRange: versiculo 
      }));
      
      // Cleanup
      return () => {
        promise.abort();
      };
    }
  }, [version, libro, capitulo, versiculo, dispatch]);

  // Actualizar showError cuando haya error real después del timeout
  useEffect(() => {
    if (error && !loading && !currentVerses) {
      const timer = setTimeout(() => {
        setShowError(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else if (currentVerses) {
      setShowError(false);
    }
  }, [error, loading, currentVerses]);

  // Mostrar skeleton si está cargando O si hay error pero no han pasado 5 segundos
  if (loading || (!currentVerses && !showError)) {
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
          <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 animate-pulse">
                <div className="h-4 bg-slate-700/50 rounded w-32"></div>
                <div className="h-4 bg-slate-700/30 rounded w-20"></div>
                <div className="h-4 bg-slate-700/30 rounded w-40"></div>
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
  if (showError || !currentVerses) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden">
        <Sidebar />
        <main className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-center text-red-400">
            <p className="text-xl mb-4">Error al cargar el versículo</p>
            <p className="text-sm mb-6">{error || 'Versículo no encontrado'}</p>
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

  const bookName = currentVerses.book;
  const firstVerse = currentVerses.verses[0];
  const verseRangeDisplay = currentVerses.verseRange.includes('-') 
    ? `Versículos ${currentVerses.verseRange}` 
    : `Versículo ${currentVerses.verseRange}`;

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
                Búsqueda
              </Link>
              <span className="text-slate-600">{'>'}</span>
              <Link href={`/version/${version}`} className="text-slate-400 hover:text-blue-400 capitalize">
                {bookName}
              </Link>
              <span className="text-slate-600">{'>'}</span>
              <span className="text-white font-medium">
                Capítulo {currentVerses.chapter} - {verseRangeDisplay}
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

          {/* Verse Title */}
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 capitalize">
              {bookName} {currentVerses.chapter}:{currentVerses.verseRange}
            </h1>
            <p className="text-slate-400">
              {verseRangeDisplay}
            </p>
          </div>

          {/* Featured Image Card */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <div className="aspect-[21/9] bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzFmMmE0OCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzQzMzhiYSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==')] opacity-50"></div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 text-center capitalize">
                {bookName} {currentVerses.chapter}:{currentVerses.verseRange}
              </h2>
              {firstVerse?.study && (
                <p className="text-lg text-blue-100 text-center">
                  {firstVerse.study}
                </p>
              )}
            </div>
          </div>

          {/* Button to View Full Chapter */}
          <div className="flex justify-center">
            <Link
              href={`/leer/${version}/${libro}/${capitulo}`}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Ver Capítulo Completo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Verses */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-slate-700/50">
            <div className="space-y-6">
              {currentVerses.verses.map((verse) => (
                <div key={verse.id} className="flex gap-4 group">
                  <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-500/20 text-blue-400 font-bold text-lg rounded-lg ring-2 ring-blue-500/50">
                    {verse.number}
                  </span>
                  <div className="flex-1">
                    <p className="text-xl leading-relaxed text-white">
                      {verse.verse}
                    </p>
                    {verse.study && (
                      <p className="mt-2 text-sm text-slate-400 italic">
                        {verse.study}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Section */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                Información del Versículo
              </h3>
            </div>
            <div className="space-y-2 text-slate-400">
              <p>• Libro: <span className="text-white capitalize">{bookName}</span></p>
              <p>• Capítulo: <span className="text-white">{currentVerses.chapter}</span></p>
              <p>• {verseRangeDisplay}: <span className="text-white">{currentVerses.verseRange}</span></p>
              <p>• Versión: <span className="text-white uppercase">{version}</span></p>
              <p>• Total de versículos mostrados: <span className="text-white">{currentVerses.verses.length}</span></p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Actions */}
      <FloatingActions />
    </div>
  );
}
