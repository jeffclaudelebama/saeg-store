import Link from 'next/link';
import { MarketingScaffold } from '@/components/MarketingScaffold';
import { ProductsSearchGrid } from '@/components/ProductsSearchGrid';
import { getCategoriesServer, getProductsServerResult } from '@/lib/server/products';

export default async function CataloguePage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const category = typeof searchParams?.category === 'string' ? searchParams.category : undefined;
  const page = Math.max(1, Number(typeof searchParams?.page === 'string' ? searchParams.page : '1') || 1);
  const limit = 24;

  const [productsResult, categories] = await Promise.all([
    getProductsServerResult({ category, page, perPage: limit }),
    getCategoriesServer(),
  ]);
  const products = productsResult.items;
  const totalPages = Math.max(1, Math.ceil(productsResult.total / limit));

  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (nextPage > 1) params.set('page', String(nextPage));
    return params.toString() ? `/catalogue?${params.toString()}` : '/catalogue';
  };

  return (
    <MarketingScaffold whatsappMessage="Bonjour AGROPAG, je consulte la boutique et j’ai besoin d’aide pour choisir mes produits.">
      <main className="max-w-7xl mx-auto px-4 lg:px-20 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">Notre Boutique</h1>
            <p className="text-slate-500 max-w-lg">Produits frais, invendus valorisés, vente au kilo et packs anti-gaspillage avec stock limité.</p>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <Link href="/catalogue" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${!category ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-slate-200 hover:border-primary/50'}`}>
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Tous les produits
            </Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/catalogue?category=${encodeURIComponent(c.slug)}`} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap border ${category === c.slug ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 hover:border-primary/50'}`}>
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        <ProductsSearchGrid
          id="catalogue-search"
          initialItems={products}
          category={category}
          showSearchInput={false}
          showDefaultGrid
          defaultEmptyTitle="Aucun produit trouvé"
          defaultEmptyDescription="Essayez un autre filtre ou revenez aux offres du jour."
        />
        {totalPages > 1 ? (
          <div className="mt-10 flex justify-center gap-2">
            {Array.from({ length: totalPages }).slice(0, 12).map((_, idx) => {
              const current = idx + 1;
              const active = current === page;
              return (
                <a
                  key={current}
                  href={buildPageHref(current)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold transition-colors ${
                    active
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-primary/40'
                  }`}
                >
                  {current}
                </a>
              );
            })}
          </div>
        ) : null}
      </main>
    </MarketingScaffold>
  );
}
