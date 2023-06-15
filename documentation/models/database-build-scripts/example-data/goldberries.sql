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

("All Maps Deathless", "Complete all maps in the campaign without dying", 0, NULL),
("100% Deathless", "Complete all maps and obtain all collectibles in the campaign without dying", 0, NULL),
("All C-Sides Deathless", "Complete all C-Sides of the campaign without dying", 0, NULL),
("Void-Side Moon Berry", "Get the moon berry in Void-Side. This entails doing the Spring-Side, Summer-Side, Winter-Side, Fall-Side and Void-Side golden strawberries in a row without dying, where Void-Side must be last. Void-Side B-Side is not required for this.", 0, NULL),

("Bronze Berry", "Collect the bronze berry (shielded golden berry) of the map. The bronze berry allows you to die a maximum of one time per room.", 1, NULL),
("Segment Golden Berry", "Collect a golden strawberry by completing a segment of the map without dying", 1, NULL),
("Segment Silver Berry", "Collect a silver strawberry by completing a segment of the map without dying", 1, NULL),
("Segment Red Berry", "Collect a red strawberry by completing a segment of the map without dying", 1, NULL),

("DTS", "Collect the golden strawberry while using a Dash-Trigger-Skip", 1, NULL),
("No DTS", "Collect the golden strawberry without using an existing Dash-Trigger-Skip", 1, NULL),

("Quadruple Golden Berry", "Collect all four golden strawberries (2 deathless, 2 one-dash) in one run.", 0, "Quadruple Golden"),
("Forwards Golden", "Collect the start->end golden strawberry", 1, "Forwards"),
("Backwards Golden", "Collect the end->start golden strawberry", 1, "Backwards"),
("Double Golden", "Collect both the forwards and backwards golden strawberry", 1, "Double Golden"),

("Intermediate Lobby Deathless", "Complete all maps in the intermediate lobby without dying", 0, NULL);


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
("KpSi", "chillgoldenarc", 0, 0, 0, NULL),
("voddie", "weh", 0, 1, 0, NULL),
("Parrot_Mash", "she9onmydtilliplatinum", 1, 0, 0, NULL),
("Joshi", "interrobang", 1, 1, 0, NULL),
("Todd Rogers", "dragster5.51", 0, 0, 1, "glumbsdown"),
("Kroomfie", "fullgamegod", 1, 0, 0, NULL),
("isabolle", "sweepingmines", 1, 0, 0, NULL),
("320° NW", ":spki:", 0, 0, 0, NULL),
("Asgor", ":skullemoji:", 0, 0, 0, NULL),
("Other Players", "idkanymorefunnypassword", 0, 0, 0, NULL);


-- ====== Example Data: NewMapSubmission ======
INSERT INTO `NewMapSubmission`(`url`, `name`, `description`) 
VALUES 
("https://gamebanana.com/mods/301132", "7a single dash ver", "fc lol"),
("https://gamebanana.com/mods/150789", "Lunar Ascension", "Silver");


-- ====== Example Data: NewCampaignSubmission ======
INSERT INTO `NewCampaignSubmission`(`url`, `description`) 
VALUES 
("https://gamebanana.com/mods/150732", "Quickie Mountain 2, 100% deathless"),
("https://gamebanana.com/mods/292719", "Celeste: Into The Jungle, All C-Sides deathless");


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
INSERT INTO `Challenge`(`challenge_type`, `campaign_id`, `map_id`, `objective_id`, `description`, `difficulty_id`, `difficulty_subtier`, `requires_fc`, `requires_special`, `has_fc`, `has_special`) 
VALUES 
("map", NULL, 1, 1, NULL, 4, "guard", 0, 0, 0, 0),
("map", NULL, 2, 1, NULL, 1, "high", 1, 0, 0, 0),

("map", NULL, 3, 1, NULL, 2, "high", 1, 0, 0, 0),
("map", NULL, 3, 1, NULL, 2, "low", 0, 0, 0, 0),

("map", NULL, 4, 1, NULL, 2, "mid", 0, 0, 0, 0),

("map", NULL, 5, 1, NULL, 2, "mid", 0, 0, 0, 0),

("map", NULL, 6, 1, NULL, 2, "low", 0, 0, 1, 0),

("map", NULL, 7, 1, NULL, 9, NULL, 0, 0, 1, 0),
("map", NULL, 8, 1, NULL, 9, NULL, 0, 0, 0, 0),

("map", NULL, 9, 1, NULL, 9, NULL, 0, 0, 1, 1),

("map", NULL, 10, 13, NULL, 9, NULL, 0, 0, 0, 0),
("map", NULL, 10, 14, NULL, 9, NULL, 0, 0, 1, 0),
("map", NULL, 10, 15, NULL, 9, NULL, 0, 0, 0, 0),
("map", NULL, 10, 16, NULL, 9, NULL, 0, 0, 1, 1),

("map", NULL, 11, 2, NULL, 9, NULL, 0, 0, 1, 0),
("map", NULL, 11, 2, NULL, 8, NULL, 0, 1, 0, 0),
("map", NULL, 11, 2, NULL, 7, NULL, 1, 1, 0, 0),

("campaign", 5, NULL, 17, NULL, 3, "high", 0, 0, 0, 0);


-- ====== Example Data: Submission ======
INSERT INTO `Submission`(`challenge_id`, `player_id`, `proof_url`, `player_notes`, `is_verified`, `verifier_id`, `date_verified`, `verifier_notes`, `new_map_submission_id`, `new_campaign_submission_id`, `is_fc`, `is_special`)
VALUES 
(1, 1, "https://www.youtube.com/watch?v=6LZc0nRkl3I", NULL, 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 0, 0),
(1, 2, "https://www.youtube.com/watch?v=naYN4BlslZQ", "frogeline", 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 0, 0),
(1, 4, "https://www.youtube.com/watch?v=UdwwJy-2ymM", NULL, 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 1, 0),

(2, 8, "https://www.youtube.com/watch?v=LCBmyY0yxZo", NULL, 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 0, 0),

(3, 1, "https://www.youtube.com/watch?v=6LZc0nRkl3I", NULL, 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 0, 0),
(4, 9, "https://www.youtube.com/watch?v=6LZc0nRkl3I", NULL, 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 0, 0),

(5, 2, "https://www.youtube.com/watch?v=XLyA-UMhQqo", NULL, 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 0, 0),
(6, 3, "https://www.youtube.com/watch?v=pwoxCMMLuqY&t=155s", NULL, 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 0, 0),

(7, 1, "<insert url here>", NULL, 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 1, 0),
(7, 2, "<insert url here>", NULL, 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 0, 0),
(7, 3, "<insert url here>", NULL, 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 0, 0),
(7, 7, "<insert url here>", NULL, 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 0, 0),
(7, 8, "<insert url here>", NULL, 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 1, 0),
(7, 9, "<insert url here>", NULL, 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 0, 0),

(15, 10, "<insert url here>", NULL, 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 0, 0),
(16, 10, "<insert url here>", NULL, 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 0, 0),
(17, 10, "<insert url here>", NULL, 1, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, 0, 0);


-- ====== Example Data: Change ======
INSERT INTO `Change`(`change_type`, `campaign_id`, `map_id`, `challenge_id`, `player_id`, `author`, `description`) 
VALUES 
("campaign", 1, NULL, NULL, NULL, 2, "Fixed typo: 'Vanillo' -> 'Vanilla'"),
("map", NULL, 7, NULL, NULL, 2, "Archived map"),
("challenge", NULL, NULL, 2, NULL, 2, "Moved from 'Tier 6' to 'High Tier 0'"),
("player", NULL, NULL, NULL, 2, 2, "Renamed from 'veddie' to 'voddie'"),
("general", NULL, NULL, NULL, NULL, 2, "Changed description of Objective 'Golden Berry' from 'Get funny fruit' to 'Collect the golden strawberry of the map'");


-- ====== Example Data: FarewellGoldenData ======
INSERT INTO `FarewellGoldenData`(`submission_id`, `date_achieved`, `platform`, `moonberry`, `used_keys`, `kept_keys`, `repeat_collect`, `partial_run`, `berry_number`, `date_202`, `attempted_double_collect`, `double_collect`, `no_moonberry_pickup`) 
VALUES 
(1, CURRENT_TIMESTAMP, "Windows", 0, 0, 0, 0, 0, 202, NULL, 0, 0, 0),
(2, CURRENT_TIMESTAMP, "Windows", 0, 0, 0, 0, 0, 202, NULL, 0, 0, 0),
(3, CURRENT_TIMESTAMP, "Windows", 1, 0, 5, 0, 0, 202, NULL, 1, 1, 0);
