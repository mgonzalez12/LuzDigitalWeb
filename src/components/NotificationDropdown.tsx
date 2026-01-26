'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import { UserNotificationsService } from '@/lib/services/userNotificationsService';
import { setNotifications, markAsRead, removeNotification, Notification } from '@/lib/features/notificationSlice';
import Link from 'next/link';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Load notifications from DB
  useEffect(() => {
    if (!user?.id) return;

    const loadNotifications = async () => {
      const notifications = await UserNotificationsService.getUserNotifications(user.id, {
        limit: 10,
      });

      if (notifications) {
        dispatch(setNotifications(notifications.map(n => ({ ...n, type: n.type || 'default' })) as Notification[]));
      }
    };

    loadNotifications();

    // Subscribe to realtime changes (optional, but good for UX)
    const channel = supabase
      .channel('public:user_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadNotifications();
          // Optional: Play a sound on new notification
          // const audio = new Audio('/sounds/notification.mp3');
          // audio.play().catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    dispatch(markAsRead(id));
    await UserNotificationsService.markAsRead(id);
  };

  const handleRemove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeNotification(id));
    await UserNotificationsService.deleteNotification(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors relative"
      >
        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0a0f]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#0d1420] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-semibold text-white">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                {unreadCount} nuevas
              </span>
            )}
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-sm">No hay notificaciones</p>
                <p className="text-xs mt-1 opacity-60">Estás al día con todo</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    onClick={() => handleMarkAsRead(notification.id)}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer relative group ${
                      !notification.is_read ? 'bg-blue-500/5' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-white' : 'text-gray-400'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                        <span className="text-[10px] text-gray-600 mt-2 block">
                          {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                      )}
                      <button
                        onClick={(e) => handleRemove(notification.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-gray-500 hover:text-red-400 transition-all absolute top-2 right-2"
                        title="Eliminar"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-white/5 bg-white/[0.02]">
            <Link href="/configuracion" className="block text-center text-xs text-gray-400 hover:text-white transition-colors">
              Configurar notificaciones
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
