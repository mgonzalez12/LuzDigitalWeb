'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import { addNotification, Notification } from '@/lib/features/notificationSlice';
import Link from 'next/link';
import { BookOpen, X } from 'lucide-react';

export function NotificationManager() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const lastCheckedMinute = useRef<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<{title: string, message: string} | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const checkTime = async () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;

      if (lastCheckedMinute.current === currentTimeString) return;

      lastCheckedMinute.current = currentTimeString;

      const { data: settings } = await supabase
        .from('user_settings')
        .select('reminders_enabled, reminder_time')
        .eq('user_id', user.id)
        .single();

      if (!settings || !settings.reminders_enabled || !settings.reminder_time) return;

      const settingsTime = String(settings.reminder_time).slice(0, 5);

      if (currentTimeString === settingsTime) {
        await triggerNotification(user.id);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 10000);

    return () => clearInterval(interval);
  }, [user?.id]);

  const triggerNotification = async (userId: string) => {
    const hour = new Date().getHours();
    let greeting = 'Hola';
    if (hour < 12) greeting = 'Buenos días';
    else if (hour < 18) greeting = 'Buenas tardes';
    else greeting = 'Buenas noches';

    const title = `${greeting}, es hora de tu lectura`;
    const message = 'Tómate un momento para conectar con la palabra de Dios. Tu racha te espera.';

    // Insert/Update in database and return the data
    const { data, error } = await supabase.from('user_notifications').upsert({
      user_id: userId,
      title,
      message,
      is_read: false,
      type: 'daily_reminder',
      created_at: new Date().toISOString()
    }, { onConflict: 'user_id, type' })
    .select()
    .single();

    if (error) {
      console.error('Error triggering notification:', error);
    } else if (data) {
        // 1. Dispatch to Redux (Immediate UI update for Dropdown)
        dispatch(addNotification(data as Notification));

        // 2. Show Modal (Visual feedback)
        setCurrentNotification({ title, message });
        setShowModal(true);

        // 3. Play Sound
        try {
             const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 
             audio.volume = 0.5;
             audio.play().catch(() => {});
        } catch (e) {
            // Ignore audio errors
        }
    }
  };

  if (!showModal || !currentNotification) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setShowModal(false)}
      />
      
      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-violet-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
        <button 
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mb-4 text-violet-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">{currentNotification.title}</h3>
          <p className="text-slate-300 mb-6 leading-relaxed">
            {currentNotification.message}
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors"
            >
              Más tarde
            </button>
            <Link 
              href="/dashboard" 
              onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Leer ahora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
