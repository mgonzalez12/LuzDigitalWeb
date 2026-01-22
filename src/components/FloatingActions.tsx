'use client';

import { useEffect, useRef, useState } from 'react';

type FloatingActionsProps = {
  fontSize: number;
  onDecreaseFont: () => void;
  onIncreaseFont: () => void;
};

export function FloatingActions({ fontSize, onDecreaseFont, onIncreaseFont }: FloatingActionsProps) {
  const [showNotes, setShowNotes] = useState(true);
  const [activePanel, setActivePanel] = useState<'text' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar popover al hacer click fuera
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActivePanel(null);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed right-5 bottom-6 z-40 flex flex-col items-center gap-3"
    >
      {/* Popover: Tamaño de texto */}
      {activePanel === 'text' && (
        <div className="mb-1 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-700/50 bg-slate-950/70 backdrop-blur-xl p-4 shadow-2xl">
          <div className="text-xs text-slate-400 tracking-widest uppercase mb-3">
            Tamaño de texto
          </div>
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onDecreaseFont}
              className="w-12 h-12 rounded-full bg-slate-900/60 border border-slate-700/50 text-white hover:bg-slate-800 transition-all"
              aria-label="Disminuir tamaño"
            >
              A-
            </button>
            <div className="text-2xl font-semibold text-white tabular-nums">
              {fontSize}
            </div>
            <button
              type="button"
              onClick={onIncreaseFont}
              className="w-12 h-12 rounded-full bg-slate-900/60 border border-slate-700/50 text-white hover:bg-slate-800 transition-all"
              aria-label="Aumentar tamaño"
            >
              A+
            </button>
          </div>
        </div>
      )}

      {/* Pill */}
      <div className="rounded-[28px] border border-slate-700/50 bg-slate-950/40 backdrop-blur-xl shadow-2xl px-3 py-3 flex flex-col gap-3">
        {/* Text Size */}
        <button
          type="button"
          onClick={() => setActivePanel((p) => (p === 'text' ? null : 'text'))}
          className={`w-14 h-14 rounded-2xl border transition-all flex items-center justify-center ${
            activePanel === 'text'
              ? 'bg-amber-400 text-slate-900 border-amber-200'
              : 'bg-slate-900/40 text-slate-200 border-slate-700/50 hover:bg-slate-800/50'
          }`}
          title="Ajustar tamaño de texto"
          aria-label="Ajustar tamaño de texto"
        >
          <span className="text-2xl font-serif">T</span>
        </button>

        {/* Toggle Notes/Annotations (solo UI por ahora) */}
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="w-14 h-14 rounded-2xl bg-slate-900/40 border border-slate-700/50 flex items-center justify-center text-slate-200 hover:bg-slate-800/50 transition-all"
          title={showNotes ? 'Ocultar notas' : 'Mostrar notas'}
          aria-label={showNotes ? 'Ocultar notas' : 'Mostrar notas'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {showNotes ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            ) : (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </>
            )}
          </svg>
        </button>

        {/* Add Note/Highlight (solo UI por ahora) */}
        <button
          type="button"
          className="w-14 h-14 rounded-2xl bg-slate-900/40 border border-slate-700/50 flex items-center justify-center text-slate-200 hover:bg-slate-800/50 transition-all"
          title="Añadir nota o resaltado"
          aria-label="Añadir nota o resaltado"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
