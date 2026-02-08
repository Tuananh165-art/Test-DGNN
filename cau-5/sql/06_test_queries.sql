-- TEST QUERIES

-- 1. Check inventory summary
SELECT * FROM v_inventory_summary ORDER BY product_code;

-- 2. Check stock levels and alerts
SELECT * FROM v_stock_levels ORDER BY stock_status, product_code;

-- 3. Check expiring batches
SELECT * FROM v_expiring_batches;

-- 4. Check warehouse utilization
SELECT * FROM v_warehouse_utilization ORDER BY utilization_percentage DESC;

-- 5. Get products with low stock
SELECT 
    product_code,
    product_name,
    total_available,
    reorder_point,
    stock_status
FROM v_stock_levels
WHERE stock_status IN ('LOW', 'REORDER')
ORDER BY total_available;

-- 6. Get inventory by warehouse
SELECT 
    w.warehouse_name,
    p.product_code,
    p.product_name,
    SUM(i.quantity) as total_quantity,
    SUM(i.available_quantity) as available_quantity,
    i.unit_of_measure
FROM inventory i
JOIN warehouses w ON i.warehouse_id = w.warehouse_id
JOIN products p ON i.product_id = p.product_id
GROUP BY w.warehouse_name, p.product_code, p.product_name, i.unit_of_measure
ORDER BY w.warehouse_name, p.product_code;

-- 7. Get production order history
SELECT 
    po.order_number,
    p.product_name,
    pl.line_name,
    po.planned_quantity,
    po.actual_quantity,
    po.status,
    po.planned_start_date,
    po.actual_end_date
FROM production_orders po
JOIN products p ON po.product_id = p.product_id
LEFT JOIN production_lines pl ON po.line_id = pl.line_id
ORDER BY po.planned_start_date DESC;

-- 8. Get BOM for a product
SELECT 
    bh.bom_code,
    p1.product_name as finished_product,
    p2.product_name as material,
    bd.quantity,
    bd.unit_of_measure,
    bd.scrap_percentage
FROM bom_headers bh
JOIN bom_details bd ON bh.bom_id = bd.bom_id
JOIN products p1 ON bh.product_id = p1.product_id
JOIN products p2 ON bd.material_product_id = p2.product_id
WHERE bh.is_active = true
ORDER BY bh.bom_code, bd.sequence_no;

-- 9. Get recent transactions
SELECT 
    it.transaction_number,
    it.transaction_type,
    p.product_code,
    p.product_name,
    b.batch_number,
    w.warehouse_name,
    it.quantity,
    it.unit_of_measure,
    it.transaction_date
FROM inventory_transactions it
JOIN products p ON it.product_id = p.product_id
LEFT JOIN batches b ON it.batch_id = b.batch_id
JOIN warehouses w ON it.warehouse_id = w.warehouse_id
ORDER BY it.transaction_date DESC
LIMIT 20;

-- 10. Get batch details with inventory
SELECT 
    b.batch_number,
    p.product_code,
    p.product_name,
    b.manufacture_date,
    b.expiry_date,
    b.status,
    b.quality_status,
    COALESCE(SUM(i.quantity), 0) as current_inventory,
    b.unit_of_measure
FROM batches b
JOIN products p ON b.product_id = p.product_id
LEFT JOIN inventory i ON b.batch_id = i.batch_id
GROUP BY b.batch_id, b.batch_number, p.product_code, p.product_name, 
         b.manufacture_date, b.expiry_date, b.status, b.quality_status, b.unit_of_measure
ORDER BY b.manufacture_date DESC;
