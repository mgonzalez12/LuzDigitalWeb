'use client';

import { useState } from 'react';

export function FocusMode() {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'nature' | 'piano'>('none');

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    // Aquí iría la lógica para activar el modo de concentración
    if (!isFocusMode) {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/30">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Modo de Concentración</h3>
            <button
              onClick={toggleFocusMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isFocusMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isFocusMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
            Lectura sin distracciones con ambiente opcional
          </p>

          {isFocusMode && (
            <div className="space-y-3 animate-fade-in">
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Sonido Ambiental
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'none', label: 'Silencio', icon: '🔇' },
                  { value: 'rain', label: 'Lluvia', icon: '🌧️' },
                  { value: 'nature', label: 'Naturaleza', icon: '🌿' },
                  { value: 'piano', label: 'Piano', icon: '🎹' }
                ].map((sound) => (
                  <button
                    key={sound.value}
                    onClick={() => setAmbientSound(sound.value as any)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      ambientSound === sound.value
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{sound.icon}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{sound.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
