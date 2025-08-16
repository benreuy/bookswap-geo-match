-- Add address and coordinate fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN address TEXT,
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Create an index for coordinate-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_coordinates ON public.profiles(latitude, longitude);