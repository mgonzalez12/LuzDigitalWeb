'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';

interface BookProgress {
  name: string;
  chapters: number;
  readChapters: number;
  progress: number;
}

export function ProgressIndicator() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [books, setBooks] = useState<BookProgress[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!isAuthenticated) {
        if (!cancelled) setBooks([]);
        return;
      }

      // Trae progreso agregado (view en Supabase). Limitamos a 3 para UI.
      const { data } = await supabase
        .from('user_book_progress')
        .select('book_name, chapter_count, read_chapters, progress_percent')
        .order('progress_percent', { ascending: false })
        .limit(3);

      if (cancelled) return;

      setBooks(
        (data ?? []).map((row: any) => ({
          name: row.book_name,
          chapters: row.chapter_count,
          readChapters: row.read_chapters,
          progress: Number(row.progress_percent ?? 0),
        }))
      );
    };

    load();

    const onUpdated = () => load();
    window.addEventListener('luz:reading-updated', onUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener('luz:reading-updated', onUpdated);
    };
  }, [isAuthenticated]);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/50 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Tu Progreso</h3>
          <p className="text-sm text-slate-600 dark:text-gray-400">Sin prisa, a tu ritmo</p>
        </div>
      </div>

      <div className="space-y-4">
        {books.length > 0 ? (
          books.map((book) => (
          <div key={book.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900 dark:text-white">{book.name}</span>
              <span className="text-slate-600 dark:text-gray-400">
                {book.readChapters}/{book.chapters} capítulos
              </span>
            </div>
            <div className="relative h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${book.progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
          ))
        ) : (
          <div className="text-sm text-slate-600 dark:text-gray-400">
            Lee un capítulo para empezar a ver tu progreso.
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-gray-400">Progreso general</span>
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {books.length > 0
              ? Math.round(books.reduce((acc, book) => acc + book.progress, 0) / books.length)
              : 0}
            %
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
          Cada paso cuenta en tu camino espiritual ✨
        </p>
      </div>
    </div>
  );
}
