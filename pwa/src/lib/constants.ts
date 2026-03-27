import type { SaegCommune } from '@/types/saeg';

export const APP_NAME = 'AGROPAG - La Boutique';
export const REVALIDATE_PRODUCTS_SECONDS = 30;
export const REVALIDATE_PRODUCT_SECONDS = 300;
export const CURRENCY_CODE = 'XAF';
export const TIMEZONE = 'Africa/Libreville';
export const AGROPAG_PHONE = '011453040';
export const AGROPAG_WHATSAPP_LOCAL = '062560462';
export const AGROPAG_WHATSAPP_INTL = '24162560462';
export const AGROPAG_EMAIL = 'commande@agropag.ga';
export const AGROPAG_INFO_EMAIL = 'info@agropag.ga';
export const AGROPAG_SUPPORT_EMAIL = 'support@agropag.ga';
export const AGROPAG_COPYRIGHT = '© AGROPAG 2026 — Conçu par Studio Orange since 2010, LTD';

export const DELIVERY_FEES: Record<SaegCommune, number> = {
  Libreville: 1500,
  Akanda: 2000,
  Owendo: 2500,
};

export const DELIVERY_SLOTS = [
  { value: 'matin', label: 'Matin' },
  { value: 'apres-midi', label: 'Après-midi' },
] as const;

export const COMMUNES = ['Libreville', 'Akanda', 'Owendo'] as const;
