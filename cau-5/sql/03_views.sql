-- VIEWS FOR COMMON QUERIES

-- Current Inventory Summary
CREATE OR REPLACE VIEW v_inventory_summary AS
SELECT 
    i.inventory_id,
    p.product_code,
    p.product_name,
    p.product_type,
    b.batch_number,
    b.manufacture_date,
    b.expiry_date,
    CASE 
        WHEN b.expiry_date < CURRENT_DATE THEN 'EXPIRED'
        WHEN b.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'EXPIRING_SOON'
        ELSE 'VALID'
    END as expiry_status,
    w.warehouse_code,
    w.warehouse_name,
    sl.location_code,
    i.quantity,
    i.reserved_quantity,
    i.available_quantity,
    i.unit_of_measure,
    i.last_updated
FROM inventory i
JOIN products p ON i.product_id = p.product_id
JOIN batches b ON i.batch_id = b.batch_id
JOIN warehouses w ON i.warehouse_id = w.warehouse_id
LEFT JOIN storage_locations sl ON i.location_id = sl.location_id
WHERE i.quantity > 0;

-- Stock Levels by Product
CREATE OR REPLACE VIEW v_stock_levels AS
SELECT 
    p.product_id,
    p.product_code,
    p.product_name,
    p.product_type,
    p.unit_of_measure,
    COALESCE(SUM(i.quantity), 0) as total_quantity,
    COALESCE(SUM(i.reserved_quantity), 0) as total_reserved,
    COALESCE(SUM(i.available_quantity), 0) as total_available,
    p.min_stock_level,
    p.max_stock_level,
    p.reorder_point,
    CASE 
        WHEN COALESCE(SUM(i.available_quantity), 0) <= p.reorder_point THEN 'REORDER'
        WHEN COALESCE(SUM(i.available_quantity), 0) < p.min_stock_level THEN 'LOW'
        WHEN COALESCE(SUM(i.available_quantity), 0) > p.max_stock_level THEN 'OVERSTOCK'
        ELSE 'NORMAL'
    END as stock_status
FROM products p
LEFT JOIN inventory i ON p.product_id = i.product_id
WHERE p.is_active = true
GROUP BY p.product_id, p.product_code, p.product_name, p.product_type, 
         p.unit_of_measure, p.min_stock_level, p.max_stock_level, p.reorder_point;

-- Expiring Batches
CREATE OR REPLACE VIEW v_expiring_batches AS
SELECT 
    b.batch_id,
    b.batch_number,
    p.product_code,
    p.product_name,
    b.manufacture_date,
    b.expiry_date,
    b.expiry_date - CURRENT_DATE as days_until_expiry,
    SUM(i.quantity) as total_quantity,
    b.unit_of_measure,
    b.status
FROM batches b
JOIN products p ON b.product_id = p.product_id
LEFT JOIN inventory i ON b.batch_id = i.batch_id
WHERE b.expiry_date <= CURRENT_DATE + INTERVAL '60 days'
  AND b.status = 'AVAILABLE'
GROUP BY b.batch_id, b.batch_number, p.product_code, p.product_name, 
         b.manufacture_date, b.expiry_date, b.unit_of_measure, b.status
ORDER BY b.expiry_date;

-- Warehouse Utilization
CREATE OR REPLACE VIEW v_warehouse_utilization AS
SELECT 
    w.warehouse_id,
    w.warehouse_code,
    w.warehouse_name,
    w.warehouse_type,
    w.capacity_m3,
    COALESCE(SUM(i.quantity * p.unit_volume_m3), 0) as used_volume_m3,
    CASE 
        WHEN w.capacity_m3 > 0 THEN 
            ROUND((COALESCE(SUM(i.quantity * p.unit_volume_m3), 0) / w.capacity_m3 * 100)::numeric, 2)
        ELSE 0
    END as utilization_percentage,
    COUNT(DISTINCT i.product_id) as product_count,
    COUNT(DISTINCT i.batch_id) as batch_count
FROM warehouses w
LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
LEFT JOIN products p ON i.product_id = p.product_id
WHERE w.is_active = true
GROUP BY w.warehouse_id, w.warehouse_code, w.warehouse_name, w.warehouse_type, w.capacity_m3;
