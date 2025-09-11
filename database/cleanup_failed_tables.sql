-- Cleanup script for failed table creation
-- Run this if the previous user_preferences_tables.sql failed

-- Drop tables if they exist (in reverse order due to foreign key constraints)
DROP TABLE IF EXISTS meetup_reviews CASCADE;
DROP TABLE IF EXISTS meetup_participants CASCADE;
DROP TABLE IF EXISTS meetups CASCADE;
DROP TABLE IF EXISTS user_reviews CASCADE;
DROP TABLE IF EXISTS user_ratings CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;

-- Note: This will remove any data in these tables if they exist
-- Make sure to backup any important data before running this script
