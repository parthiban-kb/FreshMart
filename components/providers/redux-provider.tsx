'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { useEffect, useState } from 'react';
import { initializeStorage } from '@/lib/storage';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeStorage();
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return null;
  }

  return <Provider store={store}>{children}</Provider>;
}
