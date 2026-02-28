import type { SaegCommune } from '@/types/saeg';

export const APP_NAME = 'SAEG - La Boutique';
export const REVALIDATE_PRODUCTS_SECONDS = 30;
export const REVALIDATE_PRODUCT_SECONDS = 300;
export const CURRENCY_CODE = 'XAF';
export const TIMEZONE = 'Africa/Libreville';
export const SAEG_PHONE = '011453040';
export const SAEG_WHATSAPP_LOCAL = '077638864';
export const SAEG_WHATSAPP_INTL = '24177638864';
export const SAEG_EMAIL = 'store@saeggabon.ga';
export const SAEG_COPYRIGHT = '© SAEG 2026 — Conçu par Studio Orange since 2010, LTD (www.studio-orange-world.com)';

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
