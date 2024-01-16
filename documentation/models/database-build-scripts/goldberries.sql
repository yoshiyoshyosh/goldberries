-- Combined Build Script

-- =========== Drop Statements ===========
DROP TABLE IF EXISTS FarewellGoldenData;
DROP TABLE IF EXISTS Change;
DROP TABLE IF EXISTS Submission;
DROP TABLE IF EXISTS Challenge;
DROP TABLE IF EXISTS Map;
DROP TABLE IF EXISTS Account;
DROP TABLE IF EXISTS Player;
DROP TABLE IF EXISTS Logging;
DROP TABLE IF EXISTS NewChallenge;
DROP TABLE IF EXISTS Difficulty;
DROP TABLE IF EXISTS Objective;
DROP TABLE IF EXISTS Campaign;



-- =========== Create Statements ===========

-- ====== Campaign ======
CREATE TABLE IF NOT EXISTS Campaign
(
 id                       SERIAL ,
 name                     varchar(128) NOT NULL ,
 url                      varchar(256) NOT NULL ,
 date_added               timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 icon_url                 varchar(256) NULL ,
 sort_major_name          varchar(32) NULL ,
 sort_major_labels        text NULL ,
 sort_major_accent_colors text NULL ,
 sort_minor_name          varchar(32) NULL ,
 sort_minor_labels        text NULL ,
 sort_minor_accent_colors text NULL ,
 author_gb_id             int NULL ,
 author_gb_name           varchar(128) NULL ,
PRIMARY KEY (id)
);

-- ====== Objective ======
CREATE TABLE IF NOT EXISTS Objective
(
 id                  SERIAL ,
 name                varchar(64) NOT NULL ,
 description         text NOT NULL ,
 display_name_suffix varchar(32) NULL ,
 is_arbitrary        bit NOT NULL DEFAULT '0' ,
PRIMARY KEY (id)
);

-- ====== Difficulty ======
CREATE TABLE IF NOT EXISTS Difficulty
(
 id      SERIAL ,
 name    varchar(32) NOT NULL ,
 subtier text NULL CHECK (subtier in ('high', 'mid', 'low', 'guard')) ,
 sort    int NOT NULL ,
PRIMARY KEY (id)
);

-- ====== NewChallenge ======
CREATE TABLE IF NOT EXISTS NewChallenge
(
 id          SERIAL ,
 url         varchar(256) NOT NULL ,
 name        varchar(128) NULL ,
 description text NOT NULL ,
PRIMARY KEY (id)
);

-- ====== Logging ======
CREATE TABLE IF NOT EXISTS Logging
(
 id      SERIAL ,
 message text NOT NULL ,
 level   text NOT NULL CHECK (level in ('debug', 'info', 'warn', 'error', 'critical')) ,
 topic   varchar(64) NULL ,
 date    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
PRIMARY KEY (id)
);

-- ====== Player ======
CREATE TABLE IF NOT EXISTS Player
(
 id   SERIAL ,
 name varchar(32) NOT NULL ,
PRIMARY KEY (id)
);

-- ====== Account ======
CREATE TABLE IF NOT EXISTS Account
(
 id                SERIAL ,
 player_id         int NOT NULL REFERENCES Player (id) ,
 claimed_player_id int NOT NULL REFERENCES Player (id) ,
 email             varchar(128) NULL ,
 password          varchar(128) NULL ,
 discord_id        varchar(32) NULL ,
 session_token     varchar(64) NULL ,
 session_created   timestamp NULL ,
 date_created      timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 is_verifier       bit NOT NULL DEFAULT '0' ,
 is_admin          bit NOT NULL DEFAULT '0' ,
 is_suspended      bit NOT NULL DEFAULT '0' ,
 suspension_reason text NULL ,
PRIMARY KEY (id)
);

-- ====== Map ======
CREATE TABLE IF NOT EXISTS Map
(
 id               SERIAL ,
 name             varchar(128) NOT NULL ,
 url              varchar(256) NULL, -- GameBanana / Google Drive URL
 is_rejected      bit NOT NULL DEFAULT '0' ,
 rejection_reason text NULL ,
 is_archived      bit NOT NULL DEFAULT '0' ,
 campaign_id      int NOT NULL REFERENCES Campaign (id) ON DELETE CASCADE ON UPDATE CASCADE ,
 sort_major       int NULL ,
 sort_minor       int NULL ,
 sort_order       int NULL ,
 date_added       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 author_gb_id     int NULL ,
 author_gb_name   varchar(128) NULL ,
PRIMARY KEY (id)
);

-- ====== Challenge ======
CREATE TABLE IF NOT EXISTS Challenge
(
 id            SERIAL ,
 campaign_id   int NULL REFERENCES Campaign (id) ON DELETE CASCADE ON UPDATE CASCADE ,
 map_id        int NULL REFERENCES Map (id) ON DELETE CASCADE ON UPDATE CASCADE ,
 objective_id  int NOT NULL REFERENCES Objective (id) ON DELETE CASCADE ON UPDATE CASCADE ,
 description   text NULL ,
 difficulty_id int NOT NULL REFERENCES Difficulty (id) ON DELETE CASCADE ON UPDATE CASCADE ,
 date_created  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 requires_fc   bit NOT NULL DEFAULT '0' ,
 has_fc        bit NOT NULL DEFAULT '0' ,
 is_arbitrary  bit NULL ,
PRIMARY KEY (id)
);

-- ====== Submission ======
CREATE TABLE IF NOT EXISTS Submission
(
 id                      SERIAL ,
 challenge_id            int NULL REFERENCES Challenge (id) ON DELETE CASCADE ON UPDATE CASCADE ,
 player_id               int NOT NULL REFERENCES Player (id) ON DELETE CASCADE ON UPDATE CASCADE ,
 date_created            timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 is_fc                   bit NOT NULL DEFAULT '0' ,
 proof_url               varchar(256) NOT NULL ,
 player_notes            text NULL ,
 suggested_difficulty_id int NULL REFERENCES Difficulty (id) ,
 is_verified             bit NOT NULL DEFAULT '0' ,
 is_rejected             bit NOT NULL DEFAULT '0' ,
 verifier_id             int NULL REFERENCES Account (id) ON DELETE CASCADE ON UPDATE CASCADE ,
 date_verified           timestamp NULL ,
 verifier_notes          text NULL ,
 new_challenge_id        int NULL REFERENCES NewChallenge (id) ON DELETE CASCADE ON UPDATE CASCADE ,
PRIMARY KEY (id)
);

-- ====== Change ======
CREATE TABLE IF NOT EXISTS Change
(
 id           SERIAL ,
 change_type  text NOT NULL CHECK (change_type in ('campaign', 'map', 'challenge', 'player', 'general')) ,
 campaign_id  int NULL REFERENCES Campaign (id) ON DELETE CASCADE ON UPDATE CASCADE ,
 map_id       int NULL REFERENCES Map (id) ON DELETE CASCADE ON UPDATE CASCADE ,
 challenge_id int NULL REFERENCES Challenge (id) ON DELETE CASCADE ON UPDATE CASCADE ,
 player_id    int NULL REFERENCES Player (id) ON DELETE CASCADE ON UPDATE CASCADE ,
 author_id    int NOT NULL REFERENCES Account (id) ON DELETE CASCADE ON UPDATE CASCADE ,
 description  text NOT NULL ,
 date         timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
PRIMARY KEY (id)
);

-- ====== FarewellGoldenData ======
CREATE TABLE IF NOT EXISTS FarewellGoldenData
(
 id                       SERIAL ,
 submission_id            int NOT NULL REFERENCES Submission (id) ON DELETE CASCADE ON UPDATE CASCADE ,
 date_achieved            timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 platform                 varchar(64) NOT NULL ,
 moonberry                bit NOT NULL DEFAULT '0' ,
 used_keys                bit NOT NULL DEFAULT '0' ,
 kept_keys                int NOT NULL DEFAULT 0 ,
 repeat_collect           bit NOT NULL DEFAULT '0' ,
 partial_run              bit NOT NULL DEFAULT '0' ,
 berry_number             int NOT NULL DEFAULT 202 ,
 date_202                 timestamp NULL ,
 attempted_double_collect bit NOT NULL DEFAULT '0' ,
 double_collect           bit NOT NULL DEFAULT '0' ,
 no_moonberry_pickup      bit NOT NULL DEFAULT '0' ,
PRIMARY KEY (id)
);
