'use client';

import { useState, useEffect } from 'react';

interface Verse {
  verse: string;
  number: number;
  study?: string;
  id: number;
}

interface BibleBook {
  name: string;
  info: string;
  byChapter: string;
}

interface BookDetails {
  names: string[];
  abrev: string;
  chapters: number;
  testament: string;
}

interface ChapterData {
  testament: string;
  name: string;
  num_chapters: number;
  chapter: number;
  vers: Verse[];
}

const STORAGE_KEY = 'daily_verse';
const DATE_KEY = 'daily_verse_date';
const VERSION = 'rv1960'; // Versión por defecto

// Función para generar un número aleatorio determinístico basado en la fecha
function getDailySeed(date: Date): number {
  const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Función para obtener un número aleatorio basado en una semilla
function seededRandom(seed: number, max: number): number {
  return seed % max;
}

// Función para obtener el versículo del día desde la API
async function getDailyVerseFromAPI(): Promise<{ text: string; reference: string }> {
  const today = new Date();
  // Formato de fecha: YYYY-MM-DD (con padding para mes y día)
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Verificar si hay un versículo guardado para hoy
  if (typeof window !== 'undefined') {
    const savedDate = localStorage.getItem(DATE_KEY);
    const savedVerse = localStorage.getItem(STORAGE_KEY);
    
    if (savedDate === todayString && savedVerse) {
      try {
        return JSON.parse(savedVerse);
      } catch (e) {
        // Si hay error al parsear, continuar para generar uno nuevo
      }
    }
  }
  
  try {
    // 1. Obtener lista de libros
    const booksResponse = await fetch(`https://bible-api.deno.dev/api/read/${VERSION}`);
    if (!booksResponse.ok) {
      throw new Error(`Failed to fetch Bible books: ${booksResponse.status} ${booksResponse.statusText}`);
    }
    const books: BibleBook[] = await booksResponse.json();
    
    if (!books || books.length === 0) {
      throw new Error('No books available');
    }
    
    // 2. Seleccionar un libro aleatorio basado en la fecha
    const seed = getDailySeed(today);
    const bookIndex = seededRandom(seed, books.length);
    const selectedBook = books[bookIndex];
    
    if (!selectedBook) {
      throw new Error('Selected book is invalid');
    }
    
    // 3. Obtener detalles del libro para saber cuántos capítulos tiene
    let chaptersCount = 50; // Valor por defecto si falla
    try {
      if (selectedBook.info) {
        const bookDetailsResponse = await fetch(`https://bible-api.deno.dev${selectedBook.info}`);
        if (bookDetailsResponse.ok) {
          const bookDetails: BookDetails = await bookDetailsResponse.json();
          if (bookDetails && bookDetails.chapters && bookDetails.chapters > 0) {
            chaptersCount = bookDetails.chapters;
          }
        }
      }
    } catch (e) {
      // Si falla, usar valor por defecto
      console.warn('Could not fetch book details, using default chapter count');
    }
    
    // Asegurarse de que chaptersCount sea válido
    if (chaptersCount <= 0) {
      chaptersCount = 50; // Valor por defecto seguro
    }
    
    // 4. Construir el nombre del libro para la URL
    // Limpiar el nombre del libro: remover " endpoint", espacios, y convertir a minúsculas
    let bookName = selectedBook.name
      .replace(' endpoint', '')
      .replace(/\s+/g, '')
      .toLowerCase()
      .trim();
    
    // Si byChapter está disponible, extraer el nombre del libro de ahí
    if (selectedBook.byChapter) {
      // byChapter es algo como "/api/read/rv1960/genesis"
      const match = selectedBook.byChapter.match(/\/([^/]+)$/);
      if (match && match[1]) {
        bookName = match[1];
      }
    }
    
    // 5. Intentar obtener un capítulo válido (con retry si el capítulo está vacío)
    const chapterSeed = getDailySeed(today) + 1000;
    let chapterData: ChapterData | null = null;
    let chapterNumber = 0;
    const maxRetries = Math.min(10, chaptersCount); // Intentar hasta 10 capítulos diferentes
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // Seleccionar un capítulo aleatorio (diferente en cada intento)
      const chapterOffset = seededRandom(chapterSeed + attempt * 100, chaptersCount);
      chapterNumber = chapterOffset + 1; // +1 porque los capítulos empiezan en 1
      
      // Construir la URL del capítulo
      const chapterUrl = `https://bible-api.deno.dev/api/read/${VERSION}/${bookName}/${chapterNumber}`;
      
      try {
        const chapterResponse = await fetch(chapterUrl);
        
        if (!chapterResponse.ok) {
          // Si es 404, el capítulo no existe, intentar siguiente
          if (chapterResponse.status === 404) {
            continue;
          }
          // Para otros errores, también continuar
          continue;
        }
        
        const data: ChapterData = await chapterResponse.json();
        
        // Verificar que el capítulo tenga versículos
        if (data && data.vers && Array.isArray(data.vers) && data.vers.length > 0) {
          chapterData = data;
          break; // Capítulo válido encontrado
        }
      } catch (e) {
        // Continuar con el siguiente intento
        continue;
      }
    }
    
    // Si después de todos los intentos no encontramos un capítulo válido
    if (!chapterData || !chapterData.vers || chapterData.vers.length === 0) {
      // Intentar con un libro conocido que siempre funciona (Juan capítulo 3)
      console.warn('Could not find valid chapter, trying fallback: Juan 3');
      try {
        const fallbackResponse = await fetch(`https://bible-api.deno.dev/api/read/${VERSION}/juan/3`);
        if (fallbackResponse.ok) {
          const fallbackData: ChapterData = await fallbackResponse.json();
          if (fallbackData && fallbackData.vers && fallbackData.vers.length > 0) {
            const verseSeed = getDailySeed(today) + 2000;
            const verseIndex = seededRandom(verseSeed, fallbackData.vers.length);
            const selectedVerse = fallbackData.vers[verseIndex];
            
            const result = {
              text: selectedVerse.verse,
              reference: `Juan 3:${selectedVerse.number}`
            };
            
            if (typeof window !== 'undefined') {
              localStorage.setItem(DATE_KEY, todayString);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
            }
            
            return result;
          }
        }
      } catch (e) {
        // Si el fallback también falla, lanzar el error original
      }
      
      throw new Error('Could not find a valid chapter with verses after all attempts');
    }
    
    // 6. Seleccionar un versículo aleatorio del capítulo
    const verseSeed = getDailySeed(today) + 2000;
    const verseIndex = seededRandom(verseSeed, chapterData.vers.length);
    const selectedVerse = chapterData.vers[verseIndex];
    
    if (!selectedVerse || !selectedVerse.verse) {
      throw new Error('Selected verse is invalid');
    }
    
    // 7. Formatear la referencia
    const bookDisplayName = chapterData.name || selectedBook.name.replace(' endpoint', '').trim();
    const reference = `${bookDisplayName} ${chapterNumber}:${selectedVerse.number}`;
    
    const result = {
      text: selectedVerse.verse,
      reference: reference
    };
    
    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(DATE_KEY, todayString);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    }
    
    return result;
  } catch (error) {
    // Mostrar el error completo para debugging
    console.error('Error fetching daily verse from API:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Fallback a un versículo por defecto en caso de error
    return {
      text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
      reference: "Juan 3:16"
    };
  }
}

export function DailyVerse() {
  const [todayVerse, setTodayVerse] = useState<{ text: string; reference: string }>({
    text: "Cargando...",
    reference: ""
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Primero verificar si hay un versículo guardado para hoy (síncrono)
    const today = new Date();
    // Formato de fecha: YYYY-MM-DD (con padding para mes y día)
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    if (typeof window !== 'undefined') {
      const savedDate = localStorage.getItem(DATE_KEY);
      const savedVerse = localStorage.getItem(STORAGE_KEY);
      
      if (savedDate === todayString && savedVerse) {
        try {
          const verse = JSON.parse(savedVerse);
          setTodayVerse(verse);
          setIsLoading(false);
          return; // Ya tenemos el versículo, no necesitamos hacer fetch
        } catch (e) {
          // Si hay error al parsear, continuar para obtener uno nuevo
        }
      }
    }
    
    // Si no hay versículo guardado para hoy, cargarlo desde la API
    const loadVerse = async () => {
      setIsLoading(true);
      try {
        const verse = await getDailyVerseFromAPI();
        setTodayVerse(verse);
      } catch (error) {
        console.error('Error loading daily verse:', error);
        setTodayVerse({
          text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
          reference: "Juan 3:16"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVerse();
  }, []);

  const handleSave = () => {
    setIsSaved(!isSaved);
    // Aquí iría la lógica para guardar en favoritos
  };

  return (
    <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/30 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Versículo del Día</span>
          </div>
          <button
            onClick={handleSave}
            className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
            aria-label={isSaved ? "Remover de favoritos" : "Guardar en favoritos"}
          >
            <svg 
              className={`w-5 h-5 transition-colors ${isSaved ? 'text-amber-500 fill-current' : 'text-slate-400 dark:text-gray-500'}`} 
              fill={isSaved ? "currentColor" : "none"} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="mb-4 space-y-3">
            <div className="h-6 bg-amber-200/50 dark:bg-amber-900/20 rounded animate-pulse"></div>
            <div className="h-4 bg-amber-200/50 dark:bg-amber-900/20 rounded w-3/4 animate-pulse"></div>
          </div>
        ) : (
          <>
            <blockquote className="mb-4">
              <p className="text-lg md:text-xl leading-relaxed text-slate-800 dark:text-gray-200 italic">
                "{todayVerse.text}"
              </p>
            </blockquote>

            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              — {todayVerse.reference}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
