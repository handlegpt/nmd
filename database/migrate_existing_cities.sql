-- =====================================================
-- Migrate Existing Cities Table to Nomad Agent Schema
-- Compatible with existing data structure
-- =====================================================

-- First, let's add the missing columns to the existing cities table
ALTER TABLE cities ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS country_name VARCHAR(100);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS population INTEGER;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS language VARCHAR(100);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS currency VARCHAR(3);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS climate_tag VARCHAR(50);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS safety_score DECIMAL(3,1);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS wifi_speed_mbps DECIMAL(5,1);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS cost_min_usd INTEGER;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS cost_max_usd INTEGER;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS nomad_score DECIMAL(3,1);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS community_score DECIMAL(3,1);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS coffee_score DECIMAL(3,1);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS coworking_score DECIMAL(3,1);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing data to populate new fields
-- Generate slug from name and country
UPDATE cities 
SET slug = LOWER(REPLACE(REPLACE(name || '-' || country, ' ', '-'), '''', ''))
WHERE slug IS NULL;

-- Set country_name from country_code (you may need to adjust this mapping)
UPDATE cities 
SET country_name = CASE country_code
  WHEN 'US' THEN 'United States'
  WHEN 'GB' THEN 'United Kingdom'
  WHEN 'DE' THEN 'Germany'
  WHEN 'FR' THEN 'France'
  WHEN 'ES' THEN 'Spain'
  WHEN 'IT' THEN 'Italy'
  WHEN 'NL' THEN 'Netherlands'
  WHEN 'PT' THEN 'Portugal'
  WHEN 'TH' THEN 'Thailand'
  WHEN 'MX' THEN 'Mexico'
  WHEN 'BR' THEN 'Brazil'
  WHEN 'AR' THEN 'Argentina'
  WHEN 'CL' THEN 'Chile'
  WHEN 'CO' THEN 'Colombia'
  WHEN 'PE' THEN 'Peru'
  WHEN 'UY' THEN 'Uruguay'
  WHEN 'CR' THEN 'Costa Rica'
  WHEN 'GT' THEN 'Guatemala'
  WHEN 'PA' THEN 'Panama'
  WHEN 'EC' THEN 'Ecuador'
  WHEN 'BO' THEN 'Bolivia'
  WHEN 'PY' THEN 'Paraguay'
  WHEN 'VE' THEN 'Venezuela'
  WHEN 'CU' THEN 'Cuba'
  WHEN 'DO' THEN 'Dominican Republic'
  WHEN 'JM' THEN 'Jamaica'
  WHEN 'TT' THEN 'Trinidad and Tobago'
  WHEN 'BB' THEN 'Barbados'
  WHEN 'BS' THEN 'Bahamas'
  WHEN 'BZ' THEN 'Belize'
  WHEN 'GY' THEN 'Guyana'
  WHEN 'SR' THEN 'Suriname'
  WHEN 'CN' THEN 'China'
  WHEN 'JP' THEN 'Japan'
  WHEN 'KR' THEN 'South Korea'
  WHEN 'SG' THEN 'Singapore'
  WHEN 'MY' THEN 'Malaysia'
  WHEN 'ID' THEN 'Indonesia'
  WHEN 'PH' THEN 'Philippines'
  WHEN 'VN' THEN 'Vietnam'
  WHEN 'IN' THEN 'India'
  WHEN 'BD' THEN 'Bangladesh'
  WHEN 'PK' THEN 'Pakistan'
  WHEN 'LK' THEN 'Sri Lanka'
  WHEN 'NP' THEN 'Nepal'
  WHEN 'BT' THEN 'Bhutan'
  WHEN 'MV' THEN 'Maldives'
  WHEN 'AU' THEN 'Australia'
  WHEN 'NZ' THEN 'New Zealand'
  WHEN 'FJ' THEN 'Fiji'
  WHEN 'PG' THEN 'Papua New Guinea'
  WHEN 'SB' THEN 'Solomon Islands'
  WHEN 'VU' THEN 'Vanuatu'
  WHEN 'NC' THEN 'New Caledonia'
  WHEN 'PF' THEN 'French Polynesia'
  WHEN 'WS' THEN 'Samoa'
  WHEN 'TO' THEN 'Tonga'
  WHEN 'KI' THEN 'Kiribati'
  WHEN 'TV' THEN 'Tuvalu'
  WHEN 'NR' THEN 'Nauru'
  WHEN 'PW' THEN 'Palau'
  WHEN 'FM' THEN 'Micronesia'
  WHEN 'MH' THEN 'Marshall Islands'
  WHEN 'CA' THEN 'Canada'
  WHEN 'RU' THEN 'Russia'
  WHEN 'KZ' THEN 'Kazakhstan'
  WHEN 'UZ' THEN 'Uzbekistan'
  WHEN 'KG' THEN 'Kyrgyzstan'
  WHEN 'TJ' THEN 'Tajikistan'
  WHEN 'TM' THEN 'Turkmenistan'
  WHEN 'AF' THEN 'Afghanistan'
  WHEN 'IR' THEN 'Iran'
  WHEN 'IQ' THEN 'Iraq'
  WHEN 'SY' THEN 'Syria'
  WHEN 'LB' THEN 'Lebanon'
  WHEN 'JO' THEN 'Jordan'
  WHEN 'IL' THEN 'Israel'
  WHEN 'PS' THEN 'Palestine'
  WHEN 'SA' THEN 'Saudi Arabia'
  WHEN 'AE' THEN 'United Arab Emirates'
  WHEN 'QA' THEN 'Qatar'
  WHEN 'BH' THEN 'Bahrain'
  WHEN 'KW' THEN 'Kuwait'
  WHEN 'OM' THEN 'Oman'
  WHEN 'YE' THEN 'Yemen'
  WHEN 'EG' THEN 'Egypt'
  WHEN 'LY' THEN 'Libya'
  WHEN 'TN' THEN 'Tunisia'
  WHEN 'DZ' THEN 'Algeria'
  WHEN 'MA' THEN 'Morocco'
  WHEN 'SD' THEN 'Sudan'
  WHEN 'SS' THEN 'South Sudan'
  WHEN 'ET' THEN 'Ethiopia'
  WHEN 'ER' THEN 'Eritrea'
  WHEN 'DJ' THEN 'Djibouti'
  WHEN 'SO' THEN 'Somalia'
  WHEN 'KE' THEN 'Kenya'
  WHEN 'UG' THEN 'Uganda'
  WHEN 'TZ' THEN 'Tanzania'
  WHEN 'RW' THEN 'Rwanda'
  WHEN 'BI' THEN 'Burundi'
  WHEN 'MW' THEN 'Malawi'
  WHEN 'ZM' THEN 'Zambia'
  WHEN 'ZW' THEN 'Zimbabwe'
  WHEN 'BW' THEN 'Botswana'
  WHEN 'NA' THEN 'Namibia'
  WHEN 'ZA' THEN 'South Africa'
  WHEN 'LS' THEN 'Lesotho'
  WHEN 'SZ' THEN 'Eswatini'
  WHEN 'MG' THEN 'Madagascar'
  WHEN 'MU' THEN 'Mauritius'
  WHEN 'SC' THEN 'Seychelles'
  WHEN 'KM' THEN 'Comoros'
  WHEN 'YT' THEN 'Mayotte'
  WHEN 'RE' THEN 'Réunion'
  WHEN 'MZ' THEN 'Mozambique'
  WHEN 'AO' THEN 'Angola'
  WHEN 'CD' THEN 'Democratic Republic of the Congo'
  WHEN 'CG' THEN 'Republic of the Congo'
  WHEN 'CF' THEN 'Central African Republic'
  WHEN 'TD' THEN 'Chad'
  WHEN 'CM' THEN 'Cameroon'
  WHEN 'GQ' THEN 'Equatorial Guinea'
  WHEN 'GA' THEN 'Gabon'
  WHEN 'ST' THEN 'São Tomé and Príncipe'
  WHEN 'GH' THEN 'Ghana'
  WHEN 'TG' THEN 'Togo'
  WHEN 'BJ' THEN 'Benin'
  WHEN 'NE' THEN 'Niger'
  WHEN 'BF' THEN 'Burkina Faso'
  WHEN 'ML' THEN 'Mali'
  WHEN 'SN' THEN 'Senegal'
  WHEN 'GM' THEN 'Gambia'
  WHEN 'GN' THEN 'Guinea'
  WHEN 'GW' THEN 'Guinea-Bissau'
  WHEN 'SL' THEN 'Sierra Leone'
  WHEN 'LR' THEN 'Liberia'
  WHEN 'CI' THEN 'Ivory Coast'
  WHEN 'MR' THEN 'Mauritania'
  WHEN 'CV' THEN 'Cape Verde'
  WHEN 'DK' THEN 'Denmark'
  WHEN 'SE' THEN 'Sweden'
  WHEN 'NO' THEN 'Norway'
  WHEN 'FI' THEN 'Finland'
  WHEN 'IS' THEN 'Iceland'
  WHEN 'IE' THEN 'Ireland'
  WHEN 'CH' THEN 'Switzerland'
  WHEN 'AT' THEN 'Austria'
  WHEN 'BE' THEN 'Belgium'
  WHEN 'LU' THEN 'Luxembourg'
  WHEN 'LI' THEN 'Liechtenstein'
  WHEN 'MC' THEN 'Monaco'
  WHEN 'SM' THEN 'San Marino'
  WHEN 'VA' THEN 'Vatican City'
  WHEN 'AD' THEN 'Andorra'
  WHEN 'MT' THEN 'Malta'
  WHEN 'CY' THEN 'Cyprus'
  WHEN 'GR' THEN 'Greece'
  WHEN 'TR' THEN 'Turkey'
  WHEN 'BG' THEN 'Bulgaria'
  WHEN 'RO' THEN 'Romania'
  WHEN 'HU' THEN 'Hungary'
  WHEN 'SK' THEN 'Slovakia'
  WHEN 'CZ' THEN 'Czech Republic'
  WHEN 'PL' THEN 'Poland'
  WHEN 'LT' THEN 'Lithuania'
  WHEN 'LV' THEN 'Latvia'
  WHEN 'EE' THEN 'Estonia'
  WHEN 'BY' THEN 'Belarus'
  WHEN 'UA' THEN 'Ukraine'
  WHEN 'MD' THEN 'Moldova'
  WHEN 'RS' THEN 'Serbia'
  WHEN 'ME' THEN 'Montenegro'
  WHEN 'BA' THEN 'Bosnia and Herzegovina'
  WHEN 'HR' THEN 'Croatia'
  WHEN 'SI' THEN 'Slovenia'
  WHEN 'MK' THEN 'North Macedonia'
  WHEN 'AL' THEN 'Albania'
  WHEN 'XK' THEN 'Kosovo'
  WHEN 'GE' THEN 'Georgia'
  WHEN 'AM' THEN 'Armenia'
  WHEN 'AZ' THEN 'Azerbaijan'
  ELSE country_code
END
WHERE country_name IS NULL;

-- Set default values for new fields based on existing data
UPDATE cities 
SET 
  wifi_speed_mbps = wifi_speed,
  cost_min_usd = cost_of_living * 0.8,
  cost_max_usd = cost_of_living * 1.2,
  nomad_score = CASE 
    WHEN wifi_speed >= 50 AND cost_of_living <= 2000 THEN 8.0
    WHEN wifi_speed >= 30 AND cost_of_living <= 3000 THEN 7.0
    WHEN wifi_speed >= 20 AND cost_of_living <= 4000 THEN 6.0
    ELSE 5.0
  END,
  community_score = 7.0, -- Default value
  coffee_score = 7.0,    -- Default value
  coworking_score = 7.0, -- Default value
  safety_score = 7.0,    -- Default value
  language = 'English',  -- Default value
  currency = 'USD',      -- Default value
  climate_tag = 'temperate', -- Default value
  population = 1000000,  -- Default value
  is_active = true
WHERE wifi_speed_mbps IS NULL;

-- Add unique constraint on slug (drop first if exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cities_slug_unique'
    ) THEN
        ALTER TABLE cities ADD CONSTRAINT cities_slug_unique UNIQUE (slug);
    END IF;
END $$;

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities (slug);
CREATE INDEX IF NOT EXISTS idx_cities_country_name ON cities (country_name);
CREATE INDEX IF NOT EXISTS idx_cities_cost_range ON cities (cost_min_usd, cost_max_usd);
CREATE INDEX IF NOT EXISTS idx_cities_nomad_score ON cities (nomad_score);
CREATE INDEX IF NOT EXISTS idx_cities_active ON cities (is_active);

-- Now create the other tables that don't exist yet
-- (These will be created by the safe migration script)

-- Show the updated cities table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'cities' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
