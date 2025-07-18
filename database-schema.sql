-- Simplified Supabase Database Schema for Event QR Portal
-- Run these SQL commands in your Supabase SQL editor

-- Create events table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table (simplified version with check-in timestamp)
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    college VARCHAR(255),
    department VARCHAR(255),
    qr_code TEXT,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_checked_in_at ON students(checked_in_at);

-- Optional: Add checked_in_at column to existing table if it doesn't exist
ALTER TABLE students ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access on events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on events" ON events FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on students" ON students FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on students" ON students FOR UPDATE USING (true);

-- Insert some sample events (optional)
INSERT INTO events (name, description, date, location) VALUES 
('Tech Conference 2025', 'Annual technology conference', '2025-08-15', 'Main Auditorium'),
('Career Fair', 'Meet with potential employers', '2025-08-20', 'Student Center'),
('Workshop: Web Development', 'Learn modern web development', '2025-08-25', 'Computer Lab')
ON CONFLICT DO NOTHING;

-- Optional: Add checkin_status column if you want check-in functionality
-- ALTER TABLE students ADD COLUMN IF NOT EXISTS checkin_status BOOLEAN DEFAULT FALSE;
