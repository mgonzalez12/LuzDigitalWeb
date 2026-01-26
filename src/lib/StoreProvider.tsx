'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from './store';
import { AuthProvider } from '@/components/AuthProvider';
import AmbientAudioPlayer from '@/components/AmbientAudioPlayer';
import { NotificationManager } from '@/components/NotificationManager';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | undefined>(undefined);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore() as AppStore;
  }

  return (
    <Provider store={storeRef.current}>
      <AuthProvider>
        <AmbientAudioPlayer />
        <NotificationManager />
        {children}
      </AuthProvider>
    </Provider>
  );
}
