import { NextRequest, NextResponse } from 'next/server';
import { getProductsServer } from '@/lib/server/products';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? undefined;
  const category = searchParams.get('category') ?? undefined;
  const dailyOnly = ['1', 'true', 'yes'].includes((searchParams.get('dailyOnly') ?? '').toLowerCase());
  const page = Number(searchParams.get('page') ?? '1');
  const perPage = Number(searchParams.get('perPage') ?? '40');

  const items = await getProductsServer({ search, category, dailyOnly, page, perPage });
  return NextResponse.json({ items, count: items.length, page, perPage });
}
