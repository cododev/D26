<?php

namespace DeediX\Controllers;

use DeediX\Models\Order;
use DeediX\Models\Product;

/**
 * Order Controller
 *
 * Handles order creation and tracking
 */

class OrderController extends Controller
{
    private $orderModel;
    private $productModel;

    public function __construct()
    {
        $this->orderModel = new Order();
        $this->productModel = new Product();
    }

    /**
     * Create new order
     * POST /api/v1/orders
     */
    public function store()
    {
        try {
            $data = $this->getJsonInput();

            // Validate required fields
            $this->validateRequired($data, [
                'customer_email',
                'customer_name',
                'customer_phone',
                'shipping_address',
                'items'
            ]);

            if (!is_array($data['items']) || empty($data['items'])) {
                $this->error('Order must contain at least one item', 400);
            }

            // Validate items and calculate total
            $validatedItems = [];
            $total = 0;

            foreach ($data['items'] as $item) {
                if (!isset($item['product_id']) || !isset($item['quantity'])) {
                    $this->error('Invalid item structure', 400);
                }

                // Get product details
                $product = $this->productModel->find($item['product_id']);

                if (!$product) {
                    $this->error("Product ID {$item['product_id']} not found", 404);
                }

                // Check stock
                if (!$this->productModel->hasStock($item['product_id'], $item['quantity'])) {
                    $this->error("Insufficient stock for {$product['name']}", 400);
                }

                $itemTotal = $product['price'] * $item['quantity'];
                $total += $itemTotal;

                $validatedItems[] = [
                    'product_id' => $product['id'],
                    'product_name' => $product['name'],
                    'quantity' => $item['quantity'],
                    'price' => $product['price'],
                    'total' => $itemTotal
                ];
            }

            // Prepare order data
            $orderData = [
                'user_id' => $this->getCurrentUser(),
                'customer_email' => filter_var($data['customer_email'], FILTER_SANITIZE_EMAIL),
                'customer_name' => htmlspecialchars($data['customer_name']),
                'customer_phone' => htmlspecialchars($data['customer_phone']),
                'shipping_address' => htmlspecialchars($data['shipping_address']),
                'shipping_city' => htmlspecialchars($data['shipping_city'] ?? ''),
                'shipping_state' => htmlspecialchars($data['shipping_state'] ?? ''),
                'shipping_country' => htmlspecialchars($data['shipping_country'] ?? 'Nigeria'),
                'shipping_zip' => htmlspecialchars($data['shipping_zip'] ?? ''),
                'payment_method' => htmlspecialchars($data['payment_method'] ?? 'cash_on_delivery'),
                'status' => 'pending',
                'total' => $total
            ];

            // Create order
            $orderId = $this->orderModel->createOrder($orderData, $validatedItems);

            // Get order details
            $order = $this->orderModel->find($orderId);

            $this->success([
                'order_id' => $orderId,
                'order_number' => $order['order_number'],
                'total' => $total,
                'status' => 'pending',
                'items' => $validatedItems
            ], 'Order created successfully', 201);

        } catch (\Exception $e) {
            error_log("OrderController::store - " . $e->getMessage());
            $this->error('Order creation failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Track order
     * GET /api/v1/orders/track
     */
    public function track()
    {
        try {
            $orderNumber = $this->getQuery('number');
            $email = $this->getQuery('email');

            if ($orderNumber) {
                // Track specific order
                $order = $this->orderModel->getOrderDetails($orderNumber);

                if (!$order) {
                    $this->error('Order not found', 404);
                }

                $this->success($order);

            } elseif ($email) {
                // Get all orders for email
                $orders = $this->orderModel->getOrdersByEmail($email);

                $this->success([
                    'orders' => $orders,
                    'total_orders' => count($orders)
                ]);

            } else {
                $this->error('Order number or email is required', 400);
            }

        } catch (\Exception $e) {
            error_log("OrderController::track - " . $e->getMessage());
            $this->error('Failed to track order', 500);
        }
    }

    /**
     * Get user's orders
     * GET /api/v1/orders
     */
    public function index()
    {
        $this->requireAuth();

        try {
            $userId = $this->getCurrentUser();
            $orders = $this->orderModel->getUserOrders($userId);

            $this->success(['orders' => $orders]);

        } catch (\Exception $e) {
            error_log("OrderController::index - " . $e->getMessage());
            $this->error('Failed to fetch orders', 500);
        }
    }
}
