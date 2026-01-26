'use client';

import { useEffect, useRef, useState } from 'react';

type FloatingActionsProps = {
  fontSize: number;
  onDecreaseFont: () => void;
  onIncreaseFont: () => void;
};

export function FloatingActions({ fontSize, onDecreaseFont, onIncreaseFont }: FloatingActionsProps) {
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
      </div>
    </div>
  );
}
