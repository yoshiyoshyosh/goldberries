-- Combined Build Script

-- =========== Drop Statements ===========
DROP TABLE IF EXISTS FarewellGoldenData;
DROP TABLE IF EXISTS Change;
DROP TABLE IF EXISTS Submission;
DROP TABLE IF EXISTS Challenge;
DROP TABLE IF EXISTS Map;
DROP TABLE IF EXISTS Logging;
DROP TABLE IF EXISTS NewCampaignSubmission;
DROP TABLE IF EXISTS NewMapSubmission;
DROP TABLE IF EXISTS Player;
DROP TABLE IF EXISTS Difficulty;
DROP TABLE IF EXISTS Objective;
DROP TABLE IF EXISTS Campaign;

DROP TYPE IF EXISTS difficulty_subtier_t;


-- =========== Create Statements ===========

-- ====== Campaign ======
CREATE TABLE IF NOT EXISTS Campaign
(
	id                       SERIAL PRIMARY KEY,
	name                     varchar(128) NOT NULL,
	url                      varchar(256) NOT NULL,
	date_added               timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	icon_url                 varchar(256) NULL,
	authors                  text NULL,
	sort_major_name          varchar(32) NULL,
	sort_major_labels        text NULL,
	sort_major_accent_colors text CHECK (sort_major_accent_colors ~* '[0-9A-F\t]'),
	sort_minor_name          varchar(32) NULL,
	sort_minor_labels        text NULL,
	sort_minor_accent_colors text CHECK (sort_minor_accent_colors ~* '[0-9A-F\t]')
);

-- ====== Objective ======
CREATE TABLE IF NOT EXISTS Objective
(
	id                  SERIAL PRIMARY KEY,
	name                varchar(64) NOT NULL,
	description         text NOT NULL,
	is_arbitrary        boolean NOT NULL DEFAULT false,
	display_name_suffix varchar(32) NULL
);

-- ====== Difficulty ======
CREATE TYPE difficulty_subtier_t AS ENUM ('high', 'mid', 'low', 'guard');
CREATE TABLE IF NOT EXISTS Difficulty
(
	id           SERIAL PRIMARY KEY,
	name         varchar(32) NOT NULL,
	subtier      difficulty_subtier_t NULL,
	sort         int NOT NULL,
	color        char(6) CHECK (color ~* '[0-9A-F]{6}'),
	color_group  char(6) CHECK (color_group ~* '[0-9A-F]{6}')
);

-- ====== Player ======
CREATE TABLE IF NOT EXISTS Player
(
	id                SERIAL PRIMARY KEY,
	name              varchar(32) NOT NULL,
	password          varchar(128) NULL,
	is_verifier       boolean NOT NULL DEFAULT false,
	is_admin          boolean NOT NULL DEFAULT false,
	is_suspended      boolean NOT NULL DEFAULT false,
	suspension_reason text NULL,
	date_created      timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ====== NewMapSubmission ======
CREATE TABLE IF NOT EXISTS NewMapSubmission
(
	id          SERIAL PRIMARY KEY,
	url         varchar(256) NOT NULL,
	name        varchar(128) NOT NULL,
	description text NOT NULL
);

-- ====== NewCampaignSubmission ======
CREATE TABLE IF NOT EXISTS NewCampaignSubmission
(
	id          SERIAL PRIMARY KEY,
	url         varchar(256) NOT NULL,
	description text NOT NULL
);

-- ====== LOGGING ======
CREATE TABLE IF NOT EXISTS Logging
(
	id       SERIAL PRIMARY KEY,
	message  text NOT NULL,
	level    text NOT NULL,
	topic    varchar(64) NULL,
	log_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT check_level CHECK (level in ('debug', 'info', 'warn', 'error', 'critical'))
);

-- ====== Map ======
CREATE TABLE IF NOT EXISTS Map
(
	id               SERIAL PRIMARY KEY,
	name             varchar(128) NOT NULL,
	url              varchar(256) NULL, /* Gamebanana / archive.org URL */
	side             varchar(64) NULL, /* A-Side, B-Side, etc. */
	is_rejected      boolean NOT NULL DEFAULT false,
	rejection_reason text NULL,
	is_archived      boolean NOT NULL DEFAULT false,
	campaign_id      int NULL REFERENCES Campaign (id) ON DELETE CASCADE ON UPDATE CASCADE,
	sort_major       int NULL,
	sort_minor       int NULL,
	sort_order       int NULL,
	date_added       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	authors          text NULL
);

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
	difficulty_subtier difficulty_subtier_t NULL,
	date_created       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	requires_fc        boolean NOT NULL DEFAULT false,
	requires_special   boolean NOT NULL DEFAULT false,
	has_fc             boolean NOT NULL DEFAULT false,
	has_special        boolean NOT NULL DEFAULT false,

	CONSTRAINT check_challenge_type CHECK (challenge_type in ('map', 'campaign'))
);

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
	verifier_id                int NULL REFERENCES Player (id) ON DELETE SET NULL ON UPDATE CASCADE,
	date_verified              timestamp NULL,
	verifier_notes             text NULL,
	new_map_submission_id      int NULL REFERENCES NewMapSubmission (id) ON DELETE CASCADE ON UPDATE CASCADE,
	new_campaign_submission_id int NULL REFERENCES NewCampaignSubmission (id) ON DELETE CASCADE ON UPDATE CASCADE,
	is_fc                      boolean NOT NULL DEFAULT false,
	is_special                 boolean NOT NULL DEFAULT false,
	suggested_difficulty_id    int NULL REFERENCES Difficulty (id) ON DELETE CASCADE ON UPDATE CASCADE
);

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

-- ====== FarewellGoldenData ======
CREATE TABLE IF NOT EXISTS FarewellGoldenData
(
	id                       SERIAL PRIMARY KEY,
	submission_id            int NOT NULL REFERENCES Submission (id) ON DELETE CASCADE ON UPDATE CASCADE,
	date_achieved            timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	platform                 varchar(64) NOT NULL,
	moonberry                boolean NOT NULL DEFAULT false,
	used_keys                boolean NOT NULL DEFAULT false,
	kept_keys                int NOT NULL DEFAULT 0,
	repeat_collect           boolean NOT NULL DEFAULT false,
	partial_run              boolean NOT NULL DEFAULT false,
	berry_number             int NOT NULL DEFAULT 202,
	date_202                 timestamp NULL,
	attempted_double_collect boolean NOT NULL DEFAULT false,
	double_collect           boolean NOT NULL DEFAULT false,
	no_moonberry_pickup      boolean NOT NULL DEFAULT false
);
