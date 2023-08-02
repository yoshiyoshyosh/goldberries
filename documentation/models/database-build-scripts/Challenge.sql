DROP TABLE IF EXISTS Challenge;

-- ====== Challenge ======
CREATE TABLE IF NOT EXISTS Challenge
(
	id                 SERIAL PRIMARY KEY,
	challenge_type     text NOT NULL,
	campaign_id        int NULL REFERENCES Campaign (id) ON DELETE CASCADE ON UPDATE CASCADE,
	map_id             int NULL REFERENCES Map (id) ON DELETE CASCADE ON UPDATE CASCADE,
	objective_id       int NOT NULL REFERENCES Objective (id) ON DELETE CASCADE ON UPDATE CASCADE,
	description        text NULL,
	difficulty_id      int NOT NULL REFERENCES Difficulty (id) ON DELETE SET NULL ON UPDATE CASCADE,
	date_created       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	requires_fc        boolean NOT NULL DEFAULT false,
	requires_special   boolean NOT NULL DEFAULT false,
	has_fc             boolean NOT NULL DEFAULT false,
	has_special        boolean NOT NULL DEFAULT false,

	CONSTRAINT check_challenge_type CHECK (challenge_type in ('map', 'campaign'))
);
