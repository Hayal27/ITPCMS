-- Migration: Add Leased Land and Zones Tables
-- Description: Creates tables for managing leased land parcels and zone information

-- Create land_zones table
CREATE TABLE IF NOT EXISTS land_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    total_size_sqm DECIMAL(15, 2) DEFAULT 0,
    available_size_sqm DECIMAL(15, 2) DEFAULT 0,
    icon_name VARCHAR(100) DEFAULT 'FaGlobeAfrica',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create leased_lands table
CREATE TABLE IF NOT EXISTS leased_lands (
    id VARCHAR(50) PRIMARY KEY,
    zone_id INT NOT NULL,
    land_type VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    size_sqm DECIMAL(15, 2) NOT NULL,
    available_size_sqm DECIMAL(15, 2) DEFAULT 0,
    status ENUM('Available', 'Leased') DEFAULT 'Available',
    leased_by VARCHAR(255) DEFAULT NULL,
    leased_from DATE DEFAULT NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES land_zones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample zone data
INSERT INTO land_zones (name, description, total_size_sqm, available_size_sqm, icon_name)
VALUES 
('IT Business Zone', 'Primary zone for IT companies and service providers with advanced infrastructure.', 50000, 35000, 'FaGlobeAfrica'),
('Commercial Zone', 'Designed for business support services, shopping areas, and commercial hubs.', 30000, 12000, 'FaGlobeAfrica'),
('Manufacturing Zone', 'Zone for light industrial and tech manufacturing with large-scale utility support.', 80000, 45000, 'FaGlobeAfrica'),
('Knowledge Zone', 'Focus area for research, training centers, and academic-industry collaborations.', 40000, 28000, 'FaGlobeAfrica')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Insert sample leased land data
INSERT INTO leased_lands (id, zone_id, land_type, location, size_sqm, available_size_sqm, status, leased_by, leased_from, contact_name, contact_phone)
VALUES 
('LND-ICTA-202', 1, 'Commercial', 'Behind ICT Tower A', 1500, 1200, 'Available', NULL, '2025-06-01', 'Belete Esubalew', '+251913456789'),
('LND-ICTA-203', 2, 'Commercial', 'East Wing, ICT Park', 2200, 0, 'Leased', 'TechEthiopia Solutions', '2025-01-15', 'Belete Esubalew', '+251911234567'),
('LND-ICTA-204', 3, 'Industrial', 'Near Main Entrance', 3000, 1800, 'Available', NULL, '2025-07-01', 'Belete Esubalew', '+251944567890'),
('LND-ICTA-205', 4, 'Commercial', 'North Section', 1800, 1200, 'Available', NULL, '2025-08-15', 'Belete Esubalew', '+251922345678')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
