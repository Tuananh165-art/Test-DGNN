-- BOM for Finished Milk 180ml
INSERT INTO bom_headers (bom_code, product_id, version, effective_date, is_active) VALUES
('BOM-FG-MILK-180ML-V1', 6, 'V1.0', '2024-01-01', true);

INSERT INTO bom_details (bom_id, material_product_id, quantity, unit_of_measure, sequence_no) VALUES
(1, 4, 0.18, 'LITER', 1),
(1, 2, 0.015, 'KG', 2);

-- BOM for Yogurt 100g
INSERT INTO bom_headers (bom_code, product_id, version, effective_date, is_active) VALUES
('BOM-FG-YOGURT-100G-V1', 8, 'V1.0', '2024-01-01', true);

INSERT INTO bom_details (bom_id, material_product_id, quantity, unit_of_measure, sequence_no) VALUES
(2, 5, 0.095, 'LITER', 1),
(2, 3, 0.002, 'KG', 2);

-- Batches for Raw Materials
INSERT INTO batches (batch_number, product_id, manufacture_date, expiry_date, quantity, unit_of_measure, status, quality_status) VALUES
('BATCH-RM-MILK-20240115', 1, '2024-01-15', '2024-01-18', 10000, 'LITER', 'AVAILABLE', 'APPROVED'),
('BATCH-RM-MILK-20240116', 1, '2024-01-16', '2024-01-19', 12000, 'LITER', 'AVAILABLE', 'APPROVED'),
('BATCH-RM-SUGAR-20231201', 2, '2023-12-01', '2024-12-01', 5000, 'KG', 'AVAILABLE', 'APPROVED'),
('BATCH-RM-CULTURE-20231115', 3, '2023-11-15', '2024-02-13', 200, 'KG', 'AVAILABLE', 'APPROVED');

-- Production Orders
INSERT INTO production_orders (order_number, product_id, bom_id, line_id, planned_quantity, actual_quantity, unit_of_measure, planned_start_date, planned_end_date, actual_start_date, actual_end_date, status, priority, created_by) VALUES
('PO-20240115-001', 6, 1, 1, 20000, 19800, 'BOX', '2024-01-15 08:00:00', '2024-01-15 12:00:00', '2024-01-15 08:15:00', '2024-01-15 12:10:00', 'COMPLETED', 1, 'system'),
('PO-20240116-001', 8, 2, 3, 30000, 29500, 'CUP', '2024-01-16 08:00:00', '2024-01-16 12:00:00', '2024-01-16 08:10:00', '2024-01-16 12:05:00', 'COMPLETED', 1, 'system'),
('PO-20240117-001', 6, 1, 1, 25000, NULL, 'BOX', '2024-01-17 08:00:00', '2024-01-17 13:00:00', NULL, NULL, 'PLANNED', 2, 'system');

-- Batches for Finished Goods
INSERT INTO batches (batch_number, product_id, production_order_id, manufacture_date, expiry_date, quantity, unit_of_measure, status, quality_status) VALUES
('BATCH-FG-MILK180-20240115', 6, 1, '2024-01-15', '2024-01-22', 19800, 'BOX', 'AVAILABLE', 'APPROVED'),
('BATCH-FG-YOGURT100-20240116', 8, 2, '2024-01-16', '2024-02-06', 29500, 'CUP', 'AVAILABLE', 'APPROVED');

-- Inventory - Raw Materials
INSERT INTO inventory (product_id, batch_id, warehouse_id, location_id, quantity, reserved_quantity, unit_of_measure) VALUES
(1, 1, 1, 1, 8000, 2000, 'LITER'),
(1, 2, 1, 1, 12000, 0, 'LITER'),
(2, 3, 1, 2, 4500, 500, 'KG'),
(3, 4, 1, 2, 180, 20, 'KG');

-- Inventory - Finished Goods
INSERT INTO inventory (product_id, batch_id, warehouse_id, location_id, quantity, reserved_quantity, unit_of_measure) VALUES
(6, 5, 3, 4, 15000, 3000, 'BOX'),
(8, 6, 3, 5, 25000, 5000, 'CUP');

-- Inbound Receipts
INSERT INTO inbound_receipts (receipt_number, receipt_type, warehouse_id, production_order_id, receipt_date, status, total_items, received_by) VALUES
('IR-20240115-001', 'PRODUCTION', 3, 1, '2024-01-15 12:30:00', 'COMPLETED', 1, 'John Doe'),
('IR-20240116-001', 'PRODUCTION', 3, 2, '2024-01-16 12:30:00', 'COMPLETED', 1, 'Jane Smith');

INSERT INTO inbound_receipt_details (receipt_id, product_id, batch_id, location_id, quantity, unit_of_measure, line_number) VALUES
(1, 6, 5, 4, 19800, 'BOX', 1),
(2, 8, 6, 5, 29500, 'CUP', 1);

-- Outbound Shipments
INSERT INTO outbound_shipments (shipment_number, shipment_type, warehouse_id, reference_number, shipment_date, status, total_items, shipped_by) VALUES
('OS-20240116-001', 'SALES', 3, 'SO-2024-001', '2024-01-16 14:00:00', 'SHIPPED', 2, 'Mike Johnson');

INSERT INTO outbound_shipment_details (shipment_id, product_id, batch_id, location_id, quantity, unit_of_measure, unit_price, line_number) VALUES
(1, 6, 5, 4, 4800, 'BOX', 15000, 1),
(1, 8, 6, 5, 4500, 'CUP', 8000, 2);

-- Inventory Transactions
INSERT INTO inventory_transactions (transaction_number, transaction_type, product_id, batch_id, warehouse_id, location_id, quantity, unit_of_measure, reference_type, reference_id, transaction_date, created_by) VALUES
('TXN-20240115-001', 'INBOUND', 6, 5, 3, 4, 19800, 'BOX', 'RECEIPT', 1, '2024-01-15 12:30:00', 'system'),
('TXN-20240116-001', 'INBOUND', 8, 6, 3, 5, 29500, 'CUP', 'RECEIPT', 2, '2024-01-16 12:30:00', 'system'),
('TXN-20240116-002', 'OUTBOUND', 6, 5, 3, 4, -4800, 'BOX', 'SHIPMENT', 1, '2024-01-16 14:00:00', 'system'),
('TXN-20240116-003', 'OUTBOUND', 8, 6, 3, 5, -4500, 'CUP', 'SHIPMENT', 1, '2024-01-16 14:00:00', 'system');
