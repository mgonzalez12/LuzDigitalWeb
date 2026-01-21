'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';

// Diccionario de nombres de libros con correcciones comunes
const BOOK_NAMES: Record<string, string> = {
  // Pentateuco
  'genesis': 'genesis',
  'genisis': 'genesis', // typo común
  'génesis': 'genesis',
  'exodo': 'exodo',
  'éxodo': 'exodo',
  'levitico': 'levitico',
  'levítico': 'levitico',
  'numeros': 'numeros',
  'números': 'numeros',
  'deuteronomio': 'deuteronomio',
  
  // Históricos
  'josue': 'josue',
  'josué': 'josue',
  'jueces': 'jueces',
  'rut': 'rut',
  'ruth': 'rut',
  '1-samuel': '1-samuel',
  '1samuel': '1-samuel',
  'i-samuel': '1-samuel',
  '2-samuel': '2-samuel',
  '2samuel': '2-samuel',
  'ii-samuel': '2-samuel',
  '1-reyes': '1-reyes',
  '1reyes': '1-reyes',
  '2-reyes': '2-reyes',
  '2reyes': '2-reyes',
  
  // Poéticos
  'salmos': 'salmos',
  'salmo': 'salmos',
  'proverbios': 'proverbios',
  'eclesiastes': 'eclesiastes',
  'cantares': 'cantares',
  'job': 'job',
  
  // Profetas
  'isaias': 'isaias',
  'isaías': 'isaias',
  'jeremias': 'jeremias',
  'jeremías': 'jeremias',
  'ezequiel': 'ezequiel',
  'daniel': 'daniel',
  'oseas': 'oseas',
  'joel': 'joel',
  'amos': 'amos',
  'amós': 'amos',
  'abdias': 'abdias',
  'abdías': 'abdias',
  'jonas': 'jonas',
  'jonás': 'jonas',
  'miqueas': 'miqueas',
  'nahum': 'nahum',
  'habacuc': 'habacuc',
  'sofonias': 'sofonias',
  'sofonías': 'sofonias',
  'hageo': 'hageo',
  'zacarias': 'zacarias',
  'zacarías': 'zacarias',
  'malaquias': 'malaquias',
  'malaquías': 'malaquias',
  
  // Nuevo Testamento
  'mateo': 'mateo',
  'marcos': 'marcos',
  'lucas': 'lucas',
  'juan': 'juan',
  'hechos': 'hechos',
  'romanos': 'romanos',
  '1-corintios': '1-corintios',
  '1corintios': '1-corintios',
  '2-corintios': '2-corintios',
  '2corintios': '2-corintios',
  'galatas': 'galatas',
  'gálatas': 'galatas',
  'efesios': 'efesios',
  'filipenses': 'filipenses',
  'colosenses': 'colosenses',
  '1-tesalonicenses': '1-tesalonicenses',
  '1tesalonicenses': '1-tesalonicenses',
  '2-tesalonicenses': '2-tesalonicenses',
  '2tesalonicenses': '2-tesalonicenses',
  '1-timoteo': '1-timoteo',
  '1timoteo': '1-timoteo',
  '2-timoteo': '2-timoteo',
  '2timoteo': '2-timoteo',
  'tito': 'tito',
  'filemon': 'filemon',
  'filemón': 'filemon',
  'hebreos': 'hebreos',
  'santiago': 'santiago',
  '1-pedro': '1-pedro',
  '1pedro': '1-pedro',
  '2-pedro': '2-pedro',
  '2pedro': '2-pedro',
  '1-juan': '1-juan',
  '1juan': '1-juan',
  '2-juan': '2-juan',
  '2juan': '2-juan',
  '3-juan': '3-juan',
  '3juan': '3-juan',
  'judas': 'judas',
  'apocalipsis': 'apocalipsis',
};

export function VerseSearchBar() {
  const router = useRouter();
  const { selectedVersion } = useAppSelector((state) => state.bibleVersions);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Por favor ingresa una búsqueda');
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      // Parsear la búsqueda
      // Formato esperado: "Genesis 1:1" o "Juan 3:16-17" o "Salmos 23"
      const parsed = parseVerseReference(searchQuery);
      
      if (!parsed) {
        setError('Libro no encontrado o formato inválido. Ejemplo: "Genesis 1:1" o "Juan 3:16"');
        setIsSearching(false);
        return;
      }

      // Navegar a la página de versículos o capítulo según lo buscado
      if (parsed.verse) {
        // Si tiene versículo específico, ir a la vista de versículos
        router.push(`/v/${selectedVersion}/${parsed.book}/${parsed.chapter}/${parsed.verse}`);
      } else {
        // Si solo es capítulo, ir a la vista de lectura completa
        router.push(`/leer/${selectedVersion}/${parsed.book}/${parsed.chapter}`);
      }
      
    } catch (err) {
      setError('Error al buscar. Intenta de nuevo.');
    } finally {
      setIsSearching(false);
    }
  };

  const normalizeBookName = (bookName: string): string | null => {
    // Normalizar: lowercase, remover acentos opcionales, espacios a guiones
    const normalized = bookName.trim().toLowerCase().replace(/\s+/g, '-');
    
    // Buscar en el diccionario
    if (BOOK_NAMES[normalized]) {
      return BOOK_NAMES[normalized];
    }
    
    // Si no se encuentra, intentar sin guiones
    const withoutDashes = normalized.replace(/-/g, '');
    if (BOOK_NAMES[withoutDashes]) {
      return BOOK_NAMES[withoutDashes];
    }
    
    // Si no se encuentra, intentar con espacios
    const withSpaces = normalized.replace(/-/g, ' ');
    if (BOOK_NAMES[withSpaces]) {
      return BOOK_NAMES[withSpaces];
    }
    
    return null;
  };

  const parseVerseReference = (query: string): { book: string; chapter: string; verse?: string } | null => {
    // Remover espacios extras
    query = query.trim();
    
    // Patrones comunes:
    // "Genesis 1:1"
    // "Juan 3:16"
    // "Salmos 23"
    // "1 Corintios 13:4-7"
    
    const patterns = [
      // Patrón con versículo: "Genesis 1:1" o "Genesis 1:1-3"
      /^(.+?)\s+(\d+):(\d+(?:-\d+)?)$/i,
      // Patrón sin versículo: "Genesis 1"
      /^(.+?)\s+(\d+)$/i,
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match) {
        const rawBookName = match[1].trim();
        const chapter = match[2];
        const verse = match[3] || undefined;
        
        // Normalizar el nombre del libro
        const normalizedBook = normalizeBookName(rawBookName);
        
        if (!normalizedBook) {
          // Si no se encuentra el libro, retornar null
          return null;
        }
        
        return { book: normalizedBook, chapter, verse };
      }
    }

    return null;
  };

  const handleClose = () => {
    setSearchQuery('');
    setError('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setError('');
            }}
            placeholder='Buscar versículo: ej. "Genesis 1:1" o "Juan 3:16"'
            className="w-full px-6 py-4 pl-14 pr-20 bg-slate-800/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isSearching}
          />
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Action Buttons */}
          <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
            {searchQuery && (
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white border border-slate-600 rounded-lg transition-colors"
              >
                ESC
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mt-2 text-sm text-red-400 px-2">
            {error}
          </div>
        )}
        
        {/* Help text */}
        {!error && (
          <div className="mt-2 text-xs text-slate-500 px-2">
            Ejemplos: "Genesis 1:1", "Juan 3:16", "Salmos 23:1-6", "1 Corintios 13:4"
          </div>
        )}
      </form>
    </div>
  );
}
