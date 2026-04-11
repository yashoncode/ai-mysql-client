USE test_db;

CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    city VARCHAR(100),
    total_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO customers (name, email, city, total_spent) VALUES
('Alice Johnson', 'alice@example.com', 'New York', 2500.00),
('Bob Smith', 'bob@example.com', 'Los Angeles', 1800.50),
('Carol Williams', 'carol@example.com', 'Chicago', 3200.75),
('David Brown', 'david@example.com', 'Houston', 950.25),
('Eva Martinez', 'eva@example.com', 'Phoenix', 4100.00);

INSERT INTO products (name, category, price, stock) VALUES
('Laptop Pro 15', 'Electronics', 1299.99, 50),
('Wireless Headphones', 'Electronics', 149.99, 200),
('Office Chair', 'Furniture', 349.99, 75),
('Standing Desk', 'Furniture', 599.99, 30),
('Coffee Maker', 'Appliances', 89.99, 120);

INSERT INTO orders (customer_id, product_id, quantity, total, status) VALUES
(1, 1, 1, 1299.99, 'delivered'),
(1, 2, 1, 149.99, 'delivered'),
(2, 3, 1, 349.99, 'shipped'),
(3, 1, 2, 2599.98, 'delivered'),
(3, 4, 1, 599.99, 'processing'),
(4, 5, 1, 89.99, 'pending'),
(5, 1, 1, 1299.99, 'delivered'),
(5, 2, 2, 299.98, 'shipped');
