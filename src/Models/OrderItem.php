<?php

namespace DeediX\Models;

/**
 * Order Item Model
 *
 * Handles individual items within orders
 */

class OrderItem extends Model
{
    protected $table = 'order_items';
    protected $primaryKey = 'id';

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'quantity',
        'price',
        'total'
    ];
}
