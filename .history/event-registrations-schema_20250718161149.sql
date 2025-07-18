-- Create event_registrations table to track which students registered for which events
CREATE TABLE IF NOT EXISTS event_registrations (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, event_id) -- Prevent duplicate registrations
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_student_id ON event_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);

-- Insert some sample data (optional)
-- Note: Make sure students and events exist before running these inserts
-- INSERT INTO event_registrations (student_id, event_id) VALUES 
-- (1, 1),
-- (2, 1),
-- (1, 2);
