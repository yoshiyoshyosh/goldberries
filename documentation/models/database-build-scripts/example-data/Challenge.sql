INSERT INTO `Challenge`(`challenge_type`, `campaign_id`, `map_id`, `objective_id`, `description`, `difficulty_id`, `difficulty_subtier`, `requires_fc`, `requires_special`, `has_fc`, `has_special`) 
VALUES 
--FWG
("map", NULL, 1, 1, NULL, 4, "guard", 0, 0, 0, 0),
-- Wountain
("map", NULL, 2, 1, NULL, 1, "high", 1, 0, 0, 0),

-- Summit Prologue
("map", NULL, 3, 1, NULL, 2, "high", 1, 0, 0, 0),
("map", NULL, 3, 1, NULL, 2, "low", 0, 0, 0, 0),

-- City on the moon
("map", NULL, 4, 1, NULL, 2, "mid", 0, 0, 0, 0),

--Starfruit Supernova
("map", NULL, 5, 1, NULL, 2, "mid", 0, 0, 0, 0),

-- 7DG
("map", NULL, 6, 1, NULL, 2, "low", 0, 0, 1, 0),

-- 1DG
("map", NULL, 7, 1, NULL, 9, NULL, 0, 0, 1, 0),
-- 1DarkG
("map", NULL, 8, 1, NULL, 9, NULL, 0, 0, 0, 0),

-- Impossible Visitors (Clear, SB, SB+FC)
("map", NULL, 9, 1, NULL, 9, NULL, 0, 0, 1, 1),

-- Nameless Pillars [Quad]
("map", NULL, 10, 13, NULL, 9, NULL, 0, 0, 0, 0),
-- Nameless Pillars [Forwards]
("map", NULL, 10, 14, NULL, 9, NULL, 0, 0, 1, 0),
-- Nameless Pillars [Backwards]
("map", NULL, 10, 15, NULL, 9, NULL, 0, 0, 0, 0),
-- Nameless Pillars [Double Golden]
("map", NULL, 10, 16, NULL, 9, NULL, 0, 0, 1, 1),

-- Starship Ruins
("map", NULL, 11, 2, NULL, 9, NULL, 0, 0, 1, 0),
("map", NULL, 11, 2, NULL, 8, NULL, 0, 1, 0, 0),
("map", NULL, 11, 2, NULL, 7, NULL, 1, 1, 0, 0);