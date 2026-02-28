import { NextRequest, NextResponse } from 'next/server';
import { getCategoriesServer } from '@/lib/server/products';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageRaw = Number(searchParams.get('page') ?? '1');
  const limitRaw = Number(searchParams.get('limit') ?? searchParams.get('perPage') ?? '50');
  const search = (searchParams.get('search') ?? '').trim().toLowerCase();
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(100, Math.floor(limitRaw)) : 50;

  const all = await getCategoriesServer({ noCache: true });
  const filtered = search
    ? all.filter((item) => item.name.toLowerCase().includes(search) || item.slug.toLowerCase().includes(search))
    : all;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return NextResponse.json({
    items,
    count: filtered.length,
    page,
    perPage: limit,
    limit,
  });
}
