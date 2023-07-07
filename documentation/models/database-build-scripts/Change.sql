DROP TABLE IF EXISTS Change;

-- ====== Change ======
CREATE TABLE IF NOT EXISTS Change
(
	id           SERIAL PRIMARY KEY,
	change_type  text NOT NULL,
	campaign_id  int NULL REFERENCES Campaign (id) ON DELETE CASCADE ON UPDATE CASCADE,
	map_id       int NULL REFERENCES Map (id) ON DELETE CASCADE ON UPDATE CASCADE,
	challenge_id int NULL REFERENCES Challenge (id) ON DELETE CASCADE ON UPDATE CASCADE,
	player_id    int NULL REFERENCES Player (id) ON DELETE CASCADE ON UPDATE CASCADE,
	author       int NOT NULL REFERENCES Player (id) ON DELETE CASCADE ON UPDATE CASCADE,
	description  text NOT NULL,
	change_date  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT check_change_type CHECK (change_type in ('campaign', 'map', 'challenge', 'player', 'general'))
);
