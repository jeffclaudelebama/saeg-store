export type SaegUnitType = 'kg' | 'unit';
export type SaegCommune = 'Libreville' | 'Akanda' | 'Owendo';
export type SaegDeliveryMode = 'delivery' | 'pickup';
export type SaegDeliverySlot = 'matin' | 'apres-midi';
export type SaegPaymentMethod = 'cash' | 'mobile_money';

export interface SaegCategory {
  id: number;
  slug: string;
  name: string;
  image?: string | null;
}

export interface SaegProduct {
  id: number;
  slug: string;
  name: string;
  permalink?: string;
  description: string;
  short_description: string;
  images: string[];
  categories: SaegCategory[];
  currency: string;
  currency_symbol: string;
  price: number;
  regular_price: number;
  sale_price: number;
  unit_type: SaegUnitType;
  price_per_kg: number;
  step_kg: number;
  min_kg: number;
  stock_kg: number | null;
  low_stock_threshold: number;
  low_stock: boolean;
  stock_status: string;
  is_daily_surplus: boolean;
  origin: string;
  updated_at?: string | null;
}

export interface SaegCartItem {
  key: string;
  productId: number;
  product_id?: number;
  slug: string;
  name: string;
  image: string | null;
  unitType: SaegUnitType;
  unit_type?: SaegUnitType;
  quantity: number;
  weight_kg?: number;
  stepKg: number;
  step_kg?: number;
  minKg: number;
  min_kg?: number;
  stockKg: number | null;
  stock_kg?: number | null;
  unitPrice: number;
  unit_price?: number;
  pricePerKg: number;
  price_per_kg?: number;
  currency: string;
  currencySymbol: string;
  categoryName?: string;
}

export interface SaegCheckoutForm {
  first_name: string;
  last_name?: string;
  telephone: string;
  email?: string;
  commune: SaegCommune;
  address_1: string;
  address_2?: string;
  country: 'GA';
  modeLivraison: SaegDeliveryMode;
  creneau: SaegDeliverySlot;
  paiement: SaegPaymentMethod;
  note?: string;
  mobileMoneyPayerNumber?: string;
}

export interface SaegCartValidationLine {
  itemKey: string;
  productId: number;
  product_id?: number;
  name: string;
  unitType: SaegUnitType;
  reason?: string;
  quantity: number;
  weight_kg?: number;
  lineTotal: number;
  valid: boolean;
  message?: string;
  details?: string;
}

export interface SaegCartValidationError {
  itemKey: string;
  product_id: number;
  name: string;
  reason: string;
  details?: string;
}

export interface SaegCartValidationResult {
  ok: boolean;
  valid: boolean;
  currency: string;
  currencySymbol: string;
  subtotal: number;
  shipping: number;
  total: number;
  shippingLabel: string;
  lines: SaegCartValidationLine[];
  errors: SaegCartValidationError[];
}

export interface SaegTrackingResponse {
  found: boolean;
  orderNumber?: string;
  status?: 'recue' | 'preparation' | 'en_route' | 'livree';
  statusLabel?: string;
  createdAt?: string;
  customerPhone?: string;
  customerName?: string;
  total?: number;
  deliveryMode?: SaegDeliveryMode;
  commune?: string;
  timeline?: Array<{ code: string; label: string; done: boolean }>;
  message?: string;
}

export interface SaegOrderListItem {
  id: number;
  number: string;
  date_created?: string;
  status: string;
  total: number;
  currency: string;
  billing_name: string;
  billing_phone: string;
  line_items: Array<{
    product_id: number;
    name: string;
    quantity: number;
    total: string;
  }>;
}

export interface SaegOrdersResponse {
  items: SaegOrderListItem[];
  count: number;
  phone: string;
}
