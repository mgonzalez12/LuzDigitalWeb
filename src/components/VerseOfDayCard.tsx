'use client';

export function VerseOfDayCard() {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Versículo del Día
        </span>
      </div>
      
      <blockquote className="mb-4">
        <p className="text-lg text-white font-medium leading-relaxed">
          "El Señor es mi pastor; nada me faltará."
        </p>
      </blockquote>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400 font-medium">
          Salmos 23:1
        </p>
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all">
          Reflexionar
        </button>
      </div>
    </div>
  );
}
