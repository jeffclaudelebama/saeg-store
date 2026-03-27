<?php
/**
 * Plugin Name: AGROPAG Invendus Dashboard
 * Description: Backoffice AGROPAG dédié au suivi des invendus, stock faible et actions promo rapides.
 * Version: 1.0.0
 * Author: AGROPAG
 * Requires at least: 6.4
 * Requires PHP: 8.1
 * Text Domain: saeg-invendus-dashboard
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('AGROPAG_Invendus_Dashboard')) {
    final class AGROPAG_Invendus_Dashboard {
        private const MENU_SLUG = 'saeg-invendus';
        private const ACTION_APPLY_DISCOUNT = 'saeg_invendus_apply_discount';
        private const ACTION_TOGGLE_DAILY = 'saeg_invendus_toggle_daily';
        private const NONCE_ACTION = 'saeg_invendus_nonce';
        private const META_UNIT = 'saeg_unit';
        private const META_PRICE_PER_KG = 'saeg_price_per_kg';
        private const META_STOCK_KG = 'saeg_stock_kg';
        private const META_LOW_THRESHOLD = 'saeg_low_stock_threshold';
        private const META_DAILY_SURPLUS = 'saeg_is_daily_surplus';

        public static function boot(): void {
            add_action('admin_menu', [__CLASS__, 'register_menu']);
            add_action('admin_post_' . self::ACTION_APPLY_DISCOUNT, [__CLASS__, 'handle_apply_discount']);
            add_action('admin_post_' . self::ACTION_TOGGLE_DAILY, [__CLASS__, 'handle_toggle_daily']);
        }

        public static function register_menu(): void {
            add_menu_page(
                __('AGROPAG', 'saeg-invendus-dashboard'),
                __('AGROPAG', 'saeg-invendus-dashboard'),
                'edit_products',
                self::MENU_SLUG,
                [__CLASS__, 'render_page'],
                'dashicons-store',
                56
            );

            add_submenu_page(
                self::MENU_SLUG,
                __('Invendus', 'saeg-invendus-dashboard'),
                __('Invendus', 'saeg-invendus-dashboard'),
                'edit_products',
                self::MENU_SLUG,
                [__CLASS__, 'render_page']
            );
        }

        public static function render_page(): void {
            if (!current_user_can('edit_products')) {
                wp_die(esc_html__('Accès refusé.', 'saeg-invendus-dashboard'));
            }

            $filter = isset($_GET['scope']) ? sanitize_key((string) wp_unslash($_GET['scope'])) : 'all';
            if (!in_array($filter, ['all', 'low', 'daily'], true)) {
                $filter = 'all';
            }

            $paged = isset($_GET['paged']) ? max(1, absint(wp_unslash($_GET['paged']))) : 1;
            $per_page = 50;

            $products = wc_get_products([
                'status' => ['publish', 'private'],
                'limit' => -1,
                'return' => 'objects',
            ]);

            $filtered = array_values(array_filter($products, static function ($product) use ($filter) {
                if (!is_a($product, 'WC_Product')) {
                    return false;
                }
                if ($filter === 'low') {
                    return AGROPAG_Invendus_Dashboard::is_low_stock($product);
                }
                if ($filter === 'daily') {
                    return AGROPAG_Invendus_Dashboard::is_daily_surplus($product);
                }
                return true;
            }));

            usort($filtered, static function ($a, $b) {
                return strcmp($a->get_name(), $b->get_name());
            });

            $total = count($filtered);
            $total_pages = max(1, (int) ceil($total / $per_page));
            $paged = min($paged, $total_pages);
            $rows = array_slice($filtered, ($paged - 1) * $per_page, $per_page);

            $base_url = admin_url('admin.php?page=' . self::MENU_SLUG);
            $notice = isset($_GET['notice']) ? sanitize_key((string) wp_unslash($_GET['notice'])) : '';

            echo '<div class="wrap">';
            echo '<h1>' . esc_html__('AGROPAG — Invendus', 'saeg-invendus-dashboard') . '</h1>';
            self::render_notice($notice);

            echo '<p style="margin-top:10px;">';
            self::render_filter_link($base_url, 'all', $filter, __('Tous', 'saeg-invendus-dashboard'));
            echo ' | ';
            self::render_filter_link($base_url, 'low', $filter, __('Stock faible', 'saeg-invendus-dashboard'));
            echo ' | ';
            self::render_filter_link($base_url, 'daily', $filter, __('Invendus du jour', 'saeg-invendus-dashboard'));
            echo '</p>';

            echo '<table class="widefat striped" style="margin-top:12px;">';
            echo '<thead><tr>';
            echo '<th>' . esc_html__('Produit', 'saeg-invendus-dashboard') . '</th>';
            echo '<th>' . esc_html__('Catégorie', 'saeg-invendus-dashboard') . '</th>';
            echo '<th>' . esc_html__('Prix/kg', 'saeg-invendus-dashboard') . '</th>';
            echo '<th>' . esc_html__('Stock kg', 'saeg-invendus-dashboard') . '</th>';
            echo '<th>' . esc_html__('Seuil', 'saeg-invendus-dashboard') . '</th>';
            echo '<th>' . esc_html__('Statut', 'saeg-invendus-dashboard') . '</th>';
            echo '<th>' . esc_html__('Actions', 'saeg-invendus-dashboard') . '</th>';
            echo '</tr></thead><tbody>';

            if (empty($rows)) {
                echo '<tr><td colspan="7">' . esc_html__('Aucun produit trouvé.', 'saeg-invendus-dashboard') . '</td></tr>';
            } else {
                foreach ($rows as $product) {
                    $product_id = $product->get_id();
                    $stock = self::to_float($product->get_meta(self::META_STOCK_KG, true));
                    $threshold = self::get_threshold($product);
                    $is_low = self::is_low_stock($product);
                    $is_daily = self::is_daily_surplus($product);
                    $price_per_kg = self::get_price_per_kg($product);
                    $categories = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'names']);
                    $edit_link = get_edit_post_link($product_id);

                    echo '<tr>';
                    echo '<td><a href="' . esc_url((string) $edit_link) . '">' . esc_html($product->get_name()) . '</a></td>';
                    echo '<td>' . esc_html(implode(', ', is_array($categories) ? $categories : [])) . '</td>';
                    echo '<td>' . esc_html(number_format_i18n($price_per_kg, 0)) . ' FCFA</td>';
                    echo '<td>' . esc_html(number_format_i18n($stock, 2)) . '</td>';
                    echo '<td>' . esc_html(number_format_i18n($threshold, 2)) . '</td>';
                    echo '<td>';
                    if ($is_low) {
                        echo '<span style="color:#b91c1c;font-weight:700;">' . esc_html__('Stock faible', 'saeg-invendus-dashboard') . '</span>';
                    } else {
                        echo '<span style="color:#166534;">' . esc_html__('OK', 'saeg-invendus-dashboard') . '</span>';
                    }
                    if ($is_daily) {
                        echo ' • <span style="color:#92400e;font-weight:700;">' . esc_html__('Invendu du jour', 'saeg-invendus-dashboard') . '</span>';
                    }
                    echo '</td>';
                    echo '<td>';
                    self::render_action_form(self::ACTION_APPLY_DISCOUNT, $product_id, $filter, $paged, [
                        'discount' => '10',
                    ], '-10%');
                    self::render_action_form(self::ACTION_APPLY_DISCOUNT, $product_id, $filter, $paged, [
                        'discount' => '20',
                    ], '-20%');
                    self::render_action_form(self::ACTION_TOGGLE_DAILY, $product_id, $filter, $paged, [], $is_daily ? __('Retirer invendu', 'saeg-invendus-dashboard') : __('Marquer invendu', 'saeg-invendus-dashboard'));
                    echo '</td>';
                    echo '</tr>';
                }
            }
            echo '</tbody></table>';

            if ($total_pages > 1) {
                echo '<div class="tablenav"><div class="tablenav-pages">';
                echo wp_kses_post(paginate_links([
                    'base' => add_query_arg(['page' => self::MENU_SLUG, 'scope' => $filter, 'paged' => '%#%'], admin_url('admin.php')),
                    'format' => '',
                    'current' => $paged,
                    'total' => $total_pages,
                ]));
                echo '</div></div>';
            }

            echo '</div>';
        }

        public static function handle_apply_discount(): void {
            if (!current_user_can('edit_products')) {
                wp_die(esc_html__('Accès refusé.', 'saeg-invendus-dashboard'));
            }

            check_admin_referer(self::NONCE_ACTION);
            $product_id = isset($_POST['product_id']) ? absint(wp_unslash($_POST['product_id'])) : 0;
            $discount = isset($_POST['discount']) ? (int) wp_unslash($_POST['discount']) : 0;
            $scope = isset($_POST['scope']) ? sanitize_key((string) wp_unslash($_POST['scope'])) : 'all';
            $paged = isset($_POST['paged']) ? max(1, absint(wp_unslash($_POST['paged']))) : 1;

            $product = wc_get_product($product_id);
            if (!$product || !in_array($discount, [10, 20], true)) {
                self::redirect_back($scope, $paged, 'error');
            }

            $regular = (float) $product->get_regular_price();
            if ($regular <= 0) {
                $regular = (float) $product->get_price();
            }
            if ($regular <= 0) {
                $regular = self::get_price_per_kg($product);
            }

            if ($regular <= 0) {
                self::redirect_back($scope, $paged, 'error');
            }

            $sale = round($regular * (1 - ($discount / 100)), wc_get_price_decimals());
            if ((float) $product->get_regular_price() <= 0) {
                $product->set_regular_price((string) wc_format_decimal($regular));
            }
            $product->set_sale_price((string) wc_format_decimal($sale));
            $product->set_price((string) wc_format_decimal($sale));
            $product->save();

            self::redirect_back($scope, $paged, 'updated');
        }

        public static function handle_toggle_daily(): void {
            if (!current_user_can('edit_products')) {
                wp_die(esc_html__('Accès refusé.', 'saeg-invendus-dashboard'));
            }

            check_admin_referer(self::NONCE_ACTION);
            $product_id = isset($_POST['product_id']) ? absint(wp_unslash($_POST['product_id'])) : 0;
            $scope = isset($_POST['scope']) ? sanitize_key((string) wp_unslash($_POST['scope'])) : 'all';
            $paged = isset($_POST['paged']) ? max(1, absint(wp_unslash($_POST['paged']))) : 1;

            $product = wc_get_product($product_id);
            if (!$product) {
                self::redirect_back($scope, $paged, 'error');
            }

            $current = wc_string_to_bool($product->get_meta(self::META_DAILY_SURPLUS, true));
            $product->update_meta_data(self::META_DAILY_SURPLUS, $current ? '0' : '1');
            $product->save();

            self::redirect_back($scope, $paged, 'updated');
        }

        private static function render_filter_link(string $base_url, string $scope, string $current, string $label): void {
            $url = add_query_arg(['page' => self::MENU_SLUG, 'scope' => $scope], admin_url('admin.php'));
            if ($scope === $current) {
                echo '<strong><a href="' . esc_url($url) . '">' . esc_html($label) . '</a></strong>';
                return;
            }
            echo '<a href="' . esc_url($url) . '">' . esc_html($label) . '</a>';
        }

        private static function render_action_form(string $action, int $product_id, string $scope, int $paged, array $extra, string $label): void {
            echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="display:inline-block;margin-right:6px;">';
            wp_nonce_field(self::NONCE_ACTION);
            echo '<input type="hidden" name="action" value="' . esc_attr($action) . '" />';
            echo '<input type="hidden" name="product_id" value="' . esc_attr((string) $product_id) . '" />';
            echo '<input type="hidden" name="scope" value="' . esc_attr($scope) . '" />';
            echo '<input type="hidden" name="paged" value="' . esc_attr((string) $paged) . '" />';
            foreach ($extra as $key => $value) {
                echo '<input type="hidden" name="' . esc_attr($key) . '" value="' . esc_attr((string) $value) . '" />';
            }
            echo '<button type="submit" class="button button-small">' . esc_html($label) . '</button>';
            echo '</form>';
        }

        private static function render_notice(string $notice): void {
            if (!in_array($notice, ['updated', 'error'], true)) {
                return;
            }
            $class = $notice === 'updated' ? 'notice notice-success' : 'notice notice-error';
            $text = $notice === 'updated'
                ? __('Action appliquée avec succès.', 'saeg-invendus-dashboard')
                : __('Impossible d’appliquer l’action.', 'saeg-invendus-dashboard');
            echo '<div class="' . esc_attr($class) . '"><p>' . esc_html($text) . '</p></div>';
        }

        private static function redirect_back(string $scope, int $paged, string $notice): void {
            $url = add_query_arg([
                'page' => self::MENU_SLUG,
                'scope' => $scope,
                'paged' => $paged,
                'notice' => $notice,
            ], admin_url('admin.php'));
            wp_safe_redirect($url);
            exit;
        }

        private static function to_float($value): float {
            if (is_float($value) || is_int($value)) {
                return (float) $value;
            }
            $value = str_replace(',', '.', (string) $value);
            return is_numeric($value) ? (float) $value : 0.0;
        }

        private static function get_threshold(WC_Product $product): float {
            $threshold = self::to_float($product->get_meta(self::META_LOW_THRESHOLD, true));
            return $threshold > 0 ? $threshold : 3.0;
        }

        private static function is_low_stock(WC_Product $product): bool {
            $unit = (string) $product->get_meta(self::META_UNIT, true);
            if ($unit !== 'kg') {
                return false;
            }
            $stock = self::to_float($product->get_meta(self::META_STOCK_KG, true));
            return $stock <= self::get_threshold($product);
        }

        private static function is_daily_surplus(WC_Product $product): bool {
            return wc_string_to_bool($product->get_meta(self::META_DAILY_SURPLUS, true));
        }

        private static function get_price_per_kg(WC_Product $product): float {
            $value = self::to_float($product->get_meta(self::META_PRICE_PER_KG, true));
            if ($value > 0) {
                return $value;
            }
            $regular = (float) $product->get_regular_price();
            if ($regular > 0) {
                return $regular;
            }
            return (float) $product->get_price();
        }
    }

    AGROPAG_Invendus_Dashboard::boot();
}
