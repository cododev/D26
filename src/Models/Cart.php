<?php

namespace DeediX\Models;

/**
 * Cart Model
 *
 * Handles shopping cart operations
 */

class Cart extends Model
{
    protected $table = 'cart';
    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'product_id',
        'quantity'
    ];

    /**
     * Get cart items for user with product details
     */
    public function getUserCart($userId)
    {
        $sql = "SELECT
                c.id,
                c.product_id,
                c.quantity,
                c.created_at,
                p.name as product_name,
                p.slug as product_slug,
                p.price,
                p.stock,
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image,
                (c.quantity * p.price) as subtotal
            FROM cart c
            INNER JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ? AND p.is_active = 1
            ORDER BY c.created_at DESC";

        $items = $this->db->fetchAll($sql, [$userId]);

        $total = 0;
        foreach ($items as $item) {
            $total += $item['subtotal'];
        }

        return [
            'items' => $items,
            'total' => $total,
            'item_count' => count($items)
        ];
    }

    /**
     * Add item to cart
     */
    public function addItem($userId, $productId, $quantity)
    {
        // Check if item already exists
        $existing = $this->db->fetchOne(
            "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
            [$userId, $productId]
        );

        if ($existing) {
            // Update quantity
            return $this->update($existing['id'], [
                'quantity' => $existing['quantity'] + $quantity
            ]);
        }

        // Add new item
        return $this->create([
            'user_id' => $userId,
            'product_id' => $productId,
            'quantity' => $quantity
        ]);
    }

    /**
     * Update item quantity
     */
    public function updateQuantity($cartId, $userId, $quantity)
    {
        // Verify cart item belongs to user
        $item = $this->db->fetchOne(
            "SELECT * FROM cart WHERE id = ? AND user_id = ?",
            [$cartId, $userId]
        );

        if (!$item) {
            return false;
        }

        if ($quantity <= 0) {
            return $this->delete($cartId);
        }

        return $this->update($cartId, ['quantity' => $quantity]);
    }

    /**
     * Remove item from cart
     */
    public function removeItem($cartId, $userId)
    {
        // Verify cart item belongs to user
        $item = $this->db->fetchOne(
            "SELECT * FROM cart WHERE id = ? AND user_id = ?",
            [$cartId, $userId]
        );

        if (!$item) {
            return false;
        }

        return $this->delete($cartId);
    }

    /**
     * Clear user's cart
     */
    public function clearCart($userId)
    {
        $sql = "DELETE FROM cart WHERE user_id = ?";
        return $this->db->execute($sql, [$userId]);
    }

    /**
     * Get cart item count for user
     */
    public function getItemCount($userId)
    {
        $sql = "SELECT SUM(quantity) as count FROM cart WHERE user_id = ?";
        $result = $this->db->fetchOne($sql, [$userId]);
        return $result['count'] ?? 0;
    }
}
