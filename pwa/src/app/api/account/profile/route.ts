import { NextResponse } from 'next/server';
import { getAccountSession } from '@/lib/server/account-session';
import { normalizeGabonPhone } from '@/lib/phone';
import { wooFetch } from '@/lib/server/woo';

type ProfilePayload = {
  phone?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
};

export async function GET() {
  const session = await getAccountSession();
  if (!session?.phone) {
    return NextResponse.json({ error: 'Session invalide.' }, { status: 401 });
  }

  try {
    const profile = await wooFetch<ProfilePayload>(
      `/wp-json/saeg/v1/account/profile?phone=${encodeURIComponent(session.phone)}`,
      { cache: 'no-store' },
    );
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[AGROPAG] account profile GET failed', error);
    return NextResponse.json({ error: 'Impossible de charger le profil.' }, { status: 502 });
  }
}

export async function PUT(request: Request) {
  const session = await getAccountSession();
  if (!session?.phone) {
    return NextResponse.json({ error: 'Session invalide.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as ProfilePayload | null;
  const phone = normalizeGabonPhone(String(body?.phone || session.phone || ''));
  if (!phone || phone !== session.phone) {
    return NextResponse.json({ error: 'Téléphone invalide.' }, { status: 422 });
  }

  try {
    const profile = await wooFetch<ProfilePayload>('/wp-json/saeg/v1/account/profile', {
      method: 'PUT',
      body: JSON.stringify({
        phone,
        first_name: String(body?.first_name || '').trim(),
        last_name: String(body?.last_name || '').trim(),
        email: String(body?.email || '').trim(),
        address_1: String(body?.address_1 || '').trim(),
        address_2: String(body?.address_2 || '').trim(),
        city: String(body?.city || 'Libreville').trim(),
      }),
    });
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[AGROPAG] account profile PUT failed', error);
    return NextResponse.json({ error: 'Impossible d’enregistrer le profil.' }, { status: 502 });
  }
}
