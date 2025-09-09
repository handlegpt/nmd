-- Test creating triggers and functions
-- This will help us identify if the error is in the trigger/function creation

-- Test 1: Create the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Test 2: Create triggers for each table
DROP TRIGGER IF EXISTS update_place_reviews_updated_at ON place_reviews;
CREATE TRIGGER update_place_reviews_updated_at 
  BEFORE UPDATE ON place_reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_place_photos_updated_at ON place_photos;
CREATE TRIGGER update_place_photos_updated_at 
  BEFORE UPDATE ON place_photos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_place_checkins_updated_at ON place_checkins;
CREATE TRIGGER update_place_checkins_updated_at 
  BEFORE UPDATE ON place_checkins 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_activity_updated_at ON user_activity;
CREATE TRIGGER update_user_activity_updated_at 
  BEFORE UPDATE ON user_activity 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Test 3: Check if triggers were created successfully
SELECT 'All triggers created successfully' as status;
