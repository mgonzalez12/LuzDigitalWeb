'use client';

import { TOPIC_CATALOG, type BibleTopic } from '@/lib/bibleTopics';

interface Props {
  /** Conteo de entradas resueltas por topic id (para mostrar "N entradas"). */
  countsById: Record<string, number | undefined>;
  onSelect: (topic: BibleTopic) => void;
}

export function TopicGrid({ countsById, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
      {TOPIC_CATALOG.map((t) => {
        const count = countsById[t.id];
        const subtitle = count != null
          ? `${count} ${count === 1 ? 'entrada' : 'entradas'}`
          : defaultSubtitle(t);
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t)}
            className="group flex items-center gap-3 p-3 md:p-4 bg-slate-900/50 hover:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all text-left"
          >
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0"
              style={{ backgroundColor: hexToRgba(t.tint, 0.85) }}
            >
              {t.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                {t.label}
              </h3>
              <p className="text-xs md:text-sm text-slate-400 truncate">{subtitle}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function defaultSubtitle(t: BibleTopic): string {
  switch (t.source.kind) {
    case 'fixedEntries':
      return `${t.source.entries.length} entradas`;
    case 'allBooks':
      return 'Todos los libros';
    case 'testament':
      return t.source.testament === 'old' ? '39 libros' : '27 libros';
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace('#', '');
  const r = parseInt(m.substring(0, 2), 16);
  const g = parseInt(m.substring(2, 4), 16);
  const b = parseInt(m.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
