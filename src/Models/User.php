<?php

namespace DeediX\Models;

use DeediX\Bootstrap;

/**
 * User Model
 *
 * Handles user authentication and account management
 */

class User extends Model
{
    protected $table = 'users';
    protected $primaryKey = 'id';

    protected $fillable = [
        'email',
        'password_hash',
        'first_name',
        'last_name',
        'phone',
        'role',
        'is_active'
    ];

    protected $hidden = ['password_hash'];

    /**
     * Create new user with hashed password
     */
    public function register(array $data)
    {
        // Hash password
        $passwordConfig = Bootstrap::config('security.password');
        $data['password_hash'] = password_hash(
            $data['password'],
            $passwordConfig['algorithm'],
            $passwordConfig['options']
        );

        unset($data['password']);

        return $this->create($data);
    }

    /**
     * Verify user credentials
     */
    public function authenticate($email, $password)
    {
        $user = $this->whereFirst('email', $email);

        if (!$user) {
            return false;
        }

        if (!$user['is_active']) {
            return false;
        }

        if (!password_verify($password, $user['password_hash'])) {
            return false;
        }

        // Check if password needs rehashing (algorithm updated)
        $passwordConfig = Bootstrap::config('security.password');
        if (password_needs_rehash($user['password_hash'], $passwordConfig['algorithm'], $passwordConfig['options'])) {
            $newHash = password_hash($password, $passwordConfig['algorithm'], $passwordConfig['options']);
            $this->update($user['id'], ['password_hash' => $newHash]);
        }

        return $this->hideFields($user);
    }

    /**
     * Check if email exists
     */
    public function emailExists($email)
    {
        return $this->whereFirst('email', $email) !== false;
    }

    /**
     * Get user by ID (without password)
     */
    public function findSecure($id)
    {
        $user = $this->find($id);
        return $user ? $this->hideFields($user) : null;
    }

    /**
     * Update user profile
     */
    public function updateProfile($id, array $data)
    {
        // Remove sensitive fields
        unset($data['password_hash'], $data['is_active'], $data['email']);

        return $this->update($id, $data);
    }

    /**
     * Change user password
     */
    public function changePassword($id, $currentPassword, $newPassword)
    {
        $user = $this->find($id);

        if (!$user) {
            return false;
        }

        // Verify current password
        if (!password_verify($currentPassword, $user['password_hash'])) {
            return false;
        }

        // Hash new password
        $passwordConfig = Bootstrap::config('security.password');
        $newHash = password_hash($newPassword, $passwordConfig['algorithm'], $passwordConfig['options']);

        return $this->update($id, ['password_hash' => $newHash]);
    }

    /**
     * Deactivate user account
     */
    public function deactivate($id)
    {
        return $this->update($id, ['is_active' => 0]);
    }

    /**
     * Activate user account
     */
    public function activate($id)
    {
        return $this->update($id, ['is_active' => 1]);
    }

    /**
     * Get all users (without password hashes)
     */
    public function all($limit = null, $offset = 0)
    {
        $users = parent::all($limit, $offset);

        if (!$users) {
            return [];
        }

        // Hide password hash from all users
        return array_map(function($user) {
            return $this->hideFields($user);
        }, $users);
    }
}
