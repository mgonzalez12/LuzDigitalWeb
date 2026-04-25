/**
 * Catálogo de temas bíblicos y "Destacados" — replica la lógica del iOS
 * (`BibleTopicService.swift` + `FeaturedBookCatalog`) para que la web tenga
 * el mismo modelo de exploración: temas curados, libros destacados rotando
 * diariamente y dos pestañas de testamento.
 */

import type { EnrichedBibleBook } from './features/bibleBooksSlice';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Convierte el nombre que viene del API (`Genesis`, `1 Corintios`, `1ra Tesalonicenses`)
 * a un slug consistente con los slugs del catálogo (`genesis`, `1-corintios`).
 * Quita acentos, baja a minúsculas y normaliza separadores.
 */
export function slugifyBookName(name: string): string {
  return (name || '')
    .replace(/\s*endpoint\s*$/i, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Limpia el sufijo " endpoint" que viene del API. */
export function cleanBookName(name: string): string {
  return (name || '').replace(/\s*endpoint\s*$/i, '').trim();
}

const NEW_TESTAMENT_SLUGS = new Set<string>([
  'mateo', 'marcos', 'lucas', 'juan', 'hechos', 'romanos',
  '1-corintios', '2-corintios', 'galatas', 'efesios', 'filipenses', 'colosenses',
  '1-tesalonicenses', '2-tesalonicenses', '1-timoteo', '2-timoteo', 'tito', 'filemon',
  'hebreos', 'santiago', '1-pedro', '2-pedro', '1-juan', '2-juan', '3-juan', 'judas', 'apocalipsis',
]);

export function isNewTestament(slug: string): boolean {
  return NEW_TESTAMENT_SLUGS.has(slug);
}

// ─── Tipos del catálogo ─────────────────────────────────────────────────────

export type TopicSource =
  | { kind: 'fixedEntries'; entries: TopicEntry[] }
  | { kind: 'allBooks' }
  | { kind: 'testament'; testament: 'old' | 'new' };

export interface TopicEntry {
  bookSlug: string;
  /** `null` = libro entero (abre capítulo 1). Número = ese capítulo concreto. */
  chapter: number | null;
}

export interface BibleTopic {
  id: string;
  label: string;
  emoji: string;
  /** Color del chip del tile (CSS color). */
  tint: string;
  source: TopicSource;
}

// ─── Catálogo de temas (paridad con iOS) ────────────────────────────────────

export const TOPIC_CATALOG: BibleTopic[] = [
  {
    id: 'evangelios', label: 'Evangelios', emoji: '✝️', tint: '#FFB07A',
    source: { kind: 'fixedEntries', entries: [
      { bookSlug: 'mateo', chapter: null },
      { bookSlug: 'marcos', chapter: null },
      { bookSlug: 'lucas', chapter: null },
      { bookSlug: 'juan', chapter: null },
    ] },
  },
  {
    id: 'poesia', label: 'Poesía', emoji: '🎵', tint: '#BFA8FF',
    source: { kind: 'fixedEntries', entries: [
      { bookSlug: 'salmos', chapter: null },
      { bookSlug: 'cantares', chapter: null },
      { bookSlug: 'lamentaciones', chapter: null },
    ] },
  },
  {
    id: 'profetas', label: 'Profetas', emoji: '🔥', tint: '#FF7B9E',
    source: { kind: 'fixedEntries', entries: [
      { bookSlug: 'isaias', chapter: null },
      { bookSlug: 'jeremias', chapter: null },
      { bookSlug: 'ezequiel', chapter: null },
      { bookSlug: 'daniel', chapter: null },
      { bookSlug: 'oseas', chapter: null },
      { bookSlug: 'joel', chapter: null },
      { bookSlug: 'amos', chapter: null },
      { bookSlug: 'abdias', chapter: null },
      { bookSlug: 'jonas', chapter: null },
      { bookSlug: 'miqueas', chapter: null },
      { bookSlug: 'nahum', chapter: null },
      { bookSlug: 'habacuc', chapter: null },
      { bookSlug: 'sofonias', chapter: null },
      { bookSlug: 'hageo', chapter: null },
      { bookSlug: 'zacarias', chapter: null },
      { bookSlug: 'malaquias', chapter: null },
    ] },
  },
  {
    id: 'sabiduria', label: 'Sabiduría', emoji: '🦉', tint: '#9FCE5E',
    source: { kind: 'fixedEntries', entries: [
      { bookSlug: 'job', chapter: null },
      { bookSlug: 'proverbios', chapter: null },
      { bookSlug: 'eclesiastes', chapter: null },
    ] },
  },
  {
    id: 'amor', label: 'Amor', emoji: '💖', tint: '#FF6B9E',
    source: { kind: 'fixedEntries', entries: [
      { bookSlug: '1-corintios', chapter: 13 },
      { bookSlug: 'cantares', chapter: null },
      { bookSlug: 'juan', chapter: 15 },
      { bookSlug: 'romanos', chapter: 12 },
      { bookSlug: 'efesios', chapter: 5 },
    ] },
  },
  {
    id: 'amor-de-dios', label: 'Amor de Dios', emoji: '💗', tint: '#FF8FB1',
    source: { kind: 'fixedEntries', entries: [
      { bookSlug: '1-juan', chapter: 4 },
      { bookSlug: 'romanos', chapter: 8 },
      { bookSlug: 'salmos', chapter: 136 },
      { bookSlug: 'juan', chapter: 3 },
      { bookSlug: 'efesios', chapter: 2 },
    ] },
  },
  {
    id: 'fe', label: 'Fe', emoji: '🌟', tint: '#FFC857',
    source: { kind: 'fixedEntries', entries: [
      { bookSlug: 'hebreos', chapter: 11 },
      { bookSlug: 'romanos', chapter: 4 },
      { bookSlug: 'santiago', chapter: 2 },
      { bookSlug: 'marcos', chapter: 11 },
    ] },
  },
  {
    id: 'esperanza', label: 'Esperanza', emoji: '🌅', tint: '#FFB174',
    source: { kind: 'fixedEntries', entries: [
      { bookSlug: 'romanos', chapter: 8 },
      { bookSlug: 'salmos', chapter: 27 },
      { bookSlug: 'isaias', chapter: 40 },
      { bookSlug: 'jeremias', chapter: 29 },
    ] },
  },
  {
    id: 'oracion', label: 'Oración', emoji: '🙏', tint: '#8AB4FF',
    source: { kind: 'fixedEntries', entries: [
      { bookSlug: 'mateo', chapter: 6 },
      { bookSlug: 'salmos', chapter: 23 },
      { bookSlug: 'salmos', chapter: 91 },
      { bookSlug: 'filipenses', chapter: 4 },
      { bookSlug: 'lucas', chapter: 11 },
    ] },
  },
  {
    id: 'ley', label: 'Ley (Pentateuco)', emoji: '📜', tint: '#C9A87A',
    source: { kind: 'fixedEntries', entries: [
      { bookSlug: 'genesis', chapter: null },
      { bookSlug: 'exodo', chapter: null },
      { bookSlug: 'levitico', chapter: null },
      { bookSlug: 'numeros', chapter: null },
      { bookSlug: 'deuteronomio', chapter: null },
    ] },
  },
  {
    id: 'historico-at', label: 'Histórico AT', emoji: '🏛️', tint: '#E0B774',
    source: { kind: 'fixedEntries', entries: [
      { bookSlug: 'josue', chapter: null },
      { bookSlug: 'jueces', chapter: null },
      { bookSlug: 'rut', chapter: null },
      { bookSlug: '1-samuel', chapter: null },
      { bookSlug: '2-samuel', chapter: null },
      { bookSlug: '1-reyes', chapter: null },
      { bookSlug: '2-reyes', chapter: null },
      { bookSlug: '1-cronicas', chapter: null },
      { bookSlug: '2-cronicas', chapter: null },
      { bookSlug: 'esdras', chapter: null },
      { bookSlug: 'nehemias', chapter: null },
      { bookSlug: 'ester', chapter: null },
    ] },
  },
  {
    id: 'cartas-paulinas', label: 'Cartas Paulinas', emoji: '✉️', tint: '#6FCBC0',
    source: { kind: 'fixedEntries', entries: [
      { bookSlug: 'romanos', chapter: null },
      { bookSlug: '1-corintios', chapter: null },
      { bookSlug: '2-corintios', chapter: null },
      { bookSlug: 'galatas', chapter: null },
      { bookSlug: 'efesios', chapter: null },
      { bookSlug: 'filipenses', chapter: null },
      { bookSlug: 'colosenses', chapter: null },
      { bookSlug: '1-tesalonicenses', chapter: null },
      { bookSlug: '2-tesalonicenses', chapter: null },
      { bookSlug: '1-timoteo', chapter: null },
      { bookSlug: '2-timoteo', chapter: null },
      { bookSlug: 'tito', chapter: null },
      { bookSlug: 'filemon', chapter: null },
    ] },
  },
  {
    id: 'apocaliptico', label: 'Apocalíptico', emoji: '⚡', tint: '#A98AFF',
    source: { kind: 'fixedEntries', entries: [
      { bookSlug: 'daniel', chapter: null },
      { bookSlug: 'apocalipsis', chapter: null },
    ] },
  },
];

export const TESTAMENT_OLD: BibleTopic = {
  id: 'antiguo-testamento', label: 'Antiguo Testamento', emoji: '📖', tint: '#8AB4FF',
  source: { kind: 'testament', testament: 'old' },
};

export const TESTAMENT_NEW: BibleTopic = {
  id: 'nuevo-testamento', label: 'Nuevo Testamento', emoji: '✨', tint: '#6FCBC0',
  source: { kind: 'testament', testament: 'new' },
};

// ─── Resolución de un tema a entradas concretas ─────────────────────────────

export interface BibleEntryDisplay {
  id: string;
  bookSlug: string;
  bookName: string;
  /** Capítulo a abrir al pulsar (1 si es libro entero). */
  chapter: number;
  isWholeBook: boolean;
  label: string;
  subtitle: string;
  testament: 'old' | 'new';
}

function makeEntry(book: { slug: string; name: string; chapters: number }, chapter: number | null): BibleEntryDisplay {
  const chapterCount = Math.max(1, book.chapters);
  const label = chapter ? `${book.name} ${chapter}` : book.name;
  const subtitle = chapter
    ? `Capítulo · ${book.name}`
    : `${chapterCount} ${chapterCount === 1 ? 'capítulo' : 'capítulos'}`;
  return {
    id: `${book.slug}|${chapter ?? 0}|${chapter == null ? 'B' : 'C'}`,
    bookSlug: book.slug,
    bookName: book.name,
    chapter: chapter ?? 1,
    isWholeBook: chapter == null,
    label,
    subtitle,
    testament: isNewTestament(book.slug) ? 'new' : 'old',
  };
}

/**
 * Resuelve las entradas visibles para un tema dado, usando el catálogo de libros
 * de la versión actual. Los libros se buscan por slug; si un libro del catálogo
 * no aparece en la versión, simplemente se omite (las versiones a veces difieren).
 */
export function resolveTopicEntries(
  topic: BibleTopic,
  books: EnrichedBibleBook[],
): BibleEntryDisplay[] {
  const indexed = books.map((b) => {
    const cleaned = cleanBookName(b.name);
    return {
      slug: slugifyBookName(b.name),
      name: cleaned,
      chapters: b.details?.chapters ?? 1,
      order: books.indexOf(b),
    };
  });
  const bySlug = new Map(indexed.map((b) => [b.slug, b]));

  switch (topic.source.kind) {
    case 'fixedEntries':
      return topic.source.entries
        .map((e) => {
          const book = bySlug.get(e.bookSlug);
          if (!book) return null;
          return makeEntry(book, e.chapter);
        })
        .filter((x): x is BibleEntryDisplay => x !== null);
    case 'allBooks':
      return indexed.map((b) => makeEntry(b, null));
    case 'testament': {
      const want = topic.source.testament;
      return indexed
        .filter((b) => (isNewTestament(b.slug) ? 'new' : 'old') === want)
        .map((b) => makeEntry(b, null));
    }
  }
}

// ─── Pool de "Destacados" + rotación diaria ─────────────────────────────────

export interface FeaturedBookConfig {
  slug: string;
  name: string;
  badge: string;
  /** Número de capítulos mostrados como subtítulo en la tarjeta. */
  chapters: number;
  /** Emoji o ícono pequeño que va arriba del título. */
  icon: string;
  /** Degradado CSS (`from`/`to`) para la tarjeta. */
  gradientFrom: string;
  gradientTo: string;
}

export const FEATURED_POOL: FeaturedBookConfig[] = [
  { slug: 'salmos', name: 'Salmos', badge: 'AT · POÉTICO', chapters: 150, icon: '🎵',
    gradientFrom: '#BCCCFF', gradientTo: '#7C97FF' },
  { slug: 'mateo', name: 'Mateo', badge: 'NT · EVANGELIO', chapters: 28, icon: '✨',
    gradientFrom: '#6B86FF', gradientTo: '#3E6BFF' },
  { slug: 'proverbios', name: 'Proverbios', badge: 'AT · SABIDURÍA', chapters: 31, icon: '🌿',
    gradientFrom: '#A6D479', gradientTo: '#4FA34F' },
  { slug: 'genesis', name: 'Génesis', badge: 'AT · LEY', chapters: 50, icon: '☀️',
    gradientFrom: '#FFC078', gradientTo: '#FF8A4C' },
  { slug: 'juan', name: 'Juan', badge: 'NT · EVANGELIO', chapters: 21, icon: '❤️',
    gradientFrom: '#FF8FB1', gradientTo: '#E05C8F' },
  { slug: 'romanos', name: 'Romanos', badge: 'NT · CARTA', chapters: 16, icon: '✉️',
    gradientFrom: '#6FCBC0', gradientTo: '#35908A' },
  { slug: 'isaias', name: 'Isaías', badge: 'AT · PROFETA', chapters: 66, icon: '🔥',
    gradientFrom: '#FF7B9E', gradientTo: '#C94A6E' },
  { slug: 'apocalipsis', name: 'Apocalipsis', badge: 'NT · APOCALÍPTICO', chapters: 22, icon: '⚡',
    gradientFrom: '#A98AFF', gradientTo: '#6E4DDB' },
];

const ROTATION_EPOCH = Date.UTC(2024, 0, 1); // 2024-01-01

/**
 * Devuelve el pool rotado a la derecha por la cantidad de días desde la época.
 * Regla: cada día, el último pasa a primero → rotación a la derecha por 1.
 */
export function rotatedFeatured(date: Date = new Date()): FeaturedBookConfig[] {
  const n = FEATURED_POOL.length;
  if (n === 0) return [];
  const dayMs = 24 * 60 * 60 * 1000;
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const days = Math.floor((today - ROTATION_EPOCH) / dayMs);
  return Array.from({ length: n }, (_, p) => FEATURED_POOL[((p - days) % n + n) % n]);
}
