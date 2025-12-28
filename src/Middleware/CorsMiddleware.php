<?php

namespace DeediX\Middleware;

use DeediX\Bootstrap;

/**
 * CORS Middleware
 *
 * Handles Cross-Origin Resource Sharing
 */

class CorsMiddleware
{
    public static function handle()
    {
        $corsConfig = Bootstrap::config('cors');

        if (!$corsConfig['enabled']) {
            return;
        }

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Check if origin is allowed
        if (in_array($origin, $corsConfig['allowed_origins']) || in_array('*', $corsConfig['allowed_origins'])) {
            header("Access-Control-Allow-Origin: $origin");
        }

        header('Access-Control-Allow-Methods: ' . implode(', ', $corsConfig['allowed_methods']));
        header('Access-Control-Allow-Headers: ' . implode(', ', $corsConfig['allowed_headers']));

        if (!empty($corsConfig['exposed_headers'])) {
            header('Access-Control-Expose-Headers: ' . implode(', ', $corsConfig['exposed_headers']));
        }

        header('Access-Control-Max-Age: ' . $corsConfig['max_age']);

        if ($corsConfig['supports_credentials']) {
            header('Access-Control-Allow-Credentials: true');
        }

        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
