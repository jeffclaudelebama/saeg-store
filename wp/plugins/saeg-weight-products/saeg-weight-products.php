<?php
/**
 * Plugin Name: AGROPAG Weight Products
 * Description: Gestion de produits vendus au kilo (quantités décimales), stock en kg, REST API headless AGROPAG et outils backoffice.
 * Version: 1.0.0
 * Author: AGROPAG
 * Requires at least: 6.4
 * Requires PHP: 8.1
 * Text Domain: saeg-weight-products
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('AGROPAG_Weight_Products')) {
    final class AGROPAG_Weight_Products {
        private const META_UNIT_TYPE = 'saeg_unit';
        private const META_PRICE_PER_KG = 'saeg_price_per_kg';
        private const META_STEP_KG = 'saeg_step_kg';
        private const META_MIN_KG = 'saeg_min_kg';
        private const META_STOCK_KG = 'saeg_stock_kg';
        private const META_LOW_STOCK_THRESHOLD = 'saeg_low_stock_threshold';
        private const META_DAILY_SURPLUS = 'saeg_is_daily_surplus';
        private const META_ORIGIN = 'saeg_origin';
        private const ORDER_STOCK_STATE = '_saeg_stock_kg_state';
        private const ORDER_META_MOBILE_MONEY_REFERENCE = 'saeg_mobile_money_reference';
        private const ORDER_META_MOBILE_MONEY_PAYER_NUMBER = 'saeg_mobile_money_payer_number';
        private const ORDER_META_MOBILE_MONEY_PROOF_ID = 'saeg_mobile_money_proof_id';
        private const ORDER_META_MOBILE_MONEY_STATUS = 'saeg_mobile_money_status';
        private const ORDER_META_MOBILE_MONEY_PAID_AT = 'saeg_mobile_money_paid_at';
        private const ORDER_META_PUSH_SUBSCRIPTIONS = 'saeg_push_subscriptions';
        private const DASHBOARD_DISCOUNT_NONCE = 'saeg_apply_daily_discount';
        private const MARK_MOBILE_MONEY_PAID_ACTION = 'saeg_mark_mobile_money_paid';
        private const REST_NAMESPACE = 'saeg/v1';
        private const WHATSAPP_LEAD_POST_TYPE = 'saeg_whatsapp_lead';
        private const CUSTOMER_PROFILE_POST_TYPE = 'saeg_customer_profile';
        private const OTP_CHALLENGE_POST_TYPE = 'saeg_otp_challenge';
        private const PROFILE_META_PHONE = '_saeg_phone';
        private const PROFILE_META_FIRST_NAME = '_saeg_first_name';
        private const PROFILE_META_LAST_NAME = '_saeg_last_name';
        private const PROFILE_META_EMAIL = '_saeg_email';
        private const PROFILE_META_ADDRESS_1 = '_saeg_address_1';
        private const PROFILE_META_ADDRESS_2 = '_saeg_address_2';
        private const PROFILE_META_CITY = '_saeg_city';
        private const OTP_META_PHONE = '_saeg_phone';
        private const OTP_META_REQUESTED_AT = '_saeg_requested_at';
        private const OTP_META_EXPIRES_AT = '_saeg_expires_at';
        private const OTP_META_ATTEMPTS = '_saeg_attempts';
        private const OTP_META_VERIFIED_AT = '_saeg_verified_at';
        private const OTP_META_PROVIDER_SID = '_saeg_provider_sid';
        private const OTP_RESEND_DELAY_SECONDS = 60;
        private const OTP_TTL_SECONDS = 600;
        private const OTP_MAX_ATTEMPTS = 5;
        private const CONTACT_PHONE = '011453040';
        private const CONTACT_WHATSAPP = '24177638864';
        private const CONTACT_EMAIL = 'commande@agropag.ga';

        public static function boot(): void {
            add_action('plugins_loaded', [__CLASS__, 'init']);
            register_activation_hook(__FILE__, [__CLASS__, 'activate']);
            register_deactivation_hook(__FILE__, [__CLASS__, 'deactivate']);
        }

        public static function activate(): void {
            self::register_supervisor_role();
            self::ensure_woocommerce_defaults();
            self::register_whatsapp_lead_post_type();
            self::register_account_post_types();
            flush_rewrite_rules();
        }

        public static function deactivate(): void {
            flush_rewrite_rules();
        }

        public static function init(): void {
            self::register_supervisor_role();

            add_action('rest_api_init', [__CLASS__, 'register_rest_routes']);
            add_action('init', [__CLASS__, 'register_meta']);
            add_action('init', [__CLASS__, 'register_whatsapp_lead_post_type']);
            add_action('init', [__CLASS__, 'register_account_post_types']);

            add_action('woocommerce_product_options_general_product_data', [__CLASS__, 'render_general_fields']);
            add_action('woocommerce_product_options_inventory_product_data', [__CLASS__, 'render_inventory_fields']);
            add_action('woocommerce_admin_process_product_object', [__CLASS__, 'save_product_fields']);

            add_filter('woocommerce_stock_amount', [__CLASS__, 'allow_decimal_quantities'], 10, 1);
            add_filter('woocommerce_quantity_input_args', [__CLASS__, 'filter_quantity_input_args'], 10, 2);
            add_filter('woocommerce_add_to_cart_validation', [__CLASS__, 'validate_add_to_cart'], 10, 5);
            add_filter('woocommerce_update_cart_validation', [__CLASS__, 'validate_update_cart'], 10, 4);
            add_action('woocommerce_check_cart_items', [__CLASS__, 'validate_cart_stock']);
            add_action('woocommerce_before_calculate_totals', [__CLASS__, 'apply_weight_line_pricing'], 20);
            add_filter('woocommerce_get_price_html', [__CLASS__, 'filter_price_html'], 10, 2);

            add_action('woocommerce_order_status_processing', [__CLASS__, 'reduce_stock_on_processing']);
            add_action('woocommerce_order_status_cancelled', [__CLASS__, 'restore_stock_on_cancelled']);
            add_action('woocommerce_order_status_failed', [__CLASS__, 'restore_stock_on_cancelled']);
            add_action('woocommerce_order_status_changed', [__CLASS__, 'notify_order_status_change'], 20, 4);

            add_filter('manage_edit-product_columns', [__CLASS__, 'add_admin_columns']);
            add_action('manage_product_posts_custom_column', [__CLASS__, 'render_admin_columns'], 10, 2);
            add_action('admin_head', [__CLASS__, 'admin_styles']);
            add_filter('display_post_states', [__CLASS__, 'add_low_stock_post_state'], 10, 2);

            add_action('wp_dashboard_setup', [__CLASS__, 'register_dashboard_widget']);
            add_action('admin_post_saeg_apply_daily_discount', [__CLASS__, 'handle_daily_discount_action']);
            add_action('admin_post_' . self::MARK_MOBILE_MONEY_PAID_ACTION, [__CLASS__, 'handle_mark_mobile_money_paid']);

            add_filter('woocommerce_rest_prepare_product_object', [__CLASS__, 'append_rest_fields_to_wc_response'], 10, 3);
            add_action('woocommerce_email_after_order_table', [__CLASS__, 'render_checkout_email_notices'], 20, 4);
            add_action('woocommerce_admin_order_data_after_order_details', [__CLASS__, 'render_mobile_money_admin_panel']);
        }

        public static function register_meta(): void {
            $meta_keys = [
                self::META_UNIT_TYPE => ['type' => 'string', 'default' => 'unit'],
                self::META_PRICE_PER_KG => ['type' => 'number', 'default' => 0],
                self::META_STEP_KG => ['type' => 'number', 'default' => 0.25],
                self::META_MIN_KG => ['type' => 'number', 'default' => 0.25],
                self::META_STOCK_KG => ['type' => 'number', 'default' => 0],
                self::META_LOW_STOCK_THRESHOLD => ['type' => 'number', 'default' => 3],
                self::META_DAILY_SURPLUS => ['type' => 'boolean', 'default' => false],
                self::META_ORIGIN => ['type' => 'string', 'default' => ''],
            ];

            foreach ($meta_keys as $key => $config) {
                register_post_meta('product', $key, [
                    'show_in_rest' => true,
                    'single' => true,
                    'type' => $config['type'],
                    'default' => $config['default'],
                    'auth_callback' => static function () {
                        return current_user_can('edit_products');
                    },
                    'sanitize_callback' => static function ($value) use ($key) {
                        if ($key === self::META_UNIT_TYPE) {
                            $value = sanitize_text_field((string) $value);
                            return in_array($value, ['kg', 'unit'], true) ? $value : 'unit';
                        }
                        if ($key === self::META_DAILY_SURPLUS) {
                            return wc_string_to_bool($value) ? '1' : '0';
                        }
                        if ($key === self::META_ORIGIN) {
                            return sanitize_text_field((string) $value);
                        }
                        return self::normalize_decimal($value);
                    },
                ]);
            }
        }

        public static function register_rest_routes(): void {
            register_rest_route(self::REST_NAMESPACE, '/products', [
                'methods' => WP_REST_Server::READABLE,
                'permission_callback' => '__return_true',
                'args' => [
                    'page' => ['type' => 'integer', 'default' => 1, 'minimum' => 1],
                    'per_page' => ['type' => 'integer', 'default' => 20, 'minimum' => 1, 'maximum' => 100],
                    'search' => ['type' => 'string'],
                    'category' => ['type' => 'string'],
                    'daily_only' => ['type' => 'boolean', 'default' => false],
                ],
                'callback' => [__CLASS__, 'rest_list_products'],
            ]);

            register_rest_route(self::REST_NAMESPACE, '/products/(?P<id>\d+)', [
                'methods' => WP_REST_Server::READABLE,
                'permission_callback' => '__return_true',
                'args' => [
                    'id' => ['type' => 'integer', 'required' => true],
                ],
                'callback' => [__CLASS__, 'rest_get_product'],
            ]);

            register_rest_route(self::REST_NAMESPACE, '/categories', [
                'methods' => WP_REST_Server::READABLE,
                'permission_callback' => '__return_true',
                'args' => [
                    'page' => ['type' => 'integer', 'default' => 1, 'minimum' => 1],
                    'per_page' => ['type' => 'integer', 'default' => 50, 'minimum' => 1, 'maximum' => 100],
                    'search' => ['type' => 'string'],
                ],
                'callback' => [__CLASS__, 'rest_list_categories'],
            ]);

            register_rest_route(self::REST_NAMESPACE, '/orders/(?P<id>\d+)/payment-proof', [
                'methods' => WP_REST_Server::CREATABLE,
                'permission_callback' => [__CLASS__, 'rest_can_manage_orders'],
                'args' => [
                    'id' => ['type' => 'integer', 'required' => true],
                    'payment_reference' => ['type' => 'string', 'required' => true],
                    'payer_number' => ['type' => 'string', 'required' => false],
                ],
                'callback' => [__CLASS__, 'rest_upload_payment_proof'],
            ]);

            register_rest_route(self::REST_NAMESPACE, '/whatsapp-leads', [
                'methods' => WP_REST_Server::CREATABLE,
                'permission_callback' => [__CLASS__, 'rest_can_manage_whatsapp_leads'],
                'args' => [
                    'phone' => ['type' => 'string', 'required' => true],
                    'source' => ['type' => 'string', 'required' => false],
                ],
                'callback' => [__CLASS__, 'rest_create_whatsapp_lead'],
            ]);

            register_rest_route(self::REST_NAMESPACE, '/account/profile', [
                'methods' => WP_REST_Server::READABLE,
                'permission_callback' => [__CLASS__, 'rest_can_manage_orders'],
                'args' => [
                    'phone' => ['type' => 'string', 'required' => true],
                ],
                'callback' => [__CLASS__, 'rest_get_customer_profile'],
            ]);

            register_rest_route(self::REST_NAMESPACE, '/account/profile', [
                'methods' => WP_REST_Server::EDITABLE,
                'permission_callback' => [__CLASS__, 'rest_can_manage_orders'],
                'callback' => [__CLASS__, 'rest_upsert_customer_profile'],
            ]);

            register_rest_route(self::REST_NAMESPACE, '/account/otp/request', [
                'methods' => WP_REST_Server::CREATABLE,
                'permission_callback' => [__CLASS__, 'rest_can_manage_orders'],
                'callback' => [__CLASS__, 'rest_request_account_otp'],
            ]);

            register_rest_route(self::REST_NAMESPACE, '/account/otp/verify', [
                'methods' => WP_REST_Server::CREATABLE,
                'permission_callback' => [__CLASS__, 'rest_can_manage_orders'],
                'callback' => [__CLASS__, 'rest_verify_account_otp'],
            ]);
        }

        public static function rest_list_products(WP_REST_Request $request): WP_REST_Response {
            if (!function_exists('wc_get_products')) {
                return new WP_REST_Response(['error' => 'WooCommerce non actif'], 500);
            }

            $page = max(1, (int) $request->get_param('page'));
            $per_page = min(100, max(1, (int) $request->get_param('per_page')));
            $search = sanitize_text_field((string) $request->get_param('search'));
            $category = sanitize_text_field((string) $request->get_param('category'));
            $daily_only = wc_string_to_bool($request->get_param('daily_only'));

            $query = [
                'status' => 'publish',
                'limit' => $per_page,
                'page' => $page,
                'orderby' => 'menu_order',
                'order' => 'ASC',
                'return' => 'objects',
            ];

            if ($search !== '') {
                $query['search'] = $search;
            }

            if ($category !== '') {
                $query['category'] = [$category];
            }

            if ($daily_only) {
                $query['meta_query'] = [
                    [
                        'key' => self::META_DAILY_SURPLUS,
                        'value' => '1',
                    ],
                ];
            }

            $products = wc_get_products($query);
            $data = array_map([__CLASS__, 'serialize_product'], $products);

            return new WP_REST_Response([
                'items' => $data,
                'page' => $page,
                'per_page' => $per_page,
                'count' => count($data),
            ]);
        }

        public static function rest_get_product(WP_REST_Request $request): WP_REST_Response {
            if (!function_exists('wc_get_product')) {
                return new WP_REST_Response(['error' => 'WooCommerce non actif'], 500);
            }

            $product = wc_get_product((int) $request['id']);
            if (!$product || $product->get_status() !== 'publish') {
                return new WP_REST_Response(['error' => 'Produit introuvable'], 404);
            }

            return new WP_REST_Response(self::serialize_product($product));
        }

        public static function rest_list_categories(WP_REST_Request $request): WP_REST_Response {
            $page = max(1, (int) $request->get_param('page'));
            $per_page = min(100, max(1, (int) $request->get_param('per_page')));
            $search = sanitize_text_field((string) $request->get_param('search'));

            $query = [
                'taxonomy' => 'product_cat',
                'hide_empty' => false,
                'number' => $per_page,
                'offset' => ($page - 1) * $per_page,
            ];
            if ($search !== '') {
                $query['search'] = $search;
            }

            $terms = get_terms($query);
            if (is_wp_error($terms)) {
                return new WP_REST_Response(['error' => $terms->get_error_message()], 500);
            }

            $all_terms = get_terms([
                'taxonomy' => 'product_cat',
                'hide_empty' => false,
                'fields' => 'ids',
                'search' => $search,
            ]);
            $total = is_wp_error($all_terms) ? count($terms) : count((array) $all_terms);

            $items = array_map(static function ($term) {
                return [
                    'id' => (int) $term->term_id,
                    'slug' => (string) $term->slug,
                    'name' => (string) $term->name,
                    'count' => (int) $term->count,
                ];
            }, $terms);

            return new WP_REST_Response([
                'items' => $items,
                'count' => $total,
                'page' => $page,
                'per_page' => $per_page,
            ]);
        }

        public static function rest_can_manage_whatsapp_leads(WP_REST_Request $request) {
            $expected = self::get_whatsapp_leads_token();
            if ($expected === '') {
                return new WP_Error('saeg_token_missing', __('Token WhatsApp leads non configuré.', 'saeg-weight-products'), ['status' => 500]);
            }

            $provided = (string) $request->get_header('x-saeg-token');
            if ($provided !== '' && hash_equals($expected, $provided)) {
                return true;
            }

            return new WP_Error('saeg_forbidden', __('Accès non autorisé.', 'saeg-weight-products'), ['status' => 401]);
        }

        public static function rest_create_whatsapp_lead(WP_REST_Request $request): WP_REST_Response {
            $phone = self::normalize_gabon_phone((string) $request->get_param('phone'));
            if ($phone === null) {
                return new WP_REST_Response(['error' => 'Numéro WhatsApp invalide'], 422);
            }

            $source = sanitize_key((string) $request->get_param('source'));
            if ($source === '') {
                $source = 'footer_newsletter';
            }

            $post_id = wp_insert_post([
                'post_type' => self::WHATSAPP_LEAD_POST_TYPE,
                'post_status' => 'private',
                'post_title' => sprintf('Lead WhatsApp %s', $phone),
            ], true);

            if (is_wp_error($post_id)) {
                return new WP_REST_Response(['error' => $post_id->get_error_message()], 500);
            }

            update_post_meta($post_id, '_saeg_phone', $phone);
            update_post_meta($post_id, '_saeg_source', $source);
            update_post_meta($post_id, '_saeg_created_at', current_time('mysql'));
            update_post_meta($post_id, '_saeg_ip', sanitize_text_field((string) $request->get_header('x-forwarded-for')));

            return new WP_REST_Response([
                'ok' => true,
                'id' => (int) $post_id,
                'phone' => $phone,
                'source' => $source,
            ]);
        }

        public static function rest_get_customer_profile(WP_REST_Request $request): WP_REST_Response {
            $phone = self::normalize_gabon_phone((string) $request->get_param('phone'));
            if ($phone === null) {
                return new WP_REST_Response(['error' => 'Téléphone invalide'], 422);
            }

            return new WP_REST_Response(self::get_customer_profile_payload($phone));
        }

        public static function rest_upsert_customer_profile(WP_REST_Request $request): WP_REST_Response {
            $phone = self::normalize_gabon_phone((string) $request->get_param('phone'));
            if ($phone === null) {
                return new WP_REST_Response(['error' => 'Téléphone invalide'], 422);
            }

            $email = sanitize_email((string) $request->get_param('email'));
            if ($email !== '' && !is_email($email)) {
                return new WP_REST_Response(['error' => 'Email invalide'], 422);
            }

            $profile_id = self::find_customer_profile_post_id($phone);
            if ($profile_id <= 0) {
                $profile_id = wp_insert_post([
                    'post_type' => self::CUSTOMER_PROFILE_POST_TYPE,
                    'post_status' => 'private',
                    'post_title' => sprintf('Profil client %s', $phone),
                ], true);

                if (is_wp_error($profile_id)) {
                    return new WP_REST_Response(['error' => $profile_id->get_error_message()], 500);
                }
            }

            update_post_meta($profile_id, self::PROFILE_META_PHONE, $phone);
            update_post_meta($profile_id, self::PROFILE_META_FIRST_NAME, sanitize_text_field((string) $request->get_param('first_name')));
            update_post_meta($profile_id, self::PROFILE_META_LAST_NAME, sanitize_text_field((string) $request->get_param('last_name')));
            update_post_meta($profile_id, self::PROFILE_META_EMAIL, $email);
            update_post_meta($profile_id, self::PROFILE_META_ADDRESS_1, sanitize_text_field((string) $request->get_param('address_1')));
            update_post_meta($profile_id, self::PROFILE_META_ADDRESS_2, sanitize_text_field((string) $request->get_param('address_2')));
            update_post_meta($profile_id, self::PROFILE_META_CITY, sanitize_text_field((string) $request->get_param('city')));

            return new WP_REST_Response(self::get_customer_profile_payload($phone));
        }

        public static function rest_request_account_otp(WP_REST_Request $request): WP_REST_Response {
            $phone = self::normalize_gabon_phone((string) $request->get_param('phone'));
            if ($phone === null) {
                return new WP_REST_Response(['error' => 'Téléphone invalide'], 422);
            }

            $challenge_id = self::find_otp_challenge_post_id($phone);
            $requested_at = $challenge_id > 0 ? (int) get_post_meta($challenge_id, self::OTP_META_REQUESTED_AT, true) : 0;
            $seconds_since_last = $requested_at > 0 ? (time() - $requested_at) : PHP_INT_MAX;
            if ($challenge_id > 0 && $seconds_since_last < self::OTP_RESEND_DELAY_SECONDS) {
                return new WP_REST_Response([
                    'error' => 'Veuillez patienter avant de demander un nouveau code.',
                    'resend_after' => self::OTP_RESEND_DELAY_SECONDS - $seconds_since_last,
                ], 429);
            }

            $provider = self::get_otp_provider_config();
            if ($provider === null) {
                return new WP_REST_Response(['error' => 'Provider OTP non configuré'], 500);
            }

            $provider_result = self::send_otp_via_twilio_verify($phone, $provider);
            if (is_wp_error($provider_result)) {
                return new WP_REST_Response(['error' => $provider_result->get_error_message()], 502);
            }

            if ($challenge_id <= 0) {
                $challenge_id = wp_insert_post([
                    'post_type' => self::OTP_CHALLENGE_POST_TYPE,
                    'post_status' => 'private',
                    'post_title' => sprintf('OTP %s', $phone),
                ], true);

                if (is_wp_error($challenge_id)) {
                    return new WP_REST_Response(['error' => $challenge_id->get_error_message()], 500);
                }
            }

            update_post_meta($challenge_id, self::OTP_META_PHONE, $phone);
            update_post_meta($challenge_id, self::OTP_META_REQUESTED_AT, time());
            update_post_meta($challenge_id, self::OTP_META_EXPIRES_AT, time() + self::OTP_TTL_SECONDS);
            update_post_meta($challenge_id, self::OTP_META_ATTEMPTS, 0);
            update_post_meta($challenge_id, self::OTP_META_VERIFIED_AT, 0);
            update_post_meta($challenge_id, self::OTP_META_PROVIDER_SID, sanitize_text_field((string) ($provider_result['sid'] ?? '')));

            return new WP_REST_Response([
                'ok' => true,
                'phone' => $phone,
                'expires_in' => self::OTP_TTL_SECONDS,
                'resend_after' => self::OTP_RESEND_DELAY_SECONDS,
            ]);
        }

        public static function rest_verify_account_otp(WP_REST_Request $request): WP_REST_Response {
            $phone = self::normalize_gabon_phone((string) $request->get_param('phone'));
            $code = preg_replace('/\D+/', '', (string) $request->get_param('code'));
            if ($phone === null || !is_string($code) || strlen($code) !== 6) {
                return new WP_REST_Response(['error' => 'Code OTP invalide'], 422);
            }

            $challenge_id = self::find_otp_challenge_post_id($phone);
            if ($challenge_id <= 0) {
                return new WP_REST_Response(['error' => 'Aucun code en attente pour ce numéro'], 404);
            }

            $expires_at = (int) get_post_meta($challenge_id, self::OTP_META_EXPIRES_AT, true);
            if ($expires_at <= 0 || $expires_at < time()) {
                return new WP_REST_Response(['error' => 'Le code OTP a expiré'], 410);
            }

            $attempts = (int) get_post_meta($challenge_id, self::OTP_META_ATTEMPTS, true);
            if ($attempts >= self::OTP_MAX_ATTEMPTS) {
                return new WP_REST_Response(['error' => 'Trop de tentatives, veuillez demander un nouveau code'], 429);
            }

            $provider = self::get_otp_provider_config();
            if ($provider === null) {
                return new WP_REST_Response(['error' => 'Provider OTP non configuré'], 500);
            }

            $verification = self::verify_otp_via_twilio_verify($phone, $code, $provider);
            if (is_wp_error($verification)) {
                update_post_meta($challenge_id, self::OTP_META_ATTEMPTS, $attempts + 1);
                return new WP_REST_Response(['error' => $verification->get_error_message()], 401);
            }

            update_post_meta($challenge_id, self::OTP_META_VERIFIED_AT, time());

            return new WP_REST_Response([
                'ok' => true,
                'profile' => self::get_customer_profile_payload($phone),
            ]);
        }

        public static function rest_can_manage_orders(WP_REST_Request $request) {
            if (current_user_can('edit_shop_orders')) {
                return true;
            }

            $user_id = self::authenticate_woo_api_user();
            if ($user_id > 0 && user_can($user_id, 'edit_shop_orders')) {
                wp_set_current_user($user_id);
                return true;
            }

            return new WP_Error('saeg_forbidden', __('Accès non autorisé.', 'saeg-weight-products'), ['status' => 401]);
        }

        public static function rest_upload_payment_proof(WP_REST_Request $request) {
            if (!function_exists('wc_get_order')) {
                return new WP_REST_Response(['error' => 'WooCommerce non actif'], 500);
            }

            $order = wc_get_order((int) $request['id']);
            if (!$order) {
                return new WP_REST_Response(['error' => 'Commande introuvable'], 404);
            }

            $payment_reference = sanitize_text_field((string) $request->get_param('payment_reference'));
            if ($payment_reference === '') {
                return new WP_REST_Response(['error' => 'Référence de paiement manquante'], 400);
            }

            $payer_number = sanitize_text_field((string) $request->get_param('payer_number'));

            if (!isset($_FILES['proof']) || !is_array($_FILES['proof'])) {
                return new WP_REST_Response(['error' => 'Fichier de preuve manquant'], 400);
            }

            $file = $_FILES['proof'];
            if (!empty($file['error'])) {
                return new WP_REST_Response(['error' => 'Upload invalide (' . (int) $file['error'] . ')'], 400);
            }

            require_once ABSPATH . 'wp-admin/includes/file.php';
            require_once ABSPATH . 'wp-admin/includes/image.php';
            require_once ABSPATH . 'wp-admin/includes/media.php';

            $uploaded = wp_handle_upload($file, [
                'test_form' => false,
                'mimes' => [
                    'jpg|jpeg|jpe' => 'image/jpeg',
                    'png' => 'image/png',
                    'webp' => 'image/webp',
                    'pdf' => 'application/pdf',
                ],
            ]);

            if (!is_array($uploaded) || isset($uploaded['error'])) {
                $message = is_array($uploaded) ? (string) ($uploaded['error'] ?? 'Upload impossible') : 'Upload impossible';
                return new WP_REST_Response(['error' => $message], 422);
            }

            $attachment = [
                'post_mime_type' => (string) ($uploaded['type'] ?? ''),
                'post_title' => sanitize_file_name((string) pathinfo((string) ($uploaded['file'] ?? ''), PATHINFO_FILENAME)),
                'post_content' => '',
                'post_status' => 'inherit',
            ];

            $attachment_id = wp_insert_attachment($attachment, (string) $uploaded['file']);
            if (is_wp_error($attachment_id)) {
                return new WP_REST_Response(['error' => $attachment_id->get_error_message()], 500);
            }

            $metadata = wp_generate_attachment_metadata((int) $attachment_id, (string) $uploaded['file']);
            if (is_array($metadata)) {
                wp_update_attachment_metadata((int) $attachment_id, $metadata);
            }

            $order->update_meta_data(self::ORDER_META_MOBILE_MONEY_REFERENCE, $payment_reference);
            $order->update_meta_data(self::ORDER_META_MOBILE_MONEY_PAYER_NUMBER, $payer_number);
            $order->update_meta_data(self::ORDER_META_MOBILE_MONEY_PROOF_ID, (int) $attachment_id);
            if ((string) $order->get_meta(self::ORDER_META_MOBILE_MONEY_STATUS, true) === '') {
                $order->update_meta_data(self::ORDER_META_MOBILE_MONEY_STATUS, 'pending_verification');
            }
            $order->save();

            $note = sprintf(
                'Preuve Mobile Money ajoutée. Référence: %s. Numéro payeur: %s.',
                $payment_reference,
                $payer_number !== '' ? $payer_number : 'N/A'
            );
            $order->add_order_note($note, false);

            return new WP_REST_Response([
                'ok' => true,
                'attachment_id' => (int) $attachment_id,
                'attachment_url' => wp_get_attachment_url((int) $attachment_id),
                'payment_reference' => $payment_reference,
            ]);
        }

        public static function render_general_fields(): void {
            echo '<div class="options_group show_if_simple">';

            woocommerce_wp_select([
                'id' => self::META_UNIT_TYPE,
                'label' => __('Type d\'unité AGROPAG', 'saeg-weight-products'),
                'description' => __('Choisir "kg" pour activer la vente au poids décimal.', 'saeg-weight-products'),
                'desc_tip' => true,
                'options' => [
                    'unit' => __('Unité', 'saeg-weight-products'),
                    'kg' => __('Kilogramme (kg)', 'saeg-weight-products'),
                ],
            ]);

            woocommerce_wp_text_input([
                'id' => self::META_PRICE_PER_KG,
                'label' => __('Prix / kg (FCFA)', 'saeg-weight-products'),
                'description' => __('Prix unitaire au kilogramme. Utilisé lorsque le type est "kg".', 'saeg-weight-products'),
                'desc_tip' => true,
                'data_type' => 'price',
                'type' => 'number',
                'custom_attributes' => [
                    'step' => '0.01',
                    'min' => '0',
                ],
            ]);

            woocommerce_wp_text_input([
                'id' => self::META_LOW_STOCK_THRESHOLD,
                'label' => __('Seuil stock faible (kg)', 'saeg-weight-products'),
                'description' => __('Badge admin "Stock faible" si stock_kg <= seuil.', 'saeg-weight-products'),
                'desc_tip' => true,
                'type' => 'number',
                'custom_attributes' => [
                    'step' => '0.01',
                    'min' => '0',
                ],
            ]);

            woocommerce_wp_checkbox([
                'id' => self::META_DAILY_SURPLUS,
                'label' => __('Invendu du jour', 'saeg-weight-products'),
                'description' => __('Utilisé pour les sections "Offres du jour" et l\'action -20%.', 'saeg-weight-products'),
            ]);

            woocommerce_wp_text_input([
                'id' => self::META_ORIGIN,
                'label' => __('Origine', 'saeg-weight-products'),
                'description' => __('Ex: Marché AGROPAG, Producteurs locaux, Bouchers locaux.', 'saeg-weight-products'),
                'desc_tip' => true,
                'type' => 'text',
            ]);

            echo '</div>';
        }

        public static function render_inventory_fields(): void {
            echo '<div class="options_group show_if_simple">';

            woocommerce_wp_text_input([
                'id' => self::META_STEP_KG,
                'label' => __('Pas (kg)', 'saeg-weight-products'),
                'description' => __('Incrément autorisé pour les produits vendus au kg (défaut 0.25).', 'saeg-weight-products'),
                'desc_tip' => true,
                'type' => 'number',
                'custom_attributes' => [
                    'step' => '0.01',
                    'min' => '0.01',
                ],
            ]);

            woocommerce_wp_text_input([
                'id' => self::META_MIN_KG,
                'label' => __('Minimum (kg)', 'saeg-weight-products'),
                'description' => __('Poids minimum commandable (ex: 0.25).', 'saeg-weight-products'),
                'desc_tip' => true,
                'type' => 'number',
                'custom_attributes' => [
                    'step' => '0.01',
                    'min' => '0.01',
                ],
            ]);

            woocommerce_wp_text_input([
                'id' => self::META_STOCK_KG,
                'label' => __('Stock disponible (kg)', 'saeg-weight-products'),
                'description' => __('Stock réel en kg pour validation panier/commande.', 'saeg-weight-products'),
                'desc_tip' => true,
                'type' => 'number',
                'custom_attributes' => [
                    'step' => '0.01',
                    'min' => '0',
                ],
            ]);

            echo '</div>';
        }

        public static function save_product_fields($product): void {
            if (!is_a($product, 'WC_Product')) {
                return;
            }

            $unit_type = isset($_POST[self::META_UNIT_TYPE]) ? sanitize_text_field(wp_unslash($_POST[self::META_UNIT_TYPE])) : 'unit';
            if (!in_array($unit_type, ['kg', 'unit'], true)) {
                $unit_type = 'unit';
            }

            $price_per_kg = isset($_POST[self::META_PRICE_PER_KG]) ? self::normalize_decimal(wp_unslash($_POST[self::META_PRICE_PER_KG])) : 0.0;
            $step_kg = isset($_POST[self::META_STEP_KG]) ? max(0.01, self::normalize_decimal(wp_unslash($_POST[self::META_STEP_KG]))) : 0.25;
            $min_kg = isset($_POST[self::META_MIN_KG]) ? max(0.01, self::normalize_decimal(wp_unslash($_POST[self::META_MIN_KG]))) : 0.25;
            $stock_kg = isset($_POST[self::META_STOCK_KG]) ? max(0.0, self::normalize_decimal(wp_unslash($_POST[self::META_STOCK_KG]))) : 0.0;
            $low_stock_threshold = isset($_POST[self::META_LOW_STOCK_THRESHOLD]) ? max(0.0, self::normalize_decimal(wp_unslash($_POST[self::META_LOW_STOCK_THRESHOLD]))) : 3.0;
            $is_daily_surplus = isset($_POST[self::META_DAILY_SURPLUS]) ? 'yes' : 'no';
            $origin = isset($_POST[self::META_ORIGIN]) ? sanitize_text_field(wp_unslash($_POST[self::META_ORIGIN])) : '';

            $product->update_meta_data(self::META_UNIT_TYPE, $unit_type);
            $product->update_meta_data(self::META_PRICE_PER_KG, wc_format_decimal($price_per_kg));
            $product->update_meta_data(self::META_STEP_KG, wc_format_decimal($step_kg));
            $product->update_meta_data(self::META_MIN_KG, wc_format_decimal($min_kg));
            $product->update_meta_data(self::META_STOCK_KG, wc_format_decimal($stock_kg));
            $product->update_meta_data(self::META_LOW_STOCK_THRESHOLD, wc_format_decimal($low_stock_threshold));
            $product->update_meta_data(self::META_DAILY_SURPLUS, $is_daily_surplus === 'yes' ? '1' : '0');
            $product->update_meta_data(self::META_ORIGIN, $origin);

            if ($unit_type === 'kg' && $price_per_kg > 0) {
                $product->set_regular_price((string) wc_format_decimal($price_per_kg));
                if ((float) $product->get_price() <= 0) {
                    $product->set_price((string) wc_format_decimal($price_per_kg));
                }
                if ($stock_kg <= 0) {
                    $product->set_stock_status('outofstock');
                } else {
                    $product->set_stock_status('instock');
                }
            }

            if (!$product->get_tax_status()) {
                $product->set_tax_status('none');
            }
        }

        public static function allow_decimal_quantities($amount) {
            if (is_numeric($amount)) {
                return (float) $amount;
            }
            return $amount;
        }

        public static function filter_quantity_input_args(array $args, $product): array {
            if (!is_a($product, 'WC_Product')) {
                return $args;
            }

            if (!self::is_weight_product($product)) {
                $args['step'] = $args['step'] ?? 1;
                $args['min_value'] = max(1, (int) ($args['min_value'] ?? 1));
                return $args;
            }

            $step = self::get_step_kg($product);
            $min = self::get_min_kg($product);
            $stock = self::get_stock_kg($product);

            $args['input_value'] = isset($args['input_value']) && (float) $args['input_value'] > 0 ? $args['input_value'] : $min;
            $args['min_value'] = $min;
            $args['step'] = $step;
            $args['pattern'] = '[0-9]+([\\.,][0-9]+)?';
            $args['inputmode'] = 'decimal';
            $args['max_value'] = $stock > 0 ? $stock : '';

            return $args;
        }

        public static function validate_add_to_cart(bool $passed, int $product_id, int $quantity, int $variation_id = 0, array $variations = []): bool {
            $target_product_id = $variation_id > 0 ? $variation_id : $product_id;
            $product = wc_get_product($target_product_id);
            if (!$product || !self::is_weight_product($product)) {
                return $passed;
            }

            $qty = isset($_REQUEST['quantity']) ? self::normalize_decimal(wp_unslash($_REQUEST['quantity'])) : (float) $quantity;
            $valid = self::validate_weight_quantity($product, $qty);
            if (is_wp_error($valid)) {
                wc_add_notice($valid->get_error_message(), 'error');
                return false;
            }

            $requested_total = $qty + self::get_cart_reserved_qty_for_product($product->get_id());
            if ($requested_total > self::get_stock_kg($product) + 0.0001) {
                wc_add_notice(__('Stock insuffisant pour ce poids demandé.', 'saeg-weight-products'), 'error');
                return false;
            }

            return $passed;
        }

        public static function validate_update_cart(bool $passed, string $cart_item_key, array $values, $quantity): bool {
            $product = isset($values['data']) && is_a($values['data'], 'WC_Product') ? $values['data'] : null;
            if (!$product || !self::is_weight_product($product)) {
                return $passed;
            }

            $qty = self::normalize_decimal($quantity);
            $valid = self::validate_weight_quantity($product, $qty);
            if (is_wp_error($valid)) {
                wc_add_notice($valid->get_error_message(), 'error');
                return false;
            }

            return $passed;
        }

        public static function validate_cart_stock(): void {
            if (!WC()->cart) {
                return;
            }

            $totals = [];
            foreach (WC()->cart->get_cart() as $cart_item_key => $item) {
                if (!isset($item['data']) || !is_a($item['data'], 'WC_Product')) {
                    continue;
                }

                $product = $item['data'];
                if (!self::is_weight_product($product)) {
                    continue;
                }

                $qty = self::normalize_decimal($item['quantity'] ?? 0);
                $totals[$product->get_id()] = ($totals[$product->get_id()] ?? 0) + $qty;

                $valid = self::validate_weight_quantity($product, $qty);
                if (is_wp_error($valid)) {
                    wc_add_notice($valid->get_error_message(), 'error');
                }
            }

            foreach ($totals as $product_id => $qty_sum) {
                $product = wc_get_product($product_id);
                if (!$product) {
                    continue;
                }
                $stock = self::get_stock_kg($product);
                if ($qty_sum > $stock + 0.0001) {
                    /* translators: %s: product name */
                    wc_add_notice(sprintf(__('Stock insuffisant pour %s.', 'saeg-weight-products'), $product->get_name()), 'error');
                }
            }
        }

        public static function apply_weight_line_pricing(WC_Cart $cart): void {
            if (is_admin() && !defined('DOING_AJAX')) {
                return;
            }

            foreach ($cart->get_cart() as $item) {
                if (!isset($item['data']) || !is_a($item['data'], 'WC_Product')) {
                    continue;
                }

                $product = $item['data'];
                if (!self::is_weight_product($product)) {
                    continue;
                }

                $unit_price = self::get_effective_weight_unit_price($product);
                if ($unit_price <= 0) {
                    continue;
                }

                // WooCommerce calcule déjà le total de ligne via `quantity`.
                // Ici, le prix unitaire doit rester le prix/kg.
                $product->set_price((string) wc_format_decimal($unit_price));
            }
        }

        public static function filter_price_html(string $price_html, $product): string {
            if (!is_a($product, 'WC_Product') || !self::is_weight_product($product)) {
                return $price_html;
            }

            $suffix = ' <small style="opacity:.8;">/ kg</small>';
            if (strpos($price_html, '/ kg') !== false) {
                return $price_html;
            }
            return $price_html . $suffix;
        }

        public static function reduce_stock_on_processing(int $order_id): void {
            $order = wc_get_order($order_id);
            if (!$order) {
                return;
            }

            $state = (string) $order->get_meta(self::ORDER_STOCK_STATE);
            if ($state === 'reduced') {
                return;
            }

            $changes = self::collect_order_weight_quantities($order);
            foreach ($changes as $product_id => $qty_kg) {
                $product = wc_get_product($product_id);
                if (!$product || !self::is_weight_product($product)) {
                    continue;
                }

                $new_stock = max(0.0, self::get_stock_kg($product) - $qty_kg);
                $product->update_meta_data(self::META_STOCK_KG, wc_format_decimal($new_stock));
                $product->set_stock_status($new_stock > 0 ? 'instock' : 'outofstock');
                $product->save();
            }

            $order->update_meta_data(self::ORDER_STOCK_STATE, 'reduced');
            $order->save();
        }

        public static function restore_stock_on_cancelled(int $order_id): void {
            $order = wc_get_order($order_id);
            if (!$order) {
                return;
            }

            $state = (string) $order->get_meta(self::ORDER_STOCK_STATE);
            if ($state !== 'reduced') {
                return;
            }

            $changes = self::collect_order_weight_quantities($order);
            foreach ($changes as $product_id => $qty_kg) {
                $product = wc_get_product($product_id);
                if (!$product || !self::is_weight_product($product)) {
                    continue;
                }

                $new_stock = max(0.0, self::get_stock_kg($product) + $qty_kg);
                $product->update_meta_data(self::META_STOCK_KG, wc_format_decimal($new_stock));
                $product->set_stock_status($new_stock > 0 ? 'instock' : 'outofstock');
                $product->save();
            }

            $order->update_meta_data(self::ORDER_STOCK_STATE, 'restored');
            $order->save();
        }

        public static function add_admin_columns(array $columns): array {
            $new_columns = [];
            foreach ($columns as $key => $label) {
                $new_columns[$key] = $label;
                if ($key === 'price') {
                    $new_columns['saeg_stock_kg'] = __('Stock AGROPAG', 'saeg-weight-products');
                }
            }
            if (!isset($new_columns['saeg_stock_kg'])) {
                $new_columns['saeg_stock_kg'] = __('Stock AGROPAG', 'saeg-weight-products');
            }
            return $new_columns;
        }

        public static function render_admin_columns(string $column, int $post_id): void {
            if ($column !== 'saeg_stock_kg') {
                return;
            }

            $product = wc_get_product($post_id);
            if (!$product) {
                echo '&mdash;';
                return;
            }

            if (!self::is_weight_product($product)) {
                echo esc_html__('Unité', 'saeg-weight-products');
                return;
            }

            $stock = self::get_stock_kg($product);
            $threshold = self::get_low_stock_threshold($product);
            $is_low = $stock <= $threshold;

            echo '<span>' . esc_html(wc_format_localized_decimal($stock)) . ' kg</span>';
            if ($is_low) {
                echo ' <span class="saeg-stock-badge saeg-stock-badge--low">' . esc_html__('Stock faible', 'saeg-weight-products') . '</span>';
            }
        }

        public static function admin_styles(): void {
            $screen = get_current_screen();
            if (!$screen || $screen->id !== 'edit-product') {
                return;
            }
            echo '<style>
            .saeg-stock-badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;line-height:1.6}
            .saeg-stock-badge--low{background:#fde9e9;color:#b42318;border:1px solid #f4b4b4}
            </style>';
        }

        public static function add_low_stock_post_state(array $post_states, WP_Post $post): array {
            if ($post->post_type !== 'product') {
                return $post_states;
            }

            $product = wc_get_product($post->ID);
            if (!$product || !self::is_weight_product($product)) {
                return $post_states;
            }

            if (self::get_stock_kg($product) <= self::get_low_stock_threshold($product)) {
                $post_states['saeg_low_stock'] = __('Stock faible', 'saeg-weight-products');
            }

            return $post_states;
        }

        public static function register_dashboard_widget(): void {
            if (!current_user_can('edit_products')) {
                return;
            }

            wp_add_dashboard_widget(
                'saeg_daily_surplus_widget',
                __('Invendus du jour', 'saeg-weight-products'),
                [__CLASS__, 'render_dashboard_widget']
            );
        }

        public static function render_dashboard_widget(): void {
            $products = wc_get_products([
                'status' => 'publish',
                'limit' => 8,
                'return' => 'objects',
                'meta_query' => [
                    [
                        'key' => self::META_DAILY_SURPLUS,
                        'value' => '1',
                    ],
                ],
            ]);

            $count_ids = wc_get_products([
                'status' => 'publish',
                'return' => 'ids',
                'limit' => -1,
                'meta_query' => [
                    [
                        'key' => self::META_DAILY_SURPLUS,
                        'value' => '1',
                    ],
                ],
            ]);
            $count = is_array($count_ids) ? count($count_ids) : 0;

            echo '<p><strong>' . esc_html(sprintf(_n('%d produit marqué "invendu du jour"', '%d produits marqués "invendu du jour"', $count, 'saeg-weight-products'), $count)) . '</strong></p>';

            if (!empty($products)) {
                echo '<ul style="margin:0 0 12px 16px;">';
                foreach ($products as $product) {
                    echo '<li>' . esc_html($product->get_name()) . ' - ' . wp_kses_post(wc_price((float) $product->get_price())) . '</li>';
                }
                echo '</ul>';
            }

            echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
            wp_nonce_field(self::DASHBOARD_DISCOUNT_NONCE);
            echo '<input type="hidden" name="action" value="saeg_apply_daily_discount" />';
            submit_button(__('Appliquer -20% (prix promo)', 'saeg-weight-products'), 'primary', 'submit', false);
            echo '</form>';
            echo '<p style="margin-top:8px;color:#555;">' . esc_html__('Crée/actualise un prix promo WooCommerce à 80% du prix régulier sur les invendus du jour.', 'saeg-weight-products') . '</p>';
        }

        public static function handle_daily_discount_action(): void {
            if (!current_user_can('edit_products')) {
                wp_die(esc_html__('Accès refusé.', 'saeg-weight-products'));
            }
            check_admin_referer(self::DASHBOARD_DISCOUNT_NONCE);

            $products = wc_get_products([
                'status' => ['publish', 'private'],
                'limit' => -1,
                'return' => 'objects',
                'meta_query' => [
                    [
                        'key' => self::META_DAILY_SURPLUS,
                        'value' => '1',
                    ],
                ],
            ]);

            $updated = 0;
            foreach ($products as $product) {
                $regular = (float) $product->get_regular_price();
                if ($regular <= 0 && self::is_weight_product($product)) {
                    $regular = self::get_price_per_kg($product);
                    if ($regular > 0) {
                        $product->set_regular_price((string) wc_format_decimal($regular));
                    }
                }
                if ($regular <= 0) {
                    continue;
                }

                $sale = round($regular * 0.8, wc_get_price_decimals());
                $product->set_sale_price((string) wc_format_decimal($sale));
                $product->set_price((string) wc_format_decimal($sale));
                $product->save();
                $updated++;
            }

            $redirect = add_query_arg([
                'page' => 'wc-admin',
                'saeg_discount_applied' => $updated,
            ], admin_url('index.php'));
            wp_safe_redirect($redirect);
            exit;
        }

        public static function append_rest_fields_to_wc_response(WP_REST_Response $response, $object, WP_REST_Request $request): WP_REST_Response {
            if (!is_a($object, 'WC_Product')) {
                return $response;
            }

            $data = $response->get_data();
            $data['saeg'] = [
                'unit_type' => self::get_unit_type($object),
                'price_per_kg' => self::get_price_per_kg($object),
                'step_kg' => self::get_step_kg($object),
                'min_kg' => self::get_min_kg($object),
                'stock_kg' => self::get_stock_kg($object),
                'low_stock_threshold' => self::get_low_stock_threshold($object),
                'low_stock' => self::is_low_stock($object),
                'is_daily_surplus' => self::is_daily_surplus($object),
                'origin' => (string) $object->get_meta(self::META_ORIGIN, true),
            ];
            $response->set_data($data);

            return $response;
        }

        public static function render_checkout_email_notices($order, bool $sent_to_admin, bool $plain_text, $email): void {
            if (!is_a($order, 'WC_Order')) {
                return;
            }

            if ($plain_text) {
                echo "\n---\n";
                echo "Contacts AGROPAG\n";
                echo 'Téléphone : ' . self::CONTACT_PHONE . "\n";
                echo 'WhatsApp : ' . self::CONTACT_WHATSAPP . "\n";
                echo 'Email : ' . self::CONTACT_EMAIL . "\n";
            } else {
                echo '<div style="margin:18px 0;padding:12px;border:1px solid #e5e7eb;border-radius:8px;">';
                echo '<p style="margin:0 0 8px;font-weight:700;color:#0B2B16;">Contacts AGROPAG</p>';
                echo '<p style="margin:0;font-size:13px;line-height:1.5;">Téléphone : ' . esc_html(self::CONTACT_PHONE) . '<br />';
                echo 'WhatsApp : ' . esc_html(self::CONTACT_WHATSAPP) . '<br />';
                echo 'Email : ' . esc_html(self::CONTACT_EMAIL) . '</p>';
                echo '</div>';
            }

            $payment = (string) $order->get_meta('saeg_paiement');
            if ($payment !== 'mobile_money') {
                return;
            }

            $reference = (string) $order->get_meta(self::ORDER_META_MOBILE_MONEY_REFERENCE, true);
            $payer_number = (string) $order->get_meta(self::ORDER_META_MOBILE_MONEY_PAYER_NUMBER, true);

            if ($plain_text) {
                echo "\nPaiement Mobile Money\n";
                echo "Airtel Money — Code agent : AGROPAG\n";
                echo "Moov Money — Code agent : AGROPAG (bientôt disponible)\n";
                if ($reference !== '') {
                    echo 'Référence : ' . $reference . "\n";
                }
                if ($payer_number !== '') {
                    echo 'Numéro payeur : ' . $payer_number . "\n";
                }
            } else {
                echo '<div style="margin:18px 0;padding:12px;border:1px solid #b7dfc6;background:#f3fbf6;border-radius:8px;">';
                echo '<p style="margin:0 0 8px;font-weight:700;color:#1B7F3A;">Paiement Mobile Money</p>';
                echo '<p style="margin:0;font-size:13px;line-height:1.6;color:#0f172a;">';
                echo 'Airtel Money — Code agent : AGROPAG<br />';
                echo 'Moov Money — Code agent : AGROPAG (bientôt disponible)';
                if ($reference !== '') {
                    echo '<br />Référence : <strong>' . esc_html($reference) . '</strong>';
                }
                if ($payer_number !== '') {
                    echo '<br />Numéro payeur : ' . esc_html($payer_number);
                }
                echo '</p>';
                echo '</div>';
            }
        }

        public static function render_mobile_money_admin_panel($order): void {
            if (!is_a($order, 'WC_Order')) {
                return;
            }

            $payment = (string) $order->get_meta('saeg_paiement');
            if ($payment !== 'mobile_money') {
                return;
            }

            $reference = (string) $order->get_meta(self::ORDER_META_MOBILE_MONEY_REFERENCE, true);
            $payer_number = (string) $order->get_meta(self::ORDER_META_MOBILE_MONEY_PAYER_NUMBER, true);
            $proof_id = (int) $order->get_meta(self::ORDER_META_MOBILE_MONEY_PROOF_ID, true);
            $status = (string) $order->get_meta(self::ORDER_META_MOBILE_MONEY_STATUS, true);
            $paid_at = (string) $order->get_meta(self::ORDER_META_MOBILE_MONEY_PAID_AT, true);
            $proof_url = $proof_id > 0 ? wp_get_attachment_url($proof_id) : '';

            echo '<div class="order_data_column" style="width:100%;">';
            echo '<h3 style="margin-top:16px;">Paiement Mobile Money AGROPAG</h3>';
            echo '<p><strong>Référence :</strong> ' . esc_html($reference !== '' ? $reference : '—') . '</p>';
            echo '<p><strong>Numéro payeur :</strong> ' . esc_html($payer_number !== '' ? $payer_number : '—') . '</p>';
            echo '<p><strong>Statut :</strong> ' . esc_html($status !== '' ? $status : 'pending_verification') . '</p>';
            if ($paid_at !== '') {
                echo '<p><strong>Payé le :</strong> ' . esc_html($paid_at) . '</p>';
            }
            if ($proof_url !== '') {
                echo '<p><strong>Preuve :</strong> <a href="' . esc_url($proof_url) . '" target="_blank" rel="noopener">Voir la pièce jointe</a></p>';
            } else {
                echo '<p><strong>Preuve :</strong> Aucune</p>';
            }

            if ($status !== 'paid') {
                $url = wp_nonce_url(
                    add_query_arg(
                        [
                            'action' => self::MARK_MOBILE_MONEY_PAID_ACTION,
                            'order_id' => $order->get_id(),
                        ],
                        admin_url('admin-post.php')
                    ),
                    self::MARK_MOBILE_MONEY_PAID_ACTION . '_' . $order->get_id()
                );
                echo '<p><a class="button button-primary" href="' . esc_url($url) . '">Marquer payé</a></p>';
            } else {
                echo '<p><span class="button disabled" style="pointer-events:none;">Paiement déjà validé</span></p>';
            }
            echo '</div>';
        }

        public static function handle_mark_mobile_money_paid(): void {
            if (!current_user_can('edit_shop_orders')) {
                wp_die(esc_html__('Accès refusé.', 'saeg-weight-products'));
            }

            $order_id = isset($_GET['order_id']) ? absint(wp_unslash($_GET['order_id'])) : 0;
            if ($order_id <= 0) {
                wp_die(esc_html__('Commande invalide.', 'saeg-weight-products'));
            }

            check_admin_referer(self::MARK_MOBILE_MONEY_PAID_ACTION . '_' . $order_id);

            $order = wc_get_order($order_id);
            if (!$order) {
                wp_die(esc_html__('Commande introuvable.', 'saeg-weight-products'));
            }

            $order->update_meta_data(self::ORDER_META_MOBILE_MONEY_STATUS, 'paid');
            $order->update_meta_data(self::ORDER_META_MOBILE_MONEY_PAID_AT, current_time('mysql'));
            $order->save();

            if ($order->get_status() === 'on-hold') {
                $order->update_status('processing', 'Paiement Mobile Money validé manuellement par AGROPAG.');
            } else {
                $order->add_order_note('Paiement Mobile Money validé manuellement par AGROPAG.', false);
            }

            wp_safe_redirect($order->get_edit_order_url());
            exit;
        }

        private static function get_push_webhook_url(): string {
            if (defined('AGROPAG_PUSH_WEBHOOK_URL')) {
                return (string) AGROPAG_PUSH_WEBHOOK_URL;
            }

            $value = getenv('AGROPAG_PUSH_WEBHOOK_URL');
            return is_string($value) ? trim($value) : '';
        }

        private static function get_push_webhook_secret(): string {
            if (defined('AGROPAG_PUSH_WEBHOOK_SECRET')) {
                return (string) AGROPAG_PUSH_WEBHOOK_SECRET;
            }

            $value = getenv('AGROPAG_PUSH_WEBHOOK_SECRET');
            return is_string($value) ? trim($value) : '';
        }

        private static function get_order_status_label(WC_Order $order, string $status): string {
            $payment_method = (string) $order->get_meta('saeg_paiement', true);
            $mobile_money_status = (string) $order->get_meta(self::ORDER_META_MOBILE_MONEY_STATUS, true);

            switch ($status) {
                case 'completed':
                    return 'Livrée';
                case 'processing':
                    return 'Préparation';
                case 'saeg_en_route':
                case 'en-route':
                    return 'En route';
                case 'on-hold':
                    if ($payment_method === 'mobile_money') {
                        return $mobile_money_status === 'paid' ? 'Paiement validé' : 'Paiement à vérifier';
                    }
                    return 'En attente de confirmation';
                case 'cancelled':
                    return 'Commande annulée';
                case 'failed':
                    return 'Paiement échoué';
                case 'refunded':
                    return 'Commande remboursée';
                case 'pending':
                default:
                    return 'Commande reçue';
            }
        }

        public static function notify_order_status_change($order_id, $from_status, $to_status, $order): void {
            if (!is_a($order, 'WC_Order')) {
                $order = wc_get_order((int) $order_id);
            }
            if (!$order) {
                return;
            }

            $subscriptions_raw = (string) $order->get_meta(self::ORDER_META_PUSH_SUBSCRIPTIONS, true);
            if ($subscriptions_raw === '') {
                return;
            }

            $subscriptions = json_decode($subscriptions_raw, true);
            if (!is_array($subscriptions) || count($subscriptions) === 0) {
                return;
            }

            $webhook_url = self::get_push_webhook_url();
            if ($webhook_url === '') {
                return;
            }

            $payload = [
                'orderId' => (int) $order->get_id(),
                'orderNumber' => (string) $order->get_order_number(),
                'statusLabel' => self::get_order_status_label($order, (string) $to_status),
                'customerName' => trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name()),
                'orderUrl' => 'https://boutique.agropag.ga/suivi',
                'subscriptions' => $subscriptions,
            ];

            $headers = [
                'Content-Type' => 'application/json',
            ];

            $secret = self::get_push_webhook_secret();
            if ($secret !== '') {
                $headers['x-agropag-webhook-secret'] = $secret;
            }

            $response = wp_remote_post($webhook_url, [
                'timeout' => 15,
                'headers' => $headers,
                'body' => wp_json_encode($payload),
                'data_format' => 'body',
            ]);

            if (is_wp_error($response)) {
                $order->add_order_note('Échec notification push commande: ' . $response->get_error_message(), false);
                return;
            }

            $code = (int) wp_remote_retrieve_response_code($response);
            if ($code >= 400) {
                $order->add_order_note('Échec notification push commande: HTTP ' . $code, false);
            }
        }

        private static function collect_order_weight_quantities(WC_Order $order): array {
            $changes = [];
            foreach ($order->get_items('line_item') as $item) {
                $product = $item->get_product();
                if (!$product || !self::is_weight_product($product)) {
                    continue;
                }
                $qty = self::normalize_decimal($item->get_quantity());
                if ($qty <= 0) {
                    continue;
                }
                $changes[$product->get_id()] = ($changes[$product->get_id()] ?? 0.0) + $qty;
            }
            return $changes;
        }

        private static function validate_weight_quantity(WC_Product $product, float $qty) {
            $min = self::get_min_kg($product);
            $step = self::get_step_kg($product);
            $stock = self::get_stock_kg($product);

            if ($qty <= 0) {
                return new WP_Error('saeg_invalid_qty', __('Veuillez saisir un poids valide.', 'saeg-weight-products'));
            }
            if ($qty + 0.0001 < $min) {
                return new WP_Error('saeg_min_qty', sprintf(__('Poids minimum: %s kg.', 'saeg-weight-products'), wc_format_localized_decimal($min)));
            }
            if (!self::respects_step($qty, $min, $step)) {
                return new WP_Error('saeg_step_qty', sprintf(__('Le poids doit respecter un pas de %s kg.', 'saeg-weight-products'), wc_format_localized_decimal($step)));
            }
            if ($qty > $stock + 0.0001) {
                return new WP_Error('saeg_stock_qty', __('Stock insuffisant pour ce poids demandé.', 'saeg-weight-products'));
            }

            return true;
        }

        private static function respects_step(float $qty, float $min, float $step): bool {
            $scale = 1000;
            $qty_i = (int) round($qty * $scale);
            $min_i = (int) round($min * $scale);
            $step_i = max(1, (int) round($step * $scale));

            if ($qty_i < $min_i) {
                return false;
            }

            return (($qty_i - $min_i) % $step_i) === 0;
        }

        private static function get_cart_reserved_qty_for_product(int $product_id): float {
            if (!WC()->cart) {
                return 0.0;
            }
            $qty = 0.0;
            foreach (WC()->cart->get_cart() as $item) {
                if (!isset($item['product_id']) || (int) $item['product_id'] !== $product_id) {
                    continue;
                }
                $qty += self::normalize_decimal($item['quantity'] ?? 0);
            }
            return $qty;
        }

        private static function serialize_product(WC_Product $product): array {
            $images = [];
            foreach ($product->get_gallery_image_ids() as $image_id) {
                $url = wp_get_attachment_image_url($image_id, 'large');
                if ($url) {
                    $images[] = $url;
                }
            }
            if ($product->get_image_id()) {
                $cover = wp_get_attachment_image_url($product->get_image_id(), 'large');
                if ($cover) {
                    array_unshift($images, $cover);
                }
            }
            $images = array_values(array_unique(array_filter($images)));

            $categories = [];
            foreach ($product->get_category_ids() as $cat_id) {
                $term = get_term($cat_id, 'product_cat');
                if ($term && !is_wp_error($term)) {
                    $categories[] = [
                        'id' => $term->term_id,
                        'slug' => $term->slug,
                        'name' => $term->name,
                    ];
                }
            }

            $unit_type = self::get_unit_type($product);
            $stock_kg = self::get_stock_kg($product);

            return [
                'id' => $product->get_id(),
                'slug' => $product->get_slug(),
                'name' => $product->get_name(),
                'permalink' => $product->get_permalink(),
                'description' => wp_kses_post($product->get_description()),
                'short_description' => wp_kses_post($product->get_short_description()),
                'images' => $images,
                'categories' => $categories,
                'currency' => get_woocommerce_currency(),
                'currency_symbol' => html_entity_decode(get_woocommerce_currency_symbol(), ENT_QUOTES, 'UTF-8'),
                'price' => (float) $product->get_price(),
                'regular_price' => (float) $product->get_regular_price(),
                'sale_price' => (float) $product->get_sale_price(),
                'unit_type' => $unit_type,
                'price_per_kg' => self::get_price_per_kg($product),
                'step_kg' => self::get_step_kg($product),
                'min_kg' => self::get_min_kg($product),
                'stock_kg' => $unit_type === 'kg' ? $stock_kg : null,
                'low_stock_threshold' => self::get_low_stock_threshold($product),
                'low_stock' => self::is_low_stock($product),
                'stock_status' => $product->get_stock_status(),
                'is_daily_surplus' => self::is_daily_surplus($product),
                'origin' => (string) $product->get_meta(self::META_ORIGIN, true),
                'tax_status' => $product->get_tax_status() ?: 'none',
                'updated_at' => $product->get_date_modified() ? $product->get_date_modified()->date(DATE_ATOM) : null,
            ];
        }

        private static function get_effective_weight_unit_price(WC_Product $product): float {
            $price = (float) $product->get_price();
            if ($price > 0) {
                return $price;
            }
            return self::get_price_per_kg($product);
        }

        private static function is_weight_product($product): bool {
            if (!is_a($product, 'WC_Product')) {
                $product = wc_get_product((int) $product);
            }
            if (!$product) {
                return false;
            }
            return self::get_unit_type($product) === 'kg';
        }

        private static function get_unit_type(WC_Product $product): string {
            $value = (string) $product->get_meta(self::META_UNIT_TYPE, true);
            return in_array($value, ['kg', 'unit'], true) ? $value : 'unit';
        }

        private static function get_price_per_kg(WC_Product $product): float {
            $raw = $product->get_meta(self::META_PRICE_PER_KG, true);
            if ($raw === '' || $raw === null) {
                return (float) $product->get_regular_price();
            }
            return self::normalize_decimal($raw);
        }

        private static function get_step_kg(WC_Product $product): float {
            $value = self::normalize_decimal($product->get_meta(self::META_STEP_KG, true));
            return $value > 0 ? $value : 0.25;
        }

        private static function get_min_kg(WC_Product $product): float {
            $value = self::normalize_decimal($product->get_meta(self::META_MIN_KG, true));
            return $value > 0 ? $value : 0.25;
        }

        private static function get_stock_kg(WC_Product $product): float {
            $value = self::normalize_decimal($product->get_meta(self::META_STOCK_KG, true));
            return max(0.0, $value);
        }

        private static function get_low_stock_threshold(WC_Product $product): float {
            $value = self::normalize_decimal($product->get_meta(self::META_LOW_STOCK_THRESHOLD, true));
            return $value > 0 ? $value : 3.0;
        }

        private static function is_low_stock(WC_Product $product): bool {
            if (!self::is_weight_product($product)) {
                return false;
            }
            return self::get_stock_kg($product) <= self::get_low_stock_threshold($product);
        }

        private static function is_daily_surplus(WC_Product $product): bool {
            return wc_string_to_bool($product->get_meta(self::META_DAILY_SURPLUS, true));
        }

        private static function normalize_decimal($value): float {
            if (is_float($value) || is_int($value)) {
                return (float) $value;
            }
            $value = str_replace(',', '.', (string) $value);
            return is_numeric($value) ? (float) $value : 0.0;
        }

        private static function authenticate_woo_api_user(): int {
            if (!function_exists('wc_api_hash')) {
                return 0;
            }

            $auth = '';
            if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $auth = (string) wp_unslash($_SERVER['HTTP_AUTHORIZATION']);
            } elseif (isset($_SERVER['Authorization'])) {
                $auth = (string) wp_unslash($_SERVER['Authorization']);
            }

            if ($auth === '' && function_exists('apache_request_headers')) {
                $headers = apache_request_headers();
                if (is_array($headers) && isset($headers['Authorization'])) {
                    $auth = (string) $headers['Authorization'];
                }
            }

            if ($auth === '' || stripos($auth, 'basic ') !== 0) {
                return 0;
            }

            $encoded = trim(substr($auth, 6));
            $decoded = base64_decode($encoded);
            if (!is_string($decoded) || strpos($decoded, ':') === false) {
                return 0;
            }

            [$consumer_key, $consumer_secret] = explode(':', $decoded, 2);
            $consumer_key = sanitize_text_field($consumer_key);
            $consumer_secret = sanitize_text_field($consumer_secret);

            if ($consumer_key === '' || $consumer_secret === '' || strpos($consumer_key, 'ck_') !== 0) {
                return 0;
            }

            global $wpdb;
            $table = $wpdb->prefix . 'woocommerce_api_keys';
            $row = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT user_id, permissions, consumer_secret FROM {$table} WHERE consumer_key = %s LIMIT 1",
                    wc_api_hash($consumer_key)
                )
            );

            if (!$row || empty($row->consumer_secret)) {
                return 0;
            }

            if (!hash_equals((string) $row->consumer_secret, $consumer_secret)) {
                return 0;
            }

            $permissions = (string) $row->permissions;
            if (!in_array($permissions, ['read_write', 'write'], true)) {
                return 0;
            }

            return (int) $row->user_id;
        }

        public static function register_whatsapp_lead_post_type(): void {
            register_post_type(self::WHATSAPP_LEAD_POST_TYPE, [
                'labels' => [
                    'name' => __('Leads WhatsApp AGROPAG', 'saeg-weight-products'),
                    'singular_name' => __('Lead WhatsApp AGROPAG', 'saeg-weight-products'),
                ],
                'public' => false,
                'show_ui' => false,
                'show_in_menu' => false,
                'supports' => ['title'],
                'capability_type' => 'post',
                'map_meta_cap' => true,
            ]);
        }

        public static function register_account_post_types(): void {
            register_post_type(self::CUSTOMER_PROFILE_POST_TYPE, [
                'labels' => [
                    'name' => __('Profils clients AGROPAG', 'saeg-weight-products'),
                    'singular_name' => __('Profil client AGROPAG', 'saeg-weight-products'),
                ],
                'public' => false,
                'show_ui' => false,
                'show_in_menu' => false,
                'supports' => ['title'],
                'capability_type' => 'post',
                'map_meta_cap' => true,
            ]);

            register_post_type(self::OTP_CHALLENGE_POST_TYPE, [
                'labels' => [
                    'name' => __('OTP AGROPAG', 'saeg-weight-products'),
                    'singular_name' => __('OTP AGROPAG', 'saeg-weight-products'),
                ],
                'public' => false,
                'show_ui' => false,
                'show_in_menu' => false,
                'supports' => ['title'],
                'capability_type' => 'post',
                'map_meta_cap' => true,
            ]);
        }

        private static function find_customer_profile_post_id(string $phone): int {
            $query = new WP_Query([
                'post_type' => self::CUSTOMER_PROFILE_POST_TYPE,
                'post_status' => 'private',
                'posts_per_page' => 1,
                'fields' => 'ids',
                'meta_query' => [
                    [
                        'key' => self::PROFILE_META_PHONE,
                        'value' => $phone,
                    ],
                ],
            ]);

            return isset($query->posts[0]) ? (int) $query->posts[0] : 0;
        }

        private static function get_customer_profile_payload(string $phone): array {
            $profile_id = self::find_customer_profile_post_id($phone);
            if ($profile_id <= 0) {
                return [
                    'phone' => $phone,
                    'first_name' => '',
                    'last_name' => '',
                    'email' => '',
                    'address_1' => '',
                    'address_2' => '',
                    'city' => 'Libreville',
                ];
            }

            return [
                'phone' => $phone,
                'first_name' => (string) get_post_meta($profile_id, self::PROFILE_META_FIRST_NAME, true),
                'last_name' => (string) get_post_meta($profile_id, self::PROFILE_META_LAST_NAME, true),
                'email' => (string) get_post_meta($profile_id, self::PROFILE_META_EMAIL, true),
                'address_1' => (string) get_post_meta($profile_id, self::PROFILE_META_ADDRESS_1, true),
                'address_2' => (string) get_post_meta($profile_id, self::PROFILE_META_ADDRESS_2, true),
                'city' => (string) get_post_meta($profile_id, self::PROFILE_META_CITY, true) ?: 'Libreville',
            ];
        }

        private static function find_otp_challenge_post_id(string $phone): int {
            $query = new WP_Query([
                'post_type' => self::OTP_CHALLENGE_POST_TYPE,
                'post_status' => 'private',
                'posts_per_page' => 1,
                'fields' => 'ids',
                'meta_query' => [
                    [
                        'key' => self::OTP_META_PHONE,
                        'value' => $phone,
                    ],
                ],
            ]);

            return isset($query->posts[0]) ? (int) $query->posts[0] : 0;
        }

        private static function get_otp_provider_config(): ?array {
            $account_sid = getenv('TWILIO_ACCOUNT_SID');
            $auth_token = getenv('TWILIO_AUTH_TOKEN');
            $service_sid = getenv('TWILIO_VERIFY_SERVICE_SID');
            $channel = getenv('AGROPAG_OTP_CHANNEL');

            if (defined('TWILIO_ACCOUNT_SID') && (!$account_sid || $account_sid === '')) {
                $account_sid = (string) constant('TWILIO_ACCOUNT_SID');
            }
            if (defined('TWILIO_AUTH_TOKEN') && (!$auth_token || $auth_token === '')) {
                $auth_token = (string) constant('TWILIO_AUTH_TOKEN');
            }
            if (defined('TWILIO_VERIFY_SERVICE_SID') && (!$service_sid || $service_sid === '')) {
                $service_sid = (string) constant('TWILIO_VERIFY_SERVICE_SID');
            }
            if (defined('AGROPAG_OTP_CHANNEL') && (!$channel || $channel === '')) {
                $channel = (string) constant('AGROPAG_OTP_CHANNEL');
            }

            if (!is_string($account_sid) || !is_string($auth_token) || !is_string($service_sid) || $account_sid === '' || $auth_token === '' || $service_sid === '') {
                return null;
            }

            return [
                'account_sid' => $account_sid,
                'auth_token' => $auth_token,
                'service_sid' => $service_sid,
                'channel' => is_string($channel) && $channel !== '' ? $channel : 'sms',
            ];
        }

        private static function to_e164_phone(string $phone): string {
            return '+' . ltrim($phone, '+');
        }

        private static function send_otp_via_twilio_verify(string $phone, array $provider) {
            $endpoint = sprintf(
                'https://verify.twilio.com/v2/Services/%s/Verifications',
                rawurlencode((string) $provider['service_sid'])
            );

            $response = wp_remote_post($endpoint, [
                'timeout' => 20,
                'headers' => [
                    'Authorization' => 'Basic ' . base64_encode((string) $provider['account_sid'] . ':' . (string) $provider['auth_token']),
                    'Content-Type' => 'application/x-www-form-urlencoded',
                ],
                'body' => [
                    'To' => self::to_e164_phone($phone),
                    'Channel' => (string) $provider['channel'],
                ],
            ]);

            if (is_wp_error($response)) {
                return $response;
            }

            $code = (int) wp_remote_retrieve_response_code($response);
            $body = json_decode((string) wp_remote_retrieve_body($response), true);
            if ($code >= 400) {
                return new WP_Error('saeg_otp_send_failed', isset($body['message']) ? (string) $body['message'] : 'Échec envoi OTP');
            }

            return is_array($body) ? $body : [];
        }

        private static function verify_otp_via_twilio_verify(string $phone, string $code, array $provider) {
            $endpoint = sprintf(
                'https://verify.twilio.com/v2/Services/%s/VerificationCheck',
                rawurlencode((string) $provider['service_sid'])
            );

            $response = wp_remote_post($endpoint, [
                'timeout' => 20,
                'headers' => [
                    'Authorization' => 'Basic ' . base64_encode((string) $provider['account_sid'] . ':' . (string) $provider['auth_token']),
                    'Content-Type' => 'application/x-www-form-urlencoded',
                ],
                'body' => [
                    'To' => self::to_e164_phone($phone),
                    'Code' => $code,
                ],
            ]);

            if (is_wp_error($response)) {
                return $response;
            }

            $http_code = (int) wp_remote_retrieve_response_code($response);
            $body = json_decode((string) wp_remote_retrieve_body($response), true);
            if ($http_code >= 400) {
                return new WP_Error('saeg_otp_verify_failed', isset($body['message']) ? (string) $body['message'] : 'Code OTP invalide');
            }

            if (!is_array($body) || (($body['status'] ?? '') !== 'approved' && ($body['valid'] ?? false) !== true)) {
                return new WP_Error('saeg_otp_invalid', 'Code OTP invalide');
            }

            return $body;
        }

        private static function get_whatsapp_leads_token(): string {
            $token = getenv('AGROPAG_WA_LEADS_TOKEN');
            if (is_string($token) && $token !== '') {
                return $token;
            }
            if (defined('AGROPAG_WA_LEADS_TOKEN')) {
                $defined = (string) constant('AGROPAG_WA_LEADS_TOKEN');
                if ($defined !== '') {
                    return $defined;
                }
            }
            return '';
        }

        private static function normalize_gabon_phone(string $raw): ?string {
            $digits = preg_replace('/\D+/', '', $raw);
            if (!is_string($digits) || $digits === '') {
                return null;
            }

            $local = '';
            if (strpos($digits, '241') === 0 && strlen($digits) >= 11) {
                $local = substr($digits, 3, 8);
            } elseif (strpos($digits, '0') === 0 && strlen($digits) >= 9) {
                $local = substr($digits, 1, 8);
            } elseif (strlen($digits) === 8) {
                $local = $digits;
            }

            if (!preg_match('/^\d{8}$/', $local)) {
                return null;
            }

            return '241' . $local;
        }

        private static function register_supervisor_role(): void {
            $caps = [
                'read' => true,
                'upload_files' => true,
                'edit_products' => true,
                'edit_others_products' => true,
                'publish_products' => true,
                'read_private_products' => true,
                'delete_products' => false,
                'delete_published_products' => false,
                'manage_product_terms' => true,
                'edit_product_terms' => true,
                'assign_product_terms' => true,
                'edit_shop_orders' => true,
                'read_shop_order' => true,
                'read_private_shop_orders' => true,
                'edit_shop_orders' => true,
                'edit_others_shop_orders' => true,
                'publish_shop_orders' => false,
                'delete_shop_orders' => false,
                'read_shop_orders' => true,
                'manage_woocommerce' => false,
                'view_woocommerce_reports' => true,
                'list_users' => false,
                'create_users' => false,
                'edit_users' => false,
                'install_plugins' => false,
                'activate_plugins' => false,
                'update_plugins' => false,
                'delete_plugins' => false,
                'manage_options' => false,
                'edit_theme_options' => false,
            ];

            $role = get_role('saeg_superviseur');
            if (!$role) {
                add_role('saeg_superviseur', __('Superviseur AGROPAG', 'saeg-weight-products'), $caps);
                return;
            }

            foreach ($caps as $cap => $grant) {
                if ($grant) {
                    $role->add_cap($cap);
                } else {
                    $role->remove_cap($cap);
                }
            }
        }

        private static function ensure_woocommerce_defaults(): void {
            if (get_option('woocommerce_currency') === '') {
                update_option('woocommerce_currency', 'XAF');
            }
            update_option('woocommerce_calc_taxes', 'no');
            if (function_exists('wp_timezone_string') && wp_timezone_string() === 'UTC') {
                update_option('timezone_string', 'Africa/Libreville');
            }
        }
    }

    AGROPAG_Weight_Products::boot();
}
