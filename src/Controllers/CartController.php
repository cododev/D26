<?php

namespace DeediX\Controllers;

use DeediX\Models\Cart;
use DeediX\Models\Product;

/**
 * Cart Controller
 *
 * Handles shopping cart operations
 */

class CartController extends Controller
{
    private $cartModel;
    private $productModel;

    public function __construct()
    {
        $this->cartModel = new Cart();
        $this->productModel = new Product();
    }

    /**
     * Get cart items
     * GET /api/v1/cart
     */
    public function index()
    {
        $this->requireAuth();

        try {
            $userId = $this->getCurrentUser();
            $cart = $this->cartModel->getUserCart($userId);

            $this->success($cart);

        } catch (\Exception $e) {
            error_log("CartController::index - " . $e->getMessage());
            $this->error('Failed to fetch cart', 500);
        }
    }

    /**
     * Add item to cart
     * POST /api/v1/cart
     */
    public function store()
    {
        $this->requireAuth();

        try {
            $data = $this->getJsonInput();
            $this->validateRequired($data, ['product_id', 'quantity']);

            $userId = $this->getCurrentUser();
            $productId = (int)$data['product_id'];
            $quantity = (int)$data['quantity'];

            if ($quantity < 1) {
                $this->error('Quantity must be at least 1', 400);
            }

            // Verify product exists and has stock
            if (!$this->productModel->hasStock($productId, $quantity)) {
                $this->error('Insufficient stock', 400);
            }

            $this->cartModel->addItem($userId, $productId, $quantity);

            $this->success([], 'Item added to cart', 201);

        } catch (\Exception $e) {
            error_log("CartController::store - " . $e->getMessage());
            $this->error('Failed to add item to cart', 500);
        }
    }

    /**
     * Update cart item quantity
     * PUT /api/v1/cart
     */
    public function update()
    {
        $this->requireAuth();

        try {
            $data = $this->getJsonInput();
            $this->validateRequired($data, ['cart_id', 'quantity']);

            $userId = $this->getCurrentUser();
            $cartId = (int)$data['cart_id'];
            $quantity = (int)$data['quantity'];

            if ($quantity < 0) {
                $this->error('Quantity must be 0 or greater', 400);
            }

            $result = $this->cartModel->updateQuantity($cartId, $userId, $quantity);

            if (!$result) {
                $this->error('Cart item not found', 404);
            }

            $message = $quantity === 0 ? 'Item removed from cart' : 'Cart updated';
            $this->success([], $message);

        } catch (\Exception $e) {
            error_log("CartController::update - " . $e->getMessage());
            $this->error('Failed to update cart', 500);
        }
    }

    /**
     * Remove item from cart
     * DELETE /api/v1/cart
     */
    public function destroy()
    {
        $this->requireAuth();

        try {
            $cartId = (int)$this->getQuery('id');

            if (!$cartId) {
                $this->error('Cart ID is required', 400);
            }

            $userId = $this->getCurrentUser();
            $result = $this->cartModel->removeItem($cartId, $userId);

            if (!$result) {
                $this->error('Cart item not found', 404);
            }

            $this->success([], 'Item removed from cart');

        } catch (\Exception $e) {
            error_log("CartController::destroy - " . $e->getMessage());
            $this->error('Failed to remove item from cart', 500);
        }
    }

    /**
     * Clear entire cart
     * DELETE /api/v1/cart/clear
     */
    public function clear()
    {
        $this->requireAuth();

        try {
            $userId = $this->getCurrentUser();
            $this->cartModel->clearCart($userId);

            $this->success([], 'Cart cleared');

        } catch (\Exception $e) {
            error_log("CartController::clear - " . $e->getMessage());
            $this->error('Failed to clear cart', 500);
        }
    }
}
