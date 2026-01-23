'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Monitor, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBibleBooks } from '@/lib/features/bibleBooksSlice';

const LightBeamScene = dynamic(() => import('./LightBeamScene'), {
  ssr: false,
});

export default function HomeHeroSection() {
  const dispatch = useAppDispatch();
  const { books } = useAppSelector((state) => state.bibleBooks);
  const [bookCount, setBookCount] = useState<number>(66); // Valor por defecto

  // Fetch de libros de Reina Valera 1960 (rv1960) al montar el componente
  useEffect(() => {
    // Solo hacer fetch si no tenemos libros o si la versión actual no es rv1960
    if (books.length === 0) {
      dispatch(fetchBibleBooks('rv1960'));
    }
  }, [dispatch]);

  // Actualizar el conteo cuando los libros se carguen
  useEffect(() => {
    if (books.length > 0) {
      setBookCount(books.length);
    }
  }, [books]);
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d1420] to-[#0a0a0f]" />

      {/* Three.js Light Beam */}
      <LightBeamScene />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-9xl flex-col items-center justify-center px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center flex flex-col items-center"
        >
          {/* Version Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 backdrop-blur-sm"
          >
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-medium text-blue-300">VERSIÓN 2.0 DISPONIBLE</span>
          </motion.div>

          <motion.h1
            className="mb-6 text-balance font-sans text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
              La Palabra en
            </span>
            <br />
            <span className="text-white">Nueva Luz</span>
          </motion.h1>

          <motion.p
            className="mx-auto mb-10 max-w-xl text-pretty text-lg text-gray-400 md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Una experiencia digital moderna y open-source para el cristiano contemporáneo.
            Sumérgete en la espiritualidad con diseño de alta tecnología.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/version/rv1960">
              <Button
                size="lg"
                className="group rounded-full bg-white/10 px-8 py-6 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-lg hover:shadow-blue-500/20"
              >
                Iniciar Lectura
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          {/* Stats / Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 w-full max-w-4xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 w-full border-t border-white/5 pt-12 md:pt-16">
              {[
                { icon: BookOpen, label: `${bookCount} Libros`, desc: "CONTENIDO ÍNTEGRO" },
                { icon: Users, label: "+15k", desc: "LECTORES ACTIVOS" },
                { icon: Monitor, label: "4K Ready", desc: "DISEÑO ADAPTATIVO" },
                { icon: MessageSquare, label: "Comunidad", desc: "SOPORTE GLOBAL" }
              ].map((feat, i) => (
                <div key={i} className="flex flex-col items-center gap-3 group">
                  <div className="text-gray-400 group-hover:text-blue-400 transition-colors">
                    <feat.icon size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-white text-sm font-bold">{feat.label}</span>
                    <span className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">{feat.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
    </section>
  );
}
