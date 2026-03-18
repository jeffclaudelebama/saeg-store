<?php
/**
 * Footer template for AGROPAG La Boutique
 * 
 * @package AGROPAG_La_Boutique
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>

<!-- wp:html -->
<footer class="bg-slate-900 text-white">
  <!-- Main Footer Content -->
  <div class="max-w-7xl mx-auto px-4 md:px-10 py-12">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      
      <!-- Company Info -->
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <img 
            class="h-10 w-auto" 
            src="https://admin.store.saeggabon.ga/wp-content/uploads/2026/03/499871381_122101467926886115_2230277052560218685_n-removebg-preview.png"
            alt="Logo AGROPAG"
            loading="lazy"
          />
        </div>
        <p class="text-slate-400 text-sm leading-relaxed">
          AGROPAG, la Société agropastorale du Gabon, mobilise les invendus pour nourrir Libreville, Akanda et Owendo.
        </p>
        <div class="flex gap-3">
          <a href="#" class="text-slate-400 hover:text-white transition-colors">
            <span class="material-symbols-outlined">facebook</span>
          </a>
          <a href="#" class="text-slate-400 hover:text-white transition-colors">
            <span class="material-symbols-outlined">alternate_email</span>
          </a>
          <a href="#" class="text-slate-400 hover:text-white transition-colors">
            <span class="material-symbols-outlined">phone</span>
          </a>
        </div>
      </div>

      <!-- Quick Links -->
      <div>
        <h3 class="font-bold text-lg mb-4">Liens Rapides</h3>
        <ul class="space-y-2">
          <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="text-slate-400 hover:text-white transition-colors text-sm">Accueil</a></li>
          <li><a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="text-slate-400 hover:text-white transition-colors text-sm">Boutique</a></li>
          <li><a href="<?php echo esc_url( get_permalink( get_page_by_path( 'a-propos' ) ) ); ?>" class="text-slate-400 hover:text-white transition-colors text-sm">À Propos</a></li>
          <li><a href="<?php echo esc_url( get_permalink( get_page_by_path( 'contact' ) ) ); ?>" class="text-slate-400 hover:text-white transition-colors text-sm">Contact</a></li>
        </ul>
      </div>

      <!-- Categories -->
      <div>
        <h3 class="font-bold text-lg mb-4">Catégories</h3>
        <ul class="space-y-2">
          <li><a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>?cat=fruits" class="text-slate-400 hover:text-white transition-colors text-sm">Fruits Tropicaux</a></li>
          <li><a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>?cat=legumes" class="text-slate-400 hover:text-white transition-colors text-sm">Légumes Frais</a></li>
          <li><a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>?cat=viandes" class="text-slate-400 hover:text-white transition-colors text-sm">Viandes</a></li>
          <li><a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>?cat=poissons" class="text-slate-400 hover:text-white transition-colors text-sm">Poissons</a></li>
        </ul>
      </div>

      <!-- Contact Info -->
      <div>
        <h3 class="font-bold text-lg mb-4">Contact</h3>
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">location_on</span>
            <span class="text-slate-400 text-sm">Libreville, Gabon</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">phone</span>
            <a href="tel:+24162560462" class="text-slate-400 hover:text-white transition-colors text-sm">+241 625 604 62</a>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">alternate_email</span>
            <a href="mailto:contact@agropag.ga" class="text-slate-400 hover:text-white transition-colors text-sm">contact@agropag.ga</a>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">schedule</span>
            <span class="text-slate-400 text-sm">Lun-Ven: 8h-18h</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Footer -->
  <div class="border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 md:px-10 py-6">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-slate-400 text-sm">
          © <?php echo date( 'Y' ); ?> AGROPAG. Tous droits réservés.
        </p>
        <div class="flex gap-6">
          <a href="<?php echo esc_url( get_permalink( get_page_by_path( 'mentions-legales' ) ) ); ?>" class="text-slate-400 hover:text-white transition-colors text-sm">Mentions Légales</a>
          <a href="<?php echo esc_url( get_permalink( get_page_by_path( 'confidentialite' ) ) ); ?>" class="text-slate-400 hover:text-white transition-colors text-sm">Confidentialité</a>
          <a href="<?php echo esc_url( get_permalink( get_page_by_path( 'cgv' ) ) ); ?>" class="text-slate-400 hover:text-white transition-colors text-sm">CGV</a>
        </div>
      </div>
    </div>
  </div>
</footer>
<!-- /wp:html -->

<?php wp_footer(); ?>
</body>
</html>
