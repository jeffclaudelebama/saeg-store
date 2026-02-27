import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MarketingScaffold } from '@/components/MarketingScaffold';
import { ProductDetailClient } from '@/components/ProductDetailClient';
import { ViewItemTracker } from '@/components/EventTrackers';
import { getProductServer } from '@/lib/server/products';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductServer(Number(params.id));
  if (!product) notFound();
  const gallery = (product.images.length ? product.images : ['/og-default.png']).slice(0, 4);

  return (
    <MarketingScaffold whatsappMessage={`Bonjour SAEG, je veux commander ${product.name}.`}>
      <ViewItemTracker product={product} />
      <main className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-6">
        <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-6">
          <a className="hover:text-primary" href="/">Accueil</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <a className="hover:text-primary" href="/catalogue">Boutique</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-primary font-bold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <Image
                src={gallery[0] || '/og-default.png'}
                alt={product.name}
                width={1200}
                height={1200}
                className="w-full h-full object-cover"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {gallery.map((src, i) => (
                <div key={`${src}-${i}`} className={`aspect-square rounded-lg overflow-hidden cursor-pointer ${i === 0 ? 'border-2 border-primary' : 'border border-slate-200 opacity-80'}`}>
                  <Image
                    src={src}
                    alt={`${product.name} ${i + 1}`}
                    width={320}
                    height={320}
                    className="w-full h-full object-cover"
                    sizes="(max-width: 1024px) 25vw, 14vw"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Origine locale</span>
                {product.low_stock ? <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Stock faible</span> : null}
                {product.is_daily_surplus ? <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Invendu du jour</span> : null}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-2">{product.name}</h1>
              <p className="text-slate-500 text-base leading-relaxed">{product.short_description || product.description.replace(/<[^>]+>/g, '')}</p>
            </div>

            <div className="py-4 border-y border-slate-200">
              <p className="text-primary text-3xl font-bold">
                {Math.round(product.sale_price || product.price || product.regular_price)} FCFA{' '}
                <span className="text-lg font-medium text-slate-400">/{product.unit_type === 'kg' ? ' kg' : ' unité'}</span>
              </p>
            </div>

            <ProductDetailClient product={product} />

            <div className="grid grid-cols-1 gap-4 mt-20 lg:mt-6">
              <div className="p-4 bg-primary/5 rounded-lg flex items-start gap-4 border border-primary/10">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                <div>
                  <p className="text-sm font-bold text-primary mb-1">Livraison locale</p>
                  <p className="text-xs text-slate-600">Libreville, Akanda, Owendo • créneaux matin / après-midi</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg flex items-start gap-4 border border-blue-100">
                <span className="material-symbols-outlined text-blue-600">balance</span>
                <div>
                  <p className="text-sm font-bold text-blue-900 mb-1">Vente au poids</p>
                  <p className="text-xs text-blue-800/80">Pas: {product.step_kg || 0.25} kg • Minimum: {product.min_kg || 0.25} kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </MarketingScaffold>
  );
}
