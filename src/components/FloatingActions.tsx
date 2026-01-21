'use client';

import { useState } from 'react';

export function FloatingActions() {
  const [showNotes, setShowNotes] = useState(true);

  return (
    <div className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-40">
      {/* Text Size */}
      <button
        className="w-12 h-12 rounded-full bg-slate-800 dark:bg-zinc-900 border border-slate-700 dark:border-zinc-800 flex items-center justify-center text-white hover:bg-blue-500 hover:border-blue-500 transition-all shadow-lg group"
        title="Ajustar tamaño de texto"
      >
        <span className="text-sm font-bold group-hover:scale-110 transition-transform">TT</span>
      </button>

      {/* Toggle Notes/Annotations */}
      <button
        onClick={() => setShowNotes(!showNotes)}
        className="w-12 h-12 rounded-full bg-slate-800 dark:bg-zinc-900 border border-slate-700 dark:border-zinc-800 flex items-center justify-center text-white hover:bg-blue-500 hover:border-blue-500 transition-all shadow-lg group"
        title={showNotes ? 'Ocultar notas' : 'Mostrar notas'}
      >
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {showNotes ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          ) : (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </>
          )}
        </svg>
      </button>

      {/* Add Note/Highlight */}
      <button
        className="w-12 h-12 rounded-full bg-slate-800 dark:bg-zinc-900 border border-slate-700 dark:border-zinc-800 flex items-center justify-center text-white hover:bg-blue-500 hover:border-blue-500 transition-all shadow-lg group"
        title="Añadir nota o resaltado"
      >
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
  );
}
