<?php

namespace DeediX\Controllers;

use DeediX\Models\Product;

/**
 * Product Controller
 *
 * Handles product-related requests
 */

class ProductController extends Controller
{
    private $productModel;

    public function __construct()
    {
        $this->productModel = new Product();
    }

    /**
     * Get all products with filters
     * GET /api/v1/products
     */
    public function index()
    {
        try {
            $filters = [
                'category' => $this->getQuery('category'),
                'subcategory' => $this->getQuery('subcategory'),
                'search' => $this->getQuery('search'),
                'featured' => $this->getQuery('featured'),
                'popular' => $this->getQuery('popular'),
                'new' => $this->getQuery('new')
            ];

            // Remove null filters
            $filters = array_filter($filters, function($value) {
                return $value !== null;
            });

            $page = max(1, (int)$this->getQuery('page', 1));
            $limit = min(100, max(1, (int)$this->getQuery('limit', 20)));

            $result = $this->productModel->getAllWithDetails($filters, $page, $limit);

            $this->success($result);

        } catch (\Exception $e) {
            error_log("ProductController::index - " . $e->getMessage());
            $this->error('Failed to fetch products', 500);
        }
    }

    /**
     * Get single product by ID
     * GET /api/v1/products/{id}
     */
    public function show($id)
    {
        try {
            $product = $this->productModel->getByIdWithDetails($id);

            if (!$product) {
                $this->error('Product not found', 404);
            }

            $this->success($product);

        } catch (\Exception $e) {
            error_log("ProductController::show - " . $e->getMessage());
            $this->error('Failed to fetch product', 500);
        }
    }

    /**
     * Get product by slug
     * GET /api/v1/products/slug/{slug}
     */
    public function getBySlug($slug)
    {
        try {
            $product = $this->productModel->getBySlug($slug);

            if (!$product) {
                $this->error('Product not found', 404);
            }

            $this->success($product);

        } catch (\Exception $e) {
            error_log("ProductController::getBySlug - " . $e->getMessage());
            $this->error('Failed to fetch product', 500);
        }
    }

    /**
     * Get featured products
     * GET /api/v1/products/featured
     */
    public function featured()
    {
        try {
            $limit = min(50, max(1, (int)$this->getQuery('limit', 8)));
            $result = $this->productModel->getFeatured($limit);

            $this->success($result);

        } catch (\Exception $e) {
            error_log("ProductController::featured - " . $e->getMessage());
            $this->error('Failed to fetch featured products', 500);
        }
    }

    /**
     * Get popular products
     * GET /api/v1/products/popular
     */
    public function popular()
    {
        try {
            $limit = min(50, max(1, (int)$this->getQuery('limit', 8)));
            $result = $this->productModel->getPopular($limit);

            $this->success($result);

        } catch (\Exception $e) {
            error_log("ProductController::popular - " . $e->getMessage());
            $this->error('Failed to fetch popular products', 500);
        }
    }

    /**
     * Get new arrivals
     * GET /api/v1/products/new
     */
    public function newArrivals()
    {
        try {
            $limit = min(50, max(1, (int)$this->getQuery('limit', 8)));
            $result = $this->productModel->getNewArrivals($limit);

            $this->success($result);

        } catch (\Exception $e) {
            error_log("ProductController::newArrivals - " . $e->getMessage());
            $this->error('Failed to fetch new products', 500);
        }
    }
}
