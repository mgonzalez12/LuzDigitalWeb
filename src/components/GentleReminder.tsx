'use client';

import { useState, useEffect } from 'react';

export function GentleReminder() {
  const [showReminder, setShowReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');

  useEffect(() => {
    const savedTime = localStorage.getItem('reminderTime');
    if (savedTime) {
      setReminderTime(savedTime);
    }
  }, []);

  const handleSaveReminder = () => {
    localStorage.setItem('reminderTime', reminderTime);
    setShowReminder(false);
    // Aquí iría la lógica para programar notificaciones
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800/30">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Recordatorio Suave</h3>
          <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
            Configura un momento tranquilo del día para tu lectura espiritual
          </p>

          {!showReminder ? (
            <button
              onClick={() => setShowReminder(true)}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
            >
              Configurar recordatorio →
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Hora preferida
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveReminder}
                  className="flex-1 py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-all"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setShowReminder(false)}
                  className="py-2 px-4 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
