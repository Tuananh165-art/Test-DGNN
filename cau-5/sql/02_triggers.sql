-- TRIGGERS AND FUNCTIONS

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_factories_updated_at BEFORE UPDATE ON factories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_orders_updated_at BEFORE UPDATE ON production_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Validate batch expiry
CREATE OR REPLACE FUNCTION check_batch_expiry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expiry_date <= NEW.manufacture_date THEN
        RAISE EXCEPTION 'Expiry date must be after manufacture date';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_batch_expiry BEFORE INSERT OR UPDATE ON batches
    FOR EACH ROW EXECUTE FUNCTION check_batch_expiry();
