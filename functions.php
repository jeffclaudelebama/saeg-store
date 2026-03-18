<?php
/**
 * AGROPAG La Boutique Theme Functions
 * 
 * @package AGROPAG_La_Boutique
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Define theme constants
 */
if ( ! defined( 'SAEG_THEME_VERSION' ) ) {
    define( 'SAEG_THEME_VERSION', '1.0.0' );
}

if ( ! defined( 'SAEG_THEME_DIR' ) ) {
    define( 'SAEG_THEME_DIR', get_template_directory() );
}

if ( ! defined( 'SAEG_THEME_URI' ) ) {
    define( 'SAEG_THEME_URI', get_template_directory_uri() );
}

/**
 * Set up theme defaults and register support for various WordPress features
 * 
 * @since 1.0.0
 */
function saeg_theme_setup() {
    // Add title tag support
    add_theme_support( 'title-tag' );
    
    // Add custom logo support
    add_theme_support( 'custom-logo', array(
        'height'      => 120,
        'width'       => 180,
        'flex-height' => true,
        'flex-width'  => true,
    ) );
    
    // Add post thumbnail support
    add_theme_support( 'post-thumbnails' );
    add_image_size( 'saeg-featured', 1280, 720, true );
    add_image_size( 'saeg-product', 600, 600, true );
    add_image_size( 'saeg-product-thumb', 150, 150, true );
    
    // Add responsive embeds
    add_theme_support( 'responsive-embeds' );
    
    // Add HTML5 support for forms, gallery, etc
    add_theme_support( 'html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ) );
    
    // Add custom colors support
    add_theme_support( 'editor-color-palette', array(
        array(
            'name'  => __( 'Primary', 'saeg-la-boutique' ),
            'slug'  => 'primary',
            'color' => '#00571a',
        ),
        array(
            'name'  => __( 'Accent', 'saeg-la-boutique' ),
            'slug'  => 'accent',
            'color' => '#FED202',
        ),
        array(
            'name'  => __( 'Neutral 50', 'saeg-la-boutique' ),
            'slug'  => 'neutral-50',
            'color' => '#f9fafb',
        ),
        array(
            'name'  => __( 'Neutral 100', 'saeg-la-boutique' ),
            'slug'  => 'neutral-100',
            'color' => '#f3f4f6',
        ),
        array(
            'name'  => __( 'Neutral 200', 'saeg-la-boutique' ),
            'slug'  => 'neutral-200',
            'color' => '#e5e7eb',
        ),
        array(
            'name'  => __( 'Neutral 300', 'saeg-la-boutique' ),
            'slug'  => 'neutral-300',
            'color' => '#d1d5db',
        ),
    ) );
    
    // Add custom font sizes
    add_theme_support( 'editor-font-sizes', array(
        array(
            'name' => __( 'Small', 'saeg-la-boutique' ),
            'size' => 14,
            'slug' => 'small'
        ),
        array(
            'name' => __( 'Medium', 'saeg-la-boutique' ),
            'size' => 16,
            'slug' => 'medium'
        ),
        array(
            'name' => __( 'Large', 'saeg-la-boutique' ),
            'size' => 18,
            'slug' => 'large'
        ),
        array(
            'name' => __( 'Extra Large', 'saeg-la-boutique' ),
            'size' => 24,
            'slug' => 'extra-large'
        ),
    ) );
    
    // WooCommerce support
    add_theme_support( 'wc-product-gallery-zoom' );
    add_theme_support( 'wc-product-gallery-lightbox' );
    add_theme_support( 'wc-product-gallery-slider' );
    add_theme_support( 'woocommerce' );
    add_theme_support( 'woocommerce', array(
        'thumbnail_image_width' => 600,
        'gallery_thumbnail_image_width' => 150,
        'single_image_width' => 600,
    ) );
    
    // Language support
    load_theme_textdomain( 'saeg-la-boutique', SAEG_THEME_DIR . '/languages' );
}
add_action( 'after_setup_theme', 'saeg_theme_setup' );

/**
 * Enqueue frontend styles and scripts
 * 
 * @since 1.0.0
 */
function saeg_enqueue_frontend_assets() {
    // CRITICAL: Enqueue WP Neutralize CSS FIRST (highest priority)
    // This resets all WordPress/Gutenberg defaults before app CSS
    wp_enqueue_style(
        'saeg-wp-neutralize',
        SAEG_THEME_URI . '/assets/css/wp-neutralize.css',
        array(),
        SAEG_THEME_VERSION
    );
    
    // Enqueue main application stylesheet (from Stitch design)
    wp_enqueue_style(
        'saeg-app-style',
        SAEG_THEME_URI . '/assets/css/app.css',
        array( 'saeg-wp-neutralize' ), // Depends on wp-neutralize to be loaded first
        SAEG_THEME_VERSION
    );
    
    // Add custom AGROPAG utility styles (earth tone accents)
    wp_enqueue_style(
        'saeg-earth-style',
        SAEG_THEME_URI . '/assets/css/saeg.css',
        array( 'saeg-app-style' ),
        SAEG_THEME_VERSION
    );
    
    // Enqueue legacy style.css for WordPress compatibility
    wp_enqueue_style(
        'saeg-theme-style',
        SAEG_THEME_URI . '/style.css',
        array( 'saeg-app-style' ),
        SAEG_THEME_VERSION
    );
    
    // Enqueue Google Fonts (Inter)
    wp_enqueue_style(
        'saeg-inter-font',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
        array(),
        SAEG_THEME_VERSION
    );
    
    // Enqueue Material Symbols Icon Font
    wp_enqueue_style(
        'material-symbols',
        'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
        array(),
        SAEG_THEME_VERSION
    );
    
    // Enqueue main JavaScript
    wp_enqueue_script(
        'saeg-theme-main',
        SAEG_THEME_URI . '/assets/js/main.js',
        array(),
        SAEG_THEME_VERSION,
        true
    );
    
    // Load responsive utilities script
    wp_enqueue_script(
        'saeg-theme-utils',
        SAEG_THEME_URI . '/assets/js/utils.js',
        array(),
        SAEG_THEME_VERSION,
        true
    );
    
    // Localize script for AJAX operations
    wp_localize_script( 'saeg-theme-main', 'saegTheme', array(
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'nonce' => wp_create_nonce( 'saeg_nonce' ),
    ) );
}
add_action( 'wp_enqueue_scripts', 'saeg_enqueue_frontend_assets' );

/**
 * Enqueue editor styles
 * 
 * @since 1.0.0
 */
function saeg_enqueue_editor_assets() {
    // Enqueue editor stylesheet
    wp_enqueue_style(
        'saeg-editor-style',
        SAEG_THEME_URI . '/assets/css/editor-style.css',
        array( 'wp-edit-blocks' ),
        SAEG_THEME_VERSION
    );
    
    // Enqueue Google Fonts
    wp_enqueue_style(
        'saeg-inter-font',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
        array(),
        SAEG_THEME_VERSION
    );
}
add_action( 'enqueue_block_editor_assets', 'saeg_enqueue_editor_assets' );

/**
 * Register custom block patterns
 * 
 * @since 1.0.0
 */
function saeg_register_block_patterns() {
    $pattern_dir = SAEG_THEME_DIR . '/patterns';
    
    if ( ! is_dir( $pattern_dir ) ) {
        return;
    }
    
    $pattern_files = glob( $pattern_dir . '/*.php' );
    
    foreach ( $pattern_files as $file ) {
        register_block_pattern_category(
            'saeg',
            array( 'label' => __( 'AGROPAG Patterns', 'saeg-la-boutique' ) )
        );
    }
}
add_action( 'init', 'saeg_register_block_patterns' );

/**
 * Register custom sidebar/widget area
 * 
 * @since 1.0.0
 */
function saeg_register_sidebars() {
    register_sidebar( array(
        'name'          => __( 'Primary Sidebar', 'saeg-la-boutique' ),
        'id'            => 'primary-sidebar',
        'description'   => __( 'Main widget area', 'saeg-la-boutique' ),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ) );
    
    register_sidebar( array(
        'name'          => __( 'Footer Sidebar', 'saeg-la-boutique' ),
        'id'            => 'footer-sidebar',
        'description'   => __( 'Footer widget area', 'saeg-la-boutique' ),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h4 class="widget-title">',
        'after_title'   => '</h4>',
    ) );
}
add_action( 'widgets_init', 'saeg_register_sidebars' );

/**
 * Register custom post types and taxonomies
 * 
 * @since 1.0.0
 */
function saeg_register_custom_post_types() {
    // Register testimonial post type
    register_post_type( 'testimonial', array(
        'label'       => __( 'Testimonials', 'saeg-la-boutique' ),
        'public'      => true,
        'show_in_rest' => true,
        'supports'    => array( 'title', 'editor', 'thumbnail' ),
        'menu_icon'   => 'dashicons-format-quote',
        'rewrite'     => array( 'slug' => 'testimonials' ),
    ) );
}
add_action( 'init', 'saeg_register_custom_post_types' );

/**
 * WooCommerce support and customization
 * 
 * @since 1.0.0
 */

// Remove WooCommerce default styles if needed
function saeg_remove_woocommerce_styles() {
    // We'll use our custom styles instead
    wp_dequeue_style( 'woocommerce_frontend_styles' );
    wp_dequeue_style( 'woocommerce-general' );
    wp_dequeue_style( 'woocommerce-layout' );
    wp_dequeue_style( 'woocommerce-smallscreen' );
}
add_action( 'wp_enqueue_scripts', 'saeg_remove_woocommerce_styles', 99 );

/**
 * Filter WooCommerce product per page
 * 
 * @since 1.0.0
 */
function saeg_woocommerce_products_per_page() {
    return 12;
}
add_filter( 'loop_shop_per_page', 'saeg_woocommerce_products_per_page' );

/**
 * Add custom body classes
 * 
 * @since 1.0.0
 */
function saeg_body_classes( $classes ) {
    global $post;
    
    // Add page type class
    if ( is_singular( 'page' ) && $post ) {
        $classes[] = 'page-' . $post->post_name;
    }
    
    // Add WooCommerce class
    if ( class_exists( 'WooCommerce' ) ) {
        $classes[] = 'woocommerce-active';
    }
    
    // Add no-sidebar class if needed
    if ( is_active_sidebar( 'primary-sidebar' ) ) {
        $classes[] = 'has-sidebar';
    }
    
    return $classes;
}
add_filter( 'body_class', 'saeg_body_classes' );

/**
 * Custom excerpt length
 * 
 * @since 1.0.0
 */
function saeg_excerpt_length( $length ) {
    return 20;
}
add_filter( 'excerpt_length', 'saeg_excerpt_length' );

/**
 * Disable block-based widgets if needed
 * 
 * @since 1.0.0
 */
function saeg_disable_block_widgets() {
    // Uncomment to disable block widgets and use classic widgets
    // add_filter( 'gutenberg_use_widgets_block_editor', '__return_false' );
}
add_action( 'init', 'saeg_disable_block_widgets' );

/**
 * Add admin notice for theme setup
 * 
 * @since 1.0.0
 */
function saeg_admin_notice() {
    if ( is_admin() && get_option( '_saeg_theme_notice_displayed' ) === false ) {
        ?>
        <div class="notice notice-info is-dismissible">
            <p>
                <strong><?php _e( 'AGROPAG La Boutique Theme', 'saeg-la-boutique' ); ?></strong><br>
                <?php _e( 'Welcome! To get started, make sure WooCommerce is activated and complete the theme setup.', 'saeg-la-boutique' ); ?>
            </p>
        </div>
        <?php
        update_option( '_saeg_theme_notice_displayed', true );
    }
}
add_action( 'admin_notices', 'saeg_admin_notice' );

/**
 * Include additional theme files
 * 
 * @since 1.0.0
 */
require_once SAEG_THEME_DIR . '/inc/custom-functions.php';
require_once SAEG_THEME_DIR . '/inc/woocommerce-hooks.php';
require_once SAEG_THEME_DIR . '/inc/class-walker-nav-menu.php';

?>
