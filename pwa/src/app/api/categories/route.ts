import { NextResponse } from 'next/server';
import { getCategoriesServer } from '@/lib/server/products';

export async function GET() {
  const items = await getCategoriesServer();
  return NextResponse.json({ items, count: items.length });
}
