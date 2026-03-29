import { NextResponse } from 'next/server';
import { createAccountSession } from '@/lib/server/account-session';
import { normalizeGabonPhone } from '@/lib/phone';
import { wooFetch } from '@/lib/server/woo';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { phone?: string; code?: string } | null;
  const phone = normalizeGabonPhone(String(body?.phone || ''));
  const code = String(body?.code || '').trim();

  if (!phone) {
    return NextResponse.json({ error: 'Téléphone invalide.' }, { status: 422 });
  }
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Le code OTP doit contenir 6 chiffres.' }, { status: 422 });
  }

  try {
    const result = await wooFetch<{ ok: boolean; profile?: unknown }>('/wp-json/saeg/v1/account/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });
    await createAccountSession(phone);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const statusMatch = message.match(/Woo fetch failed (\d+)/);
    const status = statusMatch ? Number(statusMatch[1]) : 502;
    return NextResponse.json({ error: status === 401 ? 'Code OTP invalide.' : 'Impossible de vérifier le code OTP.' }, { status });
  }
}
