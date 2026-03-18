'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  description: string;
  images: Array<{
    id: number;
    src: string;
    alt: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  attributes?: Array<{
    id: number;
    name: string;
    options: string[];
  }>;
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${slug}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setProduct(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const addToCart = async () => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product?.id,
          quantity: quantity,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Show success message or update cart UI
        alert('Produit ajouté au panier!');
      } else {
        alert('Erreur: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Erreur lors de l\'ajout au panier');
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
          <Link href="/boutique" className="text-green-700 hover:text-green-800 underline">
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Tailwind Config */}
      <script id="tailwind-config" dangerouslySetInnerHTML={{
        __html: `
          tailwind.config = {
            darkMode: "class",
            theme: {
              extend: {
                colors: {
                  "primary": "#00571a",
                  "background-light": "#f5f8f6",
                  "background-dark": "#0f2315",
                },
                fontFamily: {
                  "display": ["Inter", "sans-serif"]
                },
                borderRadius: {
                  "DEFAULT": "0.125rem",
                  "lg": "0.25rem",
                  "xl": "0.5rem",
                  "full": "0.75rem"
                },
              },
            },
          }
        `
      }} />
      
      <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-primary/10 px-4 md:px-10 lg:px-20 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
            <div className="flex items-center gap-6 md:gap-12">
                <div className="flex items-center gap-3">
                <div className="text-primary">
                  <span className="material-symbols-outlined text-3xl">eco</span>
                </div>
                <div className="space-y-1">
                  <h1 className="text-primary text-xl font-black leading-tight tracking-tight hidden sm:block">AGROPAG | La Boutique</h1>
                  <span className="badge-terroir text-[10px] tracking-[0.4em] uppercase">Société agropastorale du Gabon</span>
                </div>
              </div>
              <nav className="hidden lg:flex items-center gap-6">
                <Link className="text-slate-700 dark:text-slate-300 text-sm font-semibold hover:text-primary transition-colors" href="/boutique">Boucherie</Link>
                <Link className="text-slate-700 dark:text-slate-300 text-sm font-semibold hover:text-primary transition-colors" href="#">Épicerie</Link>
                <Link className="text-slate-700 dark:text-slate-300 text-sm font-semibold hover:text-primary transition-colors" href="#">Fruits & Légumes</Link>
                <Link className="text-primary text-sm font-bold hover:underline transition-colors" href="#">Promotions</Link>
              </nav>
            </div>
            <div className="flex flex-1 justify-end items-center gap-3 md:gap-6">
              <div className="hidden md:flex flex-1 max-w-xs relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 text-xl">search</span>
                <input className="w-full pl-10 pr-4 py-2 bg-primary/5 border-none rounded focus:ring-2 focus:ring-primary/20 text-sm outline-none" placeholder="Rechercher un produit..." type="text"/>
              </div>
              <div className="flex items-center gap-2">
                <Link className="p-2 hover:bg-primary/10 rounded-lg relative transition-colors" href="/panier">
                  <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">shopping_cart</span>
                  <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>
                </Link>
                <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">person</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 mb-8 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Link className="hover:text-primary" href="/">Accueil</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <Link className="hover:text-primary" href="/boutique">Boucherie</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary font-bold">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Product Image Section */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <img 
                  alt={product.images[selectedImage]?.alt || product.name} 
                  className="w-full h-full object-cover" 
                  src={product.images[selectedImage]?.src || '/images/placeholder.jpg'}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(0, 4).map((image, index) => (
                  <div 
                    key={image.id}
                    className={`aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                      index === selectedImage ? 'border-primary' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img className="w-full h-full object-cover" src={image.src} alt={image.alt} />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Origine Locale</span>
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Première Qualité</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-50 leading-tight mb-2">{product.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="py-4 border-y border-slate-200 dark:border-slate-800">
                <p className="text-primary text-3xl font-bold">{formatPrice(product.price)} <span className="text-lg font-medium text-slate-400">/ kg</span></p>
              </div>

              {/* Quantity & Total */}
              <div className="flex flex-col gap-4">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Quantité (kg)</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded overflow-hidden h-12">
                    <button 
                      className="px-4 h-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setQuantity(Math.max(0.25, quantity - 0.25))}
                    >
                      <span className="material-symbols-outlined text-lg">remove</span>
                    </button>
                    <input 
                      className="w-20 text-center border-none focus:ring-0 bg-transparent font-bold" 
                      min="0.25" 
                      step="0.25" 
                      type="number" 
                      value={quantity.toFixed(2)}
                      onChange={(e) => setQuantity(Math.max(0.25, parseFloat(e.target.value) || 0.25))}
                    />
                    <button 
                      className="px-4 h-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setQuantity(quantity + 0.25)}
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                  </div>
                  <div className="flex-1 bg-primary/5 border border-primary/20 rounded h-12 px-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">Total estimé :</span>
                    <span className="text-lg font-black text-primary">{formatPrice((parseFloat(product.price) * quantity).toString())}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <button 
                  onClick={addToCart}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined">shopping_basket</span>
                  Ajouter au panier
                </button>
                <a 
                  href="https://wa.me/2250700000000" 
                  target="_blank"
                  className="w-full border-2 border-primary/40 hover:border-primary/60 text-primary font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .01 5.437 0 12.045c0 2.112.552 4.173 1.6 6.005L0 24l6.104-1.602a11.83 11.83 0 005.94 1.594h.005c6.605 0 12.04-5.437 12.045-12.045a11.814 11.814 0 00-3.541-8.528"/>
                  </svg>
                  Commander sur WhatsApp
                </a>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 gap-4 mt-6">
                <div className="p-4 bg-blue-50 dark:bg-slate-800/50 rounded-lg flex items-start gap-4 border border-blue-100 dark:border-slate-700">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">ac_unit</span>
                  <div>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">Conseils de conservation</p>
                    <p className="text-xs text-blue-800/80 dark:text-slate-400">Conserver au frais entre 0°C et 4°C. Consommer dans les 48h après achat ou congeler immédiatement.</p>
                  </div>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg flex items-start gap-4 border border-primary/10">
                  <span className="material-symbols-outlined text-primary">local_shipping</span>
                  <div>
                    <p className="text-sm font-bold text-primary mb-1">Livraison Express</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Livré chez vous en moins de 2h à Abidjan et environs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Extra Details Tabs */}
          <div className="mt-20 border-t border-slate-200 dark:border-slate-800 pt-10">
            <div className="flex gap-8 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto pb-px">
              <button 
                className={`pb-4 border-b-2 font-bold whitespace-nowrap transition-colors ${
                  activeTab === 'description' 
                    ? 'border-primary text-primary' 
                    : 'text-slate-500 hover:text-primary'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description détaillée
              </button>
              <button 
                className={`pb-4 font-bold whitespace-nowrap transition-colors ${
                  activeTab === 'nutrition' 
                    ? 'border-primary text-primary' 
                    : 'text-slate-500 hover:text-primary'
                }`}
                onClick={() => setActiveTab('nutrition')}
              >
                Valeurs nutritionnelles
              </button>
              <button 
                className={`pb-4 font-bold whitespace-nowrap transition-colors ${
                  activeTab === 'reviews' 
                    ? 'border-primary text-primary' 
                    : 'text-slate-500 hover:text-primary'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Avis clients (24)
              </button>
            </div>

            <div className="max-w-3xl">
              {activeTab === 'description' && (
                <>
                  <h3 className="text-xl font-bold mb-4">La qualité AGROPAG</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    Notre {product.name.toLowerCase()} provient exclusivement de fermes partenaires sélectionnées pour le respect du bien-être animal et une alimentation 100% naturelle. Chaque pièce est préparée par nos bouchers experts dans nos ateliers certifiés, garantissant une hygiène irréprochable et une fraîcheur optimale de la ferme à votre assiette.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                      <span>Découpe traditionnelle maitrisée</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                      <span>Emballage sous vide sur demande</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                      <span>Traçabilité complète du produit</span>
                    </li>
                  </ul>
                </>
              )}

              {activeTab === 'nutrition' && (
                <div className="text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400">Informations nutritionnelles bientôt disponibles...</p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400">Avis clients bientôt disponibles...</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-white mt-20 py-12 px-4 md:px-10 lg:px-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">eco</span>
                <h2 className="text-xl font-black">AGROPAG</h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                AGROPAG, Société agropastorale du Gabon, valorise les invendus du marché éphémère pour nourrir les villes de Libreville, Akanda et Owendo.
                <span className="badge-terroir ml-2 hidden md:inline-flex">Invendus du jour</span>
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Boutique</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><Link className="hover:text-primary transition-colors" href="/boutique">Boucherie</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Fruits & Légumes</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Crèmerie</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Épicerie Fine</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Aide & Support</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><Link className="hover:text-primary transition-colors" href="#">Suivi de commande</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Modes de livraison</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Politique de retour</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Contact</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">call</span>
                  +241 625 604 62
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">mail</span>
                  contact@agropag.ga
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                  Libreville, Gabon
                </li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-8 flex flex-col md:row justify-between items-center gap-4 text-slate-500 text-xs">
            <p>© 2024 AGROPAG. Tous droits réservés.</p>
            <div className="flex gap-6">
              <Link className="hover:text-white transition-colors" href="#">Mentions Légales</Link>
              <Link className="hover:text-white transition-colors" href="#">Confidentialité</Link>
              <Link className="hover:text-white transition-colors" href="#">CGV</Link>
            </div>
          </div>
        </footer>

        {/* Floating WhatsApp Button */}
        <a
          className="fixed bottom-6 right-6 z-[60] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
          href="https://wa.me/24162560462?text=Bonjour%20AGROPAG,%20je%20souhaite%20commander"
          target="_blank"
          rel="noreferrer"
          title="Commander sur WhatsApp"
        >
          <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .01 5.437 0 12.045c0 2.112.552 4.173 1.6 6.005L0 24l6.104-1.602a11.83 11.83 0 005.94 1.594h.005c6.605 0 12.04-5.437 12.045-12.045a11.814 11.814 0 00-3.541-8.528"/>
          </svg>
        </a>
      </div>
    </>
  );
}
