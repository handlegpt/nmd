-- Script to run all city addition scripts in order
-- This will add 300+ new cities to the database

-- First, let's check how many cities we currently have
SELECT COUNT(*) as current_city_count FROM cities;

-- Run Part 1: Asia - Southeast Asia, Singapore, Philippines, Thailand
\i add_300_cities.sql

-- Run Part 2: Asia - Vietnam, Indonesia, Japan, South Korea, Taiwan, China, India
\i add_300_cities_part2.sql

-- Run Part 3: Europe - Eastern Europe, Romania, Bulgaria, Croatia, Serbia, Ukraine, Greece, Turkey, Russia
\i add_300_cities_part3.sql

-- Run Part 4: Americas - North America, Central America, South America
\i add_300_cities_part4.sql

-- Run Part 5: Africa and Oceania
\i add_300_cities_part5.sql

-- Final count to see how many cities we have now
SELECT COUNT(*) as final_city_count FROM cities;

-- Show some sample cities by country
SELECT country, COUNT(*) as city_count 
FROM cities 
GROUP BY country 
ORDER BY city_count DESC 
LIMIT 20;
