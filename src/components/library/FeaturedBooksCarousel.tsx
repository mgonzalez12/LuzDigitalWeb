'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { rotatedFeatured } from '@/lib/bibleTopics';

interface Props {
  versionCode: string;
}

/**
 * Carrusel "Destacados" — pool fijo rotando a la derecha cada día (último → primero).
 * Replica la lógica del iOS (`FeaturedBookCatalog.rotated`).
 */
export function FeaturedBooksCarousel({ versionCode }: Props) {
  const items = useMemo(() => rotatedFeatured(), []);

  return (
    <div className="relative -mx-4 md:mx-0">
      <div
        className="flex gap-4 md:gap-6 overflow-x-auto pb-2 px-4 md:px-0 scroll-smooth snap-x"
        style={{ scrollbarWidth: 'thin' }}
      >
        {items.map((b) => (
          <Link
            key={b.slug}
            href={`/leer/${versionCode}/${b.slug}/1`}
            className="group relative flex-shrink-0 w-[180px] md:w-[200px] h-[260px] md:h-[280px] rounded-2xl overflow-hidden snap-start transition-transform hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${b.gradientFrom}, ${b.gradientTo})`,
            }}
          >
            <div className="absolute inset-0 p-5 flex flex-col justify-between">
              <span className="text-[10px] md:text-xs font-bold text-white/90 tracking-widest uppercase">
                {b.badge}
              </span>
              <div className="flex flex-col gap-2">
                <span className="text-2xl md:text-3xl">{b.icon}</span>
                <h3 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'serif' }}>
                  {b.name}
                </h3>
                <p className="text-xs md:text-sm font-semibold text-white/85">
                  {b.chapters} capítulos
                </p>
              </div>
            </div>
            {/* Sutil glow al hover */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
