-- Run this SQL to add check-in functionality to existing students table
-- This will add the checked_in_at column if it doesn't already exist

-- Add checked_in_at column to existing students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_students_checked_in_at ON students(checked_in_at);

-- Verify the column was added (optional)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'students' AND column_name = 'checked_in_at';
