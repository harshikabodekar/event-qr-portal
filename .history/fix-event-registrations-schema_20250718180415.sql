-- Fix the event_registrations table schema
-- First, let's update the data types and add proper foreign key constraints

-- Step 1: Update event_registrations table structure
ALTER TABLE public.event_registrations 
  ALTER COLUMN student_id TYPE uuid USING student_id::uuid,
  ALTER COLUMN event_id TYPE bigint USING event_id::bigint,
  ALTER COLUMN registered_at TYPE timestamp with time zone USING registered_at::timestamp with time zone;

-- Step 2: Add foreign key constraints
ALTER TABLE public.event_registrations 
  ADD CONSTRAINT fk_event_registrations_student_id 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.event_registrations 
  ADD CONSTRAINT fk_event_registrations_event_id 
  FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_student_id ON public.event_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_unique ON public.event_registrations(student_id, event_id);

-- Step 4: Add unique constraint to prevent duplicate registrations
ALTER TABLE public.event_registrations 
  ADD CONSTRAINT unique_student_event 
  UNIQUE (student_id, event_id);
