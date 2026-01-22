'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { useAppSelector } from '@/lib/hooks';

export default function ConfiguracionPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  // Solo UI (no lógica real). Se mantiene local para prototipo de diseño.
  const [useCustomKeys, setUseCustomKeys] = useState(true);
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showDeepSeekKey, setShowDeepSeekKey] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || (!isAuthenticated && typeof window !== 'undefined')) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>
        <Sidebar />
        <main className="flex-1 lg:ml-64 relative z-10 flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-xl bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 animate-pulse">
            <div className="h-8 bg-slate-700/40 rounded-lg w-56 mb-3"></div>
            <div className="h-5 bg-slate-700/20 rounded-lg w-96 mb-8"></div>
            <div className="h-48 bg-slate-700/20 rounded-xl"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <Sidebar />

      <main className="flex-1 lg:ml-64 relative z-10 px-4 md:px-6 lg:px-10 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-start gap-4 mb-10">
            <button
              onClick={() => router.back()}
              className="mt-1 text-slate-300 hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>

            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white">Configuración de IA</h1>
              <p className="text-slate-400 mt-2">
                Configura tus API keys para servicios de IA personalizados
              </p>
            </div>
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <section className="lg:col-span-2 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Configuración de API Keys</h2>
                    <p className="text-sm text-slate-400">Guarda tus llaves para usar tus propios modelos</p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-7">
                {/* Toggle */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-medium">Usar API Keys personalizadas</p>
                    <p className="text-sm text-slate-400">
                      Activa para usar tus propias API keys en lugar de las predeterminadas
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setUseCustomKeys((v) => !v)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      useCustomKeys ? 'bg-blue-500' : 'bg-slate-700'
                    }`}
                    aria-pressed={useCustomKeys}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        useCustomKeys ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Google */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <span className="text-blue-300 text-sm font-bold">G</span>
                    </div>
                    <p className="text-white font-semibold">Google AI API Key</p>
                  </div>

                  <div className="relative">
                    <input
                      disabled={!useCustomKeys}
                      type={showGoogleKey ? 'text' : 'password'}
                      placeholder="••••••••••••••••••••••••••••••••••"
                      className="w-full pr-12 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGoogleKey((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      aria-label="Mostrar/ocultar Google key"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Obtén tu API key en{' '}
                    <Link href="#" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
                      Google AI Studio
                    </Link>
                  </p>
                </div>

                {/* OpenAI */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold">OpenAI API Key</p>
                  </div>

                  <div className="relative">
                    <input
                      disabled={!useCustomKeys}
                      type={showOpenAIKey ? 'text' : 'password'}
                      placeholder="Ingresa tu OpenAI API Key"
                      className="w-full pr-12 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenAIKey((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      aria-label="Mostrar/ocultar OpenAI key"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Obtén tu API key en{' '}
                    <Link href="#" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
                      OpenAI Platform
                    </Link>
                  </p>
                </div>

                {/* DeepSeek */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0a1 1 0 00.95.69h.999c.969 0 1.371 1.24.588 1.81l-.809.588a1 1 0 00-.364 1.118l.309.951c.3.921-.755 1.688-1.538 1.118l-.809-.588a1 1 0 00-1.176 0l-.809.588c-.783.57-1.838-.197-1.538-1.118l.309-.951a1 1 0 00-.364-1.118l-.809-.588c-.783-.57-.38-1.81.588-1.81h.999a1 1 0 00.95-.69z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l.6 1.8H15l-1.95 1.2.75 2.1L12 17.7 10.2 19.1l.75-2.1L9 15.8h2.4L12 14z" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold">DeepSeek API Key</p>
                  </div>

                  <div className="relative">
                    <input
                      disabled={!useCustomKeys}
                      type={showDeepSeekKey ? 'text' : 'password'}
                      placeholder="Ingresa tu DeepSeek API Key"
                      className="w-full pr-12 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeepSeekKey((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      aria-label="Mostrar/ocultar DeepSeek key"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Obtén tu API key en{' '}
                    <Link href="#" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
                      DeepSeek Platform
                    </Link>
                  </p>
                </div>

                {/* Save button (solo UI) */}
                <button
                  type="button"
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-500/20"
                >
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar Configuración
                  </span>
                </button>
              </div>
            </section>

            {/* Right column */}
            <aside className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h2M9 7h.01M7 7a2 2 0 114 0c0 .67-.33 1.26-.84 1.62M3 21h18" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Estadísticas de IA</h2>
                    <p className="text-sm text-slate-400">Estado y consumo (UI)</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Google card */}
                <div className="bg-slate-950/40 border border-slate-700/40 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <span className="text-blue-300 font-bold">G</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold leading-tight">Google</p>
                        <p className="text-xs text-slate-400">Uso: 5</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                      Conectado
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-slate-300">
                    <p className="text-slate-400">0% utilizado</p>
                    <p className="text-slate-400">Último uso: 21/1/2026, 20:12:12</p>
                    <p className="text-white font-semibold mt-1">Ilimitado</p>
                  </div>
                </div>

                {/* OpenAI card */}
                <div className="bg-slate-950/40 border border-slate-700/40 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-semibold leading-tight">OpenAI</p>
                        <p className="text-xs text-slate-400">Uso: 3</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/20">
                      Desconectado
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-slate-300">
                    <p className="text-slate-400">5% utilizado</p>
                    <p className="text-slate-400">Último uso: 21/1/2026, 20:12:12</p>
                    <p className="text-white font-semibold mt-1">4,000</p>
                  </div>
                </div>

                {/* DeepSeek card */}
                <div className="bg-slate-950/40 border border-slate-700/40 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0a1 1 0 00.95.69h.999c.969 0 1.371 1.24.588 1.81l-.809.588a1 1 0 00-.364 1.118l.309.951c.3.921-.755 1.688-1.538 1.118l-.809-.588a1 1 0 00-1.176 0l-.809.588c-.783.57-1.838-.197-1.538-1.118l.309-.951a1 1 0 00-.364-1.118l-.809-.588c-.783-.57-.38-1.81.588-1.81h.999a1 1 0 00.95-.69z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-semibold leading-tight">DeepSeek</p>
                        <p className="text-xs text-slate-400">Uso: 3</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/20">
                      Desconectado
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-slate-300">
                    <p className="text-slate-400">14% utilizado</p>
                    <p className="text-slate-400">Último uso: 21/1/2026, 20:12:12</p>
                    <p className="text-white font-semibold mt-1">32,000</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

