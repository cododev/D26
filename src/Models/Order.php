<?php

namespace DeediX\Models;

/**
 * Order Model
 *
 * Handles order creation and management
 */

class Order extends Model
{
    protected $table = 'orders';
    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'order_number',
        'customer_email',
        'customer_name',
        'customer_phone',
        'shipping_address',
        'shipping_city',
        'shipping_state',
        'shipping_country',
        'shipping_zip',
        'payment_method',
        'status',
        'total',
        'tracking_number',
        'notes'
    ];

    /**
     * Create order with items
     */
    public function createOrder(array $orderData, array $items)
    {
        $this->db->beginTransaction();

        try {
            // Generate unique order number
            $orderData['order_number'] = $this->generateOrderNumber();

            // Create order
            $orderId = $this->create($orderData);

            // Insert order items
            $itemModel = new OrderItem();
            foreach ($items as $item) {
                $item['order_id'] = $orderId;
                $itemModel->create($item);

                // Update product stock
                $productModel = new Product();
                $productModel->updateStock($item['product_id'], -$item['quantity']);
            }

            // Add initial status history
            $this->addStatusHistory($orderId, 'pending', 'Order placed');

            $this->db->commit();

            return $orderId;

        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Get order with items and status history
     */
    public function getOrderDetails($orderNumber)
    {
        $sql = "SELECT * FROM orders WHERE order_number = ?";
        $order = $this->db->fetchOne($sql, [$orderNumber]);

        if (!$order) {
            return null;
        }

        // Get order items
        $itemsSql = "SELECT * FROM order_items WHERE order_id = ?";
        $order['items'] = $this->db->fetchAll($itemsSql, [$order['id']]);

        // Get status history
        $historySql = "SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC";
        $order['status_history'] = $this->db->fetchAll($historySql, [$order['id']]);

        return $order;
    }

    /**
     * Get orders by user ID
     */
    public function getUserOrders($userId)
    {
        $sql = "SELECT
                o.*,
                COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC";

        return $this->db->fetchAll($sql, [$userId]);
    }

    /**
     * Get orders by email
     */
    public function getOrdersByEmail($email)
    {
        $sql = "SELECT
                o.*,
                COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.customer_email = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC";

        return $this->db->fetchAll($sql, [$email]);
    }

    /**
     * Update order status
     */
    public function updateStatus($orderId, $status, $notes = '')
    {
        $this->update($orderId, ['status' => $status]);
        $this->addStatusHistory($orderId, $status, $notes);

        return true;
    }

    /**
     * Add status history entry
     */
    private function addStatusHistory($orderId, $status, $notes = '')
    {
        $sql = "INSERT INTO order_status_history (order_id, status, notes) VALUES (?, ?, ?)";
        return $this->db->execute($sql, [$orderId, $status, $notes]);
    }

    /**
     * Generate unique order number
     */
    private function generateOrderNumber()
    {
        return 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
    }

    /**
     * Get order statistics
     */
    public function getStatistics($userId = null)
    {
        $where = $userId ? "WHERE user_id = ?" : "";
        $params = $userId ? [$userId] : [];

        $sql = "SELECT
                COUNT(*) as total_orders,
                SUM(total) as total_revenue,
                AVG(total) as average_order_value,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders
            FROM orders $where";

        return $this->db->fetchOne($sql, $params);
    }

    /**
     * Get all orders with details (admin)
     */
    public function getAllWithDetails()
    {
        $sql = "SELECT
                o.id,
                o.order_number,
                o.customer_email,
                CONCAT(o.customer_first_name, ' ', o.customer_last_name) as customer_name,
                o.customer_phone,
                o.total,
                o.status,
                o.payment_status,
                o.payment_method,
                o.created_at,
                o.updated_at,
                COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.created_at DESC";

        $orders = $this->db->fetchAll($sql);

        // Get items for each order
        foreach ($orders as &$order) {
            $itemsSql = "SELECT
                    oi.*,
                    p.name as product_name,
                    p.image as product_image
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?";
            $order['items'] = $this->db->fetchAll($itemsSql, [$order['id']]);
        }

        return $orders;
    }
}
