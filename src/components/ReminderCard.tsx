'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { UserSettingsService } from '@/lib/services/userSettingsService';

export function ReminderCard() {
  const { user } = useAppSelector((state) => state.auth);
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('09:00');
  const [tempTime, setTempTime] = useState('09:00');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadSettings = async () => {
      const settings = await UserSettingsService.getUserSettings(user.id);

      if (settings) {
        setEnabled(settings.reminders_enabled || false);
        const dbTime = settings.reminder_time ? String(settings.reminder_time).slice(0, 5) : '09:00';
        setTime(dbTime);
        setTempTime(dbTime);
      }
      setLoading(false);
    };

    loadSettings();
  }, [user?.id]);

  const toggleReminder = async () => {
    if (!user?.id) return;
    const newState = !enabled;
    setEnabled(newState);
    
    // Immediate save for toggle
    await UserSettingsService.saveUserSettings(user.id, {
      reminders_enabled: newState,
      // If we are toggling, we might as well save the current time too just in case
      reminder_time: time
    });
  };

  const handleSaveTime = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!user?.id) return;
    
    try {
      setTime(tempTime);
      setIsEditing(false);
      
      await UserSettingsService.saveUserSettings(user.id, {
        reminders_enabled: enabled,
        reminder_time: tempTime
      });
    } catch (error) {
      console.error('Error in handleSaveTime:', error);
      // Revert on error
      setTime(time);
      setIsEditing(true);
    }
  };

  const startEditing = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      setTempTime(time);
      setIsEditing(true);
    } catch (error) {
      console.error('Error starting edit mode:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-950/40 to-fuchsia-950/40 border border-violet-500/20 backdrop-blur-sm animate-pulse h-[140px]" />
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-950/40 to-fuchsia-950/40 border border-violet-500/20 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Recordatorio Suave</h3>
            <p className="text-xs text-violet-200/70">
              {enabled ? `Programado a las ${time}` : 'Desactivado'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleReminder}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-violet-500' : 'bg-slate-700'
          }`}
          aria-label="Toggle recordatorios"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <div 
          className={`flex-1 bg-white/5 border rounded-xl px-4 py-3 flex items-center justify-between transition-all ${isEditing ? 'border-violet-500/50 bg-violet-500/10' : 'border-white/10 group hover:border-violet-500/30'}`}
          onClick={(e) => {
            if (!enabled || !isEditing) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <span className="text-sm text-slate-300">Hora del día</span>
          <input
            type="time"
            value={isEditing ? tempTime : time}
            onChange={(e) => {
              try {
                e.stopPropagation();
                setTempTime(e.target.value);
              } catch (error) {
                console.error('Error updating time:', error);
              }
            }}
            onBlur={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            disabled={!enabled || !isEditing}
            className={`bg-transparent text-white font-medium focus:outline-none [color-scheme:dark] ${(!enabled || !isEditing) ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        </div>
        
        {enabled && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isEditing) {
                handleSaveTime(e);
              } else {
                startEditing(e);
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isEditing 
                ? 'bg-violet-500 hover:bg-violet-600 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-violet-200'
            }`}
          >
            {isEditing ? 'Guardar' : 'Editar'}
          </button>
        )}
      </div>
    </div>
  );
}
