'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBibleVersions } from '@/lib/features/bibleVersionsSlice';
import { Portal } from './Portal';

interface VersionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Gradientes para cada versión
const versionGradients = [
  'from-amber-900/20 to-zinc-900',
  'from-blue-900/20 to-zinc-900',
  'from-purple-900/20 to-zinc-900',
  'from-green-900/20 to-zinc-900',
  'from-red-900/20 to-zinc-900',
  'from-indigo-900/20 to-zinc-900',
];

export function VersionSelectorModal({ isOpen, onClose }: VersionSelectorModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { versions, loading } = useAppSelector((state) => state.bibleVersions);

  // Cargar versiones al abrir el modal
  useEffect(() => {
    if (isOpen && versions.length === 0) {
      dispatch(fetchBibleVersions());
    }
  }, [isOpen, versions.length, dispatch]);

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleVersionSelect = (versionCode: string) => {
    // Navegar a la página de libros de esa versión
    router.push(`/version/${versionCode}`);
    // Cerrar el modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay con blur */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="relative z-[10000] w-full max-w-4xl animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
          aria-label="Cerrar modal"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal card */}
        <div className="relative bg-gradient-to-br from-slate-900/95 to-blue-950/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 md:p-12 shadow-2xl">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-50"></div>

          <div className="relative">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Navegación Rápida
              </h2>
              <p className="text-sm text-slate-400 uppercase tracking-wider mb-6">
                Selecciona tu destino
              </p>
              <h3 className="text-xl md:text-2xl font-semibold text-blue-400">
                SELECCIONA VERSIÓN DE LA BIBLIA
              </h3>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 animate-pulse"
                  >
                    <div className="h-6 bg-slate-700/50 rounded mb-2"></div>
                    <div className="h-4 bg-slate-700/30 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Versions grid */}
            {!loading && versions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {versions.map((version, index) => {
                  const gradient = versionGradients[index % versionGradients.length];
                  
                  return (
                    <button
                      key={version.version}
                      onClick={() => handleVersionSelect(version.version)}
                      className="group text-left bg-slate-800/50 hover:bg-slate-800/70 rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all card-hover"
                    >
                      {/* Gradient indicator */}
                      <div className={`w-full h-2 bg-gradient-to-r ${gradient} rounded-full mb-4`}></div>
                      
                      {/* Version name */}
                      <h4 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {version.name}
                      </h4>
                      
                      {/* Version code */}
                      <p className="text-sm text-slate-400 uppercase tracking-wider">
                        {version.version}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {!loading && versions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">
                  No se encontraron versiones de la Biblia.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </Portal>
  );
}
