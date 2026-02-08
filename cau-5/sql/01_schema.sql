-- WAREHOUSE MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Phase 1: Core Tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Factories/Plants
CREATE TABLE factories (
    factory_id SERIAL PRIMARY KEY,
    factory_code VARCHAR(20) UNIQUE NOT NULL,
    factory_name VARCHAR(200) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouses
CREATE TABLE warehouses (
    warehouse_id SERIAL PRIMARY KEY,
    warehouse_code VARCHAR(20) UNIQUE NOT NULL,
    warehouse_name VARCHAR(200) NOT NULL,
    warehouse_type VARCHAR(50) NOT NULL,
    factory_id INTEGER REFERENCES factories(factory_id),
    capacity_m3 DECIMAL(12,2),
    temperature_min DECIMAL(5,2),
    temperature_max DECIMAL(5,2),
    humidity_min DECIMAL(5,2),
    humidity_max DECIMAL(5,2),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Storage Locations
CREATE TABLE storage_locations (
    location_id SERIAL PRIMARY KEY,
    location_code VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id),
    parent_location_id INTEGER REFERENCES storage_locations(location_id),
    location_type VARCHAR(20) NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    capacity_m3 DECIMAL(10,2),
    max_weight_kg DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Categories
CREATE TABLE product_categories (
    category_id SERIAL PRIMARY KEY,
    category_code VARCHAR(20) UNIQUE NOT NULL,
    category_name VARCHAR(200) NOT NULL,
    parent_category_id INTEGER REFERENCES product_categories(category_id),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(300) NOT NULL,
    product_type VARCHAR(20) NOT NULL,
    category_id INTEGER REFERENCES product_categories(category_id),
    unit_of_measure VARCHAR(20) NOT NULL,
    unit_weight_kg DECIMAL(10,3),
    unit_volume_m3 DECIMAL(10,6),
    shelf_life_days INTEGER,
    min_stock_level DECIMAL(12,2),
    max_stock_level DECIMAL(12,2),
    reorder_point DECIMAL(12,2),
    storage_temperature_min DECIMAL(5,2),
    storage_temperature_max DECIMAL(5,2),
    barcode VARCHAR(100),
    qr_code VARCHAR(200),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Production Lines
CREATE TABLE production_lines (
    line_id SERIAL PRIMARY KEY,
    line_code VARCHAR(20) UNIQUE NOT NULL,
    line_name VARCHAR(200) NOT NULL,
    factory_id INTEGER NOT NULL REFERENCES factories(factory_id),
    capacity_per_hour DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bill of Materials Headers
CREATE TABLE bom_headers (
    bom_id SERIAL PRIMARY KEY,
    bom_code VARCHAR(50) UNIQUE NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    version VARCHAR(20) NOT NULL,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, version)
);

-- Bill of Materials Details
CREATE TABLE bom_details (
    bom_detail_id SERIAL PRIMARY KEY,
    bom_id INTEGER NOT NULL REFERENCES bom_headers(bom_id) ON DELETE CASCADE,
    material_product_id INTEGER NOT NULL REFERENCES products(product_id),
    quantity DECIMAL(12,4) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    scrap_percentage DECIMAL(5,2) DEFAULT 0,
    sequence_no INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Production Orders
CREATE TABLE production_orders (
    order_id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    bom_id INTEGER REFERENCES bom_headers(bom_id),
    line_id INTEGER REFERENCES production_lines(line_id),
    planned_quantity DECIMAL(12,2) NOT NULL,
    actual_quantity DECIMAL(12,2),
    unit_of_measure VARCHAR(20) NOT NULL,
    planned_start_date TIMESTAMP NOT NULL,
    planned_end_date TIMESTAMP NOT NULL,
    actual_start_date TIMESTAMP,
    actual_end_date TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    priority INTEGER DEFAULT 5,
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Batches/Lots
CREATE TABLE batches (
    batch_id SERIAL PRIMARY KEY,
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    production_order_id INTEGER REFERENCES production_orders(order_id),
    manufacture_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    quality_status VARCHAR(20) DEFAULT 'PENDING',
    supplier_id INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory
CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    batch_id INTEGER NOT NULL REFERENCES batches(batch_id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id),
    location_id INTEGER REFERENCES storage_locations(location_id),
    quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
    reserved_quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
    available_quantity DECIMAL(12,2) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    unit_of_measure VARCHAR(20) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, batch_id, warehouse_id, location_id)
);

-- Inbound Receipts
CREATE TABLE inbound_receipts (
    receipt_id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    receipt_type VARCHAR(20) NOT NULL,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id),
    supplier_id INTEGER,
    production_order_id INTEGER REFERENCES production_orders(order_id),
    reference_number VARCHAR(100),
    receipt_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',
    total_items INTEGER,
    notes TEXT,
    received_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inbound_receipt_details (
    receipt_detail_id SERIAL PRIMARY KEY,
    receipt_id INTEGER NOT NULL REFERENCES inbound_receipts(receipt_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    batch_id INTEGER REFERENCES batches(batch_id),
    location_id INTEGER REFERENCES storage_locations(location_id),
    quantity DECIMAL(12,2) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    unit_price DECIMAL(15,2),
    line_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Outbound Shipments
CREATE TABLE outbound_shipments (
    shipment_id SERIAL PRIMARY KEY,
    shipment_number VARCHAR(50) UNIQUE NOT NULL,
    shipment_type VARCHAR(20) NOT NULL,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id),
    customer_id INTEGER,
    destination_warehouse_id INTEGER REFERENCES warehouses(warehouse_id),
    reference_number VARCHAR(100),
    shipment_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',
    total_items INTEGER,
    notes TEXT,
    shipped_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE outbound_shipment_details (
    shipment_detail_id SERIAL PRIMARY KEY,
    shipment_id INTEGER NOT NULL REFERENCES outbound_shipments(shipment_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    batch_id INTEGER REFERENCES batches(batch_id),
    location_id INTEGER REFERENCES storage_locations(location_id),
    quantity DECIMAL(12,2) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    unit_price DECIMAL(15,2),
    line_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Transactions
CREATE TABLE inventory_transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    batch_id INTEGER REFERENCES batches(batch_id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id),
    location_id INTEGER REFERENCES storage_locations(location_id),
    quantity DECIMAL(12,2) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    reference_type VARCHAR(50),
    reference_id INTEGER,
    transaction_date TIMESTAMP NOT NULL,
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_warehouses_factory ON warehouses(factory_id);
CREATE INDEX idx_locations_warehouse ON storage_locations(warehouse_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_batches_product ON batches(product_id);
CREATE INDEX idx_batches_expiry ON batches(expiry_date);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_production_orders_status ON production_orders(status);
CREATE INDEX idx_inbound_receipts_warehouse ON inbound_receipts(warehouse_id);
CREATE INDEX idx_outbound_shipments_warehouse ON outbound_shipments(warehouse_id);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(transaction_date);
