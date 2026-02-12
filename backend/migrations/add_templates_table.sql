-- Migration to add template storage and extra fields
CREATE TABLE IF NOT EXISTS id_card_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    config JSON NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add barcode field to id_card_persons if not exists (usually same as id_number but stored separately if needed)
-- We'll just generate it from id_number in the frontend/component.
