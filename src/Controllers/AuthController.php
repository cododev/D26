<?php

namespace DeediX\Controllers;

use DeediX\Models\User;
use DeediX\Validators\UserValidator;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 * Authentication Controller - JWT Version
 *
 * Handles user registration, login with JWT tokens
 */

class AuthController extends Controller
{
    private $userModel;
    private $secretKey = 'your-super-secret-jwt-key-change-this-now-2025'; // CHANGE THIS IN PRODUCTION!
    private $algo = 'HS256';
    private $expire = 604800; // 7 days in seconds

    public function __construct()
    {
        $this->userModel = new User();
    }

    /**
     * Register new user
     * POST /api/v1/auth/register
     */
    public function register()
    {
        try {
            $data = $this->getJsonInput();

            // Validate input
            $validator = new UserValidator($data);
            $sanitizedData = $validator->validateRegistration();

            if ($validator->fails()) {
                $this->error('Validation failed', 422, $validator->errors());
            }

            // Check if email already exists
            if ($this->userModel->emailExists($sanitizedData['email'])) {
                $this->error('Email already registered', 409);
            }

            // Create user (role defaults to 'customer' in DB)
            $userId = $this->userModel->register($sanitizedData);

            // Fetch the newly created user to get role
            $user = $this->userModel->findSecure($userId);

            // Generate JWT
            $payload = [
                'iss' => 'http://localhost', // Change to your domain in production
                'aud' => 'http://localhost',
                'iat' => time(),
                'exp' => time() + $this->expire,
                'user_id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role'] ?? 'customer'
            ];

            $jwt = JWT::encode($payload, $this->secretKey, $this->algo);

            $this->success([
                'token' => $jwt,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['first_name'] . ' ' . $user['last_name'],
                    'role' => $user['role'] ?? 'customer'
                ]
            ], 'Registration successful', 201);

        } catch (\Exception $e) {
            error_log("AuthController::register - " . $e->getMessage());
            $this->error('Registration failed', 500);
        }
    }

    /**
     * User login
     * POST /api/v1/auth/login
     */
    public function login()
    {
        try {
            $data = $this->getJsonInput();

            // Validate input
            $validator = new UserValidator($data);
            $sanitizedData = $validator->validateLogin();

            if ($validator->fails()) {
                $this->error('Validation failed', 422, $validator->errors());
            }

            // Authenticate user
            $user = $this->userModel->authenticate($sanitizedData['email'], $data['password']);

            if (!$user) {
                $this->error('Invalid email or password', 401);
            }

            // Generate JWT
            $payload = [
                'iss' => 'http://localhost',
                'aud' => 'http://localhost',
                'iat' => time(),
                'exp' => time() + $this->expire,
                'user_id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role'] ?? 'customer'
            ];

            $jwt = JWT::encode($payload, $this->secretKey, $this->algo);

            $this->success([
                'token' => $jwt,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['first_name'] . ' ' . $user['last_name'],
                    'phone' => $user['phone'] ?? null,
                    'role' => $user['role'] ?? 'customer'
                ]
            ], 'Login successful');

        } catch (\Exception $e) {
            error_log("AuthController::login - " . $e->getMessage());
            $this->error('Login failed', 500);
        }
    }

    /**
     * User logout - JWT is stateless, so just frontend clears token
     * POST /api/v1/auth/logout
     */
    public function logout()
    {
        $this->success([], 'Logged out successfully (clear token on client)');
    }

    /**
     * Check authentication status via JWT
     * GET /api/v1/auth/check
     */
    public function check()
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $this->success(['authenticated' => false]);
            return;
        }

        $jwt = $matches[1];

        try {
            $decoded = JWT::decode($jwt, new Key($this->secretKey, $this->algo));

            $this->success([
                'authenticated' => true,
                'user_id' => $decoded->user_id,
                'email' => $decoded->email,
                'role' => $decoded->role ?? 'customer'
            ]);
        } catch (\Exception $e) {
            $this->success(['authenticated' => false]);
        }
    }

    /**
     * Get current user profile (protected route)
     * GET /api/v1/auth/me
     */
    public function me()
    {
        $user = $this->getAuthenticatedUser();

        if (!$user) {
            $this->error('Unauthorized', 401);
            return;
        }

        $this->success($user);
    }

    /**
     * Helper: Get authenticated user from JWT
     */
    private function getAuthenticatedUser()
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return null;
        }

        $jwt = $matches[1];

        try {
            $decoded = JWT::decode($jwt, new Key($this->secretKey, $this->algo));
            return $this->userModel->findSecure($decoded->user_id);
        } catch (\Exception $e) {
            return null;
        }
    }
}