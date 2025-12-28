<?php

/**
 * Security Configuration
 *
 * Security headers, CSRF protection, and other security settings
 */

return [
    'headers' => [
        'X-Frame-Options' => 'SAMEORIGIN',
        'X-Content-Type-Options' => 'nosniff',
        'X-XSS-Protection' => '1; mode=block',
        'Referrer-Policy' => 'strict-origin-when-cross-origin',
        'Permissions-Policy' => 'geolocation=(), microphone=(), camera=()',
        'Content-Security-Policy' => "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    ],

    'csrf' => [
        'enabled' => true,
        'token_name' => 'csrf_token',
        'token_length' => 32,
        'regenerate_on_submit' => true
    ],

    'password' => [
        'algorithm' => PASSWORD_ARGON2ID,
        'options' => [
            'memory_cost' => 65536,
            'time_cost' => 4,
            'threads' => 3
        ],
        'min_length' => 8,
        'require_uppercase' => true,
        'require_lowercase' => true,
        'require_numbers' => true,
        'require_special' => false
    ],

    'rate_limiting' => [
        'enabled' => true,
        'requests_per_minute' => 60,
        'ban_duration' => 900, // 15 minutes
        'whitelist' => []
    ],

    'input_validation' => [
        'max_string_length' => 1000,
        'allowed_html_tags' => '<p><br><strong><em><a>',
        'sanitize_filename' => true
    ]
];
