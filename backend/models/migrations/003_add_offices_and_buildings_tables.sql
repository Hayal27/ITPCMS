-- Migration: Add Offices and Buildings Tables
-- Description: Creates tables for managing office spaces and building information

-- Create office_buildings table
CREATE TABLE IF NOT EXISTS office_buildings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    total_offices INT DEFAULT 0,
    available_offices INT DEFAULT 0,
    total_size_sqm DECIMAL(10, 2) DEFAULT 0,
    icon_name VARCHAR(100) DEFAULT 'FaBuilding',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create offices table
CREATE TABLE IF NOT EXISTS offices (
    id VARCHAR(50) PRIMARY KEY,
    zone VARCHAR(100) NOT NULL,
    building_id INT NOT NULL,
    unit_number VARCHAR(50) NOT NULL,
    floor INT NOT NULL,
    size_sqm DECIMAL(10, 2) NOT NULL,
    status ENUM('Available', 'Rented') DEFAULT 'Available',
    price_monthly DECIMAL(15, 2) NOT NULL,
    rented_by VARCHAR(255) DEFAULT NULL,
    available_from DATE DEFAULT NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES office_buildings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample building data
INSERT INTO office_buildings (name, description, total_offices, available_offices, total_size_sqm, icon_name)
VALUES 
('ICT Tower A', 'Premium office spaces designed for tech companies and startups with modern amenities and high-speed internet.', 50, 30, 4500, 'FaBuilding'),
('ICT Tower B', 'Enterprise-grade office spaces with larger floor plans, suitable for established companies and organizations.', 40, 15, 5200, 'FaBuilding'),
('ICT Tower C', 'Mixed-use office spaces with flexible layouts, ideal for digital service providers and creative agencies.', 45, 25, 4800, 'FaBuilding'),
('ICT Tower D', 'Affordable office spaces designed for startups and small businesses with essential amenities.', 60, 35, 3800, 'FaBuilding')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Insert sample office data
-- We need to get the building ids first, but for sample data we can assume 1, 2, 3, 4
INSERT INTO offices (id, zone, building_id, unit_number, floor, size_sqm, status, price_monthly, rented_by, available_from, contact_name, contact_phone)
VALUES 
('OFF-ICTA-305', 'Tech Innovation Zone', 1, 'A305', 3, 85, 'Available', 18750, NULL, '2025-06-01', 'Belete Esubalew', '+251911223344'),
('OFF-ICTB-201', 'Business Hub Zone', 2, 'B201', 2, 120, 'Rented', 25000, 'TechEthiopia Solutions', '2026-01-15', 'Belete Esubalew', '+251911223344'),
('OFF-ICTA-402', 'Tech Innovation Zone', 1, 'A402', 4, 95, 'Available', 20000, NULL, '2025-07-01', 'Belete Esubalew', '+251911223344'),
('OFF-ICTC-510', 'Digital Services Zone', 3, 'C510', 5, 150, 'Available', 32000, NULL, '2025-08-15', 'Belete Esubalew', '+251911223344'),
('OFF-ICTD-105', 'Startup Incubator Zone', 4, 'D105', 1, 70, 'Rented', 15000, 'Ethio Digital Solutions', '2026-03-01', 'Belete Esubalew', '+251911223344'),
('OFF-ICTB-620', 'Enterprise Zone', 2, 'B620', 6, 200, 'Available', 42000, NULL, '2025-09-01', 'Belete Esubalew', '+251911223344')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
