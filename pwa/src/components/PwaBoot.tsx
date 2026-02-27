'use client';

import { useEffect } from 'react';

export function PwaBoot() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (window.location.hostname === 'localhost') return;

    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('SW registration failed', error);
    });
  }, []);

  return null;
}
