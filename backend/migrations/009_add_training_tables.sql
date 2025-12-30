
CREATE TABLE IF NOT EXISTS training_workshops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    event_date DATE,
    duration VARCHAR(100),
    location VARCHAR(255),
    type VARCHAR(100),
    instructor VARCHAR(100),
    capacity INT,
    summary TEXT,
    description TEXT,
    tags JSON,
    link VARCHAR(255),
    status ENUM('Upcoming', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
