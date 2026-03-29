import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET() {
  if (!env.webPushPublicKey) {
    return NextResponse.json({ error: 'Clé Web Push non configurée.' }, { status: 503 });
  }

  return NextResponse.json({ publicKey: env.webPushPublicKey });
}
