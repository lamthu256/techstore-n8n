-- 1. USERS
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password text not null,
  role text DEFAULT 'user',
  created_at timestamp default now()
);

-- 2. PRODUCTS
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null, -- Giá VNĐ
  image text,
  category text,
  stock integer default 0,
  rating numeric(2,1) default 0.0 check (rating >= 0.0 and rating <= 5.0),
  reviews_count integer default 0,
  created_at timestamp default now()
);

-- 3. ORDERS
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  total integer not null, 
  address jsonb not null,
  status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamp default now()
);

-- 4. ORDER ITEMS
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity integer not null,
  price integer not null
);

-- 5. CART ITEMS
create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity integer not null,
  created_at timestamp default now(),
  unique(user_id, product_id)
);

-- 6. PRODUCT REVIEWS
create table product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- 7. CUSTOMER PROFILES
CREATE TABLE customer_profiles (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_orders integer DEFAULT 0,
  total_spent integer DEFAULT 0, 
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- TRIGGERS AND FUNCTIONS
-- 1a. Tạo hàm tính toán rating
CREATE OR REPLACE FUNCTION update_product_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Cập nhật lại bảng products dựa trên tính toán từ bảng product_reviews
    UPDATE products
    SET 
        reviews_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)),
        rating = (SELECT COALESCE(AVG(rating), 0) FROM product_reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id))
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1b. Gắn Trigger vào bảng product_reviews
-- Kích hoạt khi INSERT (thêm review), UPDATE (sửa sao), DELETE (xóa review)
CREATE TRIGGER trg_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating_stats();

-- 2a. Hàm tự động tạo customer profile
CREATE OR REPLACE FUNCTION create_customer_profile()
RETURNS trigger AS $$
BEGIN
    -- Chỉ tạo profile cho user role (nếu muốn bỏ điều kiện này thì xoá IF)
    IF NEW.role = 'user' THEN
        INSERT INTO customer_profiles (id)
        VALUES (NEW.id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2b. Gắn Trigger vào bảng users
CREATE TRIGGER trg_create_customer_profile
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_customer_profile();

-- 3a. Tạo hàm cập nhật tổng đơn hàng và tổng chi tiêu
CREATE OR REPLACE FUNCTION update_customer_profile_stats()
RETURNS TRIGGER AS $$
BEGIN 
    -- Cập nhật lại bảng customer_profiles dựa trên tính toán từ bảng orders
    UPDATE customer_profiles cp
    SET 
        total_orders = (
            SELECT COUNT(*) 
            FROM orders o
            WHERE o.user_id = NEW.user_id
        ),
        total_spent = (
            SELECT COALESCE(SUM(o.total), 0)
            FROM orders o
            WHERE o.user_id = NEW.user_id
              AND o.status = 'delivered'
        ),
        updated_at = now()
    WHERE cp.id = NEW.user_id;
    RETURN NEW;
END;  
$$ LANGUAGE plpgsql;

-- 3b. Gắn Trigger vào bảng orders
CREATE TRIGGER trg_recalc_customer_profile
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_customer_profile_stats();

