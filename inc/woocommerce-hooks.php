<?php
/**
 * WooCommerce theme hooks and customizations
 * 
 * @package SAEG_La_Boutique
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! function_exists( 'woocommerce_template_loop_product_title' ) ) {
    return;
}

/**
 * Customize product display structure
 * 
 * @since 1.0.0
 */

// Remove default product image hook
remove_action( 'woocommerce_before_shop_loop_item_title', 'woocommerce_template_loop_product_thumbnail', 10 );

// Remove default product title
remove_action( 'woocommerce_shop_loop_item_title', 'woocommerce_template_loop_product_title', 10 );

// Remove default product rating
remove_action( 'woocommerce_after_shop_loop_item_title', 'woocommerce_template_loop_rating', 5 );

// Remove default price and add-to-cart
remove_action( 'woocommerce_after_shop_loop_item_title', 'woocommerce_template_loop_price', 10 );
remove_action( 'woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart', 10 );

/**
 * Hook: woocommerce_before_shop_loop_item
 * 
 * @hooked woocommerce_template_loop_product_link_open - 10
 */
add_action( 'woocommerce_before_shop_loop_item', 'saeg_before_product_item' );
function saeg_before_product_item() {
    echo '<article class="product-item">';
}

/**
 * Add product image with custom styling
 * 
 * @since 1.0.0
 */
add_action( 'woocommerce_before_shop_loop_item_title', 'saeg_product_image', 10 );
function saeg_product_image() {
    echo '<div class="product-image">';
    if ( has_post_thumbnail() ) {
        the_post_thumbnail( 'saeg-product', array(
            'class' => 'product-thumbnail',
        ) );
    } else {
        echo '<img src="' . esc_url( wc_placeholder_img_src() ) . '" alt="' . esc_attr( get_the_title() ) . '" class="product-thumbnail" />';
    }
    echo '</div>';
}

/**
 * Add product title with custom styling
 * 
 * @since 1.0.0
 */
add_action( 'woocommerce_shop_loop_item_title', 'saeg_product_title', 10 );
function saeg_product_title() {
    echo '<h3 class="product-title"><a href="' . esc_url( get_the_permalink() ) . '">' . esc_html( get_the_title() ) . '</a></h3>';
}

/**
 * Add product rating
 * 
 * @since 1.0.0
 */
add_action( 'woocommerce_after_shop_loop_item_title', 'saeg_product_rating', 5 );
function saeg_product_rating() {
    if ( has_filter( 'woocommerce_rating_html' ) ) {
        echo '<div class="product-rating">';
        woocommerce_template_loop_rating();
        echo '</div>';
    }
}

/**
 * Add product price with custom styling
 * 
 * @since 1.0.0
 */
add_action( 'woocommerce_after_shop_loop_item_title', 'saeg_product_price', 10 );
function saeg_product_price() {
    echo '<div class="product-price">' . wp_kses_post( $GLOBALS['product']->get_price_html() ) . '</div>';
}

/**
 * Add product add-to-cart button
 * 
 * @since 1.0.0
 */
add_action( 'woocommerce_after_shop_loop_item', 'saeg_product_add_to_cart', 10 );
function saeg_product_add_to_cart() {
    global $product;
    
    echo '<div class="product-add-to-cart">';
    
    if ( $product->is_purchasable() && $product->is_in_stock() ) {
        echo apply_filters( 'woocommerce_loop_add_to_cart_link', sprintf(
            '<a href="%s" data-quantity="%s" class="%s" %s>%s</a>',
            esc_url( $product->add_to_cart_url() ),
            esc_attr( isset( $quantity ) ? $quantity : 1 ),
            esc_attr( implode( ' ', array_filter( array(
                'button',
                'product_type_' . $product->get_type(),
                $product->is_purchasable() && $product->is_in_stock() ? 'add_to_cart_button' : '',
            ) ) ) ),
            isset( $args ) ? wc_implode_html_attributes( $args ) : '',
            esc_html( $product->add_to_cart_text() ),
        ), $product );
    }
    
    echo '</div>';
}

/**
 * Hook: woocommerce_after_shop_loop_item
 * 
 * @hooked woocommerce_template_loop_product_link_close - 10
 */
add_action( 'woocommerce_after_shop_loop_item', 'saeg_after_product_item' );
function saeg_after_product_item() {
    echo '</article>';
}

/**
 * Customize single product page structure
 * 
 * @since 1.0.0
 */

// Remove default single product image gallery
remove_action( 'woocommerce_before_single_product_summary', 'woocommerce_show_product_images', 20 );

// Add custom product image gallery
add_action( 'woocommerce_before_single_product_summary', 'saeg_single_product_images', 20 );
function saeg_single_product_images() {
    global $product;
    
    echo '<div class="product-gallery">';
    
    if ( has_post_thumbnail() ) {
        echo '<div class="product-main-image">';
        the_post_thumbnail( 'saeg-product', array(
            'class' => 'main-image',
            'alt'   => esc_attr( $product->get_name() ),
        ) );
        echo '</div>';
        
        // Thumbnails
        $attachment_ids = $product->get_gallery_image_ids();
        if ( ! empty( $attachment_ids ) ) {
            echo '<div class="product-thumbnails">';
            
            // Add main image thumbnail
            echo '<div class="thumbnail-item active">';
            the_post_thumbnail( 'saeg-product-thumb', array(
                'class' => 'thumbnail',
            ) );
            echo '</div>';
            
            // Add gallery image thumbnails
            foreach ( $attachment_ids as $attachment_id ) {
                echo '<div class="thumbnail-item">';
                echo wp_get_attachment_image( $attachment_id, 'saeg-product-thumb', false, array(
                    'class' => 'thumbnail',
                ) );
                echo '</div>';
            }
            
            echo '</div>';
        }
    } else {
        echo '<img src="' . esc_url( wc_placeholder_img_src() ) . '" alt="' . esc_attr( $product->get_name() ) . '" />';
    }
    
    echo '</div>';
}

/**
 * Customize product meta
 * 
 * @since 1.0.0
 */
add_filter( 'woocommerce_product_meta_start', 'saeg_product_meta_start' );
function saeg_product_meta_start() {
    return '';
}

/**
 * Customize related products
 * 
 * @since 1.0.0
 */
add_filter( 'woocommerce_output_related_products_args', 'saeg_related_products_args' );
function saeg_related_products_args( $args ) {
    $args['posts_per_page'] = 4;
    $args['columns'] = 4;
    return $args;
}

/**
 * Add product category archive custom styling
 * 
 * @since 1.0.0
 */
add_action( 'woocommerce_archive_description', 'saeg_archive_description', 5 );
function saeg_archive_description() {
    if ( is_product_category() || is_product_tag() ) {
        echo '<div class="archive-header">';
        if ( is_product_category() ) {
            the_archive_title( '<h1 class="archive-title">', '</h1>' );
        }
        the_archive_description( '<div class="archive-description">', '</div>' );
        echo '</div>';
    }
}

/**
 * Customize cart page layout
 * 
 * @since 1.0.0
 */
add_action( 'woocommerce_cart_coupon', 'saeg_cart_coupon' );
function saeg_cart_coupon() {
    // Custom coupon area styling can be added here
}

/**
 * Customize checkout page
 * 
 * @since 1.0.0
 */
add_filter( 'woocommerce_checkout_fields', 'saeg_checkout_fields' );
function saeg_checkout_fields( $fields ) {
    // Add custom CSS classes to checkout fields
    foreach ( $fields as $section => $section_fields ) {
        foreach ( $section_fields as $key => $field ) {
            $fields[ $section ][ $key ]['input_class'][] = 'checkout-field';
        }
    }
    return $fields;
}

/**
 * Add structured data for products
 * 
 * @since 1.0.0
 */
add_action( 'woocommerce_single_product_summary', 'saeg_product_structured_data', 100 );
function saeg_product_structured_data() {
    global $product;
    
    if ( ! is_product() || ! $product ) {
        return;
    }
    
    $schema = array(
        '@context'     => 'https://schema.org',
        '@type'        => 'Product',
        'name'         => $product->get_name(),
        'description'  => $product->get_description(),
        'image'        => wp_get_attachment_url( $product->get_image_id() ),
        'price'        => $product->get_price(),
        'priceCurrency' => get_woocommerce_currency(),
    );
    
    if ( $product->get_rating_count() > 0 ) {
        $schema['aggregateRating'] = array(
            '@type'       => 'AggregateRating',
            'ratingValue' => $product->get_average_rating(),
            'reviewCount' => $product->get_review_count(),
        );
    }
    
    echo '<script type="application/ld+json">' . wp_json_encode( $schema ) . '</script>';
}

?>
