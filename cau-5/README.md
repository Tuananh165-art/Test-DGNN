## Demo
[![Tải xuống video demo](preview.png)](demo3.mp4)
Sau khi nhấn: Tải xuống video demo thì nhấn tiếp View raw để tải Video về máy

# Hệ Thống Quản Lý Kho Thông Minh - Warehouse Management System

Hệ thống cơ sở dữ liệu quản lý kho thông minh cho nhà máy sản xuất (ví dụ: Vinamilk).

## 📋 Mục Lục

- [Tổng Quan](#tổng-quan)
- [Kiến Trúc Database](#kiến-trúc-database)
- [Cài Đặt](#cài-đặt)
- [Sử Dụng](#sử-dụng)
- [Mô Tả Chi Tiết](#mô-tả-chi-tiết)
- [Chiến Lược Mở Rộng](#chiến-lược-mở-rộng)

## 🎯 Tổng Quan

Hệ thống quản lý:
- ✅ Nguyên liệu đầu vào (Raw Materials)
- ✅ Sản phẩm bán thành phẩm (Semi-Finished Products)
- ✅ Thành phẩm (Finished Goods)
- ✅ Quy trình sản xuất (Production Process)
- ✅ Xuất nhập kho (Inbound/Outbound)
- ✅ Theo dõi lô hàng và hạn sử dụng (Batch & Expiry Tracking)
- ✅ Vị trí lưu kho (Storage Locations)

## 🏗️ Kiến Trúc Database

### ERD - Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌────────────────┐
│  Factories  │──────<│  Warehouses  │──────<│    Storage     │
│             │       │              │       │   Locations    │
└─────────────┘       └──────────────┘       └────────────────┘
                             │
                             │
                             ▼
┌─────────────┐       ┌──────────────┐       ┌────────────────┐
│  Product    │       │   Products   │──────<│   Inventory    │
│ Categories  │──────<│              │       │                │
└─────────────┘       └──────────────┘       └────────────────┘
                             │                       │
                             │                       │
                             ▼                       ▼
                      ┌──────────────┐       ┌────────────────┐
                      │   Batches    │───────│   Inventory    │
                      │              │       │  Transactions  │
                      └──────────────┘       └────────────────┘
                             │
                             │
                             ▼
┌─────────────┐       ┌──────────────┐       ┌────────────────┐
│ Production  │       │  Production  │       │      BOM       │
│   Lines     │──────<│    Orders    │       │   Headers      │
└─────────────┘       └──────────────┘       └────────────────┘
                                                     │
                                                     ▼
                                              ┌────────────────┐
                                              │      BOM       │
                                              │    Details     │
                                              └────────────────┘

┌─────────────┐       ┌──────────────┐
│  Inbound    │──────<│   Inbound    │
│  Receipts   │       │   Details    │
└─────────────┘       └──────────────┘

┌─────────────┐       ┌──────────────┐
│  Outbound   │──────<│   Outbound   │
│  Shipments  │       │   Details    │
└─────────────┘       └──────────────┘
```

### Các Bảng Chính (Core Tables)

#### 1. Master Data
- **factories**: Nhà máy/xí nghiệp
- **warehouses**: Kho hàng (phân loại theo loại sản phẩm)
- **storage_locations**: Vị trí lưu trữ (Zone/Rack/Shelf/Bin)
- **product_categories**: Danh mục sản phẩm
- **products**: Sản phẩm (nguyên liệu, bán thành phẩm, thành phẩm)

#### 2. Production
- **production_lines**: Dây chuyền sản xuất
- **bom_headers**: Bill of Materials (công thức sản xuất)
- **bom_details**: Chi tiết BOM
- **production_orders**: Lệnh sản xuất

#### 3. Inventory
- **batches**: Lô hàng với thông tin hạn sử dụng
- **inventory**: Tồn kho hiện tại
- **inventory_transactions**: Lịch sử giao dịch (audit trail)

#### 4. Transactions
- **inbound_receipts**: Phiếu nhập kho
- **inbound_receipt_details**: Chi tiết nhập kho
- **outbound_shipments**: Phiếu xuất kho
- **outbound_shipment_details**: Chi tiết xuất kho

### Views (Truy Vấn Thường Dùng)

- **v_inventory_summary**: Tổng quan tồn kho với trạng thái hạn sử dụng
- **v_stock_levels**: Mức tồn kho theo sản phẩm với cảnh báo
- **v_expiring_batches**: Lô hàng sắp hết hạn (60 ngày)
- **v_warehouse_utilization**: Tỷ lệ sử dụng kho

## 🚀 Cài Đặt

### Yêu Cầu

- Docker Desktop
- Docker Compose
- PostgreSQL Client (tùy chọn)

### Bước 1: Khởi Động Database

```bash
# Di chuyển vào thư mục dự án
cd cau-5

# Khởi động PostgreSQL và pgAdmin
docker-compose up -d

# Kiểm tra containers đang chạy
docker-compose ps
```

Sau khi khởi động thành công:
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050`

### Bước 2: Import Database Schema

#### Cách 1: Sử dụng Docker Exec (Khuyến nghị)

```bash
# Import schema
docker exec -i warehouse_db psql -U admin -d warehouse_management < sql/01_schema.sql
# (window/powershell) 
Get-Content sql\01_schema.sql | docker exec -i warehouse_db psql -U admin -d warehouse_management

# Import triggers
docker exec -i warehouse_db psql -U admin -d warehouse_management < sql/02_triggers.sql
# (window/powershell) 
Get-Content sql\02_triggers.sql | docker exec -i warehouse_db psql -U admin -d warehouse_management

# Import views
docker exec -i warehouse_db psql -U admin -d warehouse_management < sql/03_views.sql
# (window/powershell) 
Get-Content sql\03_views.sql | docker exec -i warehouse_db psql -U admin -d warehouse_management

# Import sample data
docker exec -i warehouse_db psql -U admin -d warehouse_management < sql/04_sample_data.sql
# (window/powershell) 
Get-Content sql\04_sample_data.sql | docker exec -i warehouse_db psql -U admin -d warehouse_management

docker exec -i warehouse_db psql -U admin -d warehouse_management < sql/05_sample_data_part2.sql
# (window/powershell) 
Get-Content sql\05_sample_data_part2.sql | docker exec -i warehouse_db psql -U admin -d warehouse_management

```

#### Cách 3: Sử dụng pgAdmin

1. Truy cập pgAdmin: `http://localhost:5050`
2. Đăng nhập:
   - Email: `admin@warehouse.com`
   - Password: `admin123`
3. Thêm server mới:
   - Host: `postgres`
   - Port: `5432`
   - Database: `warehouse_management`
   - Username: `admin`
   - Password: `admin123`
4. Mở Query Tool và chạy từng file SQL theo thứ tự

## 🧪 Test & Run

### Chạy Test Queries

```bash
# Chạy test queries
docker exec -i warehouse_db psql -U admin -d warehouse_management < sql/06_test_queries.sql
# (window/powershell) 
Get-Content sql\06_test_queries.sql | docker exec -i warehouse_db psql -U admin -d warehouse_management
```

### Kết Nối Database

**Kết Nối Database qua http://localhost:5050/:**
```
- Host name/address:
postgres
- Port:
5432
- database:
warehouse_management
- Username:
admin
- Password:
admin123
```

**Connection URL:**
```
postgresql://admin:admin123@localhost:5432/warehouse_management
```

### Các Truy Vấn Test Cơ Bản

```sql
-- 1. Kiểm tra tồn kho
SELECT * FROM v_inventory_summary;

-- 2. Kiểm tra mức tồn kho và cảnh báo
SELECT * FROM v_stock_levels WHERE stock_status != 'NORMAL';

-- 3. Kiểm tra lô hàng sắp hết hạn
SELECT * FROM v_expiring_batches;

-- 4. Kiểm tra tỷ lệ sử dụng kho
SELECT * FROM v_warehouse_utilization;

-- 5. Lịch sử giao dịch gần đây
SELECT * FROM inventory_transactions 
ORDER BY transaction_date DESC 
LIMIT 10;
```

## 📖 Mô Tả Chi Tiết

### 1. Bảng Factories (Nhà Máy)

Quản lý thông tin các nhà máy/xí nghiệp sản xuất.

**Các trường chính:**
- `factory_code`: Mã nhà máy (unique)
- `factory_name`: Tên nhà máy
- `is_active`: Trạng thái hoạt động

**Ràng buộc:**
- `factory_code` phải unique
- `factory_name` không được null

### 2. Bảng Warehouses (Kho)

Quản lý các kho hàng, phân loại theo loại sản phẩm.

**Các trường chính:**
- `warehouse_type`: RAW_MATERIAL, SEMI_FINISHED, FINISHED, GENERAL
- `capacity_m3`: Dung tích kho (m³)
- `temperature_min/max`: Nhiệt độ lưu trữ
- `humidity_min/max`: Độ ẩm

**Ràng buộc:**
- Mỗi kho thuộc về một nhà máy
- `warehouse_code` phải unique

**Indexes:**
- `idx_warehouses_factory`: Tìm kho theo nhà máy
- `idx_warehouses_type`: Tìm kho theo loại

### 3. Bảng Storage Locations (Vị Trí Lưu Trữ)

Quản lý vị trí lưu trữ theo cấu trúc phân cấp (Zone → Rack → Shelf → Bin).

**Các trường chính:**
- `location_type`: ZONE, RACK, SHELF, BIN
- `parent_location_id`: Vị trí cha (hỗ trợ cấu trúc cây)
- `capacity_m3`: Dung tích vị trí

**Ràng buộc:**
- Mỗi vị trí thuộc về một kho
- Có thể có vị trí cha (hierarchical)

### 4. Bảng Products (Sản Phẩm)

Quản lý tất cả sản phẩm: nguyên liệu, bán thành phẩm, thành phẩm.

**Các trường chính:**
- `product_type`: RAW_MATERIAL, SEMI_FINISHED, FINISHED
- `shelf_life_days`: Hạn sử dụng (ngày)
- `min_stock_level`: Mức tồn kho tối thiểu
- `max_stock_level`: Mức tồn kho tối đa
- `reorder_point`: Điểm đặt hàng lại
- `barcode/qr_code`: Mã vạch/QR

**Ràng buộc:**
- `product_code` phải unique
- `unit_of_measure` bắt buộc

**Indexes:**
- `idx_products_type`: Tìm theo loại sản phẩm
- `idx_products_barcode`: Tìm theo mã vạch

### 5. Bảng Batches (Lô Hàng)

Quản lý lô hàng với thông tin sản xuất và hạn sử dụng.

**Các trường chính:**
- `batch_number`: Số lô (unique)
- `manufacture_date`: Ngày sản xuất
- `expiry_date`: Hạn sử dụng
- `status`: AVAILABLE, RESERVED, QUARANTINE, EXPIRED, CONSUMED
- `quality_status`: PENDING, APPROVED, REJECTED

**Ràng buộc:**
- `expiry_date` phải sau `manufacture_date` (trigger validation)
- Mỗi lô thuộc về một sản phẩm

**Indexes:**
- `idx_batches_expiry`: Tìm lô theo hạn sử dụng (quan trọng cho FEFO)

### 6. Bảng Inventory (Tồn Kho)

Quản lý tồn kho hiện tại theo sản phẩm, lô, kho, vị trí.

**Các trường chính:**
- `quantity`: Số lượng tổng
- `reserved_quantity`: Số lượng đã đặt trước
- `available_quantity`: Số lượng khả dụng (computed column)

**Ràng buộc:**
- Unique constraint: (product_id, batch_id, warehouse_id, location_id)
- `available_quantity` tự động tính = quantity - reserved_quantity

**Indexes:**
- Composite indexes cho truy vấn nhanh

### 7. Bảng Production Orders (Lệnh Sản Xuất)

Quản lý các lệnh sản xuất.

**Các trường chính:**
- `status`: PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
- `planned_quantity` vs `actual_quantity`
- `priority`: Độ ưu tiên (1-10)

**Ràng buộc:**
- Liên kết với BOM và production line

### 8. Bảng BOM (Bill of Materials)

Quản lý công thức sản xuất.

**Cấu trúc:**
- `bom_headers`: Thông tin chung
- `bom_details`: Chi tiết nguyên liệu

**Ràng buộc:**
- Một sản phẩm có thể có nhiều version BOM
- Unique constraint: (product_id, version)

### 9. Bảng Transactions (Giao Dịch)

**Inbound Receipts**: Nhập kho
- Từ nhà cung cấp (PURCHASE)
- Từ sản xuất (PRODUCTION)
- Chuyển kho (TRANSFER)
- Trả hàng (RETURN)

**Outbound Shipments**: Xuất kho
- Bán hàng (SALES)
- Sản xuất (PRODUCTION)
- Chuyển kho (TRANSFER)
- Hủy bỏ (DISPOSAL)

**Inventory Transactions**: Audit trail đầy đủ

### Validation Rules

1. **Batch Expiry**: Hạn sử dụng phải sau ngày sản xuất
2. **Inventory**: Số lượng không được âm
3. **Reserved Quantity**: Không được lớn hơn quantity
4. **Timestamps**: Tự động cập nhật updated_at

### Optimization Strategies

1. **Indexes**:
   - Composite indexes cho foreign keys
   - Indexes cho các trường thường query (status, date, type)
   - Indexes cho batch expiry tracking

2. **Partitioning** (Phase 2):
   - Partition inventory_transactions theo tháng
   - Archive dữ liệu cũ

3. **Computed Columns**:
   - `available_quantity` = quantity - reserved_quantity
   - Giảm logic tính toán ở application layer

4. **Views**:
   - Pre-computed views cho báo cáo thường dùng
   - Materialized views cho dữ liệu lớn (Phase 2)

## 🔄 Chiến Lược Mở Rộng

### Phase 1: Core System (Hiện Tại)

✅ Các chức năng cơ bản:
- Quản lý master data
- Quản lý tồn kho
- Xuất nhập kho
- Theo dõi lô hàng và hạn sử dụng
- Quy trình sản xuất cơ bản

**Quy mô**: 1-3 nhà máy, 5-10 kho, 1000-5000 SKUs

### Phase 2: Advanced Features

🔄 Mở rộng:

1. **Quality Management**:
```sql
CREATE TABLE quality_inspections (
    inspection_id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES batches(batch_id),
    inspection_type VARCHAR(50),
    inspection_date TIMESTAMP,
    result VARCHAR(20),
    inspector VARCHAR(100),
    notes TEXT
);
```

2. **Supplier Management**:
```sql
CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    supplier_code VARCHAR(20) UNIQUE,
    supplier_name VARCHAR(200),
    contact_info JSONB,
    rating DECIMAL(3,2)
);
```

3. **Customer Management**:
```sql
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    customer_code VARCHAR(20) UNIQUE,
    customer_name VARCHAR(200),
    customer_type VARCHAR(50),
    contact_info JSONB
);
```

4. **Equipment Tracking**:
```sql
CREATE TABLE equipment (
    equipment_id SERIAL PRIMARY KEY,
    equipment_code VARCHAR(20),
    equipment_type VARCHAR(50),
    warehouse_id INTEGER REFERENCES warehouses(warehouse_id),
    status VARCHAR(20)
);
```

5. **Partitioning cho Performance**:
```sql
-- Partition inventory_transactions by month
CREATE TABLE inventory_transactions_2024_01 
PARTITION OF inventory_transactions
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

**Quy mô**: 5-10 nhà máy, 20-50 kho, 10000-50000 SKUs

### Phase 3: Enterprise Scale

🚀 Mở rộng lớn:

1. **Multi-Tenant Support**:
```sql
CREATE TABLE tenants (
    tenant_id SERIAL PRIMARY KEY,
    tenant_code VARCHAR(20),
    tenant_name VARCHAR(200)
);

-- Add tenant_id to all tables
ALTER TABLE factories ADD COLUMN tenant_id INTEGER REFERENCES tenants(tenant_id);
```

2. **Advanced Analytics**:
```sql
CREATE TABLE inventory_snapshots (
    snapshot_id BIGSERIAL PRIMARY KEY,
    snapshot_date DATE,
    product_id INTEGER,
    warehouse_id INTEGER,
    quantity DECIMAL(12,2),
    value DECIMAL(15,2)
);
```

3. **IoT Integration**:
```sql
CREATE TABLE sensor_readings (
    reading_id BIGSERIAL PRIMARY KEY,
    warehouse_id INTEGER,
    location_id INTEGER,
    sensor_type VARCHAR(50),
    reading_value DECIMAL(10,2),
    reading_time TIMESTAMP,
    alert_triggered BOOLEAN
);
```

4. **Blockchain Traceability**:
```sql
CREATE TABLE blockchain_records (
    record_id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT,
    block_hash VARCHAR(256),
    timestamp TIMESTAMP
);
```

**Quy mô**: 20+ nhà máy, 100+ kho, 100000+ SKUs

### Xử Lý Tăng Trưởng Dữ Liệu

1. **Archiving Strategy**:
```sql
-- Archive old transactions
CREATE TABLE inventory_transactions_archive (
    LIKE inventory_transactions INCLUDING ALL
);

-- Move data older than 2 years
INSERT INTO inventory_transactions_archive
SELECT * FROM inventory_transactions
WHERE transaction_date < CURRENT_DATE - INTERVAL '2 years';
```

2. **Read Replicas**: Sử dụng PostgreSQL replication cho read-heavy workloads

3. **Caching Layer**: Redis cho frequently accessed data

4. **Sharding**: Shard theo factory_id hoặc region

## 📊 Ví Dụ Sử Dụng

### Tạo Lệnh Sản Xuất Mới

```sql
-- 1. Tạo production order
INSERT INTO production_orders (
    order_number, product_id, bom_id, line_id,
    planned_quantity, unit_of_measure,
    planned_start_date, planned_end_date,
    status, priority, created_by
) VALUES (
    'PO-20240120-001', 6, 1, 1,
    30000, 'BOX',
    '2024-01-20 08:00:00', '2024-01-20 14:00:00',
    'PLANNED', 1, 'system'
);

-- 2. Khi hoàn thành, tạo batch
INSERT INTO batches (
    batch_number, product_id, production_order_id,
    manufacture_date, expiry_date,
    quantity, unit_of_measure,
    status, quality_status
) VALUES (
    'BATCH-FG-MILK180-20240120', 6, 3,
    '2024-01-20', '2024-01-27',
    29800, 'BOX',
    'AVAILABLE', 'APPROVED'
);

-- 3. Nhập kho
INSERT INTO inbound_receipts (
    receipt_number, receipt_type, warehouse_id,
    production_order_id, receipt_date,
    status, received_by
) VALUES (
    'IR-20240120-001', 'PRODUCTION', 3,
    3, '2024-01-20 14:30:00',
    'COMPLETED', 'John Doe'
);
```

### Xuất Kho (FEFO - First Expired First Out)

```sql
-- Tìm batch sắp hết hạn nhất
SELECT 
    i.inventory_id,
    i.batch_id,
    b.batch_number,
    b.expiry_date,
    i.available_quantity
FROM inventory i
JOIN batches b ON i.batch_id = b.batch_id
WHERE i.product_id = 6
  AND i.warehouse_id = 3
  AND i.available_quantity > 0
  AND b.status = 'AVAILABLE'
ORDER BY b.expiry_date ASC
LIMIT 1;
```

## 🛠️ Maintenance

### Backup Database

```bash
# Backup
docker exec warehouse_db pg_dump -U admin warehouse_management > backup.sql

# Restore
docker exec -i warehouse_db psql -U admin -d warehouse_management < backup.sql
```

### Stop & Clean

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

## 📝 License

MIT License

## 👥 Contact

Hệ thống được thiết kế cho mục đích học tập và demo.
