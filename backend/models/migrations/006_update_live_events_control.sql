-- Add monitoring and control columns to live_events
ALTER TABLE live_events 
ADD COLUMN is_streaming BOOLEAN DEFAULT FALSE,
ADD COLUMN is_recording BOOLEAN DEFAULT FALSE,
ADD COLUMN recording_url VARCHAR(255),
ADD COLUMN actual_start_time DATETIME,
MODIFY COLUMN status ENUM('draft', 'published', 'live', 'ended') DEFAULT 'draft';
