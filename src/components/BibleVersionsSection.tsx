'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBibleVersions } from '@/lib/features/bibleVersionsSlice';
import { BibleVersionsSkeleton } from './skeletons/BibleVersionsSkeleton';
import { Carousel, Card, type Card as CardType } from '@/components/ui/apple-cards-carousel';

// Mapeo de códigos de versión a imágenes
const versionImagesMap: Record<string, string> = {
  'rv1960': 'https://hkpftjxmpmqsuzdxgswm.supabase.co/storage/v1/object/public/LuzDigital/biblia_reina_1960_moderna.png',
  'rv1995': 'https://hkpftjxmpmqsuzdxgswm.supabase.co/storage/v1/object/public/LuzDigital/biblia_reina_1995.png',
  'nvi': 'https://hkpftjxmpmqsuzdxgswm.supabase.co/storage/v1/object/public/LuzDigital/biblia_nueva_version_internacional.png',
  'dhh': 'https://hkpftjxmpmqsuzdxgswm.supabase.co/storage/v1/object/public/LuzDigital/biblia_Dios_habla_hoy.png',
  'pdt': 'https://hkpftjxmpmqsuzdxgswm.supabase.co/storage/v1/object/public/LuzDigital/biblia_palabra_de_Dios_para_Todos.png',
  'kjv': 'https://hkpftjxmpmqsuzdxgswm.supabase.co/storage/v1/object/public/LuzDigital/biblia_King_James_Version.png'
};

export function BibleVersionsSection() {
  const dispatch = useAppDispatch();
  const { versions, loading, error } = useAppSelector((state) => state.bibleVersions);

  useEffect(() => {
    // Fetch versions al montar el componente
    dispatch(fetchBibleVersions());
  }, [dispatch]);

  // Ordenar versiones para que rv1960 esté primero
  const sortedVersions = useMemo(() => {
    if (!versions.length) return [];
    const sorted = [...versions];
    const rv1960Index = sorted.findIndex(v => v.version === 'rv1960');
    if (rv1960Index > 0) {
      const [rv1960] = sorted.splice(rv1960Index, 1);
      sorted.unshift(rv1960);
    }
    return sorted;
  }, [versions]);

  // Convertir versiones a formato de cards del carousel
  const carouselCards = useMemo(() => {
    return sortedVersions.map((version): CardType => {
      const imageUrl = versionImagesMap[version.version] || '';
      return {
        category: 'Versión',
        title: version.name,
        src: imageUrl,
        href: `/version/${version.version}`,
      };
    });
  }, [sortedVersions]);

  // Crear los elementos Card del carousel
  const cardElements = carouselCards.map((card, index) => (
    <Card key={card.href || index} card={card} index={index} />
  ));

  if (loading) {
    return (
      <section id="capitulos" className="py-16 md:py-24 bg-gradient-to-b from-gray-950 via-slate-950 to-[#0d1420]">
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
      <section id="capitulos" className="py-16 md:py-24 bg-gradient-to-b from-gray-950 via-slate-950 to-[#0d1420]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-400">
            <p>Error al cargar las versiones: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="capitulos" className="py-16 md:py-24 bg-gradient-to-b from-gray-950 via-slate-950 to-[#0d1420]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <h2 className="text-xl md:text-5xl font-bold mb-2 text-white font-sans">
              Versiones de la Biblia
            </h2>
            <p className="text-gray-400">
              Explora diferentes traducciones de las Sagradas Escrituras
            </p>
          </div>
          <Link
            href="/busqueda"
            className="hidden sm:flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Explorar</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Carousel */}
        {carouselCards.length > 0 && (
          <div className="w-full">
            <Carousel items={cardElements} />
          </div>
        )}

        {/* Empty state */}
        {versions.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400">
              No se encontraron versiones de la Biblia.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
