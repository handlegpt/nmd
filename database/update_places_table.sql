-- Update places table to add missing columns for ratings and reviews
-- This script adds the necessary columns to support the new place features

-- Add rating and review_count columns to places table
ALTER TABLE places 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS check_in_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS outlets BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS long_stay_ok BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS opening_hours VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
ADD COLUMN IF NOT EXISTS socket_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wifi_stability VARCHAR(20) DEFAULT 'good',
ADD COLUMN IF NOT EXISTS average_spend VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_methods TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS suitable_for TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cover_photo TEXT;

-- Add constraints for new columns
ALTER TABLE places 
ADD CONSTRAINT IF NOT EXISTS places_rating_check CHECK (rating >= 0 AND rating <= 5),
ADD CONSTRAINT IF NOT EXISTS places_review_count_check CHECK (review_count >= 0),
ADD CONSTRAINT IF NOT EXISTS places_check_in_count_check CHECK (check_in_count >= 0),
ADD CONSTRAINT IF NOT EXISTS places_socket_count_check CHECK (socket_count >= 0),
ADD CONSTRAINT IF NOT EXISTS places_wifi_stability_check CHECK (wifi_stability IN ('poor', 'fair', 'good', 'excellent'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_places_rating ON places(rating);
CREATE INDEX IF NOT EXISTS idx_places_review_count ON places(review_count);
CREATE INDEX IF NOT EXISTS idx_places_check_in_count ON places(check_in_count);
CREATE INDEX IF NOT EXISTS idx_places_wifi_stability ON places(wifi_stability);
CREATE INDEX IF NOT EXISTS idx_places_outlets ON places(outlets);
CREATE INDEX IF NOT EXISTS idx_places_long_stay_ok ON places(long_stay_ok);

-- Add comments for documentation
COMMENT ON COLUMN places.rating IS 'Average rating from user reviews (0-5)';
COMMENT ON COLUMN places.review_count IS 'Total number of user reviews';
COMMENT ON COLUMN places.check_in_count IS 'Total number of user check-ins';
COMMENT ON COLUMN places.outlets IS 'Whether the place has power outlets';
COMMENT ON COLUMN places.long_stay_ok IS 'Whether long-term stays are allowed';
COMMENT ON COLUMN places.opening_hours IS 'Business hours (e.g., "09:00 - 20:00")';
COMMENT ON COLUMN places.phone IS 'Contact phone number';
COMMENT ON COLUMN places.website IS 'Official website URL';
COMMENT ON COLUMN places.google_maps_url IS 'Google Maps URL';
COMMENT ON COLUMN places.socket_count IS 'Number of power outlets available';
COMMENT ON COLUMN places.wifi_stability IS 'WiFi stability rating';
COMMENT ON COLUMN places.average_spend IS 'Average spending range (e.g., "¥500~¥800")';
COMMENT ON COLUMN places.payment_methods IS 'Accepted payment methods';
COMMENT ON COLUMN places.suitable_for IS 'Suitable activities (work, social, reading, etc.)';
COMMENT ON COLUMN places.photos IS 'Array of photo URLs';
COMMENT ON COLUMN places.cover_photo IS 'Main cover photo URL';
