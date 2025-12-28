<?php

namespace DeediX;

/**
 * Application Bootstrap
 *
 * Initializes the application with minimal, secure setup for JWT-based API
 */

class Bootstrap
{
    private static $config = [];
    private static $initialized = false;

    public static function init()
    {
        if (self::$initialized) {
            return;
        }

        // Load environment variables
        self::loadEnvironment();

        // Set error reporting
        self::setupErrorHandling();

        // Load configuration
        self::loadConfig();

        // Set timezone
        $timezone = self::$config['app']['timezone'] ?? 'Africa/Lagos';
        date_default_timezone_set($timezone);

        // Set security headers
        self::setSecurityHeaders();

        self::$initialized = true;
    }

    /**
     * Load .env file
     */
    private static function loadEnvironment()
    {
        $envFile = __DIR__ . '/../.env';

        if (!file_exists($envFile)) {
            return;
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        foreach ($lines as $line) {
            $line = trim($line);

            // Skip comments and empty lines
            if (!$line || $line[0] === '#') {
                continue;
            }

            // Parse KEY=VALUE
            if (strpos($line, '=') !== false) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value, " \t\n\r\0\x0B\"'");

                putenv("$key=$value");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
    }

    /**
     * Setup error handling
     */
    private static function setupErrorHandling()
    {
        $debug = filter_var(getenv('APP_DEBUG') ?: 'false', FILTER_VALIDATE_BOOLEAN);

        if ($debug) {
            error_reporting(E_ALL);
            ini_set('display_errors', '1');
        } else {
            error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
            ini_set('display_errors', '0');
            ini_set('log_errors', '1');
            ini_set('error_log', __DIR__ . '/../storage/logs/error.log');
        }

        set_error_handler([self::class, 'errorHandler']);
        set_exception_handler([self::class, 'exceptionHandler']);
    }

    /**
     * Load config files
     */
    private static function loadConfig()
    {
        $configPath = __DIR__ . '/../config/';
        $configFiles = ['app', 'database', 'security', 'cors'];

        foreach ($configFiles as $file) {
            $filePath = $configPath . $file . '.php';
            if (file_exists($filePath)) {
                self::$config[$file] = require $filePath;
            }
        }
    }

    /**
     * Set security headers
     */
    private static function setSecurityHeaders()
    {
        $headers = self::$config['security']['headers'] ?? [
            'X-Content-Type-Options' => 'nosniff',
            'X-Frame-Options' => 'DENY',
            'X-XSS-Protection' => '1; mode=block',
            'Referrer-Policy' => 'strict-origin-when-cross-origin',
            'Permissions-Policy' => 'geolocation=(), microphone=()',
        ];

        foreach ($headers as $header => $value) {
            header("$header: $value");
        }

        // Allow CORS for localhost/frontend
        header('Access-Control-Allow-Origin: http://localhost');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');
    }

    /**
     * Get config value
     */
    public static function config($key, $default = null)
    {
        $keys = explode('.', $key);
        $value = self::$config;

        foreach ($keys as $k) {
            if (!isset($value[$k])) {
                return $default;
            }
            $value = $value[$k];
        }

        return $value;
    }

    /**
     * Error handler
     */
    public static function errorHandler($errno, $errstr, $errfile, $errline)
    {
        $message = "[$errno] $errstr in $errfile on line $errline";
        error_log($message);

        if (self::config('app.debug', false)) {
            echo "<pre>Error: $message</pre>";
        }

        return true;
    }

    /**
     * Exception handler
     */
    public static function exceptionHandler($exception)
    {
        $message = $exception->getMessage() . " in " . $exception->getFile() . " on line " . $exception->getLine();
        error_log("Uncaught Exception: $message\n" . $exception->getTraceAsString());

        http_response_code(500);

        if (self::config('app.debug', false)) {
            echo "<pre>Uncaught Exception: $message\n\n" . $exception->getTraceAsString() . "</pre>";
        } else {
            echo json_encode(['success' => false, 'message' => 'Internal server error']);
        }
    }
}