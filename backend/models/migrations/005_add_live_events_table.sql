-- Migration: Add Live Events Table
-- Path: d:/itpccms/backend/ITPCMS/backend/models/migrations/005_add_live_events_table.sql

CREATE TABLE IF NOT EXISTS live_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    timezone VARCHAR(50) DEFAULT 'UTC',
    location VARCHAR(255),
    stream_platform VARCHAR(50) DEFAULT 'youtube',
    stream_url VARCHAR(255),
    stream_poster VARCHAR(255),
    stream_aspect VARCHAR(20) DEFAULT '16:9',
    chat_enabled BOOLEAN DEFAULT TRUE,
    chat_pinned VARCHAR(255),
    estimated_viewers INT DEFAULT 0,
    status ENUM('draft', 'published', 'ended') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS live_event_agenda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    time TIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    speaker VARCHAR(255),
    FOREIGN KEY (event_id) REFERENCES live_events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS live_event_speakers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    photo VARCHAR(255),
    FOREIGN KEY (event_id) REFERENCES live_events(id) ON DELETE CASCADE
);

-- Insert a sample event to make it immediately functional
INSERT INTO live_events (title, subtitle, event_date, start_time, end_time, location, stream_url, stream_poster, status)
VALUES (
    'ITPC Hub Innovation Summit 2025', 
    'Exploring the future of Ethiopia''s Digital Economy', 
    CURDATE(), 
    '09:30:00', 
    '17:00:00', 
    'Main Exhibition Hall, Addis Ababa',
    'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    'https://images.unsplash.com/photo-1540575861501-7ad060e1c415?auto=format&fit=crop&q=80',
    'published'
);

SET @last_id = LAST_INSERT_ID();

INSERT INTO live_event_agenda (event_id, time, title, speaker) VALUES 
(@last_id, '09:30:00', 'Opening Ceremony', 'Minister of Innovation'),
(@last_id, '10:30:00', 'Panel: Future of Startups', 'Dr. Abate Solomon'),
(@last_id, '14:00:00', 'ICT Infrastructure Roadmap', 'Eng. Teklehaimanot');

INSERT INTO live_event_speakers (event_id, name, role, photo) VALUES 
(@last_id, 'Dr. Abate Solomon', 'Lead Research Analyst', 'https://i.pravatar.cc/150?u=abate'),
(@last_id, 'Eng. Teklehaimanot', 'Infrastructure Director', 'https://i.pravatar.cc/150?u=tekle');
