<?php

namespace DeediX\Models;

/**
 * Product Model
 *
 * Handles all product-related database operations
 */

class Product extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'id';

    protected $fillable = [
        'category_id',
        'subcategory_id',
        'sku',
        'name',
        'slug',
        'short_description',
        'full_description',
        'price',
        'compare_price',
        'stock',
        'rating',
        'reviews_count',
        'is_featured',
        'is_popular',
        'is_new',
        'is_active'
    ];

    /**
     * Get products with category and subcategory info
     */
    public function getAllWithDetails($filters = [], $page = 1, $limit = 20)
    {
        $where = ["p.is_active = 1"];
        $params = [];

        // Build WHERE clauses from filters
        if (!empty($filters['category'])) {
            $where[] = "c.slug = ?";
            $params[] = $filters['category'];
        }

        if (!empty($filters['subcategory'])) {
            $where[] = "s.slug = ?";
            $params[] = $filters['subcategory'];
        }

        if (!empty($filters['search'])) {
            $where[] = "MATCH(p.name, p.short_description, p.full_description) AGAINST (? IN NATURAL LANGUAGE MODE)";
            $params[] = $filters['search'];
        }

        if (!empty($filters['featured'])) {
            $where[] = "p.is_featured = 1";
        }

        if (!empty($filters['popular'])) {
            $where[] = "p.is_popular = 1";
        }

        if (!empty($filters['new'])) {
            $where[] = "p.is_new = 1";
        }

        $whereClause = implode(' AND ', $where);

        // Count total
        $countSql = "SELECT COUNT(*) as total
                     FROM products p
                     LEFT JOIN categories c ON p.category_id = c.id
                     LEFT JOIN subcategories s ON p.subcategory_id = s.id
                     WHERE $whereClause";

        $totalResult = $this->db->fetchOne($countSql, $params);
        $total = $totalResult['total'] ?? 0;

        // Get products
        $offset = ($page - 1) * $limit;
        $sql = "SELECT
                p.id,
                p.sku,
                p.name,
                p.slug,
                p.short_description,
                p.price,
                p.compare_price,
                p.stock,
                p.rating,
                p.reviews_count,
                p.is_featured,
                p.is_popular,
                p.is_new,
                c.name as category_name,
                c.slug as category_slug,
                s.name as subcategory_name,
                s.slug as subcategory_slug,
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN subcategories s ON p.subcategory_id = s.id
            WHERE $whereClause
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?";

        $params[] = $limit;
        $params[] = $offset;

        $products = $this->db->fetchAll($sql, $params);

        return [
            'products' => $products,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ]
        ];
    }

    /**
     * Get single product with full details
     */
    public function getByIdWithDetails($id)
    {
        $sql = "SELECT
                p.*,
                c.name as category_name,
                c.slug as category_slug,
                s.name as subcategory_name,
                s.slug as subcategory_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN subcategories s ON p.subcategory_id = s.id
            WHERE p.id = ? AND p.is_active = 1";

        $product = $this->db->fetchOne($sql, [$id]);

        if ($product) {
            // Get all images
            $imageSql = "SELECT image_url, alt_text, is_primary
                        FROM product_images
                        WHERE product_id = ?
                        ORDER BY is_primary DESC, display_order ASC";

            $product['images'] = $this->db->fetchAll($imageSql, [$id]);
        }

        return $product;
    }

    /**
     * Get product by slug
     */
    public function getBySlug($slug)
    {
        $product = $this->whereFirst('slug', $slug);

        if ($product) {
            return $this->getByIdWithDetails($product['id']);
        }

        return null;
    }

    /**
     * Update stock quantity
     */
    public function updateStock($id, $quantity)
    {
        $sql = "UPDATE products SET stock = stock + ? WHERE id = ?";
        return $this->db->execute($sql, [$quantity, $id]);
    }

    /**
     * Check if product has sufficient stock
     */
    public function hasStock($id, $quantity)
    {
        $product = $this->find($id);
        return $product && $product['stock'] >= $quantity;
    }

    /**
     * Get featured products
     */
    public function getFeatured($limit = 8)
    {
        return $this->getAllWithDetails(['featured' => true], 1, $limit);
    }

    /**
     * Get popular products
     */
    public function getPopular($limit = 8)
    {
        return $this->getAllWithDetails(['popular' => true], 1, $limit);
    }

    /**
     * Get new arrivals
     */
    public function getNewArrivals($limit = 8)
    {
        return $this->getAllWithDetails(['new' => true], 1, $limit);
    }
}
