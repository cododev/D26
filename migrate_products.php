<?php
/**
 * Product Migration Script
 * Migrates products from canoonstore-extracted-products.json to MySQL database
 * Properly categorizes products and extracts prices
 */

require_once __DIR__ . '/api/config/config.php';
require_once __DIR__ . '/api/config/database.php';

echo "====================================\n";
echo "DEEDIX SHOP - PRODUCT MIGRATION\n";
echo "====================================\n\n";

// Load JSON data
$json_file = __DIR__ . '/database/data/canoonstore-extracted-products.json';
if (!file_exists($json_file)) {
    die("ERROR: JSON file not found: $json_file\n");
}

echo "Loading products from JSON...\n";
$json_data = json_decode(file_get_contents($json_file), true);

if (!$json_data || !isset($json_data['categories'])) {
    die("ERROR: Invalid JSON format\n");
}

// Connect to database
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    die("ERROR: Database connection failed\n");
}

echo "Connected to database successfully!\n\n";

// Get category and subcategory IDs
echo "Fetching categories and subcategories...\n";
$categories_map = [];
$subcategories_map = [];

// Get categories
$cat_query = "SELECT id, slug FROM categories";
$cat_stmt = $db->query($cat_query);
while ($row = $cat_stmt->fetch()) {
    $categories_map[$row['slug']] = $row['id'];
}

// Get subcategories
$subcat_query = "SELECT id, slug, category_id FROM subcategories";
$subcat_stmt = $db->query($subcat_query);
while ($row = $subcat_stmt->fetch()) {
    $key = $row['category_id'] . '_' . $row['slug'];
    $subcategories_map[$key] = $row['id'];
}

echo "Found " . count($categories_map) . " categories\n";
echo "Found " . count($subcategories_map) . " subcategories\n\n";

/**
 * Determine subcategory from product name
 */
function determineSubcategory($product_name, $category_id, $subcategories_map) {
    $name_lower = strtolower($product_name);

    // Smartphones subcategories
    if ($category_id == 1) { // smartphones
        if (strpos($name_lower, 'iphone') !== false || strpos($name_lower, 'ipad') !== false) {
            return $subcategories_map['1_iphone'] ?? null;
        } elseif (strpos($name_lower, 'samsung') !== false || strpos($name_lower, 'galaxy') !== false) {
            return $subcategories_map['1_samsung'] ?? null;
        } elseif (strpos($name_lower, 'pixel') !== false) {
            return $subcategories_map['1_google-pixel'] ?? null;
        } elseif (strpos($name_lower, 'oneplus') !== false) {
            return $subcategories_map['1_oneplus'] ?? null;
        } else {
            return $subcategories_map['1_other-brands'] ?? null;
        }
    }

    // Laptops subcategories
    if ($category_id == 2) { // laptops
        if (strpos($name_lower, 'macbook') !== false) {
            return $subcategories_map['2_apple'] ?? null;
        } elseif (strpos($name_lower, 'dell') !== false) {
            return $subcategories_map['2_dell'] ?? null;
        } elseif (strpos($name_lower, 'hp ') !== false || strpos($name_lower, ' hp ') !== false) {
            return $subcategories_map['2_hp'] ?? null;
        } elseif (strpos($name_lower, 'surface') !== false) {
            return $subcategories_map['2_surface'] ?? null;
        } elseif (strpos($name_lower, 'lenovo') !== false) {
            return $subcategories_map['2_lenovo'] ?? null;
        } elseif (strpos($name_lower, 'asus') !== false) {
            return $subcategories_map['2_asus'] ?? null;
        }
    }

    // Gaming subcategories
    if ($category_id == 3) { // gaming
        if (strpos($name_lower, 'controller') !== false || strpos($name_lower, ' pad') !== false) {
            return $subcategories_map['3_controllers'] ?? null;
        } elseif (strpos($name_lower, 'headset') !== false || strpos($name_lower, 'headphone') !== false) {
            return $subcategories_map['3_headsets'] ?? null;
        } elseif (preg_match('/(ps4|ps5|xbox|nintendo)\s+(game|fifa|call|gran|god)/i', $name_lower)) {
            return $subcategories_map['3_games'] ?? null;
        } else {
            // Default to consoles for PS5, Xbox, Nintendo
            return $subcategories_map['3_consoles'] ?? null;
        }
    }

    // Accessories subcategories
    if ($category_id == 4) { // accessories
        if (strpos($name_lower, 'airpod') !== false || strpos($name_lower, 'jbl') !== false ||
            strpos($name_lower, 'bose') !== false || strpos($name_lower, 'beats') !== false ||
            strpos($name_lower, 'speaker') !== false || strpos($name_lower, 'harman') !== false) {
            return $subcategories_map['4_audio'] ?? null;
        } elseif (strpos($name_lower, 'charger') !== false || strpos($name_lower, 'cable') !== false ||
                  strpos($name_lower, 'adapter') !== false || strpos($name_lower, 'power') !== false ||
                  strpos($name_lower, 'magsafe') !== false) {
            return $subcategories_map['4_charging'] ?? null;
        } elseif (strpos($name_lower, 'case') !== false || strpos($name_lower, 'cover') !== false ||
                  strpos($name_lower, 'protector') !== false || strpos($name_lower, 'screen') !== false) {
            return $subcategories_map['4_cases'] ?? null;
        } elseif (strpos($name_lower, 'keyboard') !== false || strpos($name_lower, 'mouse') !== false) {
            return $subcategories_map['4_keyboards-mice'] ?? null;
        } else {
            return $subcategories_map['4_other'] ?? null;
        }
    }

    return null;
}

// Prepare insert statement
$insert_query = "INSERT INTO products (
    category_id,
    subcategory_id,
    sku,
    name,
    slug,
    short_description,
    full_description,
    price,
    stock,
    rating,
    reviews_count,
    is_featured,
    is_popular,
    is_new,
    is_active
) VALUES (
    :category_id,
    :subcategory_id,
    :sku,
    :name,
    :slug,
    :short_description,
    :full_description,
    :price,
    :stock,
    :rating,
    :reviews_count,
    :is_featured,
    :is_popular,
    :is_new,
    1
)";

$insert_image_query = "INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
                       VALUES (:product_id, :image_url, :alt_text, :display_order, :is_primary)";

$product_stmt = $db->prepare($insert_query);
$image_stmt = $db->prepare($insert_image_query);

$total_imported = 0;
$total_skipped = 0;
$slug_counter = []; // Track slug usage to ensure uniqueness

// Process each category
foreach ($json_data['categories'] as $category_slug => $category_data) {
    $category_id = $categories_map[$category_slug] ?? null;

    if (!$category_id) {
        echo "WARNING: Category '$category_slug' not found in database. Skipping...\n";
        continue;
    }

    echo "\nProcessing category: $category_slug\n";
    echo str_repeat('-', 50) . "\n";

    $products = $category_data['products'] ?? [];
    $count = 0;

    foreach ($products as $product) {
        try {
            // Determine subcategory
            $subcategory_id = determineSubcategory($product['name'], $category_id, $subcategories_map);

            // Generate unique slug and SKU
            $base_slug = generateSlug($product['name']);
            $slug = $base_slug;

            // Make slug unique if already exists
            if (isset($slug_counter[$base_slug])) {
                $slug_counter[$base_slug]++;
                $slug = $base_slug . '-' . $slug_counter[$base_slug];
            } else {
                $slug_counter[$base_slug] = 0;
            }

            $sku = strtoupper(substr(md5($product['id']), 0, 10));

            // Bind parameters
            $product_stmt->bindValue(':category_id', $category_id, PDO::PARAM_INT);
            $product_stmt->bindValue(':subcategory_id', $subcategory_id, PDO::PARAM_INT);
            $product_stmt->bindValue(':sku', $sku);
            $product_stmt->bindValue(':name', $product['name']);
            $product_stmt->bindValue(':slug', $slug);
            $product_stmt->bindValue(':short_description', $product['description'] ?? '');
            $product_stmt->bindValue(':full_description', $product['full_description'] ?? $product['description'] ?? '');
            $product_stmt->bindValue(':price', $product['price'] ?? 0);
            $product_stmt->bindValue(':stock', $product['stock'] ?? 0, PDO::PARAM_INT);
            $product_stmt->bindValue(':rating', $product['rating'] ?? 0.0);
            $product_stmt->bindValue(':reviews_count', $product['reviews'] ?? 0, PDO::PARAM_INT);
            $product_stmt->bindValue(':is_featured', $product['featured'] ?? false, PDO::PARAM_BOOL);
            $product_stmt->bindValue(':is_popular', $product['popular'] ?? false, PDO::PARAM_BOOL);
            $product_stmt->bindValue(':is_new', $product['new'] ?? false, PDO::PARAM_BOOL);

            // Execute
            $product_stmt->execute();
            $product_id = $db->lastInsertId();

            // Insert images
            if (!empty($product['images'])) {
                foreach ($product['images'] as $index => $image_url) {
                    // Transform image path from old structure to new structure
                    // From: "images/products/filename.jpg"
                    // To: "assets/images/products/filename.jpg"
                    $image_url = str_replace('images/products/', 'assets/images/products/', $image_url);

                    $image_stmt->bindValue(':product_id', $product_id, PDO::PARAM_INT);
                    $image_stmt->bindValue(':image_url', $image_url);
                    $image_stmt->bindValue(':alt_text', $product['name']);
                    $image_stmt->bindValue(':display_order', $index, PDO::PARAM_INT);
                    $image_stmt->bindValue(':is_primary', $index === 0 ? 1 : 0, PDO::PARAM_BOOL);
                    $image_stmt->execute();
                }
            }

            $count++;
            $total_imported++;

        } catch (PDOException $e) {
            $total_skipped++;
            echo "  ERROR: Failed to import '{$product['name']}': " . $e->getMessage() . "\n";
        }
    }

    echo "Imported: $count products\n";
}

echo "\n====================================\n";
echo "MIGRATION COMPLETE!\n";
echo "====================================\n";
echo "Total products imported: $total_imported\n";
echo "Total products skipped: $total_skipped\n";
echo "\nYou can now access your shop at:\n";
echo APP_URL . "\n\n";
?>
