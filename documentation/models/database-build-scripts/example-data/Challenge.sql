INSERT INTO Challenge(challenge_type, campaign_id, map_id, objective_id, description, difficulty_id, difficulty_subtier, requires_fc, requires_special, has_fc, has_special) 
VALUES 
-- FWG
('map', NULL, 1, 1, NULL, 4, 'guard', false, false, false, false),
-- Waterbear Mountain
('map', NULL, 2, 1, NULL, 1, 'high', true, false, false, false),

-- Summit Prologue
('map', NULL, 3, 1, NULL, 2, 'high', true, false, false, false),
('map', NULL, 3, 1, NULL, 2, 'low', false, false, false, false),

-- CotM
('map', NULL, 4, 1, NULL, 2, 'mid', false, false, false, false),

-- Starfruit Supernova
('map', NULL, 5, 1, NULL, 2, 'mid', false, false, false, false),

-- 7DG
('map', NULL, 6, 1, NULL, 2, 'low', false, false, true, false),

-- 1DG
('map', NULL, 7, 1, NULL, 9, NULL, false, false, true, false),
-- 1DarkG
('map', NULL, 8, 1, NULL, 9, NULL, false, false, false, false),

-- Impossible Visitors (Clear, SB, SB+FC)
('map', NULL, 9, 1, NULL, 9, NULL, false, false, true, true),

-- Nameless Pillars [Quad]
('map', NULL, 10, 13, NULL, 9, NULL, false, false, false, false),
-- Nameless Pillars [Forwards]
('map', NULL, 10, 14, NULL, 9, NULL, false, false, true, false),
-- Nameless Pillars [Backwards]
('map', NULL, 10, 15, NULL, 9, NULL, false, false, false, false),
-- Nameless Pillars [Double Golden]
('map', NULL, 10, 16, NULL, 9, NULL, false, false, true, false),

-- Starship Ruins
('map', NULL, 11, 2, NULL, 9, NULL, false, false, true, false),
('map', NULL, 11, 2, NULL, 8, NULL, false, true, false, false),
('map', NULL, 11, 2, NULL, 7, NULL, true, true, false, false),

-- Full Game Challenges
('campaign', 5, NULL, 17, NULL, 3, 'high', false, false, false, false);
