-- Add user_preferences table to existing database
-- This script should be run on the existing database to add the missing user_preferences table

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    wifi_quality INTEGER DEFAULT 0 CHECK (wifi_quality >= 0 AND wifi_quality <= 100),
    cost_of_living INTEGER DEFAULT 0 CHECK (cost_of_living >= 0 AND cost_of_living <= 100),
    climate_comfort INTEGER DEFAULT 0 CHECK (climate_comfort >= 0 AND climate_comfort <= 100),
    social_atmosphere INTEGER DEFAULT 0 CHECK (social_atmosphere >= 0 AND social_atmosphere <= 100),
    visa_convenience INTEGER DEFAULT 0 CHECK (visa_convenience >= 0 AND visa_convenience <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on user_preferences table
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow public insert preferences" ON public.user_preferences FOR INSERT WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'user_preferences table added successfully!' as status;
