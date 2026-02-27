import { NextResponse } from 'next/server';
import { validateCartAgainstProducts } from '@/lib/cart-validation';
import { env, hasWooEnv } from '@/lib/env';
import { getProductServer } from '@/lib/server/products';
import { wooFetch } from '@/lib/server/woo';
import type { SaegCartItem, SaegCheckoutForm, SaegProduct } from '@/types/saeg';

interface CheckoutPayload {
  items: SaegCartItem[];
  form: SaegCheckoutForm;
}

function mapPayment(form: SaegCheckoutForm) {
  if (form.paiement === 'mobile_money') {
    return { payment_method: 'saeg_mobile_money', payment_method_title: 'Mobile Money', set_paid: false };
  }
  return { payment_method: 'cod', payment_method_title: 'Paiement à la livraison', set_paid: false };
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D+/g, '');
  if (digits.startsWith('241')) return `+${digits}`;
  return `+241${digits}`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CheckoutPayload | null;
  if (!body || !Array.isArray(body.items) || !body.form) {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  }

  if (body.items.length === 0) {
    return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
  }

  const ids = Array.from(new Set(body.items.map((i) => i.productId)));
  const productResults = await Promise.all(ids.map((id) => getProductServer(id)));
  const products = productResults.filter((product): product is SaegProduct => product !== null);
  const validation = validateCartAgainstProducts({
    items: body.items,
    products,
    commune: body.form.commune,
    modeLivraison: body.form.modeLivraison,
  });

  if (!validation.valid) {
    return NextResponse.json({ error: 'Panier invalide', validation }, { status: 422 });
  }

  const phone = normalizePhone(body.form.telephone);

  const lineItems = body.items.map((item) => ({
    product_id: item.productId,
    quantity: item.quantity,
    meta_data: item.unitType === 'kg' ? [{ key: 'saeg_requested_weight_kg', value: String(item.quantity) }] : [],
  }));

  const shippingLines = [
    {
      method_id: body.form.modeLivraison === 'pickup' ? 'local_pickup' : 'flat_rate',
      method_title: validation.shippingLabel,
      total: String(validation.shipping),
    },
  ];

  const mobileMoneyNote = 'Paiement Mobile Money: Airtel Money — Code agent : SAEG. Moov Money — Code agent : SAEG (bientôt disponible).';
  const metaData = [
    { key: 'saeg_commune', value: body.form.commune },
    { key: 'saeg_mode_livraison', value: body.form.modeLivraison },
    { key: 'saeg_creneau', value: body.form.creneau },
    { key: 'saeg_paiement', value: body.form.paiement },
    { key: 'saeg_mobile_money_code_agent', value: 'SAEG' },
    { key: 'saeg_source', value: 'pwa' },
  ];

  const orderPayload = {
    status: env.orderStatusOnCreate || 'pending',
    currency: 'XAF',
    billing: {
      first_name: body.form.nom.split(' ').slice(0, 1).join(' '),
      last_name: body.form.nom.split(' ').slice(1).join(' '),
      phone,
      email: '',
      address_1: body.form.adresse,
      city: body.form.commune,
      country: 'GA',
    },
    shipping: {
      first_name: body.form.nom.split(' ').slice(0, 1).join(' '),
      last_name: body.form.nom.split(' ').slice(1).join(' '),
      phone,
      address_1: body.form.adresse,
      city: body.form.commune,
      country: 'GA',
    },
    customer_note:
      body.form.paiement === 'mobile_money'
        ? [body.form.note, mobileMoneyNote].filter(Boolean).join(' | ')
        : body.form.note || `${body.form.modeLivraison === 'pickup' ? 'Retrait' : 'Livraison'} - Créneau: ${body.form.creneau}`,
    line_items: lineItems,
    shipping_lines: shippingLines,
    meta_data: metaData,
    ...mapPayment(body.form),
  };

  if (!hasWooEnv()) {
    const fakeId = Math.floor(Date.now() / 1000);
    return NextResponse.json({
      ok: true,
      mock: true,
      order: {
        id: fakeId,
        number: String(fakeId),
        status: 'pending',
        total: validation.total,
        currency: 'XAF',
        created_at: new Date().toISOString(),
      },
      validation,
    });
  }

  try {
    const order = await wooFetch<any>('/wp-json/wc/v3/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
      revalidate: 0,
    });

    return NextResponse.json({ ok: true, order, validation });
  } catch (error) {
    console.error('[SAEG] create-order failed', error);
    return NextResponse.json({ error: 'Impossible de créer la commande', details: String(error) }, { status: 502 });
  }
}
