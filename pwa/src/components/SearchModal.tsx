'use client';

import { startTransition, useDeferredValue, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SafeImage } from '@/components/SafeImage';
import { formatCurrency, stripHtml } from '@/lib/format';
import { matchProductSearch } from '@/lib/search';
import type { SaegProduct } from '@/types/saeg';

type SearchModalProps = {
  open: boolean;
  onClose: () => void;
};

type ProductsApiResponse = {
  items?: SaegProduct[];
};

let PRODUCTS_CACHE: SaegProduct[] | null = null;

export function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [products, setProducts] = useState<SaegProduct[]>(PRODUCTS_CACHE ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverResults, setServerResults] = useState<SaegProduct[] | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 20);

    if (PRODUCTS_CACHE && PRODUCTS_CACHE.length > 0) {
      startTransition(() => {
        setProducts(PRODUCTS_CACHE ?? []);
      });
    } else {
      setLoading(true);
      fetch('/api/products?perPage=500&page=1', { cache: 'no-store' })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const payload = (await response.json()) as ProductsApiResponse;
          const items = Array.isArray(payload.items) ? payload.items : [];
          PRODUCTS_CACHE = items;
          startTransition(() => {
            setProducts(items);
            setError(null);
          });
        })
        .catch((cause) => {
          console.error('[AGROPAG] search modal products fetch failed', cause);
          setError('Impossible de charger les produits.');
        })
        .finally(() => {
          setLoading(false);
        });
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const term = deferredQuery.trim();
    if (!term) {
      startTransition(() => {
        setServerResults(null);
      });
      return;
    }
    if (products.length <= 200) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search: term,
          perPage: '500',
          page: '1',
        });
        const response = await fetch(`/api/products?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = (await response.json()) as ProductsApiResponse;
        if (controller.signal.aborted) {
          return;
        }
        startTransition(() => {
          setServerResults(Array.isArray(payload.items) ? payload.items : []);
          setError(null);
        });
      } catch (cause) {
        if (controller.signal.aborted) {
          return;
        }
        console.error('[AGROPAG] search modal server search failed', cause);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [deferredQuery, open, products.length]);

  if (!open) {
    return null;
  }

  const localResults = query.trim() ? products.filter((product) => matchProductSearch(product, query)) : products;
  const items = query.trim() && serverResults ? serverResults : localResults;
  const showEmpty = !loading && query.trim().length > 0 && items.length === 0;

  const openProduct = (product: SaegProduct) => {
    const token = product.slug?.trim() || String(product.id);
    onClose();
    router.push(`/produit/${encodeURIComponent(token)}`);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/40" role="dialog" aria-modal="true">
      <div className="h-full w-full md:flex md:items-center md:justify-center md:p-6">
        <div className="h-full w-full bg-white md:h-[85vh] md:max-h-[760px] md:w-[min(980px,92vw)] md:rounded-2xl md:shadow-2xl md:overflow-hidden">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 px-4 py-3 md:px-6">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Rechercher un produit..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-900 focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                    aria-label="Rechercher des produits"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Effacer la recherche"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                  aria-label="Fermer la recherche"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="mt-2 text-sm text-slate-500">
                {query.trim() ? (
                  <span>{items.length} résultat{items.length > 1 ? 's' : ''}</span>
                ) : (
                  <span>{products.length} produits disponibles</span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
              {loading && products.length === 0 ? (
                <div className="state-card state-card--loading">Chargement...</div>
              ) : null}
              {error ? (
                <div className="state-card state-card--error">
                  <h3>Recherche indisponible</h3>
                  <p>{error}</p>
                </div>
              ) : null}
              {showEmpty ? (
                <div className="state-card">
                  <h3>Aucun produit trouvé</h3>
                  <p>Essayez un autre mot-clé.</p>
                </div>
              ) : null}
              {!showEmpty && !error ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => openProduct(product)}
                      className="product-card text-left"
                    >
                      <div className="product-card__image-wrap">
                        <SafeImage
                          src={product.images[0] ?? null}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="product-card__image"
                          fallbackSrc="/img/placeholder-produit.png"
                        />
                      </div>
                      <div className="product-card__body">
                        <p className="product-card__category">{product.categories[0]?.name ?? 'Catalogue'}</p>
                        <h3 className="product-card__title">{product.name}</h3>
                        <p className="product-card__desc">{stripHtml(product.short_description || product.description)}</p>
                        <div className="product-card__meta">
                          <div>
                            <strong>{formatCurrency(product.sale_price || product.price || product.regular_price, product.currency)}</strong>
                            <span>{product.unit_type === 'kg' ? ' / kg' : ' / unité'}</span>
                          </div>
                          <span className="material-symbols-outlined text-primary">arrow_forward</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
