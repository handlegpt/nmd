-- Part 3: Add cities from other continents
-- EUROPE - Additional cities
INSERT INTO cities (id, name, country, country_code, timezone, latitude, longitude, visa_days, visa_type, cost_of_living, wifi_speed) VALUES
-- Europe - Eastern Europe
('a001-0000-0000-0000-000000000201', 'Warsaw', 'Poland', 'PL', 'Europe/Warsaw', 52.2297, 21.0122, 90, 'Schengen Visa', 800, 85),
('a001-0000-0000-0000-000000000202', 'Krakow', 'Poland', 'PL', 'Europe/Warsaw', 50.0755, 19.9445, 90, 'Schengen Visa', 700, 80),
('a001-0000-0000-0000-000000000203', 'Gdansk', 'Poland', 'PL', 'Europe/Warsaw', 54.3520, 18.6466, 90, 'Schengen Visa', 650, 75),
('a001-0000-0000-0000-000000000204', 'Wroclaw', 'Poland', 'PL', 'Europe/Warsaw', 51.1079, 17.0385, 90, 'Schengen Visa', 600, 70),
('a001-0000-0000-0000-000000000205', 'Poznan', 'Poland', 'PL', 'Europe/Warsaw', 52.4064, 16.9252, 90, 'Schengen Visa', 550, 65),
('a001-0000-0000-0000-000000000206', 'Lublin', 'Poland', 'PL', 'Europe/Warsaw', 51.2465, 22.5684, 90, 'Schengen Visa', 500, 60),
('a001-0000-0000-0000-000000000207', 'Katowice', 'Poland', 'PL', 'Europe/Warsaw', 50.2649, 19.0238, 90, 'Schengen Visa', 500, 60),
('a001-0000-0000-0000-000000000208', 'Lodz', 'Poland', 'PL', 'Europe/Warsaw', 51.7592, 19.4560, 90, 'Schengen Visa', 450, 55),
('a001-0000-0000-0000-000000000209', 'Szczecin', 'Poland', 'PL', 'Europe/Warsaw', 53.4285, 14.5528, 90, 'Schengen Visa', 500, 60),
('a001-0000-0000-0000-000000000210', 'Bydgoszcz', 'Poland', 'PL', 'Europe/Warsaw', 53.1235, 18.0084, 90, 'Schengen Visa', 450, 55),

-- Europe - Romania
('a001-0000-0000-0000-000000000211', 'Bucharest', 'Romania', 'RO', 'Europe/Bucharest', 44.4268, 26.1025, 90, 'Schengen Visa', 600, 70),
('a001-0000-0000-0000-000000000212', 'Cluj-Napoca', 'Romania', 'RO', 'Europe/Bucharest', 46.7712, 23.6236, 90, 'Schengen Visa', 500, 65),
('a001-0000-0000-0000-000000000213', 'Timisoara', 'Romania', 'RO', 'Europe/Bucharest', 45.7472, 21.2087, 90, 'Schengen Visa', 450, 60),
('a001-0000-0000-0000-000000000214', 'Iasi', 'Romania', 'RO', 'Europe/Bucharest', 47.1585, 27.6014, 90, 'Schengen Visa', 400, 55),
('a001-0000-0000-0000-000000000215', 'Constanta', 'Romania', 'RO', 'Europe/Bucharest', 44.1598, 28.6348, 90, 'Schengen Visa', 450, 60),
('a001-0000-0000-0000-000000000216', 'Craiova', 'Romania', 'RO', 'Europe/Bucharest', 44.3199, 23.7967, 90, 'Schengen Visa', 400, 55),
('a001-0000-0000-0000-000000000217', 'Galati', 'Romania', 'RO', 'Europe/Bucharest', 45.4353, 28.0080, 90, 'Schengen Visa', 350, 50),
('a001-0000-0000-0000-000000000218', 'Ploiesti', 'Romania', 'RO', 'Europe/Bucharest', 44.9419, 26.0225, 90, 'Schengen Visa', 400, 55),
('a001-0000-0000-0000-000000000219', 'Brasov', 'Romania', 'RO', 'Europe/Bucharest', 45.6427, 25.5887, 90, 'Schengen Visa', 450, 60),
('a001-0000-0000-0000-000000000220', 'Sibiu', 'Romania', 'RO', 'Europe/Bucharest', 45.8035, 24.1450, 90, 'Schengen Visa', 400, 55),

-- Europe - Bulgaria
('a001-0000-0000-0000-000000000221', 'Sofia', 'Bulgaria', 'BG', 'Europe/Sofia', 42.6977, 23.3219, 90, 'Schengen Visa', 500, 65),
('a001-0000-0000-0000-000000000222', 'Plovdiv', 'Bulgaria', 'BG', 'Europe/Sofia', 42.1354, 24.7453, 90, 'Schengen Visa', 400, 60),
('a001-0000-0000-0000-000000000223', 'Varna', 'Bulgaria', 'BG', 'Europe/Sofia', 43.2141, 27.9147, 90, 'Schengen Visa', 450, 60),
('a001-0000-0000-0000-000000000224', 'Burgas', 'Bulgaria', 'BG', 'Europe/Sofia', 42.5048, 27.4626, 90, 'Schengen Visa', 400, 55),
('a001-0000-0000-0000-000000000225', 'Ruse', 'Bulgaria', 'BG', 'Europe/Sofia', 43.8564, 25.9569, 90, 'Schengen Visa', 350, 50),
('a001-0000-0000-0000-000000000226', 'Stara Zagora', 'Bulgaria', 'BG', 'Europe/Sofia', 42.4258, 25.6346, 90, 'Schengen Visa', 300, 45),
('a001-0000-0000-0000-000000000227', 'Pleven', 'Bulgaria', 'BG', 'Europe/Sofia', 43.4170, 24.6067, 90, 'Schengen Visa', 300, 45),
('a001-0000-0000-0000-000000000228', 'Sliven', 'Bulgaria', 'BG', 'Europe/Sofia', 42.6858, 26.3292, 90, 'Schengen Visa', 250, 40),
('a001-0000-0000-0000-000000000229', 'Dobrich', 'Bulgaria', 'BG', 'Europe/Sofia', 43.5726, 27.8273, 90, 'Schengen Visa', 300, 45),
('a001-0000-0000-0000-000000000230', 'Shumen', 'Bulgaria', 'BG', 'Europe/Sofia', 43.2706, 26.9361, 90, 'Schengen Visa', 250, 40),

-- Europe - Croatia
('a001-0000-0000-0000-000000000231', 'Zagreb', 'Croatia', 'HR', 'Europe/Zagreb', 45.8150, 15.9819, 90, 'Schengen Visa', 700, 75),
('a001-0000-0000-0000-000000000232', 'Split', 'Croatia', 'HR', 'Europe/Zagreb', 43.5081, 16.4402, 90, 'Schengen Visa', 600, 70),
('a001-0000-0000-0000-000000000233', 'Dubrovnik', 'Croatia', 'HR', 'Europe/Zagreb', 42.6507, 18.0944, 90, 'Schengen Visa', 800, 80),
('a001-0000-0000-0000-000000000234', 'Rijeka', 'Croatia', 'HR', 'Europe/Zagreb', 45.3271, 14.4422, 90, 'Schengen Visa', 550, 65),
('a001-0000-0000-0000-000000000235', 'Osijek', 'Croatia', 'HR', 'Europe/Zagreb', 45.5550, 18.6955, 90, 'Schengen Visa', 500, 60),
('a001-0000-0000-0000-000000000236', 'Zadar', 'Croatia', 'HR', 'Europe/Zagreb', 44.1194, 15.2314, 90, 'Schengen Visa', 550, 65),
('a001-0000-0000-0000-000000000237', 'Slavonski Brod', 'Croatia', 'HR', 'Europe/Zagreb', 45.1603, 18.0156, 90, 'Schengen Visa', 400, 55),
('a001-0000-0000-0000-000000000238', 'Karlovac', 'Croatia', 'HR', 'Europe/Zagreb', 45.4929, 15.5553, 90, 'Schengen Visa', 400, 55),
('a001-0000-0000-0000-000000000239', 'Sisak', 'Croatia', 'HR', 'Europe/Zagreb', 45.4833, 16.3667, 90, 'Schengen Visa', 350, 50),
('a001-0000-0000-0000-000000000240', 'Varazdin', 'Croatia', 'HR', 'Europe/Zagreb', 46.3044, 16.3378, 90, 'Schengen Visa', 400, 55),

-- Europe - Serbia
('a001-0000-0000-0000-000000000241', 'Belgrade', 'Serbia', 'RS', 'Europe/Belgrade', 44.7866, 20.4489, 90, 'Tourist Visa', 500, 60),
('a001-0000-0000-0000-000000000242', 'Novi Sad', 'Serbia', 'RS', 'Europe/Belgrade', 45.2671, 19.8335, 90, 'Tourist Visa', 450, 55),
('a001-0000-0000-0000-000000000243', 'Nis', 'Serbia', 'RS', 'Europe/Belgrade', 43.3209, 21.8958, 90, 'Tourist Visa', 400, 50),
('a001-0000-0000-0000-000000000244', 'Kragujevac', 'Serbia', 'RS', 'Europe/Belgrade', 44.0167, 20.9167, 90, 'Tourist Visa', 350, 45),
('a001-0000-0000-0000-000000000245', 'Subotica', 'Serbia', 'RS', 'Europe/Belgrade', 46.1000, 19.6667, 90, 'Tourist Visa', 350, 45),
('a001-0000-0000-0000-000000000246', 'Zrenjanin', 'Serbia', 'RS', 'Europe/Belgrade', 45.3833, 20.3833, 90, 'Tourist Visa', 300, 40),
('a001-0000-0000-0000-000000000247', 'Pancevo', 'Serbia', 'RS', 'Europe/Belgrade', 44.8667, 20.6500, 90, 'Tourist Visa', 350, 45),
('a001-0000-0000-0000-000000000248', 'Cacak', 'Serbia', 'RS', 'Europe/Belgrade', 43.8833, 20.3500, 90, 'Tourist Visa', 300, 40),
('a001-0000-0000-0000-000000000249', 'Smederevo', 'Serbia', 'RS', 'Europe/Belgrade', 44.6667, 20.9333, 90, 'Tourist Visa', 300, 40),
('a001-0000-0000-0000-000000000250', 'Leskovac', 'Serbia', 'RS', 'Europe/Belgrade', 42.9981, 21.9461, 90, 'Tourist Visa', 250, 35),

-- Europe - Ukraine
('a001-0000-0000-0000-000000000251', 'Kyiv', 'Ukraine', 'UA', 'Europe/Kiev', 50.4501, 30.5234, 90, 'Tourist Visa', 400, 50),
('a001-0000-0000-0000-000000000252', 'Kharkiv', 'Ukraine', 'UA', 'Europe/Kiev', 49.9935, 36.2304, 90, 'Tourist Visa', 350, 45),
('a001-0000-0000-0000-000000000253', 'Odessa', 'Ukraine', 'UA', 'Europe/Kiev', 46.4825, 30.7233, 90, 'Tourist Visa', 400, 50),
('a001-0000-0000-0000-000000000254', 'Dnipro', 'Ukraine', 'UA', 'Europe/Kiev', 48.4647, 35.0462, 90, 'Tourist Visa', 350, 45),
('a001-0000-0000-0000-000000000255', 'Donetsk', 'Ukraine', 'UA', 'Europe/Kiev', 48.0159, 37.8028, 90, 'Tourist Visa', 300, 40),
('a001-0000-0000-0000-000000000256', 'Zaporizhzhia', 'Ukraine', 'UA', 'Europe/Kiev', 47.8388, 35.1396, 90, 'Tourist Visa', 300, 40),
('a001-0000-0000-0000-000000000257', 'Lviv', 'Ukraine', 'UA', 'Europe/Kiev', 49.8397, 24.0297, 90, 'Tourist Visa', 350, 45),
('a001-0000-0000-0000-000000000258', 'Kryvyi Rih', 'Ukraine', 'UA', 'Europe/Kiev', 47.9105, 33.3918, 90, 'Tourist Visa', 300, 40),
('a001-0000-0000-0000-000000000259', 'Mykolaiv', 'Ukraine', 'UA', 'Europe/Kiev', 46.9750, 31.9946, 90, 'Tourist Visa', 300, 40),
('a001-0000-0000-0000-000000000260', 'Mariupol', 'Ukraine', 'UA', 'Europe/Kiev', 47.0971, 37.5434, 90, 'Tourist Visa', 250, 35),

-- Europe - Greece
('a001-0000-0000-0000-000000000261', 'Athens', 'Greece', 'GR', 'Europe/Athens', 37.9755, 23.7348, 90, 'Schengen Visa', 800, 75),
('a001-0000-0000-0000-000000000262', 'Thessaloniki', 'Greece', 'GR', 'Europe/Athens', 40.6401, 22.9444, 90, 'Schengen Visa', 600, 70),
('a001-0000-0000-0000-000000000263', 'Patras', 'Greece', 'GR', 'Europe/Athens', 38.2466, 21.7346, 90, 'Schengen Visa', 500, 65),
('a001-0000-0000-0000-000000000264', 'Heraklion', 'Greece', 'GR', 'Europe/Athens', 35.3080, 25.0775, 90, 'Schengen Visa', 550, 65),
('a001-0000-0000-0000-000000000265', 'Larissa', 'Greece', 'GR', 'Europe/Athens', 39.6390, 22.4191, 90, 'Schengen Visa', 450, 60),
('a001-0000-0000-0000-000000000266', 'Volos', 'Greece', 'GR', 'Europe/Athens', 39.3610, 22.9427, 90, 'Schengen Visa', 450, 60),
('a001-0000-0000-0000-000000000267', 'Ioannina', 'Greece', 'GR', 'Europe/Athens', 39.6677, 20.8508, 90, 'Schengen Visa', 400, 55),
('a001-0000-0000-0000-000000000268', 'Kavala', 'Greece', 'GR', 'Europe/Athens', 40.9393, 24.4067, 90, 'Schengen Visa', 400, 55),
('a001-0000-0000-0000-000000000269', 'Chania', 'Greece', 'GR', 'Europe/Athens', 35.5122, 24.0156, 90, 'Schengen Visa', 500, 60),
('a001-0000-0000-0000-000000000270', 'Rhodes', 'Greece', 'GR', 'Europe/Athens', 36.4412, 28.2225, 90, 'Schengen Visa', 600, 65),

-- Europe - Turkey
('a001-0000-0000-0000-000000000271', 'Istanbul', 'Turkey', 'TR', 'Europe/Istanbul', 41.0082, 28.9784, 90, 'Tourist Visa', 600, 70),
('a001-0000-0000-0000-000000000272', 'Ankara', 'Turkey', 'TR', 'Europe/Istanbul', 39.9334, 32.8597, 90, 'Tourist Visa', 500, 65),
('a001-0000-0000-0000-000000000273', 'Izmir', 'Turkey', 'TR', 'Europe/Istanbul', 38.4192, 27.1287, 90, 'Tourist Visa', 550, 65),
('a001-0000-0000-0000-000000000274', 'Bursa', 'Turkey', 'TR', 'Europe/Istanbul', 40.1826, 29.0665, 90, 'Tourist Visa', 450, 60),
('a001-0000-0000-0000-000000000275', 'Antalya', 'Turkey', 'TR', 'Europe/Istanbul', 36.8969, 30.7133, 90, 'Tourist Visa', 500, 60),
('a001-0000-0000-0000-000000000276', 'Adana', 'Turkey', 'TR', 'Europe/Istanbul', 37.0000, 35.3213, 90, 'Tourist Visa', 400, 55),
('a001-0000-0000-0000-000000000277', 'Konya', 'Turkey', 'TR', 'Europe/Istanbul', 37.8746, 32.4932, 90, 'Tourist Visa', 350, 50),
('a001-0000-0000-0000-000000000278', 'Gaziantep', 'Turkey', 'TR', 'Europe/Istanbul', 37.0662, 37.3833, 90, 'Tourist Visa', 350, 50),
('a001-0000-0000-0000-000000000279', 'Mersin', 'Turkey', 'TR', 'Europe/Istanbul', 36.8000, 34.6333, 90, 'Tourist Visa', 400, 55),
('a001-0000-0000-0000-000000000280', 'Diyarbakir', 'Turkey', 'TR', 'Europe/Istanbul', 37.9144, 40.2306, 90, 'Tourist Visa', 300, 45),

-- Europe - Russia
('a001-0000-0000-0000-000000000281', 'Moscow', 'Russia', 'RU', 'Europe/Moscow', 55.7558, 37.6176, 30, 'Tourist Visa', 800, 70),
('a001-0000-0000-0000-000000000282', 'Saint Petersburg', 'Russia', 'RU', 'Europe/Moscow', 59.9311, 30.3609, 30, 'Tourist Visa', 700, 65),
('a001-0000-0000-0000-000000000283', 'Novosibirsk', 'Russia', 'RU', 'Asia/Novosibirsk', 55.0084, 82.9357, 30, 'Tourist Visa', 500, 55),
('a001-0000-0000-0000-000000000284', 'Yekaterinburg', 'Russia', 'RU', 'Asia/Yekaterinburg', 56.8431, 60.6454, 30, 'Tourist Visa', 450, 50),
('a001-0000-0000-0000-000000000285', 'Kazan', 'Russia', 'RU', 'Europe/Moscow', 55.8304, 49.0661, 30, 'Tourist Visa', 400, 45),
('a001-0000-0000-0000-000000000286', 'Nizhny Novgorod', 'Russia', 'RU', 'Europe/Moscow', 56.2965, 43.9361, 30, 'Tourist Visa', 400, 45),
('a001-0000-0000-0000-000000000287', 'Chelyabinsk', 'Russia', 'RU', 'Asia/Yekaterinburg', 55.1644, 61.4368, 30, 'Tourist Visa', 350, 40),
('a001-0000-0000-0000-000000000288', 'Omsk', 'Russia', 'RU', 'Asia/Omsk', 54.9885, 73.3242, 30, 'Tourist Visa', 350, 40),
('a001-0000-0000-0000-000000000289', 'Samara', 'Russia', 'RU', 'Europe/Samara', 53.2001, 50.1500, 30, 'Tourist Visa', 400, 45),
('a001-0000-0000-0000-000000000290', 'Rostov-on-Don', 'Russia', 'RU', 'Europe/Moscow', 47.2357, 39.7015, 30, 'Tourist Visa', 350, 40)
ON CONFLICT (name, country) DO NOTHING;
