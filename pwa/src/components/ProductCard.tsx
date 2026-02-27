'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency, formatKg, stripHtml } from '@/lib/format';
import { useCart } from '@/providers/CartProvider';
import type { SaegProduct } from '@/types/saeg';

export function ProductCard({ product }: { product: SaegProduct }) {
  const { addItem } = useCart();
  const price = product.sale_price || product.price || product.regular_price;

  return (
    <article className="product-card">
      <Link href={`/produit/${product.id}`} className="product-card__image-wrap">
        <Image
          src={product.images[0] ?? '/og-default.png'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="product-card__image"
        />
        {product.is_daily_surplus ? <span className="tag tag--yellow">Offre du jour</span> : null}
        {product.low_stock ? <span className="tag tag--red">Stock faible</span> : null}
      </Link>
      <div className="product-card__body">
        <p className="product-card__category">{product.categories[0]?.name ?? 'Catalogue'}</p>
        <h3 className="product-card__title">
          <Link href={`/produit/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-card__desc">{stripHtml(product.short_description || product.description)}</p>
        <div className="product-card__meta">
          <div>
            <strong>{formatCurrency(price, product.currency)}</strong>
            <span>{product.unit_type === 'kg' ? ' / kg' : ' / unité'}</span>
            {product.unit_type === 'kg' && typeof product.stock_kg === 'number' ? (
              <small> · Reste ~{formatKg(product.stock_kg)}</small>
            ) : null}
          </div>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => addItem(product, product.unit_type === 'kg' ? product.min_kg || 0.25 : 1)}
          >
            Ajouter
          </button>
        </div>
      </div>
    </article>
  );
}
