'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBibleVersions, setSelectedVersion } from '@/lib/features/bibleVersionsSlice';
import { fetchBibleBooks } from '@/lib/features/bibleBooksSlice';

export function FastNavigation() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { versions, selectedVersion: globalSelectedVersion, loading: versionsLoading } = useAppSelector((state) => state.bibleVersions);
  const { books, loading: booksLoading } = useAppSelector((state) => state.bibleBooks);
  
  const [selectedBook, setSelectedBook] = useState('');
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [showBookSuggestions, setShowBookSuggestions] = useState(false);
  
  const [selectedChapter, setSelectedChapter] = useState('');
  const [chapterSearchQuery, setChapterSearchQuery] = useState('');
  const [showChapterSuggestions, setShowChapterSuggestions] = useState(false);
  
  const [maxChapters, setMaxChapters] = useState(50);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const bookInputRef = useRef<HTMLInputElement>(null);
  const chapterInputRef = useRef<HTMLInputElement>(null);

  // Cargar versiones al montar el componente
  useEffect(() => {
    if (versions.length === 0) {
      dispatch(fetchBibleVersions());
    }
  }, [versions.length, dispatch]);

  // Cargar libros cuando cambia la versión
  useEffect(() => {
    if (globalSelectedVersion) {
      dispatch(fetchBibleBooks(globalSelectedVersion));
      setHasInitialized(false); // Reset cuando cambia la versión
    }
  }, [globalSelectedVersion, dispatch]);

  // Establecer libro por defecto cuando se carguen los libros (SOLO UNA VEZ)
  useEffect(() => {
    if (books.length > 0 && !hasInitialized) {
      const firstBook = books[0];
      const bookName = firstBook.name.replace(' endpoint', '').trim();
      setSelectedBook(bookName);
      setBookSearchQuery(bookName);
      
      if (firstBook.details?.chapters) {
        setMaxChapters(firstBook.details.chapters);
        setSelectedChapter('1');
        setChapterSearchQuery('1');
      }
      
      setHasInitialized(true); // Marcar como inicializado
    }
  }, [books, hasInitialized]);

  // Actualizar máximo de capítulos cuando cambia el libro
  useEffect(() => {
    if (selectedBook && books.length > 0) {
      const currentBook = books.find(book => {
        const bookName = book.name.replace(' endpoint', '').trim();
        return bookName.toLowerCase() === selectedBook.toLowerCase();
      });
      
      if (currentBook?.details?.chapters) {
        setMaxChapters(currentBook.details.chapters);
      }
    }
  }, [selectedBook, books]);

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSelectedVersion(e.target.value));
    setSelectedBook('');
    setBookSearchQuery('');
    setSelectedChapter('');
    setChapterSearchQuery('');
    setHasInitialized(false); // Permitir re-inicialización con la nueva versión
  };

  // Filtrar libros según el texto de búsqueda
  const filteredBooks = books
    .map(book => book.name.replace(' endpoint', '').trim())
    .filter(bookName => 
      bookName.toLowerCase().includes(bookSearchQuery.toLowerCase())
    )
    .slice(0, 10); // Limitar a 10 sugerencias

  // Generar opciones de capítulos filtradas
  const filteredChapters = Array.from({ length: maxChapters }, (_, i) => i + 1)
    .filter(chapter => 
      chapter.toString().includes(chapterSearchQuery)
    )
    .slice(0, 10); // Limitar a 10 sugerencias

  const handleBookInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBookSearchQuery(value);
    setShowBookSuggestions(value.length > 0);
    
    // Limpiar selección si el usuario borra todo
    if (value.length === 0) {
      setSelectedBook('');
      setSelectedChapter('');
      setChapterSearchQuery('');
      return;
    }
    
    // Si hay coincidencia exacta, establecer el libro
    const exactMatch = books.find(book => {
      const bookName = book.name.replace(' endpoint', '').trim();
      return bookName.toLowerCase() === value.toLowerCase();
    });
    
    if (exactMatch) {
      const bookName = exactMatch.name.replace(' endpoint', '').trim();
      setSelectedBook(bookName);
    } else {
      setSelectedBook('');
    }
  };

  const handleBookSelect = (bookName: string) => {
    setSelectedBook(bookName);
    setBookSearchQuery(bookName);
    setShowBookSuggestions(false);
    setSelectedChapter('1');
    setChapterSearchQuery('1');
    
    // Focus en el input de capítulo
    setTimeout(() => chapterInputRef.current?.focus(), 100);
  };

  const handleChapterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setChapterSearchQuery(value);
    setShowChapterSuggestions(true);
    
    // Validar que sea un número válido
    const chapterNum = parseInt(value);
    if (!isNaN(chapterNum) && chapterNum >= 1 && chapterNum <= maxChapters) {
      setSelectedChapter(value);
    } else {
      setSelectedChapter('');
    }
  };

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter.toString());
    setChapterSearchQuery(chapter.toString());
    setShowChapterSuggestions(false);
  };

  const handleReadNow = () => {
    if (!globalSelectedVersion || !selectedBook || !selectedChapter) {
      alert('Por favor selecciona una versión, libro y capítulo válidos');
      return;
    }

    const bookSlug = selectedBook.toLowerCase().replace(/\s+/g, '-');
    router.push(`/leer/${globalSelectedVersion}/${encodeURIComponent(bookSlug)}/${selectedChapter}`);
  };

  const isLoading = versionsLoading || booksLoading;
  const canReadNow = globalSelectedVersion && selectedBook && selectedChapter && !isLoading;

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="relative bg-gradient-to-br from-slate-900/90 to-blue-950/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-50"></div>
        
        <div className="relative">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Navegación Rápida</h2>
            <p className="text-sm text-slate-400 uppercase tracking-wider">
              Selecciona tu destino
            </p>
          </div>

          {/* Bible Version Selection */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Selecciona versión de la Biblia
            </label>
            <div className="relative">
              <select
                value={globalSelectedVersion}
                onChange={handleVersionChange}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {versionsLoading && <option>Cargando versiones...</option>}
                {!versionsLoading && versions.length === 0 && <option>No hay versiones disponibles</option>}
                {versions.map((version) => (
                  <option key={version.version} value={version.version}>
                    {version.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className={`w-5 h-5 text-amber-500 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Book and Chapter Selection with Autocomplete */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Book Autocomplete */}
            <div className="relative">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Selecciona libro
              </label>
              <div className="relative">
                <input
                  ref={bookInputRef}
                  type="text"
                  value={bookSearchQuery}
                  onChange={handleBookInputChange}
                  onFocus={() => setShowBookSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowBookSuggestions(false), 200)}
                  disabled={isLoading || books.length === 0}
                  placeholder="Buscar libro..."
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed capitalize"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className={`w-4 h-4 text-amber-500 transition-opacity ${booksLoading ? 'opacity-50 animate-pulse' : 'opacity-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Suggestions dropdown */}
                {showBookSuggestions && filteredBooks.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                    {filteredBooks.map((bookName) => (
                      <button
                        key={bookName}
                        onClick={() => handleBookSelect(bookName)}
                        className="w-full px-4 py-3 text-left text-white hover:bg-slate-700/50 transition-colors capitalize border-b border-slate-700/50 last:border-b-0"
                      >
                        {bookName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chapter Autocomplete */}
            <div className="relative">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Selecciona capítulo
              </label>
              <div className="relative">
                <input
                  ref={chapterInputRef}
                  type="text"
                  value={chapterSearchQuery}
                  onChange={handleChapterInputChange}
                  onFocus={() => setShowChapterSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowChapterSuggestions(false), 200)}
                  disabled={isLoading || !selectedBook}
                  placeholder="Número..."
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                
                {/* Suggestions dropdown */}
                {showChapterSuggestions && filteredChapters.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                    {filteredChapters.map((chapter) => (
                      <button
                        key={chapter}
                        onClick={() => handleChapterSelect(chapter)}
                        className="w-full px-4 py-3 text-left text-white hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 last:border-b-0"
                      >
                        Capítulo {chapter}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info del libro seleccionado */}
          {selectedBook && maxChapters && (
            <div className="mb-6 text-center text-sm text-slate-400">
              <span className="capitalize">{selectedBook}</span> tiene {maxChapters} capítulos
            </div>
          )}

          {/* Read Now Button */}
          <button
            onClick={handleReadNow}
            disabled={!canReadNow}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-500"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Leer Ahora</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
