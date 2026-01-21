'use client';

import { useState } from 'react';

const verses = [
  {
    text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
    reference: "Juan 3:16"
  },
  {
    text: "El Señor es mi pastor; nada me faltará.",
    reference: "Salmos 23:1"
  },
  {
    text: "Todo lo puedo en Cristo que me fortalece.",
    reference: "Filipenses 4:13"
  }
];

export function DailyVerse() {
  // Obtener versículo del día (basado en la fecha)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayVerse = verses[dayOfYear % verses.length];
  
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    // Aquí iría la lógica para guardar en favoritos
  };

  return (
    <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/30 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Versículo del Día</span>
          </div>
          <button
            onClick={handleSave}
            className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
            aria-label={isSaved ? "Remover de favoritos" : "Guardar en favoritos"}
          >
            <svg 
              className={`w-5 h-5 transition-colors ${isSaved ? 'text-amber-500 fill-current' : 'text-slate-400 dark:text-gray-500'}`} 
              fill={isSaved ? "currentColor" : "none"} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        <blockquote className="mb-4">
          <p className="text-lg md:text-xl leading-relaxed text-slate-800 dark:text-gray-200 italic">
            "{todayVerse.text}"
          </p>
        </blockquote>

        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
          — {todayVerse.reference}
        </p>
      </div>
    </div>
  );
}
