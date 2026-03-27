import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { createBackendHeaders } from '@/lib/server/woo';

function normalizeGabonPhone(value: string): string | null {
  const digits = value.replace(/\D+/g, '');
  if (!digits) {
    return null;
  }

  let local = '';
  if (digits.startsWith('241') && digits.length >= 11) {
    local = digits.slice(3, 11);
  } else if (digits.startsWith('0') && digits.length >= 9) {
    local = digits.slice(1, 9);
  } else if (digits.length === 8) {
    local = digits;
  }

  if (!/^\d{8}$/.test(local)) {
    return null;
  }

  return `241${local}`;
}

export async function POST(request: Request) {
  const token = process.env.AGROPAG_WA_LEADS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Token leads WhatsApp non configuré' }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as { phone?: string } | null;
  const normalizedPhone = normalizeGabonPhone(String(body?.phone || ''));
  if (!normalizedPhone) {
    return NextResponse.json({ error: 'Numéro WhatsApp invalide' }, { status: 422 });
  }

  const wpBase = env.wpPublicUrl.replace(/\/$/, '');
  const wpResponse = await fetch(`${wpBase}/wp-json/saeg/v1/whatsapp-leads`, {
    method: 'POST',
    headers: createBackendHeaders({
      'Content-Type': 'application/json',
      'X-AGROPAG-Token': token,
    }),
    body: JSON.stringify({
      phone: normalizedPhone,
      source: 'footer_newsletter',
    }),
    cache: 'no-store',
  });

  const payload = await wpResponse.json().catch(() => ({}));
  if (!wpResponse.ok) {
    return NextResponse.json(
      { error: payload?.error || 'Échec enregistrement du lead WhatsApp' },
      { status: wpResponse.status || 502 },
    );
  }

  return NextResponse.json({ ok: true, phone: normalizedPhone });
}
