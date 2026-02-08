# Entity Relationship Diagram (ERD)

## Warehouse Management System - Database Design

### Core Entities and Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MASTER DATA LAYER                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│    FACTORIES     │
├──────────────────┤
│ PK factory_id    │
│    factory_code  │◄─────────┐
│    factory_name  │          │
│    address       │          │ 1:N
│    is_active     │          │
└──────────────────┘          │
                              │
                    ┌─────────┴──────────┐
                    │    WAREHOUSES      │
                    ├────────────────────┤
                    │ PK warehouse_id    │
                    │    warehouse_code  │◄─────────┐
                    │    warehouse_name  │          │
                    │    warehouse_type  │          │ 1:N
                    │ FK factory_id      │          │
                    │    capacity_m3     │          │
                    │    temperature_*   │          │
                    └────────────────────┘          │
                                                    │
                              ┌─────────────────────┴────────────┐
                              │    STORAGE_LOCATIONS             │
                              ├──────────────────────────────────┤
                              │ PK location_id                   │
                              │    location_code                 │
                              │ FK warehouse_id                  │
                              │ FK parent_location_id (self-ref) │
                              │    location_type                 │
                              │    capacity_m3                   │
                              └──────────────────────────────────┘


┌──────────────────────┐
│ PRODUCT_CATEGORIES   │
├──────────────────────┤
│ PK category_id       │
│    category_code     │◄─────────┐
│    category_name     │          │
│ FK parent_category_id│          │ 1:N
└──────────────────────┘          │
                                  │
                        ┌─────────┴──────────┐
                        │     PRODUCTS       │
                        ├────────────────────┤
                        │ PK product_id      │
                        │    product_code    │◄──────────┐
                        │    product_name    │           │
                        │    product_type    │           │
                        │ FK category_id     │           │
                        │    unit_of_measure │           │
                        │    shelf_life_days │           │
                        │    min_stock_level │           │
                        │    barcode         │           │
                        └────────────────────┘           │
                                 │                       │
                                 │ 1:N                   │
                                 │                       │
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION LAYER                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  PRODUCTION_LINES    │
├──────────────────────┤
│ PK line_id           │
│    line_code         │◄─────────┐
│    line_name         │          │
│ FK factory_id        │          │ 1:N
│    capacity_per_hour │          │
└──────────────────────┘          │
                                  │
                        ┌─────────┴──────────────┐
                        │  PRODUCTION_ORDERS     │
                        ├────────────────────────┤
                        │ PK order_id            │
                        │    order_number        │
                        │ FK product_id          │
                        │ FK bom_id              │
                        │ FK line_id             │
                        │    planned_quantity    │
                        │    actual_quantity     │
                        │    status              │
                        │    planned_start_date  │
                        │    actual_end_date     │
                        └────────────────────────┘
                                 │
                                 │ 1:N
                                 ▼

┌──────────────────────┐         ┌────────────────────┐
│    BOM_HEADERS       │         │     BATCHES        │
├──────────────────────┤         ├────────────────────┤
│ PK bom_id            │         │ PK batch_id        │
│    bom_code          │         │    batch_number    │◄──────┐
│ FK product_id        │         │ FK product_id      │       │
│    version           │         │ FK production_order│       │
│    effective_date    │         │    manufacture_date│       │
└──────────────────────┘         │    expiry_date     │       │
         │                       │    quantity        │       │
         │ 1:N                   │    status          │       │
         ▼                       │    quality_status  │       │
┌──────────────────────┐         └────────────────────┘       │
│    BOM_DETAILS       │                  │                   │
├──────────────────────┤                  │ 1:N               │
│ PK bom_detail_id     │                  │                   │
│ FK bom_id            │                  │                   │
│ FK material_product  │                  │                   │
│    quantity          │                  │                   │
│    unit_of_measure   │                  │                   │
│    scrap_percentage  │                  │                   │
└──────────────────────┘                  │                   │
                                          │                   │
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INVENTORY LAYER                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │                   │
                                          ▼                   │
                              ┌────────────────────┐          │
                              │    INVENTORY       │          │
                              ├────────────────────┤          │
                              │ PK inventory_id    │          │
                              │ FK product_id      │          │
                              │ FK batch_id        │──────────┘
                              │ FK warehouse_id    │
                              │ FK location_id     │
                              │    quantity        │
                              │    reserved_qty    │
                              │    available_qty   │ (computed)
                              │    last_updated    │
                              └────────────────────┘
                                       │
                                       │ Referenced by
                                       │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TRANSACTION LAYER                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌────────────────────────┐
│  INBOUND_RECEIPTS    │         │  OUTBOUND_SHIPMENTS    │
├──────────────────────┤         ├────────────────────────┤
│ PK receipt_id        │         │ PK shipment_id         │
│    receipt_number    │         │    shipment_number     │
│    receipt_type      │         │    shipment_type       │
│ FK warehouse_id      │         │ FK warehouse_id        │
│ FK production_order  │         │    customer_id         │
│    supplier_id       │         │    destination_wh_id   │
│    receipt_date      │         │    shipment_date       │
│    status            │         │    status              │
│    received_by       │         │    shipped_by          │
└──────────────────────┘         └────────────────────────┘
         │                                  │
         │ 1:N                              │ 1:N
         ▼                                  ▼
┌──────────────────────┐         ┌────────────────────────┐
│ INBOUND_RECEIPT_     │         │ OUTBOUND_SHIPMENT_     │
│      DETAILS         │         │      DETAILS           │
├──────────────────────┤         ├────────────────────────┤
│ PK receipt_detail_id │         │ PK shipment_detail_id  │
│ FK receipt_id        │         │ FK shipment_id         │
│ FK product_id        │         │ FK product_id          │
│ FK batch_id          │         │ FK batch_id            │
│ FK location_id       │         │ FK location_id         │
│    quantity          │         │    quantity            │
│    unit_of_measure   │         │    unit_of_measure     │
│    unit_price        │         │    unit_price          │
└──────────────────────┘         └────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          AUDIT TRAIL                                         │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌────────────────────────────┐
                    │  INVENTORY_TRANSACTIONS    │
                    ├────────────────────────────┤
                    │ PK transaction_id          │
                    │    transaction_number      │
                    │    transaction_type        │
                    │ FK product_id              │
                    │ FK batch_id                │
                    │ FK warehouse_id            │
                    │ FK location_id             │
                    │    quantity                │
                    │    reference_type          │
                    │    reference_id            │
                    │    transaction_date        │
                    │    created_by              │
                    └────────────────────────────┘
```

## Key Relationships

### 1. Factory → Warehouse (1:N)
- Một nhà máy có nhiều kho
- Mỗi kho thuộc về một nhà máy

### 2. Warehouse → Storage Location (1:N)
- Một kho có nhiều vị trí lưu trữ
- Vị trí lưu trữ có cấu trúc phân cấp (self-referencing)

### 3. Product → Batch (1:N)
- Một sản phẩm có nhiều lô hàng
- Mỗi lô hàng thuộc về một sản phẩm

### 4. Batch → Inventory (1:N)
- Một lô hàng có thể ở nhiều vị trí khác nhau
- Mỗi inventory record là unique combination của (product, batch, warehouse, location)

### 5. Product → BOM (1:N)
- Một sản phẩm có thể có nhiều BOM (versions)
- BOM chứa danh sách nguyên liệu (BOM Details)

### 6. Production Order → Batch (1:N)
- Một lệnh sản xuất tạo ra nhiều lô hàng
- Mỗi lô hàng có thể liên kết với một lệnh sản xuất

### 7. Transactions → Inventory (N:1)
- Mọi giao dịch đều được ghi lại trong inventory_transactions
- Transactions cập nhật inventory thông qua triggers

## Data Types & Constraints

### Primary Keys
- All tables use SERIAL or BIGSERIAL for auto-increment IDs

### Unique Constraints
- All code fields (factory_code, warehouse_code, product_code, batch_number, etc.)
- Composite unique: (product_id, batch_id, warehouse_id, location_id) in inventory

### Foreign Keys
- All relationships enforced with foreign key constraints
- ON DELETE CASCADE for detail tables
- ON DELETE RESTRICT for master data

### Check Constraints
- expiry_date > manufacture_date (enforced by trigger)
- quantity >= 0
- reserved_quantity <= quantity

### Indexes
- Primary keys (automatic)
- Foreign keys (explicit)
- Frequently queried fields (status, date, type)
- Composite indexes for common query patterns

## Computed Columns

### inventory.available_quantity
```sql
GENERATED ALWAYS AS (quantity - reserved_quantity) STORED
```

## Triggers

### 1. update_updated_at_column
- Automatically updates updated_at timestamp on record modification

### 2. check_batch_expiry
- Validates expiry_date > manufacture_date

### 3. update_inventory_on_receipt (optional)
- Automatically updates inventory when receipt is completed

### 4. update_inventory_on_shipment (optional)
- Automatically updates inventory when shipment is shipped

## Views

### v_inventory_summary
- Current inventory with expiry status
- Joins: inventory + products + batches + warehouses + locations

### v_stock_levels
- Aggregated stock levels by product
- Stock status: NORMAL, LOW, REORDER, OVERSTOCK

### v_expiring_batches
- Batches expiring within 60 days
- Sorted by expiry date (FEFO support)

### v_warehouse_utilization
- Warehouse capacity usage
- Utilization percentage calculation

## Scalability Considerations

### Phase 1 (Current)
- Single database instance
- Up to 10 warehouses
- Up to 50,000 SKUs
- Up to 1M transactions/month

### Phase 2 (Future)
- Read replicas for reporting
- Partitioning for inventory_transactions
- Materialized views for analytics
- Up to 50 warehouses
- Up to 500,000 SKUs

### Phase 3 (Enterprise)
- Multi-tenant architecture
- Sharding by factory/region
- Time-series database for sensor data
- Data archiving strategy
- 100+ warehouses
- 1M+ SKUs
