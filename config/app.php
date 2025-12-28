<?php

/**
 * Application Configuration
 *
 * Loads environment variables and provides application-wide settings
 */

return [
    'name' => getenv('APP_NAME') ?: 'DeediX Shop',
    'env' => getenv('APP_ENV') ?: 'production',
    'debug' => filter_var(getenv('APP_DEBUG') ?: false, FILTER_VALIDATE_BOOLEAN),
    'url' => getenv('APP_URL') ?: 'https://deedixtech.com',
    'timezone' => getenv('APP_TIMEZONE') ?: 'Africa/Lagos',
    'key' => getenv('APP_KEY') ?: '',

    'session' => [
        'lifetime' => (int)(getenv('SESSION_LIFETIME') ?: 120),
        'secure' => filter_var(getenv('SESSION_SECURE') ?: true, FILTER_VALIDATE_BOOLEAN),
        'httponly' => filter_var(getenv('SESSION_HTTP_ONLY') ?: true, FILTER_VALIDATE_BOOLEAN),
        'samesite' => 'Strict'
    ],

    'api' => [
        'version' => getenv('API_VERSION') ?: 'v1',
        'rate_limit' => (int)(getenv('API_RATE_LIMIT') ?: 60),
        'rate_limit_window' => (int)(getenv('API_RATE_LIMIT_WINDOW') ?: 60)
    ],

    'storage' => [
        'path' => getenv('STORAGE_PATH') ?: 'storage',
        'upload_max_size' => (int)(getenv('UPLOAD_MAX_SIZE') ?: 5242880), // 5MB
        'allowed_types' => explode(',', getenv('ALLOWED_UPLOAD_TYPES') ?: 'jpg,jpeg,png,webp')
    ],

    'logging' => [
        'channel' => getenv('LOG_CHANNEL') ?: 'daily',
        'level' => getenv('LOG_LEVEL') ?: 'error',
        'max_files' => (int)(getenv('LOG_MAX_FILES') ?: 14)
    ]
];
