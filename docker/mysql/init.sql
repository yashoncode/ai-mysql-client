USE test_db;

CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    city VARCHAR(100),
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed Customers
INSERT INTO customers (name, email, city, total_spent) VALUES
('Alice Johnson', 'alice@example.com', 'New York', 2500.00),
('Bob Smith', 'bob@example.com', 'San Francisco', 1800.50),
('Charlie Brown', 'charlie@example.com', 'Chicago', 3200.75),
('Diana Prince', 'diana@example.com', 'Los Angeles', 950.25),
('Eve Williams', 'eve@example.com', 'Seattle', 4100.00),
('Frank Castle', 'frank@example.com', 'Boston', 1575.30),
('Grace Hopper', 'grace@example.com', 'Austin', 6200.00),
('Hank Pym', 'hank@example.com', 'Denver', 890.75);

-- Seed Products
INSERT INTO products (name, category, price, stock) VALUES
('Laptop Pro 15', 'Electronics', 1299.99, 50),
('Wireless Mouse', 'Accessories', 29.99, 200),
('USB-C Hub', 'Accessories', 49.99, 150),
('Standing Desk', 'Furniture', 599.99, 30),
('Noise Cancelling Headphones', 'Electronics', 249.99, 75),
('Mechanical Keyboard', 'Accessories', 89.99, 120),
('4K Monitor 27"', 'Electronics', 449.99, 40),
('Ergonomic Chair', 'Furniture', 399.99, 25);

-- Seed Orders
INSERT INTO orders (customer_id, product_id, quantity, total, status) VALUES
(1, 1, 1, 1299.99, 'delivered'),
(1, 2, 2, 59.98, 'delivered'),
(2, 4, 1, 599.99, 'shipped'),
(3, 1, 1, 1299.99, 'processing'),
(3, 5, 2, 499.98, 'delivered'),
(4, 3, 3, 149.97, 'pending'),
(5, 1, 2, 2599.98, 'delivered'),
(5, 5, 1, 249.99, 'shipped'),
(6, 6, 1, 89.99, 'delivered'),
(6, 7, 1, 449.99, 'processing'),
(7, 8, 1, 399.99, 'delivered'),
(7, 1, 1, 1299.99, 'delivered'),
(8, 2, 3, 89.97, 'pending'),
(2, 6, 2, 179.98, 'delivered'),
(4, 7, 1, 449.99, 'shipped');