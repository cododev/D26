<?php

namespace DeediX\Validators;

use DeediX\Bootstrap;

/**
 * User Validator
 *
 * Validates user registration and login data
 */

class UserValidator extends Validator
{
    /**
     * Validate registration data
     */
    public function validateRegistration()
    {
        // Required fields
        $this->required('email');
        $this->required('password');
        $this->required('first_name');
        $this->required('last_name');

        // Email validation
        if ($this->email('email')) {
            $this->data['email'] = $this->sanitizeEmail($this->data['email']);
        }

        // Password validation
        if ($this->required('password')) {
            $passwordConfig = Bootstrap::config('security.password');

            $this->minLength('password', $passwordConfig['min_length'] ?? 8);

            $password = $this->data['password'];

            if ($passwordConfig['require_uppercase'] ?? true) {
                if (!preg_match('/[A-Z]/', $password)) {
                    $this->addError('password', 'Password must contain at least one uppercase letter');
                }
            }

            if ($passwordConfig['require_lowercase'] ?? true) {
                if (!preg_match('/[a-z]/', $password)) {
                    $this->addError('password', 'Password must contain at least one lowercase letter');
                }
            }

            if ($passwordConfig['require_numbers'] ?? true) {
                if (!preg_match('/[0-9]/', $password)) {
                    $this->addError('password', 'Password must contain at least one number');
                }
            }

            if ($passwordConfig['require_special'] ?? false) {
                if (!preg_match('/[^A-Za-z0-9]/', $password)) {
                    $this->addError('password', 'Password must contain at least one special character');
                }
            }
        }

        // Name validation
        if (isset($this->data['first_name'])) {
            $this->maxLength('first_name', 100);
            $this->data['first_name'] = $this->sanitizeString($this->data['first_name']);
        }

        if (isset($this->data['last_name'])) {
            $this->maxLength('last_name', 100);
            $this->data['last_name'] = $this->sanitizeString($this->data['last_name']);
        }

        // Phone validation (optional)
        if (isset($this->data['phone']) && !empty($this->data['phone'])) {
            $this->maxLength('phone', 20);
            $this->data['phone'] = $this->sanitizeString($this->data['phone']);
        }

        return $this->data;
    }

    /**
     * Validate login data
     * Accepts both 'email' and 'username' fields (username is treated as email)
     */
    public function validateLogin()
    {
        // Accept either 'email' or 'username' field
        if (isset($this->data['username']) && !isset($this->data['email'])) {
            $this->data['email'] = $this->data['username'];
            unset($this->data['username']);
        }

        $this->required('email');
        $this->required('password');

        if ($this->email('email')) {
            $this->data['email'] = $this->sanitizeEmail($this->data['email']);
        }

        return $this->data;
    }

    /**
     * Validate profile update
     */
    public function validateProfileUpdate()
    {
        if (isset($this->data['first_name'])) {
            $this->maxLength('first_name', 100);
            $this->data['first_name'] = $this->sanitizeString($this->data['first_name']);
        }

        if (isset($this->data['last_name'])) {
            $this->maxLength('last_name', 100);
            $this->data['last_name'] = $this->sanitizeString($this->data['last_name']);
        }

        if (isset($this->data['phone'])) {
            $this->maxLength('phone', 20);
            $this->data['phone'] = $this->sanitizeString($this->data['phone']);
        }

        return $this->data;
    }
}
