import { NextResponse } from 'next/server';
import { getProductServer } from '@/lib/server/products';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const token = (params.id ?? '').trim();
  if (!token) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  }

  const product = await getProductServer(token, { noCache: true });
  if (!product) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  return NextResponse.json(product);
}
