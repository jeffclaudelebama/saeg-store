<?php
/**
 * Front Page template for AGROPAG La Boutique
 * 
 * @package AGROPAG_La_Boutique
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();
?>

<!-- wp:html -->
<!-- Hero Section -->
<section class="relative bg-slate-50 overflow-hidden">
  <div class="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-24 flex flex-col md:flex-row items-center gap-12">
    <div class="flex-1 space-y-6 z-10">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
        <span class="material-symbols-outlined text-sm">energy_savings_leaf</span>
        Marché Éphémère Ouvert
      </div>
      <div class="inline-flex items-center gap-2 badge-terroir text-xs font-bold uppercase tracking-widest">
        <span class="material-symbols-outlined text-xs">terrain</span>
        AGROPAG • Société agropastorale du Gabon
      </div>
      <h1 class="text-slate-900 text-4xl md:text-6xl font-black leading-[1.1] tracking-tight">
        AGROPAG, le <span class="text-primary">marché éphémère</span> des invendus
      </h1>
      <p class="text-slate-600 text-lg md:text-xl max-w-xl leading-relaxed">
        Vente au kilo – Livraison rapide ou retrait en point relais. La Société agropastorale du Gabon protège les invendus saisonniers jusqu’à épuisement.
      </p>
      <div class="flex flex-wrap gap-4">
        <a class="px-8 py-4 bg-primary text-white font-bold rounded hover:bg-primary/90 transition-all flex items-center gap-2" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">
          Voir la boutique <span class="material-symbols-outlined">arrow_forward</span>
        </a>
        <a 
          class="btn-earth px-8 py-4 flex items-center gap-2 font-semibold uppercase tracking-wide shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900" 
          href="https://wa.me/24162560462?text=Bonjour%20AGROPAG,%20je%20souhaite%20commander" 
          target="_blank" 
          rel="noreferrer"
        >
          <span class="material-symbols-outlined text-lg">chat</span>
          Commander sur WhatsApp
        </a>
      </div>
    </div>
    <div class="flex-1 relative w-full h-[400px] md:h-[500px]">
      <div class="absolute inset-0 bg-primary/5 rounded-xl rotate-3 scale-105"></div>
      <div class="absolute inset-0 bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-100">
        <img 
          class="w-full h-full object-cover" 
          src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/hero-produits.jpg"
          alt="Fresh assorted vegetables and fruits in a wooden crate"
        />
      </div>
    </div>
  </div>
</section>
<!-- /wp:html -->

<!-- Urgency Banner -->
<!-- wp:html -->
<div class="bg-primary text-white py-3 overflow-hidden whitespace-nowrap">
  <div class="flex animate-pulse items-center justify-center gap-8 uppercase text-xs font-black tracking-widest">
    <span>🔥 Produits du marché éphémère — stocks limités</span>
    <span class="hidden md:inline">•</span>
    <span class="hidden md:inline">🔥 Arrivage du jour — Commandez avant midi</span>
    <span class="hidden md:inline">•</span>
    <span class="hidden md:inline">🔥 Livraison garantie en 24h</span>
  </div>
</div>
<!-- /wp:html -->

<!-- Reassurance Section -->
<!-- wp:html -->
<section class="max-w-7xl mx-auto px-4 md:px-10 py-16">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div class="flex items-start gap-4 p-6 bg-white border border-slate-100 rounded-lg hover:shadow-lg transition-shadow">
      <div class="p-3 bg-primary/10 rounded">
        <span class="material-symbols-outlined text-primary text-3xl">eco</span>
      </div>
      <div>
        <h3 class="text-slate-900 font-bold text-lg">Produits frais</h3>
        <p class="text-slate-500 text-sm mt-1">Récoltés avec soin pour une fraîcheur garantie directement de nos champs.</p>
      </div>
    </div>
    <div class="flex items-start gap-4 p-6 bg-white border border-slate-100 rounded-lg hover:shadow-lg transition-shadow">
      <div class="p-3 bg-primary/10 rounded">
        <span class="material-symbols-outlined text-primary text-3xl">balance</span>
      </div>
      <div>
        <h3 class="text-slate-900 font-bold text-lg">Vente au kilo</h3>
        <p class="text-slate-500 text-sm mt-1">Payez le juste prix selon le poids exact. Équité et transparence totale.</p>
      </div>
    </div>
    <div class="flex items-start gap-4 p-6 bg-white border border-slate-100 rounded-lg hover:shadow-lg transition-shadow">
      <div class="p-3 bg-primary/10 rounded">
        <span class="material-symbols-outlined text-primary text-3xl">local_shipping</span>
      </div>
      <div>
        <h3 class="text-slate-900 font-bold text-lg">Livraison locale</h3>
        <p class="text-slate-500 text-sm mt-1">Service rapide à Libreville, Akanda et Owendo. Livraison à domicile.</p>
      </div>
    </div>
  </div>
</section>
<!-- /wp:html -->

<!-- Categories Grid -->
<!-- wp:html -->
<section class="bg-slate-50 py-16" id="categories">
  <div class="max-w-7xl mx-auto px-4 md:px-10">
    <div class="flex items-end justify-between mb-10">
      <div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Nos Catégories</h2>
        <p class="text-slate-500 mt-2">Explorez la richesse de nos terroirs</p>
      </div>
      <a class="text-primary font-bold flex items-center gap-1 hover:underline" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">
        Tout voir <span class="material-symbols-outlined">chevron_right</span>
      </a>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <a class="group relative aspect-square overflow-hidden rounded-lg bg-slate-200" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>?cat=fruits">
        <img 
          class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/category-fruits.jpg"
          alt="Selection of tropical fruits like mangoes and pineapples"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div class="absolute bottom-4 left-4">
          <h3 class="text-white font-bold text-xl">Fruits</h3>
        </div>
      </a>
      <a class="group relative aspect-square overflow-hidden rounded-lg bg-slate-200" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>?cat=legumes">
        <img 
          class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/category-legumes.jpg"
          alt="Various green leafy vegetables and tubers"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div class="absolute bottom-4 left-4">
          <h3 class="text-white font-bold text-xl">Légumes</h3>
        </div>
      </a>
      <a class="group relative aspect-square overflow-hidden rounded-lg bg-slate-200" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>?cat=viandes">
        <img 
          class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/category-viandes.jpg"
          alt="Fresh meat cuts and poultry"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div class="absolute bottom-4 left-4">
          <h3 class="text-white font-bold text-xl">Viandes</h3>
        </div>
      </a>
      <a class="group relative aspect-square overflow-hidden rounded-lg bg-slate-200" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>?cat=poissons">
        <img 
          class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/category-poissons.jpg"
          alt="Fresh fish and seafood selection"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div class="absolute bottom-4 left-4">
          <h3 class="text-white font-bold text-xl">Poissons</h3>
        </div>
      </a>
    </div>
  </div>
</section>
<!-- /wp:html -->

<!-- Featured Products -->
<!-- wp:html -->
<section class="py-16">
  <div class="max-w-7xl mx-auto px-4 md:px-10">
    <div class="text-center mb-10">
      <h2 class="text-3xl font-black text-slate-900 tracking-tight">Produits Vedettes</h2>
      <p class="text-slate-500 mt-2">Sélectionnés par nos experts pour vous</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <div class="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
        <div class="relative">
          <img 
            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
            src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/product-banane.jpg"
            alt="Fresh bananas from Gabon"
          />
          <div class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Nouveau</div>
        </div>
        <div class="p-4">
          <h3 class="font-bold text-lg mb-2">Bananes du Gabon</h3>
          <p class="text-slate-600 text-sm mb-3">Bananes douces et juteuses, cultivées localement.</p>
          <div class="flex items-center justify-between">
            <span class="text-2xl font-black text-primary">2 500 FCFA/kg</span>
            <button class="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
              <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
        <div class="relative">
          <img 
            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
            src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/product-tomate.jpg"
            alt="Fresh organic tomatoes"
          />
        </div>
        <div class="p-4">
          <h3 class="font-bold text-lg mb-2">Tomates Bio</h3>
          <p class="text-slate-600 text-sm mb-3">Tomates fermes et juteuses, parfaites pour vos salades.</p>
          <div class="flex items-center justify-between">
            <span class="text-2xl font-black text-primary">1 800 FCFA/kg</span>
            <button class="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
              <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
        <div class="relative">
          <img 
            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
            src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/product-viande.jpg"
            alt="Fresh beef cuts"
          />
          <div class="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">Populaire</div>
        </div>
        <div class="p-4">
          <h3 class="font-bold text-lg mb-2">Viande de Bœuf</h3>
          <p class="text-slate-600 text-sm mb-3">Viande de qualité supérieure, élevée localement.</p>
          <div class="flex items-center justify-between">
            <span class="text-2xl font-black text-primary">8 500 FCFA/kg</span>
            <button class="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
              <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
        <div class="relative">
          <img 
            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
            src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/category-poissons.jpg"
            alt="Fresh fish selection"
          />
        </div>
        <div class="p-4">
          <h3 class="font-bold text-lg mb-2">Poisson Frais</h3>
          <p class="text-slate-600 text-sm mb-3">Poisson pêché quotidiennement, livré frais.</p>
          <div class="flex items-center justify-between">
            <span class="text-2xl font-black text-primary">6 200 FCFA/kg</span>
            <button class="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
              <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<!-- /wp:html -->

<!-- Testimonials -->
<!-- wp:html -->
<section class="bg-slate-50 py-16">
  <div class="max-w-7xl mx-auto px-4 md:px-10">
    <div class="text-center mb-10">
      <h2 class="text-3xl font-black text-slate-900 tracking-tight">Ce Que Disent Nos Clients</h2>
      <p class="text-slate-500 mt-2">Des milliers de clients satisfaits au Gabon</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg border border-slate-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
            <img 
              class="w-full h-full object-cover" 
              src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/user-avatar.jpg"
              alt="Customer testimonial"
            />
          </div>
          <div>
            <h4 class="font-bold">Marie Ndong</h4>
            <p class="text-slate-500 text-sm">Cliente régulière</p>
          </div>
        </div>
        <p class="text-slate-600 italic">"Les produits sont toujours frais et la livraison est ponctuelle. Je recommande vivement AGROPAG !"</p>
        <div class="flex gap-1 mt-3">
          <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
          <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
          <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
          <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
          <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg border border-slate-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
            <img 
              class="w-full h-full object-cover" 
              src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/user-avatar.jpg"
              alt="Customer testimonial"
            />
          </div>
          <div>
            <h4 class="font-bold">Jean Mba</h4>
            <p class="text-slate-500 text-sm">Restaurant owner</p>
          </div>
        </div>
        <p class="text-slate-600 italic">"La qualité des viandes est exceptionnelle. Mes clients sont ravis et je fais des économies."</p>
        <div class="flex gap-1 mt-3">
          <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
          <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
          <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
          <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
          <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg border border-slate-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
            <img 
              class="w-full h-full object-cover" 
              src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/user-avatar.jpg"
              alt="Customer testimonial"
            />
          </div>
          <div>
            <h4 class="font-bold">Fatima Ondo</h4>
            <p class="text-slate-500 text-sm">Mère de famille</p>
          </div>
        </div>
        <p class="text-slate-600 italic">"Les fruits et légumes sont toujours frais. Le service client est excellent et très réactif."</p>
        <div class="flex gap-1 mt-3">
          <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
          <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
          <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
          <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
          <span class="material-symbols-outlined text-yellow-500 text-sm">star</span>
        </div>
      </div>
    </div>
  </div>
</section>
<!-- /wp:html -->

<!-- CTA Section -->
<!-- wp:html -->
<section class="bg-primary text-white py-16">
  <div class="max-w-7xl mx-auto px-4 md:px-10 text-center">
    <h2 class="text-3xl font-black mb-4">Prêt à Commander?</h2>
    <p class="text-xl mb-8 opacity-90">Rejoignez des milliers de clients satisfaits et profitez des meilleurs produits du Gabon</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a class="px-8 py-4 bg-white text-primary font-bold rounded hover:bg-slate-50 transition-all flex items-center justify-center gap-2" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">
        <span class="material-symbols-outlined">shopping_basket</span>
        Commander Maintenant
      </a>
      <a class="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded hover:bg-white hover:text-primary transition-all flex items-center justify-center gap-2" href="https://wa.me/241123456789">
        <span class="material-symbols-outlined">phone</span>
        WhatsApp
      </a>
    </div>
  </div>
</section>
<!-- /wp:html -->

<?php get_footer(); ?>
