import Link from 'next/link';
import Image from 'next/image';
import { MarketingScaffold } from '@/components/MarketingScaffold';
import { ProductCard } from '@/components/ProductCard';
import { getCategoriesServer, getProductsServer } from '@/lib/server/products';

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProductsServer({ perPage: 100 }),
    getCategoriesServer(),
  ]);

  const offers = products.filter((p) => p.is_daily_surplus).slice(0, 3);
  const featured = (offers.length ? offers : products).slice(0, 6);

  return (
    <MarketingScaffold whatsappMessage="Bonjour AGROPAG, je souhaite commander via WhatsApp.">
      <main>
        <section className="relative bg-slate-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-10 md:py-24 flex flex-col md:flex-row items-center gap-12 py-8">
            <div className="flex-1 space-y-6 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">energy_savings_leaf</span> Marché Éphémère Ouvert
              </div>
              <h1 className="text-slate-900 md:text-6xl font-black leading-[1.1] tracking-tight text-3xl">
                Produits frais du <span className="text-primary">marché éphémère</span>
              </h1>
              <p className="text-slate-600 md:text-xl max-w-xl leading-relaxed text-base">
                Vente au kilo, livraison locale Libreville / Akanda / Owendo / Ntoum et Click & Collect. Stocks limités AGROPAG valorisés chaque jour.
              </p>
              <div className="flex flex-wrap gap-4 sm:flex-nowrap">
                <Link className="w-full sm:w-auto px-6 py-4 bg-primary text-white font-bold rounded hover:bg-primary/90 transition-all flex items-center justify-center gap-2" href="/catalogue">
                  Voir la boutique <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <Link className="w-full sm:w-auto px-6 py-4 bg-white border border-slate-200 text-slate-900 font-bold rounded hover:bg-slate-50 transition-all text-center" href="/livraison">
                  Livraison & Retrait
                </Link>
              </div>
            </div>
            <div className="flex-1 relative w-full h-[400px] md:h-[500px]">
              <div className="absolute inset-0 bg-primary/5 rounded-xl rotate-3 scale-105"></div>
              <div className="absolute inset-0 bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-100 flex items-center justify-center">
                <div className="p-10 text-center">
                  <span className="material-symbols-outlined text-[96px] text-primary/30">grocery</span>
                  <p className="text-sm font-semibold text-slate-500">les stocks disponibles • AGROPAG</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-primary text-white py-3 overflow-hidden whitespace-nowrap">
          <div className="flex animate-pulse items-center justify-center gap-8 uppercase text-xs font-black tracking-widest">
            <span>🔥 Stocks limités • Vente au kilo</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">🔥 Commandez avant midi pour accélérer la préparation</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">🔥 Livraison Libreville / Akanda / Owendo</span>
          </div>
        </div>

        <section className="max-w-7xl mx-auto px-4 md:px-10 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              ['eco', 'Produits frais', 'Invendus du marché éphémère revalorisés rapidement pour préserver la fraîcheur.'],
              ['balance', 'Vente au kilo', 'Sélectionnez un poids décimal (pas 0,25 kg) et payez le juste prix.'],
              ['local_shipping', 'Livraison locale', 'Service rapide sur Libreville, Akanda et Owendo + option retrait.'],
            ].map(([icon, title, text]) => (
              <div key={title} className="flex items-start gap-4 p-6 bg-white border border-slate-100 rounded-lg hover:shadow-lg transition-shadow">
                <div className="p-3 bg-primary/10 rounded"><span className="material-symbols-outlined text-primary text-3xl">{icon}</span></div>
                <div>
                  <h3 className="text-slate-900 font-bold text-lg">{title}</h3>
                  <p className="text-slate-500 text-sm mt-1">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-10">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nos Catégories</h2>
                <p className="text-slate-500 mt-2">Explorez la richesse de nos terroirs</p>
              </div>
              <Link className="text-primary font-bold flex items-center gap-1 hover:underline" href="/catalogue">Tout voir <span className="material-symbols-outlined">chevron_right</span></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.slice(0, 4).map((category) => (
                <Link key={category.id} className="group relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/10" href={`/catalogue?category=${encodeURIComponent(category.slug)}`}>
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white/30 text-[72px]">nutrition</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-xl leading-tight">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-10 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Offres du jour / Produits vedettes</h2>
              <p className="text-slate-500 mt-2">Stocks limités et packs anti-gaspillage</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>

        <section className="bg-primary py-16 px-4 md:px-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-white text-3xl md:text-4xl font-black tracking-tight">Ne manquez pas les prochains arrivages</h2>
            <p className="text-white/80 text-lg">Recevez les offres du jour et packs anti-gaspillage sur WhatsApp.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input className="flex-1 bg-white border-none rounded py-3 px-4 focus:ring-2 focus:ring-white/20" placeholder="Votre numéro WhatsApp" type="text" />
              <button className="bg-slate-900 text-white font-bold py-3 px-8 rounded hover:bg-slate-800 transition-colors uppercase tracking-widest text-xs">S&apos;abonner</button>
            </div>
          </div>
        </section>
      </main>
    </MarketingScaffold>
  );
}
