<?php

/**
 * API Entry Point v1
 */

// Load Composer autoloader (vendor in project root)
require_once __DIR__ . '/../../../vendor/autoload.php';

// Initialize Bootstrap
use DeediX\Bootstrap;

Bootstrap::init();

// Handle CORS
use DeediX\Middleware\CorsMiddleware;
CorsMiddleware::handle();

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove script path
$scriptPath = dirname($_SERVER['SCRIPT_NAME']);
$path = str_replace($scriptPath, '', $path);
$path = trim($path, '/');

// Split into segments
$segments = explode('/', $path);
$resource = $segments[0] ?? '';
$action = $segments[1] ?? null;
$param = $segments[2] ?? null;
$subParam = $segments[3] ?? null;

try {
    switch ($resource) {
        case 'products':
            $controller = new \DeediX\Controllers\ProductController();

            if ($action === 'featured') {
                $controller->featured();
            } elseif ($action === 'popular') {
                $controller->popular();
            } elseif ($action === 'new') {
                $controller->newArrivals();
            } elseif ($action === 'slug' && $param) {
                $controller->getBySlug($param);
            } elseif ($action && is_numeric($action)) {
                $controller->show($action);
            } else {
                $controller->index();
            }
            break;

        case 'auth':
            $controller = new \DeediX\Controllers\AuthController();

            switch ($action) {
                case 'register':
                    if ($method === 'POST') $controller->register();
                    break;
                case 'login':
                    if ($method === 'POST') $controller->login();
                    break;
                case 'logout':
                    if ($method === 'POST') $controller->logout();
                    break;
                case 'check':
                    if ($method === 'GET') $controller->check();
                    break;
                case 'me':
                    if ($method === 'GET') $controller->me();
                    break;
                default:
                    http_response_code(404);
                    echo json_encode(['error' => 'Auth endpoint not found']);
            }
            break;

        case 'cart':
            $controller = new \DeediX\Controllers\CartController();

            if ($action === 'clear' && $method === 'DELETE') {
                $controller->clear();
            } elseif ($method === 'GET') {
                $controller->index();
            } elseif ($method === 'POST') {
                $controller->store();
            } elseif ($method === 'PUT') {
                $controller->update();
            } elseif ($method === 'DELETE') {
                $controller->destroy();
            }
            break;

        case 'orders':
            $controller = new \DeediX\Controllers\OrderController();

            if ($action === 'track' && $method === 'GET') {
                $controller->track();
            } elseif ($method === 'GET') {
                $controller->index();
            } elseif ($method === 'POST') {
                $controller->store();
            }
            break;

        case 'admin':
            $controller = new \DeediX\Controllers\AdminController();

            if ($action === 'login' && $method === 'POST') {
                $controller->login();
            } elseif ($action === 'check' && $method === 'GET') {
                $controller->check();
            } elseif ($action === 'products') {
                if ($method === 'GET') {
                    $controller->getProducts();
                } elseif ($method === 'POST') {
                    $controller->addProduct();
                } elseif ($method === 'DELETE' && $param) {
                    $controller->deleteProduct($param);
                }
            } elseif ($action === 'categories' && $method === 'GET') {
                $controller->getCategories();
            } elseif ($action === 'orders') {
                if ($method === 'GET') {
                    $controller->getOrders();
                } elseif ($method === 'PUT' && $param && $subParam === 'status') {
                    $controller->updateOrderStatus($param);
                }
            } elseif ($action === 'users') {
                if ($param === 'all' && $method === 'GET') {
                    $controller->getAllUsers();
                } elseif ($param === 'admin') {
                    if ($method === 'GET') {
                        $controller->getAdmins();
                    } elseif ($method === 'POST') {
                        $controller->createAdmin();
                    } elseif ($method === 'DELETE' && $subParam) {
                        $controller->deleteAdmin($subParam);
                    } elseif ($method === 'PUT' && $subParam && isset($segments[4]) && $segments[4] === 'password') {
                        $controller->resetAdminPassword($subParam);
                    }
                }
            } elseif ($action === 'images' && $method === 'GET') {
                $controller->getImages();
            } elseif ($action === 'upload-image' && $method === 'POST') {
                $controller->uploadImage();
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Admin endpoint not found']);
            }
            break;

        default:
            http_response_code(404);
            echo json_encode([
                'error' => 'Resource not found',
                'available' => ['products', 'auth', 'cart', 'orders', 'admin']
            ]);
    }

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => Bootstrap::config('app.debug') ? $e->getMessage() : 'Internal server error'
    ]);
}