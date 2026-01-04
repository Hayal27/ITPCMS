-- Add security columns to users table
ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0;
ALTER TABLE users ADD COLUMN account_locked_until DATETIME NULL;
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL;

-- Create blocked_ips table
CREATE TABLE IF NOT EXISTS blocked_ips (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    ip_address VARCHAR(45) NOT NULL, 
    blocked_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
    reason VARCHAR(255),
    UNIQUE KEY unique_ip (ip_address)
);
