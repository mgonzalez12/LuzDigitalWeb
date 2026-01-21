'use client';

import { useState, useEffect } from 'react';

export function ReadingStreak() {
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // Simular carga de racha desde localStorage
    const savedStreak = localStorage.getItem('readingStreak');
    if (savedStreak) {
      setStreak(parseInt(savedStreak, 10));
    }
  }, []);

  const handleReadToday = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('readingStreak', newStreak.toString());
    
    // Mostrar celebración suave
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  return (
    <div className="relative">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Racha de Lectura</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400">Tu camino espiritual continúa</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-500">{streak}</div>
            <p className="text-xs text-slate-600 dark:text-gray-400">días consecutivos</p>
          </div>
        </div>
        
        <div className="flex gap-1 mb-4">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all ${
                i < (streak % 7) 
                  ? 'bg-blue-500' 
                  : 'bg-slate-200 dark:bg-zinc-800'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleReadToday}
          className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all"
        >
          Registrar lectura de hoy
        </button>
      </div>

      {/* Celebración suave */}
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-fade-in bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="text-center">
              <div className="text-4xl mb-2">✨</div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">¡Bien hecho!</p>
              <p className="text-xs text-slate-600 dark:text-gray-400">Continúa así</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
