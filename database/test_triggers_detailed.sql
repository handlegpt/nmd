-- Test creating triggers step by step
-- This will help us identify which trigger is causing the problem

-- Test 1: Create the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

SELECT 'update_updated_at_column function created successfully' as status;

-- Test 2: Create trigger for place_reviews
DROP TRIGGER IF EXISTS update_place_reviews_updated_at ON place_reviews;
CREATE TRIGGER update_place_reviews_updated_at 
  BEFORE UPDATE ON place_reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'place_reviews trigger created successfully' as status;

-- Test 3: Create trigger for place_photos
DROP TRIGGER IF EXISTS update_place_photos_updated_at ON place_photos;
CREATE TRIGGER update_place_photos_updated_at 
  BEFORE UPDATE ON place_photos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'place_photos trigger created successfully' as status;

-- Test 4: Create trigger for place_checkins
DROP TRIGGER IF EXISTS update_place_checkins_updated_at ON place_checkins;
CREATE TRIGGER update_place_checkins_updated_at 
  BEFORE UPDATE ON place_checkins 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'place_checkins trigger created successfully' as status;

-- Test 5: Create trigger for user_activity
DROP TRIGGER IF EXISTS update_user_activity_updated_at ON user_activity;
CREATE TRIGGER update_user_activity_updated_at 
  BEFORE UPDATE ON user_activity 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'user_activity trigger created successfully' as status;

-- Final status
SELECT 'All triggers created successfully' as final_status;
