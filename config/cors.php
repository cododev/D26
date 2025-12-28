<?php

/**
 * CORS Configuration
 *
 * Cross-Origin Resource Sharing settings
 */

return [
    'enabled' => true,

    'allowed_origins' => explode(',', getenv('CORS_ALLOWED_ORIGINS') ?: 'http://localhost:8000,https://deedixtech.com'),

    'allowed_methods' => explode(',', getenv('CORS_ALLOWED_METHODS') ?: 'GET,POST,PUT,DELETE,OPTIONS'),

    'allowed_headers' => explode(',', getenv('CORS_ALLOWED_HEADERS') ?: 'Content-Type,Authorization,X-Requested-With,X-CSRF-TOKEN'),

    'exposed_headers' => ['X-Total-Count', 'X-Page-Count'],

    'max_age' => 86400, // 24 hours

    'supports_credentials' => true
];
