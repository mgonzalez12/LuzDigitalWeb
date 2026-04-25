'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Portal } from '../Portal';
import type { BibleEntryDisplay, BibleTopic } from '@/lib/bibleTopics';

interface Props {
  isOpen: boolean;
  topic: BibleTopic | null;
  entries: BibleEntryDisplay[];
  isLoading: boolean;
  versionCode: string;
  onClose: () => void;
}

/**
 * Modal que muestra las entradas (libros o capítulos concretos) de un tema.
 * Equivalente al `BibleEntryListSheet` del iOS.
 */
export function TopicEntriesModal({ isOpen, topic, entries, isLoading, versionCode, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !topic) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
        <div className="relative z-[10000] w-full max-w-3xl max-h-[80vh] flex flex-col bg-gradient-to-br from-slate-900/95 to-blue-950/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-start gap-4 p-6 md:p-8 border-b border-slate-800/60">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ backgroundColor: hexToRgba(topic.tint, 0.85) }}
            >
              {topic.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold text-white">{topic.label}</h2>
              <p className="text-sm text-slate-400 mt-1">
                Toca una entrada para abrirla en el lector.
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="text-slate-400 hover:text-white p-1 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <p className="text-center text-slate-400 py-8">
                No hay entradas disponibles en esta versión.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {entries.map((e) => (
                  <Link
                    key={e.id}
                    href={`/leer/${versionCode}/${e.bookSlug}/${e.chapter}`}
                    onClick={onClose}
                    className="group flex items-center gap-3 p-3 bg-slate-800/40 hover:bg-slate-800/70 rounded-xl border border-slate-700/40 hover:border-blue-500/50 transition-all"
                  >
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded bg-slate-900/70 text-slate-400">
                      {e.testament === 'new' ? 'NT' : 'AT'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate capitalize">
                        {e.label}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{e.subtitle}</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace('#', '');
  const r = parseInt(m.substring(0, 2), 16);
  const g = parseInt(m.substring(2, 4), 16);
  const b = parseInt(m.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
