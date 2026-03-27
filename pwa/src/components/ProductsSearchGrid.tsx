'use client';

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/UiStates';
import { matchProductSearch } from '@/lib/search';
import type { SaegProduct } from '@/types/saeg';

type ProductsSearchGridProps = {
  id?: string;
  initialItems: SaegProduct[];
  initialSearch?: string;
  category?: string;
  dailyOnly?: boolean;
  placeholder?: string;
  showSearchInput?: boolean;
  showDefaultGrid?: boolean;
  defaultEmptyTitle?: string;
  defaultEmptyDescription?: string;
};

export function ProductsSearchGrid({
  id,
  initialItems,
  initialSearch = '',
  category,
  dailyOnly = false,
  placeholder = 'Rechercher un produit...',
  showSearchInput = true,
  showDefaultGrid = true,
  defaultEmptyTitle = 'Aucun produit trouvé',
  defaultEmptyDescription = 'Essayez un autre terme de recherche ou modifiez les filtres.',
}: ProductsSearchGridProps) {
  const [query, setQuery] = useState(initialSearch);
  const deferredQuery = useDeferredValue(query);
  const [serverItems, setServerItems] = useState<SaegProduct[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasQuery = query.trim().length > 0;
  const localItems = useMemo(() => {
    if (!hasQuery) {
      return initialItems;
    }
    return initialItems.filter((item) => matchProductSearch(item, query));
  }, [hasQuery, initialItems, query]);

  useEffect(() => {
    const search = deferredQuery.trim();
    if (!search) {
      startTransition(() => {
        setServerItems(null);
        setError(null);
        setLoading(false);
      });
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          search,
          page: '1',
          perPage: '100',
        });
        if (category) {
          params.set('category', category);
        }
        if (dailyOnly) {
          params.set('daily', '1');
        }
        const response = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = (await response.json()) as { items?: SaegProduct[] };
        if (controller.signal.aborted) {
          return;
        }
        startTransition(() => {
          setServerItems(Array.isArray(payload.items) ? payload.items : []);
        });
      } catch (cause) {
        if (controller.signal.aborted) {
          return;
        }
        console.error('[AGROPAG] search fetch failed', cause);
        setError('Recherche indisponible momentanément.');
        setServerItems(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [deferredQuery, category, dailyOnly]);

  const items = hasQuery ? (serverItems ?? localItems) : initialItems;
  const showGrid = showDefaultGrid || hasQuery;

  return (
    <section id={id} className="space-y-4">
      {showSearchInput ? (
        <div className="relative w-full max-w-xl">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-12 text-sm font-medium text-slate-900 focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            aria-label="Rechercher des produits"
          />
          {hasQuery ? (
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
      ) : null}

      {showSearchInput && hasQuery ? (
        <p className="text-sm text-slate-500">
          {items.length} résultat{items.length > 1 ? 's' : ''} pour <span className="font-semibold text-slate-700">“{query.trim()}”</span>
        </p>
      ) : null}

      {showGrid ? (
        <>
          {loading && hasQuery && !serverItems ? <LoadingState label="Recherche en cours..." /> : null}
          {error && hasQuery ? <ErrorState title="Recherche indisponible" description={error} /> : null}
          {!loading && !error ? (
            items.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState title={defaultEmptyTitle} description={defaultEmptyDescription} />
            )
          ) : null}
        </>
      ) : null}
    </section>
  );
}
