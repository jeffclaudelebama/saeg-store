import { NextResponse } from 'next/server';
import { clearAccountSession, getAccountSession } from '@/lib/server/account-session';

export async function GET() {
  const session = await getAccountSession();
  if (!session?.phone) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, phone: session.phone });
}

export async function DELETE() {
  await clearAccountSession();
  return NextResponse.json({ ok: true });
}
