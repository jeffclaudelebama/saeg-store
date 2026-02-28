import { NextRequest, NextResponse } from 'next/server';
import { getProductsServerResult } from '@/lib/server/products';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? undefined;
  const category = searchParams.get('category') ?? undefined;
  const dailyToken = (searchParams.get('dailyOnly') ?? searchParams.get('daily') ?? '').toLowerCase();
  const dailyOnly = ['1', 'true', 'yes'].includes(dailyToken);
  const pageParam = Number(searchParams.get('page') ?? '1');
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const limitParam = searchParams.get('limit') ?? searchParams.get('perPage') ?? '24';
  const perPageRaw = Number(limitParam);
  const perPage = Number.isFinite(perPageRaw) && perPageRaw > 0 ? Math.min(500, Math.floor(perPageRaw)) : 24;

  const result = await getProductsServerResult({
    search,
    category,
    dailyOnly,
    page,
    perPage,
    noCache: true,
  });

  return NextResponse.json({
    items: result.items,
    count: result.total,
    page: result.page,
    perPage: result.perPage,
    limit: result.perPage,
  });
}
