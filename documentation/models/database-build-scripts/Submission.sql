DROP TABLE IF EXISTS Submission;

-- ====== Submission ======
CREATE TABLE IF NOT EXISTS Submission
(
	id                         SERIAL PRIMARY KEY,
	challenge_id               int NULL REFERENCES Challenge (id) ON DELETE CASCADE ON UPDATE CASCADE,
	player_id                  int NULL REFERENCES Player (id) ON DELETE CASCADE ON UPDATE CASCADE,
	date_created               timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	proof_url                  varchar(256) NOT NULL,
	player_notes               text NULL,
	is_verified                boolean NOT NULL DEFAULT false,
	is_rejected                boolean NOT NULL DEFAULT false,
	verifier_id                int NULL REFERENCES Player (id) ON DELETE SET NULL ON UPDATE CASCADE,
	date_verified              timestamp NULL,
	verifier_notes             text NULL,
	new_map_submission_id      int NULL REFERENCES NewMapSubmission (id) ON DELETE CASCADE ON UPDATE CASCADE,
	new_campaign_submission_id int NULL REFERENCES NewCampaignSubmission (id) ON DELETE CASCADE ON UPDATE CASCADE,
	is_fc                      boolean NOT NULL DEFAULT false,
	is_special                 boolean NOT NULL DEFAULT false,
	suggested_difficulty_id    int NULL REFERENCES Difficulty (id) ON DELETE CASCADE ON UPDATE CASCADE,
);
