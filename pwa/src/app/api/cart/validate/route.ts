import { NextResponse } from 'next/server';
import { validateCartAgainstProducts } from '@/lib/cart-validation';
import { getProductServer } from '@/lib/server/products';
import type { SaegCartItem, SaegCommune, SaegDeliveryMode, SaegProduct } from '@/types/saeg';

interface CartValidatePayload {
  items: SaegCartItem[];
  commune: SaegCommune;
  modeLivraison: SaegDeliveryMode;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CartValidatePayload | null;
  if (!body || !Array.isArray(body.items)) {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  }

  const ids = Array.from(new Set(body.items.map((i) => i.productId))).filter((id) => Number.isFinite(id));
  const productResults = await Promise.all(ids.map((id) => getProductServer(id)));
  const products = productResults.filter((product): product is SaegProduct => product !== null);

  const result = validateCartAgainstProducts({
    items: body.items,
    products,
    commune: body.commune,
    modeLivraison: body.modeLivraison,
  });

  return NextResponse.json(result, { status: result.valid ? 200 : 422 });
}
