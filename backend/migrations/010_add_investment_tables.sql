
CREATE TABLE IF NOT EXISTS investment_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    step_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    doc_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS investment_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    icon VARCHAR(100) DEFAULT 'FaFileAlt',
    file_url VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'document',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
