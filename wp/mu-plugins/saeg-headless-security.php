<?php
/**
 * Plugin Name: AGROPAG Headless Security (MU)
 * Description: CORS strict pour front headless AGROPAG + durcissement léger.
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!defined('AGROPAG_ALLOWED_FRONT_ORIGIN')) {
    define('AGROPAG_ALLOWED_FRONT_ORIGIN', 'https://boutique.agropag.ga');
}

add_filter('rest_pre_serve_request', function ($served, $result, $request, $server) {
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_ORIGIN'])) : '';
    if ($origin && $origin === AGROPAG_ALLOWED_FRONT_ORIGIN) {
        header('Access-Control-Allow-Origin: ' . AGROPAG_ALLOWED_FRONT_ORIGIN);
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: false');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    }

    if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
        status_header(200);
        return true;
    }

    return $served;
}, 10, 4);

add_filter('xmlrpc_enabled', '__return_false');
remove_action('wp_head', 'wp_generator');

/**
 * Rate limit simple sur les échecs de login WordPress (anti brute-force léger).
 * Complète un plugin dédié si installé.
 */
if (!defined('AGROPAG_LOGIN_RATE_LIMIT_MAX_ATTEMPTS')) {
    define('AGROPAG_LOGIN_RATE_LIMIT_MAX_ATTEMPTS', 5);
}

if (!defined('AGROPAG_LOGIN_RATE_LIMIT_WINDOW_SECONDS')) {
    define('AGROPAG_LOGIN_RATE_LIMIT_WINDOW_SECONDS', 15 * MINUTE_IN_SECONDS);
}

if (!function_exists('saeg_security_client_ip')) {
    function saeg_security_client_ip(): string
    {
        $candidates = [
            $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
            $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '',
            $_SERVER['REMOTE_ADDR'] ?? '',
        ];

        foreach ($candidates as $candidate) {
            if (!is_string($candidate) || $candidate === '') {
                continue;
            }

            if (strpos($candidate, ',') !== false) {
                $parts = array_map('trim', explode(',', $candidate));
                $candidate = $parts[0] ?? '';
            }

            $candidate = sanitize_text_field(wp_unslash($candidate));
            if (filter_var($candidate, FILTER_VALIDATE_IP)) {
                return $candidate;
            }
        }

        return 'unknown';
    }
}

if (!function_exists('saeg_login_rate_key')) {
    function saeg_login_rate_key(string $ip): string
    {
        return 'saeg_login_rate_' . md5($ip);
    }
}

add_filter('authenticate', function ($user, $username, $password) {
    if (!is_null($user) && !is_wp_error($user)) {
        return $user;
    }

    // Ne bloque pas les requêtes sans tentative d'auth explicite.
    if (!is_string($username) || $username === '' || !is_string($password) || $password === '') {
        return $user;
    }

    $ip = saeg_security_client_ip();
    $key = saeg_login_rate_key($ip);
    $record = get_transient($key);
    $attempts = is_array($record) ? (int) ($record['attempts'] ?? 0) : 0;
    $blocked_until = is_array($record) ? (int) ($record['blocked_until'] ?? 0) : 0;

    if ($blocked_until > time()) {
        return new WP_Error(
            'saeg_login_rate_limited',
            __('Trop de tentatives de connexion. Réessayez dans quelques minutes.', 'saeg-security')
        );
    }

    return $user;
}, 5, 3);

add_action('wp_login_failed', function ($username) {
    $ip = saeg_security_client_ip();
    $key = saeg_login_rate_key($ip);
    $record = get_transient($key);

    $attempts = is_array($record) ? (int) ($record['attempts'] ?? 0) : 0;
    $attempts++;

    $payload = [
        'attempts' => $attempts,
        'last_username' => sanitize_user((string) $username, true),
        'blocked_until' => 0,
    ];

    if ($attempts >= AGROPAG_LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
        $payload['blocked_until'] = time() + AGROPAG_LOGIN_RATE_LIMIT_WINDOW_SECONDS;
    }

    set_transient($key, $payload, AGROPAG_LOGIN_RATE_LIMIT_WINDOW_SECONDS);
});

add_action('wp_login', function ($user_login, $user) {
    $ip = saeg_security_client_ip();
    delete_transient(saeg_login_rate_key($ip));
}, 10, 2);
