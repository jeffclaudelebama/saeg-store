import { NextResponse } from 'next/server';
import { normalizeGabonPhone } from '@/lib/phone';
import { wooFetch } from '@/lib/server/woo';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { phone?: string } | null;
  const phone = normalizeGabonPhone(String(body?.phone || ''));
  if (!phone) {
    return NextResponse.json({ error: 'Téléphone invalide.' }, { status: 422 });
  }

  try {
    const result = await wooFetch<{ ok: boolean; phone: string; expires_in: number; resend_after: number }>(
      '/wp-json/saeg/v1/account/otp/request',
      {
        method: 'POST',
        body: JSON.stringify({ phone }),
      },
    );
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const statusMatch = message.match(/Woo fetch failed (\d+)/);
    const status = statusMatch ? Number(statusMatch[1]) : 502;
    return NextResponse.json({ error: 'Impossible d’envoyer le code OTP.' }, { status });
  }
}
