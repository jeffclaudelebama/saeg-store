<?php
/**
 * Header template for AGROPAG La Boutique
 * 
 * @package AGROPAG_La_Boutique
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
    
<header class="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 md:px-10 py-3">
  <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
    <!-- Logo and Navigation -->
    <div class="flex items-center gap-8">
      <!-- Logo -->
      <a class="flex items-center gap-3" href="<?php echo esc_url( home_url( '/' ) ); ?>">
        <img 
          alt="Logo AGROPAG" 
          class="h-10 w-auto" 
          src="https://admin.store.saeggabon.ga/wp-content/uploads/2026/03/499871381_122101467926886115_2230277052560218685_n-removebg-preview.png"
          loading="lazy"
        />
        <span class="text-lg font-black text-[#0B2B16] hidden sm:inline">AGROPAG</span>
      </a>

      <!-- Navigation Menu -->
      <nav class="hidden md:flex items-center gap-8">
        <?php
        if ( has_nav_menu( 'primary' ) ) {
            wp_nav_menu( array(
                'theme_location' => 'primary',
                'menu_class'     => 'flex items-center gap-8',
                'container'      => false,
                'fallback_cb'    => false,
                'walker'         => new SAEG_Walker_Nav_Menu(),
            ) );
        } else {
        ?>
        <a class="text-slate-900 text-sm font-semibold hover:text-primary transition-colors" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">
          Boutique
        </a>
        <a class="text-slate-900 text-sm font-semibold hover:text-primary transition-colors" href="#categories">
          Catégories
        </a>
        <a class="text-slate-900 text-sm font-semibold hover:text-primary transition-colors" href="<?php echo esc_url( get_permalink( get_page_by_path( 'contact' ) ) ); ?>">
          Contact
        </a>
        <?php
        }
        ?>
      </nav>
    </div>

    <!-- Right Side: Search, Cart, Profile -->
    <div class="flex flex-1 justify-end items-center gap-4">
      <!-- Search Bar (Desktop) -->
      <div class="hidden lg:flex relative w-full max-w-xs">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <form role="search" method="get" class="search-form" action="<?php echo esc_url( home_url( '/' ) ); ?>">
          <input 
            class="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded text-sm focus:ring-1 focus:ring-primary" 
            placeholder="Rechercher un produit..." 
            type="search"
            name="s"
            id="header-search"
          />
        </form>
      </div>

      <!-- Cart Button -->
      <a class="relative p-2 text-slate-700 hover:bg-slate-50 rounded" href="<?php echo esc_url( wc_get_cart_url() ); ?>">
        <span class="material-symbols-outlined">shopping_cart</span>
        <span class="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full" id="cart-count"><?php echo WC()->cart->get_cart_contents_count(); ?></span>
      </a>

      <!-- Profile Avatar -->
      <div class="h-8 w-8 rounded-full bg-slate-200 overflow-hidden">
        <?php if ( is_user_logged_in() ) : ?>
          <a href="<?php echo esc_url( get_edit_profile_url() ); ?>">
            <img 
              class="w-full h-full object-cover" 
              src="<?php echo esc_url( get_avatar_url( get_current_user_id(), array( 'size' => 32 ) ) ); ?>"
              alt="<?php echo esc_attr( wp_get_current_user()->display_name ); ?>"
            />
          </a>
        <?php else : ?>
          <a href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>">
            <img 
              class="w-full h-full object-cover" 
              src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/user-avatar.jpg"
              alt="User profile"
            />
          </a>
        <?php endif; ?>
      </div>
    </div>
  </div>
</header>
