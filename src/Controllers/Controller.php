<?php

namespace DeediX\Controllers;

/**
 * Base Controller
 *
 * Provides common methods for all controllers
 */

abstract class Controller
{
    /**
     * Send JSON response
     */
    protected function json($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    /**
     * Send success response
     */
    protected function success($data = [], $message = 'Success', $statusCode = 200)
    {
        $this->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }

    /**
     * Send error response
     */
    protected function error($message, $statusCode = 400, $errors = [])
    {
        $response = [
            'success' => false,
            'message' => $message
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        $this->json($response, $statusCode);
    }

    /**
     * Get request body as JSON
     */
    protected function getJsonInput()
    {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }

    /**
     * Get request method
     */
    protected function getMethod()
    {
        return $_SERVER['REQUEST_METHOD'];
    }

    /**
     * Get query parameters
     */
    protected function getQuery($key = null, $default = null)
    {
        if ($key === null) {
            return $_GET;
        }

        return $_GET[$key] ?? $default;
    }

    /**
     * Get current user from session
     */
    protected function getCurrentUser()
    {
        return $_SESSION['user_id'] ?? null;
    }

    /**
     * Check if user is authenticated
     */
    protected function isAuthenticated()
    {
        return isset($_SESSION['user_id']);
    }

    /**
     * Require authentication
     */
    protected function requireAuth()
    {
        if (!$this->isAuthenticated()) {
            $this->error('Authentication required', 401);
        }
    }

    /**
     * Validate required fields
     */
    protected function validateRequired(array $data, array $required)
    {
        $missing = [];

        foreach ($required as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                $missing[] = $field;
            }
        }

        if (!empty($missing)) {
            $this->error('Missing required fields: ' . implode(', ', $missing), 400);
        }
    }

    /**
     * Check if admin is authenticated
     */
    protected function isAdminAuthenticated()
    {
        return isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
    }

    /**
     * Require admin authentication
     */
    protected function requireAdminAuth()
    {
        if (!$this->isAdminAuthenticated()) {
            $this->error('Admin authentication required', 401);
        }
    }
}
