<?php

/**
 * PSR-4 Autoloader
 *
 * Automatically loads classes based on namespace and directory structure
 */

spl_autoload_register(function ($class) {
    // Project namespace prefix
    $prefix = 'DeediX\\';

    // Base directory for the namespace prefix
    $baseDir = __DIR__ . '/';

    // Check if the class uses the namespace prefix
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    // Get the relative class name
    $relativeClass = substr($class, $len);

    // Replace namespace separators with directory separators
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    // If the file exists, require it
    if (file_exists($file)) {
        require $file;
    }
});
