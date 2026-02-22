<?php
/**
 * Custom theme functions
 * 
 * @package SAEG_La_Boutique
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Get the theme mod with a default value
 * 
 * @param string $setting_id Setting ID
 * @param mixed $default Default value
 * @return mixed
 */
function saeg_get_theme_option( $setting_id, $default = '' ) {
    return get_theme_mod( $setting_id, $default );
}

/**
 * Output the custom logo
 * 
 * @since 1.0.0
 */
function saeg_output_logo() {
    if ( function_exists( 'the_custom_logo' ) && has_custom_logo() ) {
        the_custom_logo();
    } else {
        echo '<h1 class="site-title"><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html( get_bloginfo( 'name' ) ) . '</a></h1>';
    }
}

/**
 * Get featured image with fallback
 * 
 * @param int $post_id Post ID
 * @param string $size Image size
 * @return string HTML for the image
 */
function saeg_get_featured_image( $post_id = 0, $size = 'saeg-featured' ) {
    if ( ! $post_id ) {
        $post_id = get_the_ID();
    }
    
    if ( has_post_thumbnail( $post_id ) ) {
        return get_the_post_thumbnail( $post_id, $size );
    }
    
    return '<img src="' . esc_url( SAEG_THEME_URI . '/assets/images/placeholder.svg' ) . '" alt="' . esc_attr( get_the_title( $post_id ) ) . '" width="600" height="400" />';
}

/**
 * Get breadcrumbs HTML
 * 
 * @since 1.0.0
 */
function saeg_get_breadcrumbs() {
    $breadcrumbs = array();
    
    // Home
    $breadcrumbs[] = '<a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'saeg-la-boutique' ) . '</a>';
    
    // WooCommerce product archive
    if ( is_post_type_archive( 'product' ) ) {
        $breadcrumbs[] = esc_html( post_type_object( 'product' )->labels->name );
    }
    // WooCommerce product category
    elseif ( is_product_category() ) {
        $breadcrumbs[] = '<a href="' . esc_url( get_post_type_archive_link( 'product' ) ) . '">' . esc_html( post_type_object( 'product' )->labels->name ) . '</a>';
        $breadcrumbs[] = esc_html( single_cat_title( '', false ) );
    }
    // WooCommerce single product
    elseif ( is_product() ) {
        $breadcrumbs[] = '<a href="' . esc_url( get_post_type_archive_link( 'product' ) ) . '">' . esc_html( post_type_object( 'product' )->labels->name ) . '</a>';
        $breadcrumbs[] = esc_html( get_the_title() );
    }
    // Single post or page
    elseif ( is_singular() ) {
        $breadcrumbs[] = esc_html( get_the_title() );
    }
    // Search
    elseif ( is_search() ) {
        $breadcrumbs[] = esc_html__( 'Search Results', 'saeg-la-boutique' );
    }
    
    return '<nav class="breadcrumbs" itemscope itemtype="https://schema.org/BreadcrumbList">' .
           implode( ' <span class="divider">/</span> ', $breadcrumbs ) .
           '</nav>';
}

/**
 * Format price for display
 * 
 * @param float $price Price value
 * @return string Formatted price
 */
function saeg_format_price( $price ) {
    if ( function_exists( 'wc_price' ) ) {
        return wc_price( $price );
    }
    
    return '<span class="price">' . number_format( $price, 2, ',', ' ' ) . ' ' . get_woocommerce_currency_symbol() . '</span>';
}

/**
 * Get related posts
 * 
 * @param int $post_id Post ID
 * @param int $limit Number of posts to return
 * @return WP_Query
 */
function saeg_get_related_posts( $post_id = 0, $limit = 3 ) {
    if ( ! $post_id ) {
        $post_id = get_the_ID();
    }
    
    $post = get_post( $post_id );
    
    $args = array(
        'post_type'  => $post->post_type,
        'exclude'    => array( $post_id ),
        'numberposts' => $limit,
        'orderby'    => 'rand',
    );
    
    return new WP_Query( $args );
}

/**
 * Check if a block pattern exists
 * 
 * @param string $pattern_name Pattern name/slug
 * @return bool
 */
function saeg_has_block_pattern( $pattern_name ) {
    $pattern_file = SAEG_THEME_DIR . '/patterns/' . $pattern_name . '.php';
    return file_exists( $pattern_file );
}

/**
 * Display footer credit text
 * 
 * @since 1.0.0
 */
function saeg_footer_credit() {
    $text = sprintf(
        /* translators: 1: Link to WordPress, 2: Link to theme author */
        __( 'Powered by %1$s | Theme by %2$s', 'saeg-la-boutique' ),
        '<a href="https://wordpress.org/" target="_blank">WordPress</a>',
        '<a href="https://example.com" target="_blank">Your Company</a>'
    );
    
    echo apply_filters( 'saeg_footer_credit', $text );
}

/**
 * Sanitize HTML class
 * 
 * @param string $class Class name(s)
 * @return string Sanitized class
 */
function saeg_sanitize_class( $class ) {
    return implode( ' ', array_map( 'sanitize_html_class', explode( ' ', $class ) ) );
}

/**
 * Get image attachment URL
 * 
 * @param int $attachment_id Attachment ID
 * @param string $size Image size
 * @return string Image URL
 */
function saeg_get_image_url( $attachment_id, $size = 'full' ) {
    $image = wp_get_attachment_image_src( $attachment_id, $size );
    
    if ( $image ) {
        return $image[0];
    }
    
    return '';
}

?>
