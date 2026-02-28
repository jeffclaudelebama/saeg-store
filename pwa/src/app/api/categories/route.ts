import { NextResponse } from 'next/server';
import { getCategoriesServer } from '@/lib/server/products';

export async function GET() {
  const items = await getCategoriesServer({ noCache: true });
  return NextResponse.json({ items, count: items.length });
}
