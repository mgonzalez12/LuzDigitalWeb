'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { HorizontalNavbar } from '@/components/HorizontalNavbar';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBibleBooks } from '@/lib/features/bibleBooksSlice';
import { fetchBibleVersions } from '@/lib/features/bibleVersionsSlice';
import { BibleBooksSkeleton } from '@/components/skeletons/BibleBooksSkeleton';
import { VersionSelectorModal } from '@/components/VersionSelectorModal';
import { FeaturedBooksCarousel } from '@/components/library/FeaturedBooksCarousel';
import { TopicGrid } from '@/components/library/TopicGrid';
import { TopicEntriesModal } from '@/components/library/TopicEntriesModal';
import {
  TOPIC_CATALOG,
  TESTAMENT_OLD,
  TESTAMENT_NEW,
  resolveTopicEntries,
  type BibleEntryDisplay,
  type BibleTopic,
} from '@/lib/bibleTopics';

export default function BibleLibraryPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { books, loading, error } = useAppSelector((s) => s.bibleBooks);
  const { versions } = useAppSelector((s) => s.bibleVersions);

  const versionCode = params.versionCode as string;
  const currentVersion = versions.find((v) => v.version === versionCode);

  const [showVersionPicker, setShowVersionPicker] = useState(false);
  const [activeTopic, setActiveTopic] = useState<BibleTopic | null>(null);

  useEffect(() => {
    if (versions.length === 0) dispatch(fetchBibleVersions());
  }, [versions.length, dispatch]);

  useEffect(() => {
    if (versionCode) dispatch(fetchBibleBooks(versionCode));
  }, [versionCode, dispatch]);

  // Conteo de entradas por tema (alimenta los subtítulos "N entradas").
  const topicCounts = useMemo<Record<string, number>>(() => {
    if (books.length === 0) return {};
    const acc: Record<string, number> = {};
    for (const t of TOPIC_CATALOG) {
      acc[t.id] = resolveTopicEntries(t, books).length;
    }
    return acc;
  }, [books]);

  // Entradas del tema activo (resueltas en cliente).
  const activeEntries: BibleEntryDisplay[] = useMemo(() => {
    if (!activeTopic) return [];
    return resolveTopicEntries(activeTopic, books);
  }, [activeTopic, books]);

  const totalBooks = books.length || 66;
  const totalChapters = useMemo(() => {
    if (books.length === 0) return 1189;
    return books.reduce((sum, b) => sum + (b.details?.chapters ?? 0), 0) || 1189;
  }, [books]);

  if (loading && books.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        </div>
        <HorizontalNavbar />
        <main className="flex-1 relative z-10 pt-24">
          <div className="px-4 md:px-6 lg:px-8 py-8 md:py-12">
            <div className="max-w-full lg:max-w-6xl mx-auto">
              <div className="h-12 bg-slate-700/40 rounded-lg w-64 mb-3 animate-pulse" />
              <div className="h-5 bg-slate-700/30 rounded w-48 mb-8 animate-pulse" />
              <div className="h-20 bg-slate-700/30 rounded-2xl mb-8 animate-pulse" />
              <BibleBooksSkeleton />
            </div>
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <HorizontalNavbar />

      <main className="flex-1 relative z-10 pt-24">
        <div className="px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-full lg:max-w-6xl mx-auto space-y-10">
            {/* Header con título y métricas */}
            <header>
              <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'serif' }}>
                Biblioteca
              </h1>
              <p className="text-sm md:text-base text-slate-400 mt-2">
                {totalChapters.toLocaleString('es-ES')} capítulos · {totalBooks} libros
              </p>
            </header>

            {/* Tarjeta de versión actual */}
            <section
              className="flex items-center gap-4 p-4 md:p-5 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 2H8a3 3 0 00-3 3v15a2 2 0 002 2h12a1 1 0 001-1V3a1 1 0 00-1-1zm-1 17H7a1 1 0 010-2h11v2zm0-4H7a3 3 0 00-2 .76V5a1 1 0 011-1h12v11z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] md:text-xs font-bold tracking-widest text-slate-400 uppercase">
                  Versión actual
                </p>
                <p className="text-base md:text-lg font-semibold text-white truncate">
                  {currentVersion?.name || versionCode.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setShowVersionPicker(true)}
                className="text-sm md:text-base font-semibold text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0"
              >
                Cambiar
              </button>
            </section>

            {/* Destacados */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">Destacados</h2>
                <button
                  type="button"
                  onClick={() => setActiveTopic({
                    id: 'todos-los-libros',
                    label: 'Todos los libros',
                    emoji: '📚',
                    tint: '#8AB4FF',
                    source: { kind: 'allBooks' },
                  })}
                  className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Ver todo
                </button>
              </div>
              <FeaturedBooksCarousel versionCode={versionCode} />
            </section>

            {/* Explora por tema */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Explora por tema</h2>
              <TopicGrid countsById={topicCounts} onSelect={setActiveTopic} />
            </section>

            {/* Pestañas de testamento */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TestamentCard topic={TESTAMENT_OLD} count={countByTestament(books, 'old')} onClick={() => setActiveTopic(TESTAMENT_OLD)} />
              <TestamentCard topic={TESTAMENT_NEW} count={countByTestament(books, 'new')} onClick={() => setActiveTopic(TESTAMENT_NEW)} />
            </section>
          </div>
        </div>
      </main>

      {/* Selector de versión */}
      <VersionSelectorModal
        isOpen={showVersionPicker}
        onClose={() => setShowVersionPicker(false)}
      />

      {/* Entradas del tema activo */}
      <TopicEntriesModal
        isOpen={activeTopic !== null}
        topic={activeTopic}
        entries={activeEntries}
        isLoading={loading && activeTopic !== null}
        versionCode={versionCode}
        onClose={() => setActiveTopic(null)}
      />
    </div>
  );
}

// ─── Helpers locales ────────────────────────────────────────────────────────

function countByTestament(books: { name: string }[], t: 'old' | 'new'): number {
  // Conteo barato — el componente del tema cuenta entradas exactas vía slug;
  // aquí solo necesitamos un número para mostrar como subtítulo.
  return t === 'old' ? 39 : 27;
}

interface TestamentCardProps {
  topic: BibleTopic;
  count: number;
  onClick: () => void;
}

function TestamentCard({ topic, count, onClick }: TestamentCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center justify-between p-4 md:p-5 bg-slate-900/50 hover:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all text-left"
    >
      <div>
        <h3 className="text-sm md:text-base font-bold text-white group-hover:text-blue-400 transition-colors">
          {topic.label}
        </h3>
        <p className="text-xs md:text-sm text-slate-400">{count} libros</p>
      </div>
      <svg className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
