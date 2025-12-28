<?php

namespace DeediX\Models;

/**
 * Admin Model
 *
 * Handles admin user operations
 */
class Admin extends Model
{
    protected $table = 'admins';

    /**
     * Authenticate admin
     */
    public function authenticate($username, $password)
    {
        $sql = "SELECT * FROM {$this->table}
                WHERE (username = ? OR email = ?)
                AND is_active = 1
                LIMIT 1";

        $admin = $this->db->fetchOne($sql, [$username, $username]);

        if ($admin && password_verify($password, $admin['password_hash'])) {
            // Update last login
            $updateSql = "UPDATE {$this->table} SET last_login = NOW() WHERE id = ?";
            $this->db->execute($updateSql, [$admin['id']]);

            return $admin;
        }

        return false;
    }

    /**
     * Find admin by ID
     */
    public function findSecure($id)
    {
        $sql = "SELECT id, username, email, full_name, role, created_at, last_login, is_active
                FROM {$this->table}
                WHERE id = ?
                LIMIT 1";

        return $this->db->fetchOne($sql, [$id]);
    }

    /**
     * Check if username exists
     */
    public function usernameExists($username)
    {
        $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE username = ?";
        $result = $this->db->fetchOne($sql, [$username]);

        return $result['count'] > 0;
    }

    /**
     * Check if email exists
     */
    public function emailExists($email)
    {
        $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE email = ?";
        $result = $this->db->fetchOne($sql, [$email]);

        return $result['count'] > 0;
    }
}
