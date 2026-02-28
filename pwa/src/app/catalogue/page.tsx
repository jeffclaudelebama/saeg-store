import Link from 'next/link';
import { MarketingScaffold } from '@/components/MarketingScaffold';
import { ProductsSearchGrid } from '@/components/ProductsSearchGrid';
import { getCategoriesServer, getProductsServer } from '@/lib/server/products';

export default async function CataloguePage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const category = typeof searchParams?.category === 'string' ? searchParams.category : undefined;
  const search = typeof searchParams?.search === 'string' ? searchParams.search : undefined;

  const [products, categories] = await Promise.all([
    getProductsServer({ category, search, perPage: 100 }),
    getCategoriesServer(),
  ]);

  return (
    <MarketingScaffold whatsappMessage="Bonjour SAEG, je consulte la boutique et j’ai besoin d’aide pour choisir mes produits.">
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
          initialSearch={search}
          category={category}
          showDefaultGrid
          placeholder="Rechercher un produit..."
          defaultEmptyTitle="Aucun produit trouvé"
          defaultEmptyDescription="Essayez un autre filtre ou revenez aux offres du jour."
        />
      </main>
    </MarketingScaffold>
  );
}
