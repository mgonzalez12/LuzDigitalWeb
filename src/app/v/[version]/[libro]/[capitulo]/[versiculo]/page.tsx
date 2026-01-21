'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBibleVerses } from '@/lib/features/bibleVersesSlice';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden">
        {/* Background - diffused light effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-600/5 via-purple-600/5 to-transparent blur-3xl"></div>
          <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-slate-950 via-slate-950/50 to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-slate-950 via-slate-950/50 to-transparent"></div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header Skeleton */}
          <header className="flex items-center justify-between px-6 py-6">
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-blue-500/30 rounded-lg"></div>
              <div className="h-6 bg-slate-700/50 rounded w-32"></div>
            </div>
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-slate-700/50 rounded-full"></div>
              <div className="w-10 h-10 bg-slate-700/50 rounded-full"></div>
            </div>
          </header>

          {/* Main Content Skeleton */}
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="w-full max-w-3xl animate-pulse">
              <div className="h-96 bg-slate-800/30 rounded-3xl"></div>
            </div>
          </main>

          {/* Footer Skeleton */}
          <footer className="px-6 py-6">
            <div className="flex items-center justify-between animate-pulse">
              <div className="h-10 bg-slate-700/50 rounded-lg w-64"></div>
              <div className="h-10 bg-slate-700/50 rounded-lg w-48"></div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // Solo mostrar error después de 5 segundos si realmente falló
  if (showError || !currentVerses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden flex items-center justify-center">
        <div className="text-center text-red-400 px-4">
          <p className="text-xl mb-4">Error al cargar el versículo</p>
          <p className="text-sm mb-6">{error || 'Versículo no encontrado'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const bookName = currentVerses.book;
  const firstVerse = currentVerses.verses[0];
  const verseText = currentVerses.verses.map(v => v.verse).join(' ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden">
      {/* Background - diffused vertical light effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Central diffused light beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent blur-3xl"></div>
        
        {/* Side shadows with vertical stripes effect */}
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(15, 23, 42, 0.3) 2px, rgba(15, 23, 42, 0.3) 4px)',
          }}></div>
        </div>
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(15, 23, 42, 0.3) 2px, rgba(15, 23, 42, 0.3) 4px)',
          }}></div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 md:px-8 py-6">
          {/* Logo */}
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
            <span className="text-lg font-semibold text-white">Luz Digital</span>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Share Button */}
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${bookName} ${currentVerses.chapter}:${currentVerses.verseRange}`,
                    text: verseText,
                  });
                }
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all group"
              aria-label="Compartir"
            >
              <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>

            {/* Close Button */}
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all group"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content - Centered */}
        <main className="flex-1 flex items-center justify-center px-4 md:px-6 py-8">
          <div className="w-full max-w-3xl">
            {/* Verse of the Day Card */}
            <div className="relative rounded-3xl overflow-hidden backdrop-blur-xl bg-slate-800/30 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
              {/* Glowing border effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent opacity-50"></div>
              
              <div className="relative p-8 md:p-12 space-y-6">
                {/* Title */}
                <div className="text-center">
                  <p className="text-xs md:text-sm font-semibold tracking-widest text-blue-400 uppercase mb-4">
                    Versículo del Día
                  </p>
                </div>

                {/* Verse Quote */}
                <blockquote className="text-center space-y-4">
                  <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white italic leading-relaxed">
                    "{verseText}"
                  </p>
                  
                  {/* Reference */}
                  <div className="flex justify-center">
                    <p className="text-lg md:text-xl text-white font-medium capitalize">
                      {bookName} {currentVerses.chapter}:{currentVerses.verseRange}
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-16 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
                  </div>
                </blockquote>

                {/* Reflective Message */}
                <div className="text-center pt-4">
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
                    Reflexiona sobre este versículo por un momento antes de comenzar tu jornada.
                    <br className="hidden md:block" />
                    Permite que la luz interior guíe tus pensamientos hoy.
                  </p>
                </div>

                {/* Action Button */}
                <div className="flex justify-center pt-6">
                  <Link
                    href={`/leer/${version}/${libro}/${capitulo}`}
                    className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 transform"
                  >
                    Iniciar Lectura
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 md:px-8 py-6 border-t border-slate-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Ambient Music Player */}
            <div className="flex items-center gap-4 bg-slate-800/30 backdrop-blur-sm rounded-xl px-6 py-3 border border-slate-700/50">
              {/* Audio Wave Icon */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v18M9 7v10M6 9v6M15 7v10M18 9v6"/>
                </svg>
                <span className="text-sm font-medium text-slate-300">Celestial Hum</span>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue="50"
                  className="w-24 h-1 bg-slate-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                />
                <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </div>
            </div>

            {/* Daily Ritual Streak */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
                  Racha de Ritual Diario
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  4 días completados esta semana
                </p>
              </div>
              
              {/* Progress Dots */}
              <div className="flex items-center gap-1.5">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i < 4 
                        ? 'bg-blue-500 shadow-lg shadow-blue-500/50' 
                        : 'bg-slate-700'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
