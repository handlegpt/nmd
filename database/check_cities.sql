-- Check which cities exist and which are missing
-- Run this to diagnose the foreign key constraint issue

-- Check total number of cities
SELECT COUNT(*) as total_cities FROM cities;

-- Check if specific city IDs exist
SELECT 
    id,
    name,
    country,
    CASE 
        WHEN id = '550e8400-e29b-41d4-a716-446655440031' THEN 'Bangkok - MISSING'
        WHEN id = '550e8400-e29b-41d4-a716-446655440006' THEN 'Hong Kong - MISSING'
        WHEN id = '550e8400-e29b-41d4-a716-446655440009' THEN 'Tokyo - MISSING'
        ELSE 'Other'
    END as status
FROM cities 
WHERE id IN (
    '550e8400-e29b-41d4-a716-446655440031', -- Bangkok
    '550e8400-e29b-41d4-a716-446655440006', -- Hong Kong
    '550e8400-e29b-41d4-a716-446655440009', -- Tokyo
    '550e8400-e29b-41d4-a716-446655440016', -- Seoul
    '550e8400-e29b-41d4-a716-446655440011', -- Berlin
    '550e8400-e29b-41d4-a716-446655440010', -- Barcelona
    '550e8400-e29b-41d4-a716-446655440012', -- Prague
    '550e8400-e29b-41d4-a716-446655440013', -- Mexico City
    '550e8400-e29b-41d4-a716-446655440014', -- Medellin
    '550e8400-e29b-41d4-a716-446655440001', -- Chiang Mai
    '550e8400-e29b-41d4-a716-446655440002'  -- Bali
);

-- List all cities to see what was actually created
SELECT id, name, country FROM cities ORDER BY name;
