-- Fix for migration 20260330100000_unified_b2b_b2c.sql
-- The previous default 'b2c' was invalid under the check constraint.
-- Correcting it to 'b2c_student' for all future signups.

ALTER TABLE public.profiles 
ALTER COLUMN user_type SET DEFAULT 'b2c_student';

-- Update any accidental 'b2c' values if they somehow bypassed constraints (unlikely but safe)
UPDATE public.profiles 
SET user_type = 'b2c_student' 
WHERE user_type = 'b2c';
