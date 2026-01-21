'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { getCurrentSession, setUser } from '@/lib/features/authSlice';
import { supabase } from '@/lib/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Obtener sesión inicial
    dispatch(getCurrentSession());

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setUser(session?.user ?? null));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
}
