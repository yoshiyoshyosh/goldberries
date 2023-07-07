-- Combined Example Data Script

/*
Notices for entering data:
- Escape single quotes when entering manually (of course)
- Use paramaterized values for user-entry (this should sidestep the manual escaping of entering data manually)
*/

-- ========== Add Example Data ==========

-- ====== Example Data: Campaign ======
INSERT INTO Campaign(name, url) 
VALUES 
('Vanilla', 'Vanilla'),
('Monika''s D-Sides Pack', 'https://gamebanana.com/mods/150759'),
('Lunar Ruins', 'https://gamebanana.com/mods/150491'),
('Asleep', 'https://gamebanana.com/mods/150624'),
('Strawberry Jam Collab', 'https://gamebanana.com/mods/424541'),
('Gate To The Stars', 'https://gamebanana.com/mods/291623'),
('Celeste 2021 Winter Collab', 'https://gamebanana.com/mods/150789');


-- ====== Example Data: Objective ======
INSERT INTO Objective(name, description, is_arbitrary, display_name_suffix) 
VALUES 
('Golden Berry', 'Collect the golden strawberry of the map', false, NULL),
('Silver Berry', 'Collect the silver strawberry of the map', false, NULL),

('All Maps Deathless', 'Complete all maps in the campaign without dying', false, NULL),
('100% Deathless', 'Complete all maps and obtain all collectibles in the campaign without dying', false, NULL),
('All C-Sides Deathless', 'Complete all C-Sides of the campaign without dying', false, NULL),
('Void-Side Moon Berry', 'Get the moon berry in Void-Side. This entails doing the Spring-Side, Summer-Side, Winter-Side, Fall-Side and Void-Side golden strawberries in a row without dying, where Void-Side must be last. Void-Side B-Side is not required for this.', false, NULL),

('Bronze Berry', 'Collect the bronze berry (shielded golden berry) of the map. The bronze berry allows you to die a maximum of one time per room.', true, NULL),
('Segment Golden Berry', 'Collect a golden strawberry by completing a segment of the map without dying', true, NULL),
('Segment Silver Berry', 'Collect a silver strawberry by completing a segment of the map without dying', true, NULL),
('Segment Red Berry', 'Collect a red strawberry by completing a segment of the map without dying', true, NULL),

('DTS', 'Collect the golden strawberry while using a Dash-Trigger-Skip', true, NULL),
('No DTS', 'Collect the golden strawberry without using an existing Dash-Trigger-Skip', true, NULL),

('Quadruple Golden Berry', 'Collect all four golden strawberries (2 deathless, 2 one-dash) in one run.', false, 'Quadruple Golden'),
('Forwards Golden', 'Collect the start->end golden strawberry', true, 'Forwards'),
('Backwards Golden', 'Collect the end->start golden strawberry', true, 'Backwards'),
('Double Golden', 'Collect both the forwards and backwards golden strawberry', true, 'Double Golden'),

('Intermediate Lobby Deathless', 'Complete all maps in the intermediate lobby without dying', false, NULL);


-- ====== Example Data: Difficulty ======
INSERT INTO Difficulty(name, tier) 
VALUES
('Tier 0', 0),
('Tier 1', 1),
('Tier 2', 2),
('Tier 3', 3),
('Tier 4', 4),
('Tier 5', 5),
('Tier 6', 6),
('Tier 7', 7),
('Standard', NULL),
('Undetermined', NULL);


-- ====== Example Data: Player ======
INSERT INTO Player(name, password, is_verifier, is_admin, is_suspended, suspension_reason) 
VALUES 
('KpSi', 'chillgoldenarc', false, false, false, NULL),
('voddie', 'weh', false, true, false, NULL),
('Parrot_Mash', 'she9onmydtilliplatinum', true, false, false, NULL),
('Joshi', 'interrobang', true, true, false, NULL),
('Todd Rogers', 'dragster5.51', false, false, true, 'glumbsdown'),
('Kroomfie', 'fullgamegod', true, false, false, NULL),
('isabolle', 'sweepingmines', true, false, false, NULL),
('320° NW', ':spki:', false, false, false, NULL),
('Asgor', ':skullemoji:', false, false, false, NULL),
('Other Players', 'idkanymorefunnypassword', false, false, false, NULL);


-- ====== Example Data: NewMapSubmission ======
INSERT INTO NewMapSubmission(url, name, description) 
VALUES 
('https://gamebanana.com/mods/301132', '7a single dash ver', 'fc lol'),
('https://gamebanana.com/mods/150789', 'Lunar Ascension', 'Silver');


-- ====== Example Data: NewCampaignSubmission ======
INSERT INTO NewCampaignSubmission(url, description) 
VALUES 
('https://gamebanana.com/mods/150732', 'Quickie Mountain 2, 100% deathless'),
('https://gamebanana.com/mods/292719', 'Celeste: Into The Jungle, All C-Sides deathless');


-- ====== Example Data: Logging ======
INSERT INTO Logging(message, level, topic) 
VALUES 
('Started DB backup task', 'info', 'database'),
('Finished DB backup', 'info', 'database'),
('Submission created for Player ''KpSi'', Map ''Drowning Oilrig''', 'info', 'submissions'),
('User deleted their own submission for Player ''KpSi'', Map ''Drowning Oilrig''', 'info', 'submissions'),
('Submission created for Player ''KpSi'', Map ''Drowning Oilrig''', 'info', 'submissions'),
('Verifier ''Parrot_Mash'' created Objective ''Platinum Berry'' with description ''Collect the Platinum Berry of the map''', 'info', 'objectives');


-- ====== Example Data: Map ======
INSERT INTO Map(name, url, side, campaign_id, sort_1, sort_2) 
VALUES 
('Farewell', NULL, NULL, 1, NULL, NULL),
('Waterbear Mountain', 'https://gamebanana.com/mods/351275', NULL, NULL, NULL, NULL),
('Summit Prologue', 'https://gamebanana.com/mods/150572', NULL, NULL, NULL, NULL),
('City on the moon', NULL, NULL, 3, 2, NULL),
('Starfruit Supernova', NULL, NULL, 5, 4, 5),

('The Summit D-Side.', NULL, NULL, 2, 7, 1),
('Forsaken City D-Side', NULL, NULL, 2, 1, 1),
('Forsaken City Dark-Side', NULL, NULL, 2, 1, 2),

('Impossible Visitors', NULL, NULL, 6, 1, NULL),
('Nameless Pillars', NULL, NULL, 6, 2, NULL),

('Starship Ruins', NULL, NULL, 7, 5, NULL),
('FORWARD FACILITY', NULL, NULL, 7, 5, NULL);


-- ====== Example Data: Challenge ======
INSERT INTO Challenge(challenge_type, campaign_id, map_id, objective_id, description, difficulty_id, difficulty_subtier, requires_fc, requires_special, has_fc, has_special) 
VALUES 
('map', NULL, 1, 1, NULL, 4, 'guard', false, false, false, false),
('map', NULL, 2, 1, NULL, 1, 'high', true, false, false, false),

('map', NULL, 3, 1, NULL, 2, 'high', true, false, false, false),
('map', NULL, 3, 1, NULL, 2, 'low', false, false, false, false),

('map', NULL, 4, 1, NULL, 2, 'mid', false, false, false, false),

('map', NULL, 5, 1, NULL, 2, 'mid', false, false, false, false),

('map', NULL, 6, 1, NULL, 2, 'low', false, false, true, false),

('map', NULL, 7, 1, NULL, 9, NULL, false, false, true, false),
('map', NULL, 8, 1, NULL, 9, NULL, false, false, false, false),

('map', NULL, 9, 1, NULL, 9, NULL, false, false, true, true),

('map', NULL, 10, 13, NULL, 9, NULL, false, false, false, false),
('map', NULL, 10, 14, NULL, 9, NULL, false, false, true, false),
('map', NULL, 10, 15, NULL, 9, NULL, false, false, false, false),
('map', NULL, 10, 16, NULL, 9, NULL, false, false, true, false),

('map', NULL, 11, 2, NULL, 9, NULL, false, false, true, false),
('map', NULL, 11, 2, NULL, 8, NULL, false, true, false, false),
('map', NULL, 11, 2, NULL, 7, NULL, true, true, false, false),

('campaign', 5, NULL, 17, NULL, 3, 'high', false, false, false, false);


-- ====== Example Data: Submission ======
INSERT INTO Submission(challenge_id, player_id, proof_url, player_notes, is_verified, verifier_id, date_verified, verifier_notes, new_map_submission_id, new_campaign_submission_id, is_fc, is_special)
VALUES 
(1, 1, 'https://www.youtube.com/watch?v=6LZc0nRkl3I', NULL, true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, false, false),
(1, 2, 'https://www.youtube.com/watch?v=naYN4BlslZQ', 'frogeline', true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, false, false),
(1, 4, 'https://www.youtube.com/watch?v=UdwwJy-2ymM', NULL, true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, true, false),

(2, 8, 'https://www.youtube.com/watch?v=LCBmyY0yxZo', NULL, true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, false, false),

(3, 1, 'https://www.youtube.com/watch?v=6LZc0nRkl3I', NULL, true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, false, false),
(4, 9, 'https://www.youtube.com/watch?v=6LZc0nRkl3I', NULL, true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, false, false),

(5, 2, 'https://www.youtube.com/watch?v=XLyA-UMhQqo', NULL, true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, false, false),
(6, 3, 'https://www.youtube.com/watch?v=pwoxCMMLuqY&t=155s', NULL, true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, false, false),

(7, 1, '<insert url here>', NULL, true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, true, false),
(7, 2, '<insert url here>', NULL, true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, false, false),
(7, 3, '<insert url here>', NULL, true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, false, false),
(7, 7, '<insert url here>', NULL, true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, false, false),
(7, 8, '<insert url here>', NULL, true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, true, false),
(7, 9, '<insert url here>', NULL, true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, false, false),

(15, 10, '<insert url here>', NULL, true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, false, false),
(16, 10, '<insert url here>', NULL, true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, false, false),
(17, 10, '<insert url here>', NULL, true, 7, CURRENT_TIMESTAMP, NULL, NULL, NULL, false, false);


-- ====== Example Data: Change ======
INSERT INTO Change(change_type, campaign_id, map_id, challenge_id, player_id, author, description) 
VALUES 
('campaign', 1, NULL, NULL, NULL, 2, 'Fixed typo: ''Vanillo'' -> ''Vanilla'''),
('map', NULL, 7, NULL, NULL, 2, 'Archived map'),
('challenge', NULL, NULL, 2, NULL, 2, 'Moved from ''Tier 6'' to ''High Tier 0'''),
('player', NULL, NULL, NULL, 2, 2, 'Renamed from ''veddie'' to ''voddie'''),
('general', NULL, NULL, NULL, NULL, 2, 'Changed description of Objective ''Golden Berry'' from ''Get funny fruit'' to ''Collect the golden strawberry of the map''');


-- ====== Example Data: FarewellGoldenData ======
INSERT INTO FarewellGoldenData(submission_id, date_achieved, platform, moonberry, used_keys, kept_keys, repeat_collect, partial_run, berry_number, date_202, attempted_double_collect, double_collect, no_moonberry_pickup) 
VALUES 
(1, CURRENT_TIMESTAMP, 'Windows', false, false, 0, false, false, 202, NULL, false, false, false),
(2, CURRENT_TIMESTAMP, 'Windows', false, false, 0, false, false, 202, NULL, false, false, false),
(3, CURRENT_TIMESTAMP, 'Windows', true, false, 5, false, false, 202, NULL, true, true, false);
