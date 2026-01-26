'use client';

import Link from "next/link";
import HomeNavbar from "@/components/HomeNavbar";
import HomeHeroSection from "@/components/HomeHeroSection";
import { ReadingStreak } from "@/components/ReadingStreak";
import { DailyVerse } from "@/components/DailyVerse";
import { ReminderCard } from "@/components/ReminderCard";
import { AmbientSoundCard } from "@/components/AmbientSoundCard";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { BibleVersionsSection } from "@/components/BibleVersionsSection";
import { useAppSelector } from "@/lib/hooks";

export default function HomePageClient() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Verificar si el email está confirmado
  const isEmailVerified = user?.email_confirmed_at !== null && user?.email_confirmed_at !== undefined;
  const showProtectedContent = isAuthenticated && isEmailVerified;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <HomeNavbar />
      <HomeHeroSection />
      {/* Bible Versions Section */}
      <BibleVersionsSection />
      {/* Tu Viaje Espiritual Section */}
      <section id="lectura" className="py-16 md:py-24 bg-[#0d1420]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">Tu Viaje Espiritual</h2>
            <p className="text-gray-400">Herramientas diseñadas para acompañarte sin presión</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Versículo del Día - Siempre visible */}
            <div className="lg:col-span-2">
              <DailyVerse />
            </div>

            {/* Contenido restringido - Solo para usuarios autenticados y verificados */}
            {showProtectedContent && (
              <>
                {/* Racha de Lectura */}
                <ReadingStreak />

                {/* Indicador de Progreso Tranquilo */}
                <ProgressIndicator />

                {/* Recordatorio Suave */}
                <ReminderCard />

                {/* Sonidos Ambientales */}
                <AmbientSoundCard />
              </>
            )}
          </div>
        </div>
      </section>

     

      {/* Experimenta la Claridad Section */}
      <section id="recursos" className="py-16 md:py-24 bg-gradient-to-b from-[#0d1420] via-[#0a0a0f] to-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">Experimenta la Claridad.</h2>
            <p className="text-gray-400">Diseñado para el joven cristiano, fusionando fe con estética tech.</p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all shadow-sm backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Estudio Profundo</h3>
              <p className="text-gray-400 leading-relaxed">
                Seguimiento de progreso avanzado con capas de lectura interactivas y notas contextuales.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all shadow-sm backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Biblioteca Personal</h3>
              <p className="text-gray-400 leading-relaxed">
                Organiza tus versículos favoritos e insights con herramientas digitales elegantes e intuitivas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all shadow-sm backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Enfocado en Código</h3>
              <p className="text-gray-400 leading-relaxed">
                Construido sobre valores open-source para total transparencia y crecimiento compartido por la comunidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="comunidad" className="border-t border-white/10 bg-[#0a0a0f] py-12 md:py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-blue-400">
                    <circle cx="12" cy="12" r="4" fill="currentColor"/>
                    <path d="M12 2 L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 18 L12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M4.93 4.93 L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16.24 16.24 L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M2 12 L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M18 12 L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M4.93 19.07 L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16.24 7.76 L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-lg font-semibold text-white">Luz Digital</span>
              </Link>
              <p className="text-gray-400 mb-6 max-w-md">
                Llevando la espiritualidad al próximo nivel digital. Únete a nosotros en la misión de iluminar el mundo a través de la tecnología y la fe.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </a>
              </div>
              <p className="text-xs text-gray-500">© 2026 Luz Digital. Hecho con fe y código abierto.</p>
            </div>

            {/* Plataforma column */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Plataforma</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Web App</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">iOS & Android</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">API Open Source</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Documentación</Link></li>
              </ul>
            </div>

            {/* Comunidad column */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Comunidad</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Foro de Estudios</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Discord Oficial</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Blog de Actualizaciones</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Contribuir</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-6 text-xs text-gray-500">
              <Link href="#" className="hover:text-blue-400 transition-colors">Privacidad</Link>
              <Link href="#" className="hover:text-blue-400 transition-colors">Términos</Link>
              <Link href="#" className="hover:text-blue-400 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
