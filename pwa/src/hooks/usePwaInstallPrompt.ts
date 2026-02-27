'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  }
}

const DISMISS_KEY = 'saeg_pwa_install_dismissed_until';
const HIDE_MS = 30 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 1200;

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isiOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

export function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHelpOpen, setIosHelpOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  const standalone = useMemo(isStandaloneMode, []);
  const ios = useMemo(isiOS, []);

  useEffect(() => {
    if (standalone) return;

    const dismissedUntilRaw = window.localStorage.getItem(DISMISS_KEY);
    const dismissedUntil = dismissedUntilRaw ? Number(dismissedUntilRaw) : 0;
    if (Number.isFinite(dismissedUntil) && dismissedUntil > Date.now()) {
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setVisible(true);
      trackEvent('install_banner_shown', { platform: ios ? 'ios' : 'android_or_other' });
    }, SHOW_DELAY_MS);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
    };
  }, [ios, standalone]);

  const canShow = visible && !standalone;
  const mode: 'hidden' | 'android' | 'ios' = !canShow ? 'hidden' : deferredPrompt ? 'android' : ios ? 'ios' : 'hidden';

  async function promptInstall() {
    if (!deferredPrompt) return { ok: false as const, reason: 'prompt_unavailable' };
    trackEvent('install_clicked', { platform: 'android' });
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      trackEvent('install_accepted', { platform: 'android' });
      setVisible(false);
    } else {
      trackEvent('install_dismissed', { platform: 'android' });
    }
    setDeferredPrompt(null);
    return { ok: true as const, outcome: choice.outcome };
  }

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now() + HIDE_MS));
    setVisible(false);
    trackEvent('install_dismissed', { platform: mode === 'ios' ? 'ios' : 'unknown' });
  }

  function openIosHelp() {
    setIosHelpOpen(true);
    trackEvent('ios_help_opened');
  }

  return {
    mode,
    standalone,
    visible: canShow,
    iosHelpOpen,
    setIosHelpOpen,
    promptInstall,
    dismiss,
    openIosHelp,
  };
}
