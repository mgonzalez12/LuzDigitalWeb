'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBibleVersions } from '@/lib/features/bibleVersionsSlice';
import { BibleVersionsSkeleton } from './skeletons/BibleVersionsSkeleton';

// Gradientes diferentes para cada versión (placeholders hasta que subas las imágenes)
const versionGradients = [
  {
    bg: 'from-amber-900/20 to-zinc-900',
    overlay: 'from-amber-500/20 via-transparent to-blue-500/20',
  },
  {
    bg: 'from-blue-900/20 to-zinc-900',
    overlay: 'from-blue-500/30 via-cyan-500/20 to-transparent',
  },
  {
    bg: 'from-purple-900/20 to-zinc-900',
    overlay: 'from-purple-400/20 via-transparent to-pink-500/20',
  },
  {
    bg: 'from-green-900/20 to-zinc-900',
    overlay: 'from-green-500/20 via-transparent to-emerald-500/20',
  },
  {
    bg: 'from-red-900/20 to-zinc-900',
    overlay: 'from-red-500/20 via-transparent to-orange-500/20',
  },
  {
    bg: 'from-indigo-900/20 to-zinc-900',
    overlay: 'from-indigo-500/20 via-transparent to-blue-500/20',
  },
];

// Imágenes estáticas para los cards (por orden en `versions`)
// RV1960, RV1995, NVI (si el orden cambia, ajustar este arreglo).
const versionImagesByIndex: Array<string | undefined> = [
  'https://hkpftjxmpmqsuzdxgswm.supabase.co/storage/v1/object/public/LuzDigital/biblia_reina_1960_moderna.png',
  'https://hkpftjxmpmqsuzdxgswm.supabase.co/storage/v1/object/public/LuzDigital/biblia_reina_1995.png',
  'https://hkpftjxmpmqsuzdxgswm.supabase.co/storage/v1/object/public/LuzDigital/biblia_nueva_version_internacional.png',
  'https://hkpftjxmpmqsuzdxgswm.supabase.co/storage/v1/object/public/LuzDigital/biblia_Dios_habla_hoy.png',
  'https://hkpftjxmpmqsuzdxgswm.supabase.co/storage/v1/object/public/LuzDigital/biblia_palabra_de_Dios_para_Todos.png',
  'https://hkpftjxmpmqsuzdxgswm.supabase.co/storage/v1/object/public/LuzDigital/biblia_King_James_Version.png'
];

export function BibleVersionsSection() {
  const dispatch = useAppDispatch();
  const { versions, loading, error } = useAppSelector((state) => state.bibleVersions);

  useEffect(() => {
    // Fetch versions al montar el componente
    dispatch(fetchBibleVersions());
  }, [dispatch]);

  if (loading) {
    return (
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-8 md:mb-12">
            <div className="h-10 bg-slate-700/50 rounded-lg w-64 mb-2 animate-pulse"></div>
            <div className="h-5 bg-slate-700/30 rounded-lg w-96 animate-pulse"></div>
          </div>
          
          <BibleVersionsSkeleton />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-500">
            <p>Error al cargar las versiones: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Versiones de la Biblia</h2>
            <p className="text-slate-600 dark:text-gray-400">
              Explora diferentes traducciones de las Sagradas Escrituras
            </p>
          </div>
          <Link
            href="/busqueda"
            className="hidden sm:flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
          >
            <span>Explorar</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {versions.map((version, index) => {
            const gradient = versionGradients[index % versionGradients.length];
            const imageUrl = versionImagesByIndex[index];
            
            return (
              <Link
                key={version.version}
                href={`/version/${version.version}`}
                className="group card-hover rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/50 shadow-sm block"
              >
                {/* Image area (imagen o gradiente fallback) */}
                <div className="relative h-64 overflow-hidden bg-zinc-900">
                  {imageUrl ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                      style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient.bg}`} />
                  )}

                  {/* Overlay para legibilidad */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient.overlay}`} />
                  <div className="absolute inset-0 bg-black/20" />

                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full text-xs font-medium text-white uppercase">
                      {version.version}
                    </span>
                  </div>
                </div>

                {/* Text content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-500 transition-colors">
                    {version.name}
                  </h3>
                  <p className="text-slate-600 dark:text-gray-400">
                    Traducción {version.version.toUpperCase()}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {versions.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-gray-400">
              No se encontraron versiones de la Biblia.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
