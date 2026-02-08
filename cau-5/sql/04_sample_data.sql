-- SAMPLE DATA

-- Factories
INSERT INTO factories (factory_code, factory_name, address, phone, email) VALUES
('VNM-HN', 'Vinamilk Ha Noi', 'Khu CN Sai Dong, Long Bien, Ha Noi', '024-3872-6666', 'hanoi@vinamilk.com.vn'),
('VNM-HCM', 'Vinamilk Ho Chi Minh', 'Tan Thuan EPZ, District 7, HCMC', '028-3771-3333', 'hcm@vinamilk.com.vn'),
('VNM-DN', 'Vinamilk Da Nang', 'Hoa Khanh Industrial Zone, Da Nang', '0236-3650-888', 'danang@vinamilk.com.vn');

-- Warehouses
INSERT INTO warehouses (warehouse_code, warehouse_name, warehouse_type, factory_id, capacity_m3, temperature_min, temperature_max) VALUES
('WH-RM-HN01', 'Raw Material Warehouse HN', 'RAW_MATERIAL', 1, 5000, 2, 8),
('WH-SF-HN01', 'Semi-Finished Warehouse HN', 'SEMI_FINISHED', 1, 3000, 2, 8),
('WH-FG-HN01', 'Finished Goods Warehouse HN', 'FINISHED', 1, 8000, 2, 8),
('WH-RM-HCM01', 'Raw Material Warehouse HCM', 'RAW_MATERIAL', 2, 7000, 2, 8),
('WH-FG-HCM01', 'Finished Goods Warehouse HCM', 'FINISHED', 2, 10000, 2, 8);

-- Storage Locations
INSERT INTO storage_locations (location_code, warehouse_id, location_type, location_name, capacity_m3) VALUES
('WH-RM-HN01-Z01', 1, 'ZONE', 'Zone A - Cold Storage', 2000),
('WH-RM-HN01-Z01-R01', 1, 'RACK', 'Rack A1', 500),
('WH-RM-HN01-Z01-R02', 1, 'RACK', 'Rack A2', 500),
('WH-FG-HN01-Z01', 3, 'ZONE', 'Zone A - Milk Products', 3000),
('WH-FG-HN01-Z02', 3, 'ZONE', 'Zone B - Yogurt Products', 2500);

-- Product Categories
INSERT INTO product_categories (category_code, category_name, description) VALUES
('RM', 'Raw Materials', 'Raw materials for production'),
('RM-MILK', 'Fresh Milk', 'Fresh milk from farms'),
('RM-SUGAR', 'Sugar', 'Sugar and sweeteners'),
('SF', 'Semi-Finished', 'Semi-finished products'),
('FG', 'Finished Goods', 'Finished products ready for sale'),
('FG-MILK', 'Packaged Milk', 'Packaged milk products'),
('FG-YOGURT', 'Yogurt', 'Yogurt products');

-- Products - Raw Materials
INSERT INTO products (product_code, product_name, product_type, category_id, unit_of_measure, unit_weight_kg, unit_volume_m3, shelf_life_days, min_stock_level, max_stock_level, reorder_point, storage_temperature_min, storage_temperature_max) VALUES
('RM-MILK-001', 'Fresh Cow Milk', 'RAW_MATERIAL', 2, 'LITER', 1.03, 0.001, 3, 5000, 20000, 8000, 2, 6),
('RM-SUGAR-001', 'White Sugar', 'RAW_MATERIAL', 3, 'KG', 1, 0.0008, 365, 2000, 10000, 3000, 15, 25),
('RM-CULTURE-001', 'Yogurt Culture', 'RAW_MATERIAL', 2, 'KG', 1, 0.001, 90, 100, 500, 150, -18, -15);

-- Products - Semi-Finished
INSERT INTO products (product_code, product_name, product_type, category_id, unit_of_measure, unit_weight_kg, unit_volume_m3, shelf_life_days, min_stock_level, max_stock_level, reorder_point, storage_temperature_min, storage_temperature_max) VALUES
('SF-MILK-001', 'Pasteurized Milk Bulk', 'SEMI_FINISHED', 4, 'LITER', 1.03, 0.001, 7, 3000, 15000, 5000, 2, 6),
('SF-YOGURT-001', 'Yogurt Base', 'SEMI_FINISHED', 4, 'LITER', 1.1, 0.001, 14, 2000, 10000, 3000, 2, 6);

-- Products - Finished Goods
INSERT INTO products (product_code, product_name, product_type, category_id, unit_of_measure, unit_weight_kg, unit_volume_m3, shelf_life_days, min_stock_level, max_stock_level, reorder_point, storage_temperature_min, storage_temperature_max, barcode) VALUES
('FG-MILK-180ML', 'Vinamilk Fresh Milk 180ml', 'FINISHED', 6, 'BOX', 0.19, 0.00018, 7, 10000, 100000, 20000, 2, 6, '8934673100001'),
('FG-MILK-1L', 'Vinamilk Fresh Milk 1L', 'FINISHED', 6, 'BOX', 1.05, 0.001, 7, 5000, 50000, 10000, 2, 6, '8934673100002'),
('FG-YOGURT-100G', 'Vinamilk Yogurt 100g', 'FINISHED', 7, 'CUP', 0.11, 0.0001, 21, 15000, 150000, 30000, 2, 6, '8934673200001'),
('FG-YOGURT-4PACK', 'Vinamilk Yogurt 4-Pack', 'FINISHED', 7, 'PACK', 0.44, 0.0004, 21, 8000, 80000, 15000, 2, 6, '8934673200002');

-- Production Lines
INSERT INTO production_lines (line_code, line_name, factory_id, capacity_per_hour) VALUES
('LINE-HN-MILK-01', 'Milk Packaging Line 1', 1, 5000),
('LINE-HN-MILK-02', 'Milk Packaging Line 2', 1, 5000),
('LINE-HN-YOGURT-01', 'Yogurt Production Line 1', 1, 8000),
('LINE-HCM-MILK-01', 'Milk Packaging Line 1', 2, 7000);
