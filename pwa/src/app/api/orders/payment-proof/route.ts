import { NextResponse } from 'next/server';
import { hasWooEnv } from '@/lib/env';
import { normalizeGabonPhone } from '@/lib/phone';
import { wooFetch } from '@/lib/server/woo';

function toStringValue(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isAllowedProofFile(file: File): boolean {
  const allowedMime = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
  if (allowedMime.has(file.type)) {
    return true;
  }

  const lowerName = file.name.toLowerCase();
  return lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.png') || lowerName.endsWith('.webp') || lowerName.endsWith('.pdf');
}

function metaValue(meta: Array<{ key?: string; value?: unknown }> | undefined, key: string): string {
  const entry = (meta || []).find((item) => item?.key === key);
  return typeof entry?.value === 'string' ? entry.value : '';
}

export async function POST(request: Request) {
  if (!hasWooEnv()) {
    return NextResponse.json({ error: 'WooCommerce indisponible.' }, { status: 503 });
  }

  const formData = await request.formData();
  const orderId = Number(toStringValue(formData.get('orderId')));
  const phone = normalizeGabonPhone(toStringValue(formData.get('phone')));
  const paymentReferenceFromBody = toStringValue(formData.get('paymentReference'));
  const payerNumberFromBody = normalizeGabonPhone(toStringValue(formData.get('payerNumber'))) || '';
  const proof = formData.get('proof');

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return NextResponse.json({ error: 'Commande invalide.' }, { status: 422 });
  }
  if (!phone) {
    return NextResponse.json({ error: 'Téléphone invalide.' }, { status: 422 });
  }
  if (!(proof instanceof File) || proof.size <= 0) {
    return NextResponse.json({ error: 'Fichier de preuve manquant.' }, { status: 422 });
  }
  if (!isAllowedProofFile(proof)) {
    return NextResponse.json({ error: 'Format de preuve non supporté (image ou PDF uniquement).' }, { status: 422 });
  }
  if (proof.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'La preuve de paiement dépasse 10 MB.' }, { status: 422 });
  }

  try {
    const order = await wooFetch<{
      billing?: { phone?: string };
      meta_data?: Array<{ key?: string; value?: unknown }>;
    }>(`/wp-json/wc/v3/orders/${orderId}`, { cache: 'no-store' });

    const billingPhone = normalizeGabonPhone(String(order.billing?.phone || ''));
    if (!billingPhone || billingPhone !== phone) {
      return NextResponse.json({ error: 'Commande introuvable pour ce téléphone.' }, { status: 404 });
    }

    const paymentReference = paymentReferenceFromBody || metaValue(order.meta_data, 'saeg_mobile_money_reference');
    if (!paymentReference) {
      return NextResponse.json({ error: 'Référence Mobile Money introuvable.' }, { status: 422 });
    }

    const payerNumber = payerNumberFromBody || metaValue(order.meta_data, 'saeg_mobile_money_payer_number');
    const uploadPayload = new FormData();
    uploadPayload.append('proof', proof, proof.name);
    uploadPayload.append('payment_reference', paymentReference);
    uploadPayload.append('payer_number', payerNumber);

    const upload = await wooFetch<{
      ok: boolean;
      attachment_id?: number;
      attachment_url?: string;
      payment_reference?: string;
    }>(`/wp-json/saeg/v1/orders/${orderId}/payment-proof`, {
      method: 'POST',
      body: uploadPayload,
    });

    return NextResponse.json({
      ok: true,
      attachmentId: upload.attachment_id,
      attachmentUrl: upload.attachment_url,
      paymentReference: upload.payment_reference || paymentReference,
    });
  } catch (error) {
    console.error('[AGROPAG] upload payment proof failed', error);
    return NextResponse.json({ error: 'Impossible d’envoyer la preuve.', details: String(error) }, { status: 502 });
  }
}
