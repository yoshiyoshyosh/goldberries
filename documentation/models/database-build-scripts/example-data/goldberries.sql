-- Combined Example Data Script

-- ========== Add Example Data ==========

-- ====== Example Data: Campaign ======
INSERT INTO `Campaign`(`name`, `url`) 
VALUES 
("Vanilla", "Vanilla"),
("Monika's D-Sides Pack", "https://gamebanana.com/mods/150759"),
("Lunar Ruins", "https://gamebanana.com/mods/150491"),
("Asleep", "https://gamebanana.com/mods/150624"),
("Strawberry Jam Collab", "https://gamebanana.com/mods/424541"),
("Gate To The Stars", "https://gamebanana.com/mods/291623"),
("Celeste 2021 Winter Collab", "https://gamebanana.com/mods/150789");


-- ====== Example Data: Objective ======
INSERT INTO `Objective`(`name`, `description`, `is_arbitrary`, `display_name_suffix`) 
VALUES 
("Golden Berry", "Collect the golden strawberry of the map", 0, NULL),
("Silver Berry", "Collect the silver strawberry of the map", 0, NULL),
("Quadruple Golden Berry", "Collect all four golden strawberries (2 deathless, 2 one-dash) in one run.", 0, "Quadruple Golden"),

("All Maps Deathless", "Complete all maps in the campaign without dying", 0, NULL),
("100% Deathless", "Complete all maps and obtain all collectibles in the campaign without dying", 0, NULL),
("All C-Sides Deathless", "Complete all C-Sides of the campaign without dying", 0, NULL),
("Void-Side Moon Berry", "Get the moon berry in Void-Side. This entails doing the Spring-Side, Summer-Side, Winter-Side, Fall-Side and Void-Side golden strawberries in a row without dying, where Void-Side must be last. Void-Side B-Side is not required for this.", 0, NULL),

("Bronze Berry", "Collect the bronze berry (shielded golden berry) of the map. The bronze berry allows you to die a maximum of one time per room.", 1, NULL),
("Segment Golden Berry", "Collect a golden strawberry by completing a segment of the map without dying", 1, NULL),
("Segment Silver Berry", "Collect a silver strawberry by completing a segment of the map without dying", 1, NULL),
("Segment Red Berry", "Collect a red strawberry by completing a segment of the map without dying", 1, NULL),
("DTS", "Collect the golden strawberry while using a Dash-Trigger-Skip", 1, NULL),
("No DTS", "Collect the golden strawberry without using an existing Dash-Trigger-Skip", 1, NULL);


-- ====== Example Data: Difficulty ======
INSERT INTO `Difficulty`(`name`, `tier`) 
VALUES
("Tier 0", 0),
("Tier 1", 1),
("Tier 2", 2),
("Tier 3", 3),
("Tier 4", 4),
("Tier 5", 5),
("Tier 6", 6),
("Tier 7", 7),
("Standard", NULL),
("Undetermined", NULL);



-- ====== Example Data: Player ======
INSERT INTO `Player`(`name`, `password`, `is_verifier`, `is_admin`, `is_suspended`, `suspension_reason`) 
VALUES 
("KsPi", "chillgoldenarc", 0, 0, 0, NULL),
("voddi", "weh", 0, 1, 0, NULL),
("Parrot_Mash", "she9onmydtilliplatinum", 1, 0, 0, NULL),
("Joshi", "interrobang", 1, 1, 0, NULL),
("SpaceUK", "hahacheatingfuny", 0, 0, 1, "nah");


-- ====== Example Data: NewMapSubmission ======


-- ====== Example Data: NewCampaignSubmission ======


-- ====== Example Data: Log ======
INSERT INTO `Log`(`message`, `level`, `topic`) 
VALUES 
("Started DB backup task", "info", "database"),
("Finished DB backup", "info", "database"),
("Submission created for Player 'KpSi', Map 'Drowning Oilrig'", "info", "submissions"),
("User deleted their own submission for Player 'KpSi', Map 'Drowning Oilrig'", "info", "submissions"),
("Submission created for Player 'KpSi', Map 'Drowning Oilrig'", "info", "submissions"),
("Verifier 'Parrot_Mash' created Objective 'Platinum Berry' with description 'Collect the Platinum Berry of the map'", "info", "objectives");


-- ====== Example Data: Map ======
INSERT INTO `Map`(`name`, `url`, `side`, `campaign_id`, `sort_1`, `sort_2`) 
VALUES 
("Farewell", NULL, NULL, 1, NULL, NULL),
("Waterbear Mountain", "https://gamebanana.com/mods/351275", NULL, NULL, NULL, NULL),
("Summit Prologue", "https://gamebanana.com/mods/150572", NULL, NULL, NULL, NULL),
("City on the moon", NULL, NULL, 3, 2, NULL),
("Starfruit Supernova", NULL, NULL, 5, 4, 5),

("The Summit D-Side.", NULL, NULL, 2, 7, 1),
("Forsaken City D-Side", NULL, NULL, 2, 1, 1),
("Forsaken City Dark-Side", NULL, NULL, 2, 1, 2),

("Impossible Visitors", NULL, NULL, 6, 1, NULL),
("Nameless Pillars", NULL, NULL, 6, 2, NULL),

("Starship Ruins", NULL, NULL, 7, 5, NULL),
("FORWARD FACILITY", NULL, NULL, 7, 5, NULL);


-- ====== Example Data: Challenge ======


-- ====== Example Data: Submission ======


-- ====== Example Data: Change ======


-- ====== Example Data: FarewellGoldenData ======
