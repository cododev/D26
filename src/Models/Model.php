<?php

namespace DeediX\Models;

use DeediX\Database\Connection;

/**
 * Base Model Class
 *
 * Provides common database operations for all models
 */

abstract class Model
{
    protected $db;
    protected $table;
    protected $primaryKey = 'id';
    protected $fillable = [];
    protected $guarded = [];
    protected $hidden = [];

    public function __construct()
    {
        $this->db = Connection::getInstance();
    }

    /**
     * Find record by ID
     */
    public function find($id)
    {
        $sql = "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ? LIMIT 1";
        return $this->db->fetchOne($sql, [$id]);
    }

    /**
     * Find all records
     */
    public function all($limit = null, $offset = 0)
    {
        $sql = "SELECT * FROM {$this->table}";

        if ($limit) {
            $sql .= " LIMIT ? OFFSET ?";
            return $this->db->fetchAll($sql, [$limit, $offset]);
        }

        return $this->db->fetchAll($sql);
    }

    /**
     * Find records with WHERE clause
     */
    public function where($column, $operator, $value = null)
    {
        if ($value === null) {
            $value = $operator;
            $operator = '=';
        }

        $sql = "SELECT * FROM {$this->table} WHERE {$column} {$operator} ?";
        return $this->db->fetchAll($sql, [$value]);
    }

    /**
     * Find first record matching WHERE clause
     */
    public function whereFirst($column, $operator, $value = null)
    {
        if ($value === null) {
            $value = $operator;
            $operator = '=';
        }

        $sql = "SELECT * FROM {$this->table} WHERE {$column} {$operator} ? LIMIT 1";
        return $this->db->fetchOne($sql, [$value]);
    }

    /**
     * Insert new record
     */
    public function create(array $data)
    {
        $data = $this->filterFillable($data);

        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));

        $sql = "INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders})";

        $this->db->execute($sql, array_values($data));

        return $this->db->lastInsertId();
    }

    /**
     * Update existing record
     */
    public function update($id, array $data)
    {
        $data = $this->filterFillable($data);

        $sets = [];
        foreach (array_keys($data) as $column) {
            $sets[] = "{$column} = ?";
        }

        $sql = "UPDATE {$this->table} SET " . implode(', ', $sets) . " WHERE {$this->primaryKey} = ?";

        $params = array_values($data);
        $params[] = $id;

        return $this->db->execute($sql, $params);
    }

    /**
     * Delete record
     */
    public function delete($id)
    {
        $sql = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = ?";
        return $this->db->execute($sql, [$id]);
    }

    /**
     * Count total records
     */
    public function count($where = null, $params = [])
    {
        $sql = "SELECT COUNT(*) as total FROM {$this->table}";

        if ($where) {
            $sql .= " WHERE {$where}";
        }

        $result = $this->db->fetchOne($sql, $params);
        return $result['total'] ?? 0;
    }

    /**
     * Filter data based on fillable/guarded fields
     */
    protected function filterFillable(array $data)
    {
        if (!empty($this->fillable)) {
            return array_intersect_key($data, array_flip($this->fillable));
        }

        if (!empty($this->guarded)) {
            return array_diff_key($data, array_flip($this->guarded));
        }

        return $data;
    }

    /**
     * Hide sensitive fields from output
     */
    public function hideFields(array $data)
    {
        if (empty($this->hidden)) {
            return $data;
        }

        return array_diff_key($data, array_flip($this->hidden));
    }

    /**
     * Execute raw SQL query
     */
    public function raw($sql, $params = [])
    {
        return $this->db->query($sql, $params);
    }
}
