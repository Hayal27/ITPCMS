-- Add signaling column for WebRTC
ALTER TABLE live_events 
ADD COLUMN signaling_data TEXT;
