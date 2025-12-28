<?php

namespace DeediX\Controllers;

use DeediX\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Exception;

/**
 * Admin Controller - JWT Version
 *
 * Handles admin dashboard data and user management (customers & admins)
 */
class AdminController extends Controller
{
    private $userModel;
    private $secretKey = 'your-super-secret-jwt-key-change-this-now-2025'; // CHANGE IN PRODUCTION!
    private $algo = 'HS256';

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function login()
    {
        $authController = new \DeediX\Controllers\AuthController();
        $authController->login();
    }

    /**
     * Check admin authentication status
     * GET /api/v1/admin/check
     */
    public function check()
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $this->success([
                'authenticated' => false,
                'message' => 'No token provided'
            ]);
            return;
        }

        $jwt = $matches[1];

        try {
            $decoded = JWT::decode($jwt, new Key($this->secretKey, $this->algo));

            if ($decoded->role !== 'admin') {
                $this->success([
                    'authenticated' => false,
                    'message' => 'Not an admin user'
                ]);
                return;
            }

            // Get full admin details
            $admin = $this->userModel->findSecure($decoded->user_id);

            $this->success([
                'authenticated' => true,
                'admin' => [
                    'id' => $admin['id'],
                    'email' => $admin['email'],
                    'name' => ($admin['first_name'] ?? '') . ' ' . ($admin['last_name'] ?? ''),
                    'role' => $admin['role']
                ]
            ]);

        } catch (ExpiredException $e) {
            $this->success([
                'authenticated' => false,
                'message' => 'Token expired'
            ]);
        } catch (SignatureInvalidException $e) {
            $this->success([
                'authenticated' => false,
                'message' => 'Invalid token signature'
            ]);
        } catch (Exception $e) {
            $this->success([
                'authenticated' => false,
                'message' => 'Invalid token'
            ]);
        }
    }

    /**
     * Get dashboard products
     * GET /api/v1/admin/products
     */
    public function getProducts()
    {
        $this->requireAdmin();

        try {
            $productModel = new \DeediX\Models\Product();
            $products = $productModel->all();

            $this->success($products);
        } catch (Exception $e) {
            error_log("AdminController::getProducts - " . $e->getMessage());
            $this->error('Failed to fetch products', 500);
        }
    }

    /**
     * Get categories and subcategories
     * GET /api/v1/admin/categories
     */
    public function getCategories()
    {
        $this->requireAdmin();

        try {
            $db = \DeediX\Database\Connection::getInstance();

            $categories = $db->fetchAll("SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order, name");
            $subcategories = $db->fetchAll("SELECT * FROM subcategories WHERE is_active = 1 ORDER BY display_order, name");

            $this->success([
                'categories' => $categories,
                'subcategories' => $subcategories
            ]);
        } catch (Exception $e) {
            error_log("AdminController::getCategories - " . $e->getMessage());
            $this->error('Failed to fetch categories', 500);
        }
    }

    /**
     * Get all orders
     * GET /api/v1/admin/orders
     */
    public function getOrders()
    {
        $this->requireAdmin();

        try {
            $orderModel = new \DeediX\Models\Order();
            $orders = $orderModel->getAllWithDetails();

            $this->success($orders);
        } catch (Exception $e) {
            error_log("AdminController::getOrders - " . $e->getMessage());
            $this->error('Failed to fetch orders', 500);
        }
    }

    /**
     * Update order status
     * PUT /api/v1/admin/orders/{id}/status
     */
    public function updateOrderStatus($orderId)
    {
        $this->requireAdmin();

        try {
            $data = $this->getJsonInput();

            if (empty($data['status'])) {
                $this->error('Status is required', 422);
            }

            $orderModel = new \DeediX\Models\Order();
            $updated = $orderModel->updateStatus($orderId, $data['status']);

            if ($updated) {
                $this->success([], 'Order status updated successfully');
            } else {
                $this->error('Order not found or status invalid', 404);
            }
        } catch (Exception $e) {
            error_log("AdminController::updateOrderStatus - " . $e->getMessage());
            $this->error('Failed to update order status', 500);
        }
    }

    /**
     * Get all customers and admins
     * GET /api/v1/admin/users/all
     */
    public function getAllUsers()
    {
        $this->requireAdmin();

        try {
            $db = \DeediX\Database\Connection::getInstance();

            $customers = $db->fetchAll("
                SELECT id, first_name, last_name, CONCAT(first_name, ' ', last_name) as name, email, phone, created_at,
                       (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as total_orders
                FROM users
                WHERE role = 'customer' OR role IS NULL
                ORDER BY created_at DESC
            ");

            $this->success($customers);
        } catch (Exception $e) {
            error_log("AdminController::getAllUsers - " . $e->getMessage());
            $this->error('Failed to fetch users', 500);
        }
    }

    /**
     * Get all admin users
     * GET /api/v1/admin/users/admin
     */
    public function getAdmins()
    {
        $this->requireAdmin();

        try {
            $db = \DeediX\Database\Connection::getInstance();

            $admins = $db->fetchAll("
                SELECT id, first_name, last_name, CONCAT(first_name, ' ', last_name) as name, email, phone, created_at
                FROM users
                WHERE role = 'admin'
                ORDER BY created_at DESC
            ");

            $this->success($admins);
        } catch (Exception $e) {
            error_log("AdminController::getAdmins - " . $e->getMessage());
            $this->error('Failed to fetch admins', 500);
        }
    }

    /**
     * Create new admin user
     * POST /api/v1/admin/users/admin
     */
    public function createAdmin()
    {
        $this->requireAdmin();

        try {
            $data = $this->getJsonInput();

            if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
                $this->error('Name, email, and password are required', 422);
            }

            if ($this->userModel->emailExists($data['email'])) {
                $this->error('Email already registered', 409);
            }

            $nameParts = explode(' ', trim($data['name']), 2);
            $firstName = $nameParts[0];
            $lastName = $nameParts[1] ?? '';

            $adminData = [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'], // register() will hash it
                'role' => 'admin'
            ];

            $adminId = $this->userModel->register($adminData);

            $this->success(['id' => $adminId], 'Admin created successfully', 201);

        } catch (Exception $e) {
            error_log("AdminController::createAdmin - " . $e->getMessage());
            $this->error('Failed to create admin', 500);
        }
    }

    /**
     * Delete admin user (cannot delete self)
     * DELETE /api/v1/admin/users/admin/{id}
     */
    public function deleteAdmin($adminId)
    {
        $this->requireAdmin();

        try {
            $currentUser = $_SERVER['current_user'] ?? null;
            if (!$currentUser || $currentUser->user_id == $adminId) {
                $this->error('Cannot delete your own account', 403);
            }

            $admin = $this->userModel->findSecure($adminId);
            if (!$admin || $admin['role'] !== 'admin') {
                $this->error('Admin not found', 404);
            }

            $deleted = $this->userModel->delete($adminId);

            if ($deleted) {
                $this->success([], 'Admin deleted successfully');
            } else {
                $this->error('Failed to delete admin', 500);
            }

        } catch (Exception $e) {
            error_log("AdminController::deleteAdmin - " . $e->getMessage());
            $this->error('Failed to delete admin', 500);
        }
    }

    /**
     * Reset admin password
     * PUT /api/v1/admin/users/admin/{id}/password
     */
    public function resetAdminPassword($adminId)
    {
        $this->requireAdmin();

        try {
            $data = $this->getJsonInput();

            if (empty($data['new_password'])) {
                $this->error('New password is required', 422);
            }

            if (strlen($data['new_password']) < 6) {
                $this->error('Password must be at least 6 characters', 422);
            }

            $currentUser = $_SERVER['current_user'] ?? null;
            if ($currentUser && $currentUser->user_id == $adminId) {
                $this->error('Use profile settings to change your own password', 403);
            }

            $admin = $this->userModel->findSecure($adminId);
            if (!$admin || $admin['role'] !== 'admin') {
                $this->error('Admin not found', 404);
            }

            $hashedPassword = password_hash($data['new_password'], PASSWORD_DEFAULT);
            $updated = $this->userModel->updatePassword($adminId, $hashedPassword);

            if ($updated) {
                $this->success([], 'Password reset successfully');
            } else {
                $this->error('Failed to reset password', 500);
            }

        } catch (Exception $e) {
            error_log("AdminController::resetAdminPassword - " . $e->getMessage());
            $this->error('Failed to reset password', 500);
        }
    }

    /**
     * Delete product
     * DELETE /api/v1/admin/products/{id}
     */
    public function deleteProduct($productId)
    {
        $this->requireAdmin();

        try {
            $productModel = new \DeediX\Models\Product();
            $deleted = $productModel->delete($productId);

            if ($deleted) {
                $this->success([], 'Product deleted successfully');
            } else {
                $this->error('Product not found', 404);
            }
        } catch (Exception $e) {
            error_log("AdminController::deleteProduct - " . $e->getMessage());
            $this->error('Failed to delete product', 500);
        }
    }

    /**
     * Upload product image
     * POST /api/v1/admin/upload-image
     */
    public function uploadImage()
    {
        $this->requireAdmin();

        try {
            if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                $this->error('No image uploaded', 422);
            }

            $file = $_FILES['image'];
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            $maxSize = 5 * 1024 * 1024;

            if (!in_array($file['type'], $allowedTypes)) {
                $this->error('Invalid image type', 422);
            }

            if ($file['size'] > $maxSize) {
                $this->error('Image too large (max 5MB)', 422);
            }

            $uploadDir = __DIR__ . '/../../public/images/products';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'product_' . uniqid() . '_' . time() . '.' . $extension;
            $uploadPath = $uploadDir . '/' . $filename;

            if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
                $this->error('Failed to save image', 500);
            }

            $imageUrl = '../images/products/' . $filename;

            $this->success([
                'url' => $imageUrl,
                'filename' => $filename
            ], 'Image uploaded successfully');

        } catch (Exception $e) {
            error_log("AdminController::uploadImage - " . $e->getMessage());
            $this->error('Upload failed', 500);
        }
    }

    /**
     * Require admin role from JWT
     */
    private function requireAdmin()
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $this->error('No token provided', 401);
        }

        $jwt = $matches[1];

        try {
            $decoded = JWT::decode($jwt, new Key($this->secretKey, $this->algo));

            if ($decoded->role !== 'admin') {
                $this->error('Admin access required', 403);
            }

            $_SERVER['current_user'] = $decoded;

        } catch (ExpiredException $e) {
            $this->error('Token expired', 401);
        } catch (SignatureInvalidException $e) {
            $this->error('Invalid token signature', 401);
        } catch (Exception $e) {
            $this->error('Invalid token', 401);
        }
    }
}