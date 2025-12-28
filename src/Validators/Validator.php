<?php

namespace DeediX\Validators;

/**
 * Base Validator
 *
 * Provides validation methods for input data
 */

class Validator
{
    protected $errors = [];
    protected $data = [];

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    /**
     * Check if validation passed
     */
    public function passes()
    {
        return empty($this->errors);
    }

    /**
     * Check if validation failed
     */
    public function fails()
    {
        return !$this->passes();
    }

    /**
     * Get all errors
     */
    public function errors()
    {
        return $this->errors;
    }

    /**
     * Add error message
     */
    protected function addError($field, $message)
    {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }

    /**
     * Check if field is required
     */
    protected function required($field, $message = null)
    {
        if (!isset($this->data[$field]) || trim($this->data[$field]) === '') {
            $this->addError($field, $message ?? "$field is required");
            return false;
        }
        return true;
    }

    /**
     * Validate email format
     */
    protected function email($field, $message = null)
    {
        if (isset($this->data[$field]) && !filter_var($this->data[$field], FILTER_VALIDATE_EMAIL)) {
            $this->addError($field, $message ?? "$field must be a valid email address");
            return false;
        }
        return true;
    }

    /**
     * Validate minimum length
     */
    protected function minLength($field, $length, $message = null)
    {
        if (isset($this->data[$field]) && strlen($this->data[$field]) < $length) {
            $this->addError($field, $message ?? "$field must be at least $length characters");
            return false;
        }
        return true;
    }

    /**
     * Validate maximum length
     */
    protected function maxLength($field, $length, $message = null)
    {
        if (isset($this->data[$field]) && strlen($this->data[$field]) > $length) {
            $this->addError($field, $message ?? "$field must not exceed $length characters");
            return false;
        }
        return true;
    }

    /**
     * Validate numeric value
     */
    protected function numeric($field, $message = null)
    {
        if (isset($this->data[$field]) && !is_numeric($this->data[$field])) {
            $this->addError($field, $message ?? "$field must be a number");
            return false;
        }
        return true;
    }

    /**
     * Validate integer value
     */
    protected function integer($field, $message = null)
    {
        if (isset($this->data[$field]) && !filter_var($this->data[$field], FILTER_VALIDATE_INT)) {
            $this->addError($field, $message ?? "$field must be an integer");
            return false;
        }
        return true;
    }

    /**
     * Validate minimum value
     */
    protected function min($field, $min, $message = null)
    {
        if (isset($this->data[$field]) && $this->data[$field] < $min) {
            $this->addError($field, $message ?? "$field must be at least $min");
            return false;
        }
        return true;
    }

    /**
     * Validate maximum value
     */
    protected function max($field, $max, $message = null)
    {
        if (isset($this->data[$field]) && $this->data[$field] > $max) {
            $this->addError($field, $message ?? "$field must not exceed $max");
            return false;
        }
        return true;
    }

    /**
     * Sanitize string
     */
    protected function sanitizeString($value)
    {
        return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Sanitize email
     */
    protected function sanitizeEmail($value)
    {
        return filter_var(trim($value), FILTER_SANITIZE_EMAIL);
    }

    /**
     * Sanitize integer
     */
    protected function sanitizeInt($value)
    {
        return filter_var($value, FILTER_SANITIZE_NUMBER_INT);
    }

    /**
     * Sanitize float
     */
    protected function sanitizeFloat($value)
    {
        return filter_var($value, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    }
}
