'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HorizontalNavbar } from '@/components/HorizontalNavbar';
import { supabase } from '@/lib/supabase';
import { useAppSelector } from '@/lib/hooks';

type BookmarkRow = {
  user_id: string;
  version_code: string;
  book_slug: string;
  chapter_number: number;
  verse_number: number;
  note: string | null;
  created_at: string;
};

type BookMeta = {
  version_code: string;
  slug: string;
  name: string;
  testament: 'old' | 'new';
};

type ChapterData = {
  testament: string;
  name: string;
  num_chapters: number;
  chapter: number;
  vers: Array<{ number: number; verse: string }>;
};

type ViewMode = 'grid' | 'list';
type TestamentFilter = 'all' | 'old' | 'new';

const formatDateEs = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

const testamentLabel = (t: 'old' | 'new') => (t === 'old' ? 'AT' : 'NT');

export default function MarcadoresPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, user } = useAppSelector((s) => s.auth);

  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([]);
  const [booksMeta, setBooksMeta] = useState<Map<string, BookMeta>>(new Map());
  const [chapterCache, setChapterCache] = useState<Map<string, ChapterData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [testament, setTestament] = useState<TestamentFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuKey(null);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      if (!isAuthenticated || !user?.id) {
        if (!cancelled) {
          setBookmarks([]);
          setBooksMeta(new Map());
          setChapterCache(new Map());
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      const { data: bm, error: bmError } = await supabase
        .from('user_verse_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (bmError) {
        console.error(bmError);
      }

      const bookmarksRows = (bm ?? []) as BookmarkRow[];

      // Cargar metadatos de libros (solo versiones presentes)
      const versions = Array.from(new Set(bookmarksRows.map((r) => r.version_code)));
      let metaMap = new Map<string, BookMeta>();
      if (versions.length > 0) {
        const { data: books } = await supabase
          .from('bible_books')
          .select('version_code,slug,name,testament')
          .in('version_code', versions);
        metaMap = new Map(
          (books ?? []).map((b: any) => [`${b.version_code}:${b.slug}`, b as BookMeta])
        );
      }

      // Traer capítulos agrupados para resolver texto del versículo
      const uniqueChapters = Array.from(
        new Set(bookmarksRows.map((r) => `${r.version_code}:${r.book_slug}:${r.chapter_number}`))
      );

      const newCache = new Map<string, ChapterData>();
      for (const key of uniqueChapters) {
        // eslint-disable-next-line no-await-in-loop
        const [v, b, ch] = key.split(':');
        try {
          const res = await fetch(`https://bible-api.deno.dev/api/read/${v}/${b}/${ch}`, {
            signal: controller.signal,
          });
          if (!res.ok) continue;
          // eslint-disable-next-line no-await-in-loop
          const data = (await res.json()) as ChapterData;
          newCache.set(key, data);
        } catch (e) {
          // abort / network
        }
      }

      if (cancelled) return;
      setBookmarks(bookmarksRows);
      setBooksMeta(metaMap);
      setChapterCache(newCache);
      setIsLoading(false);
    };

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isAuthenticated, user?.id]);

  const enriched = useMemo(() => {
    return bookmarks.map((r) => {
      const meta = booksMeta.get(`${r.version_code}:${r.book_slug}`);
      const chapterKey = `${r.version_code}:${r.book_slug}:${r.chapter_number}`;
      const chapter = chapterCache.get(chapterKey);
      const verseText =
        chapter?.vers?.find((v) => Number(v.number) === Number(r.verse_number))?.verse ?? '';

      const bookName = meta?.name ?? r.book_slug;
      const t = meta?.testament === 'new' ? 'new' : meta?.testament === 'old' ? 'old' : null;

      return {
        ...r,
        bookName,
        testament: t,
        verseText,
      };
    });
  }, [bookmarks, booksMeta, chapterCache]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byTestament = (row: any) => {
      if (testament === 'all') return true;
      return row.testament === testament;
    };

    const byQuery = (row: any) => {
      if (!q) return true;
      const ref = `${row.bookName} ${row.chapter_number}:${row.verse_number}`.toLowerCase();
      return (
        ref.includes(q) ||
        (row.verseText ?? '').toLowerCase().includes(q) ||
        (row.note ?? '').toLowerCase().includes(q)
      );
    };

    return enriched.filter((r) => byTestament(r) && byQuery(r));
  }, [enriched, search, testament]);

  useEffect(() => {
    setPage(1);
  }, [search, testament, viewMode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const summary = useMemo(() => {
    const total = enriched.length;
    const old = enriched.filter((r: any) => r.testament === 'old').length;
    const newT = enriched.filter((r: any) => r.testament === 'new').length;
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const recent = enriched.filter((r) => new Date(r.created_at).getTime() >= sevenDaysAgo).length;
    const featured = enriched[0];
    return { total, old, new: newT, recent, featured };
  }, [enriched]);

  const goToBookmark = (r: BookmarkRow) => {
    router.push(`/leer/${r.version_code}/${r.book_slug}/${r.chapter_number}?v=${r.verse_number}`);
  };

  const handleDelete = async (r: BookmarkRow) => {
    await supabase
      .from('user_verse_bookmarks')
      .delete()
      .eq('user_id', r.user_id)
      .eq('version_code', r.version_code)
      .eq('book_slug', r.book_slug)
      .eq('chapter_number', r.chapter_number)
      .eq('verse_number', r.verse_number);

    setOpenMenuKey(null);
    setBookmarks((prev) =>
      prev.filter(
        (x) =>
          !(
            x.user_id === r.user_id &&
            x.version_code === r.version_code &&
            x.book_slug === r.book_slug &&
            x.chapter_number === r.chapter_number &&
            x.verse_number === r.verse_number
          )
      )
    );
  };

  const handleShare = async (r: any) => {
    const ref = `${r.bookName} ${r.chapter_number}:${r.verse_number}`;
    const text = r.verseText ? `"${r.verseText}"\n— ${ref}` : ref;
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/leer/${r.version_code}/${r.book_slug}/${r.chapter_number}?v=${r.verse_number}`
        : '';

    try {
      if (navigator.share) {
        await navigator.share({ title: ref, text, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
      }
    } catch {
      // ignore
    } finally {
      setOpenMenuKey(null);
    }
  };

  const Skeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-900/40 border border-slate-800/50 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-slate-900/40 border border-slate-800/50 rounded-2xl animate-pulse" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <HorizontalNavbar />

      <main className="flex-1 relative z-10 pt-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          {/* Header Card */}
          <div className="bg-slate-900/35 backdrop-blur-sm border border-slate-800/60 rounded-3xl p-8 mb-8 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 0%, rgba(245,158,11,0.08), transparent 60%), radial-gradient(circle at 70% 20%, rgba(59,130,246,0.10), transparent 60%)",
              }}
            />
            <div className="relative flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Mis Marcadores</h1>
                <p className="text-slate-400">{summary.total} versículos guardados</p>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-1 bg-slate-900/40 border border-slate-700/50 rounded-2xl p-1">
              <Link
                href="/marcadores"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  pathname?.startsWith('/marcadores')
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                Marcadores
              </Link>
              <Link
                href="/favoritos"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  pathname?.startsWith('/favoritos')
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                Favoritos
              </Link>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por libro, versículo o texto..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end">
              {/* Filter */}
              <div className="relative">
                <select
                  value={testament}
                  onChange={(e) => setTestament(e.target.value as TestamentFilter)}
                  className="px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="old">Antiguo Testamento</option>
                  <option value="new">Nuevo Testamento</option>
                </select>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-700/50 rounded-2xl p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    viewMode === 'list' ? 'bg-amber-500/20 text-amber-200' : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                  aria-label="Vista lista"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    viewMode === 'grid' ? 'bg-amber-500/20 text-amber-200' : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                  aria-label="Vista grid"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <Skeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* List/grid */}
              <section className="lg:col-span-2">
                {paged.length === 0 ? (
                  <div className="text-slate-400 bg-slate-900/30 border border-slate-800/50 rounded-2xl p-8">
                    No se encontraron marcadores con esos filtros.
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                        : 'flex flex-col gap-4'
                    }
                  >
                    {paged.map((r: any) => {
                      const key = `${r.version_code}:${r.book_slug}:${r.chapter_number}:${r.verse_number}`;
                      const t = r.testament === 'old' || r.testament === 'new' ? r.testament : 'old';
                      return (
                        <div
                          key={key}
                          onClick={() => goToBookmark(r)}
                          className={`group relative cursor-pointer bg-slate-900/35 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-5 hover:border-amber-500/30 transition-all ${
                            viewMode === 'list' ? 'w-full' : ''
                          }`}
                        >
                          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                               style={{ boxShadow: '0 0 0 1px rgba(245, 158, 11, 0.2) inset' }} />

                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-11 h-11 rounded-2xl bg-slate-800/50 border border-slate-700/40 flex items-center justify-center text-slate-200 flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-lg font-semibold text-white truncate">
                                    {r.bookName} {r.chapter_number}:{r.verse_number}
                                  </h3>
                                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-200 border border-amber-500/20">
                                    {testamentLabel(t)}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {formatDateEs(r.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-300/90 mt-2 line-clamp-2">
                                  {r.verseText ? `"${r.verseText}"` : 'Cargando versículo...'}
                                </p>
                                {r.note && (
                                  <p className="text-xs text-slate-400 mt-2 line-clamp-1">
                                    Nota: {r.note}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuKey((prev) => (prev === key ? null : key));
                                }}
                                className="w-10 h-10 rounded-xl bg-slate-900/40 border border-slate-700/40 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all"
                                aria-label="Acciones"
                              >
                                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6h.01M12 12h.01M12 18h.01" />
                                </svg>
                              </button>

                              {openMenuKey === key && (
                                <div
                                  ref={menuRef}
                                  className="absolute right-5 top-16 w-56 rounded-2xl border border-slate-700/50 bg-slate-950/80 backdrop-blur-xl shadow-2xl overflow-hidden z-20"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleShare(r)}
                                    className="w-full px-4 py-3 flex items-center gap-3 text-amber-200 hover:bg-amber-500/15 transition-all"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v3a2 2 0 002 2h12a2 2 0 002-2v-3M16 6l-4-4m0 0L8 6m4-4v12" />
                                    </svg>
                                    Compartir
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(r)}
                                    className="w-full px-4 py-3 flex items-center gap-3 text-rose-300 hover:bg-rose-500/10 transition-all"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m2 0V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                                    </svg>
                                    Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 text-amber-200/80 text-sm inline-flex items-center gap-2">
                            Ir a leer
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7v7m0-7L10 14m-4 7h7" />
                            </svg>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {filtered.length > pageSize && (
                  <div className="flex items-center justify-center gap-3 mt-8 text-slate-300">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-900/40 border border-slate-700/40 hover:bg-slate-800/50 transition-all"
                      aria-label="Anterior"
                    >
                      ‹
                    </button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                        const n = i + 1;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setPage(n)}
                            className={`w-10 h-10 rounded-xl border transition-all ${
                              n === page
                                ? 'bg-amber-500/20 border-amber-500/30 text-amber-200'
                                : 'bg-slate-900/30 border-slate-700/40 hover:bg-slate-800/50'
                            }`}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="w-10 h-10 rounded-xl bg-slate-900/40 border border-slate-700/40 hover:bg-slate-800/50 transition-all"
                      aria-label="Siguiente"
                    >
                      ›
                    </button>
                  </div>
                )}
              </section>

              {/* Summary */}
              <aside className="lg:col-span-1">
                <div className="bg-slate-900/35 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-6 sticky top-28">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l3 3-3 3-3-3 3-3zm0 12l3 3-3 3-3-3 3-3zM3 12l3-3 3 3-3 3-3-3zm12 0l3-3 3 3-3 3-3-3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Resumen</h3>
                      <p className="text-sm text-slate-400">Tu colección guardada</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-2">
                        <span className="text-amber-300">🔖</span> Total de Marcadores
                      </span>
                      <span className="text-amber-200 font-semibold">{summary.total}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-2">
                        <span className="text-amber-300">📚</span> Antiguo Testamento
                      </span>
                      <span className="text-amber-200 font-semibold">{summary.old}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-2">
                        <span className="text-blue-300">📘</span> Nuevo Testamento
                      </span>
                      <span className="text-amber-200 font-semibold">{summary.new}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-2">
                        <span className="text-emerald-300">🕒</span> Recientes (7 días)
                      </span>
                      <span className="text-emerald-200 font-semibold">{summary.recent}</span>
                    </div>
                  </div>

                  {summary.featured && (
                    <div className="mt-6 pt-6 border-t border-slate-800/60">
                      <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4">
                        <p className="text-xs text-slate-300/90 mb-2">
                          "Lámpara es a mis pies tu palabra, y lumbrera a mi camino."
                        </p>
                        <p className="text-xs text-amber-200">— Salmos 119:105</p>
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

