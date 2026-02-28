import { NextResponse } from 'next/server';
import { validateCartAgainstProducts } from '@/lib/cart-validation';
import { env, hasWooEnv } from '@/lib/env';
import { getProductServer } from '@/lib/server/products';
import { wooFetch } from '@/lib/server/woo';
import type { SaegCartItem, SaegCheckoutForm, SaegProduct } from '@/types/saeg';

interface CheckoutPayload {
  items: SaegCartItem[];
  form: SaegCheckoutForm;
  paymentProof?: File | null;
}

interface ParsedRequestBody {
  items: SaegCartItem[];
  form: SaegCheckoutForm;
  paymentProof: File | null;
}

function mapPayment(form: SaegCheckoutForm) {
  if (form.paiement === 'mobile_money') {
    return { payment_method: 'bacs', payment_method_title: 'Mobile Money', set_paid: false };
  }
  return { payment_method: 'cod', payment_method_title: 'Paiement à la livraison', set_paid: false };
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D+/g, '');
  if (digits.startsWith('241')) return `+${digits}`;
  return `+241${digits}`;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) {
    return { firstName: 'Client', lastName: '' };
  }
  return {
    firstName: parts[0] ?? 'Client',
    lastName: parts.slice(1).join(' '),
  };
}

function resolveOrderStatus(form: SaegCheckoutForm): 'on-hold' | 'processing' | 'pending' {
  if (form.paiement === 'mobile_money') {
    return 'on-hold';
  }
  return env.orderStatusOnCreate === 'processing' ? 'processing' : 'pending';
}

class WooOrderError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`Woo order create failed (${status})`);
    this.name = 'WooOrderError';
    this.status = status;
    this.body = body;
  }
}

async function createWooOrderRaw(payload: Record<string, unknown>) {
  const baseUrl = env.wcBaseUrl.replace(/\/$/, '');
  const token = Buffer.from(`${env.wcKey}:${env.wcSecret}`).toString('base64');
  const endpoint = `${baseUrl}/wp-json/wc/v3/orders`;

  console.info('[SAEG][checkout] create-order payload', JSON.stringify(payload));

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const bodyText = await response.text();
  console.info('[SAEG][checkout] create-order response', JSON.stringify({ status: response.status, body: bodyText }));

  if (!response.ok) {
    throw new WooOrderError(response.status, bodyText);
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    return { raw: bodyText };
  }
}

function random4(): string {
  return Math.random().toString(36).slice(-4).toUpperCase();
}

function buildMobileMoneyReference(orderId: number): string {
  return `SAEG-${orderId}-${random4()}`;
}

function toStringValue(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value : '';
}

async function parseBody(request: Request): Promise<ParsedRequestBody | null> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const itemsRaw = toStringValue(formData.get('items'));
    const formRaw = toStringValue(formData.get('form'));
    let items: SaegCartItem[] = [];
    let form: SaegCheckoutForm | null = null;
    try {
      items = JSON.parse(itemsRaw) as SaegCartItem[];
      form = JSON.parse(formRaw) as SaegCheckoutForm;
    } catch {
      return null;
    }
    const proofEntry = formData.get('payment_proof');
    const paymentProof = proofEntry instanceof File && proofEntry.size > 0 ? proofEntry : null;
    return { items, form, paymentProof };
  }

  const jsonBody = (await request.json().catch(() => null)) as CheckoutPayload | null;
  if (!jsonBody) {
    return null;
  }
  return {
    items: Array.isArray(jsonBody.items) ? jsonBody.items : [],
    form: jsonBody.form,
    paymentProof: jsonBody.paymentProof ?? null,
  };
}

function isAllowedProofFile(file: File): boolean {
  const allowedMime = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ]);
  if (allowedMime.has(file.type)) {
    return true;
  }
  const lowerName = file.name.toLowerCase();
  return lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.png') || lowerName.endsWith('.webp') || lowerName.endsWith('.pdf');
}

function mobileMoneyNote(reference: string): string {
  return `Référence Mobile Money: ${reference} | Airtel Money — Code agent : SAEG | Moov Money — Code agent : SAEG (bientôt disponible).`;
}

async function createInternalOrderNote(orderId: number, note: string) {
  await wooFetch(`/wp-json/wc/v3/orders/${orderId}/notes`, {
    method: 'POST',
    body: JSON.stringify({
      note,
      customer_note: false,
    }),
    revalidate: 0,
  });
}

async function updateOrderMeta(orderId: number, payload: Array<{ key: string; value: string }>) {
  await wooFetch(`/wp-json/wc/v3/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({
      meta_data: payload,
    }),
    revalidate: 0,
  });
}

async function uploadPaymentProof(orderId: number, reference: string, payerNumber: string, file: File) {
  const formData = new FormData();
  formData.append('proof', file, file.name);
  formData.append('payment_reference', reference);
  formData.append('payer_number', payerNumber);

  return wooFetch<{
    ok: boolean;
    attachment_id?: number;
    attachment_url?: string;
  }>(`/wp-json/saeg/v1/orders/${orderId}/payment-proof`, {
    method: 'POST',
    body: formData,
    revalidate: 0,
  });
}

export async function POST(request: Request) {
  const parsed = await parseBody(request);
  if (!parsed || !Array.isArray(parsed.items) || !parsed.form) {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  }

  if (parsed.items.length === 0) {
    return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
  }

  if (parsed.form.paiement === 'mobile_money') {
    if (!parsed.form.mobileMoneyPayerNumber?.trim()) {
      return NextResponse.json({ error: 'Numéro Airtel/Moov du payeur requis.' }, { status: 422 });
    }
    if (!parsed.paymentProof) {
      return NextResponse.json({ error: 'Preuve de paiement requise pour Mobile Money.' }, { status: 422 });
    }
    if (!isAllowedProofFile(parsed.paymentProof)) {
      return NextResponse.json({ error: 'Format de preuve non supporté (image ou PDF uniquement).' }, { status: 422 });
    }
    if (parsed.paymentProof.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'La preuve de paiement dépasse 10 MB.' }, { status: 422 });
    }
  }

  const ids = Array.from(new Set(parsed.items.map((i) => i.productId)));
  const productResults = await Promise.all(ids.map((id) => getProductServer(id)));
  const products = productResults.filter((product): product is SaegProduct => product !== null);
  const validation = validateCartAgainstProducts({
    items: parsed.items,
    products,
    commune: parsed.form.commune,
    modeLivraison: parsed.form.modeLivraison,
  });

  if (!validation.valid) {
    return NextResponse.json({ error: 'Panier invalide', validation }, { status: 422 });
  }

  const phone = normalizePhone(parsed.form.telephone);
  const { firstName, lastName } = splitName(parsed.form.nom);

  const lineItems = parsed.items.map((item) => ({
    product_id: item.productId,
    quantity: item.quantity,
    meta_data: item.unitType === 'kg' ? [{ key: 'saeg_requested_weight_kg', value: String(item.quantity) }] : [],
  }));

  const shippingLines = [
    {
      method_id: parsed.form.modeLivraison === 'pickup' ? 'local_pickup' : 'flat_rate',
      method_title: validation.shippingLabel,
      total: String(validation.shipping),
    },
  ];

  const metaData = [
    { key: 'saeg_commune', value: parsed.form.commune },
    { key: 'saeg_mode_livraison', value: parsed.form.modeLivraison },
    { key: 'saeg_creneau', value: parsed.form.creneau },
    { key: 'saeg_paiement', value: parsed.form.paiement },
    { key: 'saeg_mobile_money_code_agent', value: 'SAEG' },
    { key: 'saeg_mobile_money_payer_number', value: parsed.form.mobileMoneyPayerNumber || '' },
    { key: 'saeg_source', value: 'pwa' },
  ];

  const orderPayload = {
    status: resolveOrderStatus(parsed.form),
    currency: 'XAF',
    billing: {
      first_name: firstName,
      last_name: lastName,
      phone,
      email: '',
      address_1: parsed.form.adresse,
      city: 'Libreville',
      country: 'GA',
    },
    shipping: {
      first_name: firstName,
      last_name: lastName,
      phone,
      address_1: parsed.form.adresse,
      city: 'Libreville',
      country: 'GA',
    },
    customer_note:
      parsed.form.paiement === 'mobile_money'
        ? [parsed.form.note, 'Paiement Mobile Money sélectionné.'].filter(Boolean).join(' | ')
        : parsed.form.note || `${parsed.form.modeLivraison === 'pickup' ? 'Retrait' : 'Livraison'} - Créneau: ${parsed.form.creneau}`,
    line_items: lineItems,
    shipping_lines: shippingLines,
    meta_data: metaData,
    ...mapPayment(parsed.form),
  };

  if (!hasWooEnv()) {
    const fakeId = Math.floor(Date.now() / 1000);
    const paymentReference = parsed.form.paiement === 'mobile_money' ? buildMobileMoneyReference(fakeId) : '';
    return NextResponse.json({
      ok: true,
      mock: true,
      order: {
        id: fakeId,
        number: String(fakeId),
        status: parsed.form.paiement === 'mobile_money' ? 'on-hold' : 'pending',
        total: validation.total,
        currency: 'XAF',
        created_at: new Date().toISOString(),
      },
      paymentReference,
      validation,
    });
  }

  try {
    const order = await createWooOrderRaw(orderPayload);

    let paymentReference = '';
    let proofUploadResult: unknown = null;
    let warning: string | undefined;

    if (parsed.form.paiement === 'mobile_money') {
      paymentReference = buildMobileMoneyReference(Number(order.id));
      const payerNumber = parsed.form.mobileMoneyPayerNumber?.trim() || '';

      await updateOrderMeta(Number(order.id), [
        { key: 'saeg_mobile_money_reference', value: paymentReference },
        { key: 'saeg_mobile_money_payer_number', value: payerNumber },
        { key: 'saeg_mobile_money_status', value: 'pending_verification' },
      ]);

      await createInternalOrderNote(
        Number(order.id),
        `${mobileMoneyNote(paymentReference)} Numéro payeur: ${payerNumber || 'N/A'}`,
      );

      if (parsed.paymentProof) {
        try {
          proofUploadResult = await uploadPaymentProof(Number(order.id), paymentReference, payerNumber, parsed.paymentProof);
        } catch (proofError) {
          warning = 'Commande créée, mais la preuve n’a pas pu être liée automatiquement.';
          await createInternalOrderNote(Number(order.id), `Échec liaison preuve Mobile Money: ${String(proofError)}`);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      order,
      paymentReference,
      paymentProof: proofUploadResult,
      warning,
      validation,
    });
  } catch (error) {
    if (error instanceof WooOrderError) {
      return NextResponse.json(
        {
          error: 'WooCommerce order creation failed',
          status: error.status,
          body: error.body,
        },
        { status: error.status },
      );
    }
    console.error('[SAEG] create-order failed', error);
    return NextResponse.json({ error: 'Impossible de créer la commande', details: String(error) }, { status: 502 });
  }
}
