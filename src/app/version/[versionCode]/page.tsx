'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HorizontalNavbar } from '@/components/HorizontalNavbar';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBibleBooks } from '@/lib/features/bibleBooksSlice';
import { fetchBibleVersions } from '@/lib/features/bibleVersionsSlice';
import { BibleBooksSkeleton } from '@/components/skeletons/BibleBooksSkeleton';
import Link from 'next/link';

// Iconos para cada libro (usando emojis como placeholders)
const bookIcons: { [key: string]: string } = {
  genesis: '📝',
  exodo: '🌊',
  levitico: '🕯️',
  numeros: '👥',
  deuteronomio: '📜',
  josue: '⚔️',
  jueces: '⚖️',
  rut: '🌾',
  job: '❄️',
  salmos: '🎵',
  proverbios: '💡',
  eclesiastes: '⏳',
  cantares: '❤️',
  mateo: '📖',
  marcos: '✍️',
  lucas: '📓',
  juan: '🕊️',
  hechos: '🔥',
  romanos: '✉️',
};

// Helper para extraer el nombre del libro desde el campo "name"
const extractBookName = (name: string): string => {
  return name.replace(' endpoint', '').trim();
};

export default function BibleLibraryPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { books, loading, error } = useAppSelector((state) => state.bibleBooks);
  const { versions } = useAppSelector((state) => state.bibleVersions);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTestament, setActiveTestament] = useState<'old' | 'new' | 'all'>('all');

  const versionCode = params.versionCode as string;
  const currentVersion = versions.find(v => v.version === versionCode);

  // Fetch de versiones si no están cargadas
  useEffect(() => {
    if (versions.length === 0) {
      dispatch(fetchBibleVersions());
    }
  }, [versions.length, dispatch]);

  // Fetch de libros cuando tenemos el versionCode
  useEffect(() => {
    if (versionCode) {
      dispatch(fetchBibleBooks(versionCode));
    }
  }, [versionCode, dispatch]);

  // Filtrar libros por búsqueda
  const filteredBooks = books.filter(book =>
    book.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Organizar libros por categorías (simplificado)
  const oldTestamentBooks = filteredBooks.filter((_, index) => index < 39);
  const newTestamentBooks = filteredBooks.filter((_, index) => index >= 39);

  const displayedBooks = activeTestament === 'old' ? oldTestamentBooks :
                        activeTestament === 'new' ? newTestamentBooks :
                        filteredBooks;

  // Agrupar por secciones
  const pentateuch = displayedBooks.slice(0, 5);
  const wisdomPoetry = displayedBooks.filter(book => 
    ['job', 'salmos', 'proverbios', 'eclesiastes', 'cantares'].includes(
      book.name.toLowerCase()
    )
  );

  const getBookIcon = (bookName: string) => {
    const key = bookName.toLowerCase().replace(/\s+/g, '-');
    return bookIcons[key] || '📖';
  };

  const getChapterCount = (book: any) => {
    // Usar el número de capítulos real de la API si está disponible
    return book.details?.chapters || 30;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <HorizontalNavbar />
        
        <main className="flex-1 relative z-10 pt-24">
          <div className="px-4 md:px-6 lg:px-8 py-8 md:py-12">
            {/* Header Card Skeleton */}
            <div className="bg-slate-900/35 backdrop-blur-sm border border-slate-800/60 rounded-3xl p-8 mb-8 relative overflow-hidden animate-pulse">
              <div className="h-10 bg-slate-700/50 rounded-lg w-64 mb-4"></div>
              <div className="h-5 bg-slate-700/30 rounded-lg w-96 mb-6"></div>
              
              {/* Search and filter skeleton */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex-1 h-12 bg-slate-700/50 rounded-xl"></div>
                <div className="h-12 bg-blue-500/50 rounded-xl w-32"></div>
              </div>
            </div>

            {/* Tabs skeleton */}
            <div className="px-4 md:px-6 lg:px-8 py-6 border-b border-slate-800/50 mb-8">
              <div className="flex gap-8 animate-pulse">
                <div className="h-4 bg-slate-700/50 rounded w-32"></div>
                <div className="h-4 bg-slate-700/50 rounded w-40"></div>
                <div className="h-4 bg-slate-700/50 rounded w-36"></div>
              </div>
            </div>
            
            <BibleBooksSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
        <HorizontalNavbar />
        <main className="flex-1 flex items-center justify-center pt-24">
          <div className="text-center text-red-400">
            <p>Error: {error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Volver
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <HorizontalNavbar />

      <main className="flex-1 relative z-10 pt-24">
        {/* Hero Section */}
        <div className="px-4 md:px-6 lg:px-8 py-8 md:py-12 border-b border-slate-800/50">
          <div className="max-w-full lg:max-w-6xl mx-auto">
            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Biblioteca Bíblica
            </h1>
            <p className="text-xl text-slate-400 mb-3">
              {currentVersion?.name || versionCode.toUpperCase()}
            </p>
            <p className="text-slate-400 max-w-2xl mb-8">
              Explora la palabra viva a través de nuestra colección digital curada. 
              Encuentra sabiduría, consuelo y guía en cada capítulo.
            </p>

            {/* Search bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar libros, capítulos o temas (ej. 'Sabiduría', 'Génesis')"
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all">
                FILTRAR
              </button>
            </div>
          </div>
        </div>

        {/* Testament Tabs */}
        <div className="px-4 md:px-6 lg:px-8 py-6 border-b border-slate-800/50">
          <div className="max-w-full lg:max-w-6xl mx-auto">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTestament('all')}
                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                  activeTestament === 'all'
                    ? 'text-blue-400 border-blue-400'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                Todos los Libros
              </button>
              <button
                onClick={() => setActiveTestament('old')}
                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                  activeTestament === 'old'
                    ? 'text-blue-400 border-blue-400'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                Antiguo Testamento
              </button>
              <button
                onClick={() => setActiveTestament('new')}
                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                  activeTestament === 'new'
                    ? 'text-blue-400 border-blue-400'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                Nuevo Testamento
              </button>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-full lg:max-w-6xl mx-auto space-y-12">
            {/* Pentateuch Section */}
            {pentateuch.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">El Pentateuco</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {pentateuch.map((book, index) => {
                    const bookName = extractBookName(book.name);
                    return (
                      <Link
                        key={book.name}
                        href={`/leer/${versionCode}/${bookName.toLowerCase()}/1`}
                        className="group bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all card-hover"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <span className="text-xs font-bold text-blue-400">
                            LIBRO {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-2xl">
                            {getBookIcon(bookName)}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors capitalize">
                          {bookName}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {getChapterCount(book)} Capítulos
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Wisdom & Poetry Section */}
            {wisdomPoetry.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">Sabiduría y Poesía</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {wisdomPoetry.map((book, index) => {
                    const bookName = extractBookName(book.name);
                    return (
                      <Link
                        key={book.name}
                        href={`/leer/${versionCode}/${bookName.toLowerCase()}/1`}
                        className="group bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all card-hover"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <span className="text-xs font-bold text-blue-400">
                            LIBRO {String(index + 18).padStart(2, '0')}
                          </span>
                          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-2xl">
                            {getBookIcon(bookName)}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors capitalize">
                          {bookName}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {getChapterCount(book)} Capítulos
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* All other books */}
            {displayedBooks.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">Todos los Libros</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayedBooks.map((book, index) => {
                    const bookName = extractBookName(book.name);
                    return (
                      <Link
                        key={book.name}
                        href={`/leer/${versionCode}/${bookName.toLowerCase()}/1`}
                        className="group bg-slate-900/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                            {getBookIcon(bookName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors capitalize truncate">
                              {bookName}
                            </h3>
                            <p className="text-xs text-slate-400">
                              {getChapterCount(book)} caps
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Empty state */}
            {displayedBooks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">No se encontraron libros</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
