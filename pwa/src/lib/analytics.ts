'use client';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

type AnalyticsEventName =
  | 'view_item'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'install_banner_shown'
  | 'install_clicked'
  | 'install_accepted'
  | 'install_dismissed'
  | 'ios_help_opened';

export function trackEvent(eventName: AnalyticsEventName, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: eventName, ...params });

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}
