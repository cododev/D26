<?php

/**
 * Database Configuration
 *
 * Database connection settings and query builder configuration
 */

return [
    'default' => getenv('DB_CONNECTION') ?: 'mysql',

    'connections' => [
        'mysql' => [
            'driver' => 'mysql',
            'host' => getenv('DB_HOST') ?: 'localhost',
            'port' => getenv('DB_PORT') ?: 3306,
            'database' => getenv('DB_DATABASE') ?: '',
            'username' => getenv('DB_USERNAME') ?: '',
            'password' => getenv('DB_PASSWORD') ?: '',
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'options' => [
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                \PDO::ATTR_EMULATE_PREPARES => false,
                1002 => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ]
        ]
    ],

    'migrations' => [
        'table' => 'migrations',
        'path' => 'database/migrations'
    ]
];
