import { NextRequest, NextResponse } from 'next/server';
import { hasWooEnv } from '@/lib/env';
import { getAccountSession } from '@/lib/server/account-session';
import { getOrderMetaSummary, getOrderStatusView } from '@/lib/order-status';
import { normalizeGabonPhone } from '@/lib/phone';
import { wooFetch } from '@/lib/server/woo';
import type { SaegOrderListItem, SaegOrdersResponse } from '@/types/saeg';

type WooOrder = {
  id: number;
  number?: string;
  date_created?: string;
  status?: string;
  total?: string | number;
  currency?: string;
  billing?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  line_items?: Array<{
    product_id?: number;
    name?: string;
    quantity?: number;
    total?: string;
  }>;
  meta_data?: Array<{
    key?: string;
    value?: unknown;
  }>;
};

const WOO_PER_PAGE = 100;
const MAX_PAGES = 5;

function isInvalidWooPageError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('rest_post_invalid_page_number') || message.includes('Invalid page number');
}

function mapOrder(order: WooOrder): SaegOrderListItem {
  const meta = getOrderMetaSummary(order.meta_data);
  const statusView = getOrderStatusView({
    status: order.status,
    paymentMethod: meta.paymentMethod,
    mobileMoneyStatus: meta.mobileMoneyStatus,
  });

  return {
    id: Number(order.id),
    number: String(order.number || order.id),
    date_created: order.date_created,
    status: String(order.status || 'pending'),
    status_label: statusView.label,
    tracking_status: statusView.code,
    total: Number(order.total || 0),
    currency: String(order.currency || 'XAF'),
    billing_name: [order.billing?.first_name, order.billing?.last_name].filter(Boolean).join(' ').trim() || 'Client AGROPAG',
    billing_phone: String(order.billing?.phone || ''),
    payment_method: meta.paymentMethod,
    payment_reference: meta.paymentReference,
    mobile_money_status: meta.mobileMoneyStatus,
    payment_proof_uploaded: meta.paymentProofUploaded,
    line_items: (order.line_items || []).map((item) => ({
      product_id: Number(item.product_id || 0),
      name: String(item.name || 'Produit'),
      quantity: Number(item.quantity || 0),
      total: String(item.total || '0'),
    })),
  };
}

export async function GET(request: NextRequest) {
  const session = await getAccountSession();
  const rawPhone = String(request.nextUrl.searchParams.get('phone') || session?.phone || '').trim();
  const normalizedPhone = normalizeGabonPhone(rawPhone);
  const idParam = request.nextUrl.searchParams.get('id');
  const orderId = idParam ? Number(idParam) : null;

  if (!normalizedPhone) {
    return NextResponse.json({ error: 'Téléphone invalide. Format attendu: 241XXXXXXXX.' }, { status: 422 });
  }

  if (orderId !== null && (!Number.isFinite(orderId) || orderId <= 0)) {
    return NextResponse.json({ error: 'ID commande invalide.' }, { status: 422 });
  }

  if (!hasWooEnv()) {
    return NextResponse.json({ error: 'WooCommerce indisponible.' }, { status: 503 });
  }

  try {
    const found: WooOrder[] = [];

    for (let page = 1; page <= MAX_PAGES; page += 1) {
      let batch: WooOrder[];
      try {
        batch = await wooFetch<WooOrder[]>(
          `/wp-json/wc/v3/orders?per_page=${WOO_PER_PAGE}&page=${page}&orderby=date&order=desc`,
          { cache: 'no-store' },
        );
      } catch (error) {
        if (isInvalidWooPageError(error)) {
          break;
        }
        throw error;
      }

      if (!Array.isArray(batch) || batch.length === 0) {
        break;
      }

      const filtered = batch.filter((order) => normalizeGabonPhone(String(order.billing?.phone || '')) === normalizedPhone);
      if (orderId !== null) {
        const exact = filtered.find((order) => Number(order.id) === orderId);
        if (exact) {
          found.push(exact);
          break;
        }
      } else {
        found.push(...filtered);
      }

      if (batch.length < WOO_PER_PAGE) {
        break;
      }
    }

    const items = found
      .sort((a, b) => {
        const aDate = new Date(a.date_created || 0).getTime();
        const bDate = new Date(b.date_created || 0).getTime();
        return bDate - aDate;
      })
      .map(mapOrder);

    const payload: SaegOrdersResponse = {
      items,
      count: items.length,
      phone: normalizedPhone,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error('[AGROPAG] /api/orders failed', error);
    return NextResponse.json({ error: 'Impossible de récupérer les commandes.', details: String(error) }, { status: 502 });
  }
}
