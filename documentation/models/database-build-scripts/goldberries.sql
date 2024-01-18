-- Combined Build Script

-- =========== Drop Statements ===========
DROP TABLE farewellgoldendata;
DROP TABLE change;
DROP TABLE submission;
DROP TABLE challenge;
DROP TABLE "map";
DROP TABLE account;
DROP TABLE player;
DROP TABLE logging;
DROP TABLE newchallenge;
DROP TABLE difficulty;
DROP TABLE objective;
DROP TABLE campaign;



-- =========== Create Statements ===========

-- ====== campaign ======
CREATE TABLE campaign
(
 "id"                       integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 name                     varchar(128) NOT NULL,
 url                      varchar(256) NOT NULL,
 date_added               timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 icon_url                 varchar(256) NULL,
 sort_major_name          varchar(32) NULL,
 sort_major_labels        text NULL,
 sort_major_accent_colors text NULL,
 sort_minor_name          varchar(32) NULL,
 sort_minor_labels        text NULL,
 sort_minor_accent_colors text NULL,
 author_gb_id             integer NULL,
 author_gb_name           varchar(128) NULL,
 CONSTRAINT campaign_pkey PRIMARY KEY ( "id" )
);

-- ====== objective ======
CREATE TABLE objective
(
 "id"                  integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 name                varchar(64) NOT NULL,
 description         text NOT NULL,
 display_name_suffix varchar(32) NULL,
 is_arbitrary        bit(1) NOT NULL DEFAULT '0',
 CONSTRAINT objective_pkey PRIMARY KEY ( "id" )
);

-- ====== difficulty ======
CREATE TABLE difficulty
(
 "id"      integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 name    varchar(32) NOT NULL,
 subtier text NULL,
 sort    integer NOT NULL,
 CONSTRAINT difficulty_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT check_difficulty_subtier CHECK ( subtier in ('high', 'mid', 'low', 'guard') )
);

-- ====== newchallenge ======
CREATE TABLE newchallenge
(
 "id"          integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 url         varchar(256) NOT NULL,
 name        varchar(128) NULL,
 description text NOT NULL,
 CONSTRAINT newchallenge_pkey PRIMARY KEY ( "id" )
);

-- ====== logging ======
CREATE TABLE logging
(
 "id"      integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 message text NOT NULL,
 level   text NOT NULL,
 topic   varchar(64) NULL,
 "date"    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT logging_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT check_logging_level CHECK ( level in ('debug', 'info', 'warn', 'error', 'critical') )
);

-- ====== player ======
CREATE TABLE player
(
 "id"   integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 name varchar(32) NOT NULL,
 CONSTRAINT player_pkey PRIMARY KEY ( "id" )
);

-- ====== account ======
CREATE TABLE account
(
 "id"                integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 player_id         integer NULL,
 claimed_player_id integer NULL,
 email             varchar(64) NULL,
 password          varchar(128) NULL,
 discord_id        varchar(32) NULL,
 session_token     varchar(64) NULL,
 session_created   timestamp NULL,
 date_created      timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 is_verifier       bit(1) NOT NULL DEFAULT '0',
 is_admin          bit(1) NOT NULL DEFAULT '0',
 is_suspended      bit(1) NOT NULL DEFAULT '0',
 suspension_reason text NULL,
 email_verified    bit(1) NOT NULL DEFAULT '0',
 email_verify_code varchar(16) NULL,
 CONSTRAINT account_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT account_claimed_player_id_fkey FOREIGN KEY ( claimed_player_id ) REFERENCES player ( "id" ),
 CONSTRAINT account_player_id_fkey FOREIGN KEY ( player_id ) REFERENCES player ( "id" )
);

-- ====== map ======
CREATE TABLE "map"
(
 "id"               integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 campaign_id      integer NOT NULL,
 name             varchar(128) NOT NULL,
 url              varchar(256) NULL,
 is_rejected      bit(1) NOT NULL DEFAULT '0',
 rejection_reason text NULL,
 is_archived      bit(1) NOT NULL DEFAULT '0',
 sort_major       integer NULL,
 sort_minor       integer NULL,
 sort_order       integer NULL,
 date_added       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 author_gb_id     integer NULL,
 author_gb_name   varchar(128) NULL,
 CONSTRAINT map_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT map_campaign_id_fkey FOREIGN KEY ( campaign_id ) REFERENCES campaign ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ====== challenge ======
CREATE TABLE challenge
(
 "id"            integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 campaign_id   integer NULL,
 map_id        integer NULL,
 objective_id  integer NOT NULL,
 description   text NULL,
 difficulty_id integer NOT NULL,
 date_created  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 requires_fc   bit(1) NOT NULL DEFAULT '0',
 has_fc        bit(1) NOT NULL DEFAULT '0',
 is_arbitrary  bit(1) NULL,
 CONSTRAINT challenge_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT challenge_campaign_id_fkey FOREIGN KEY ( campaign_id ) REFERENCES campaign ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT challenge_difficulty_id_fkey FOREIGN KEY ( difficulty_id ) REFERENCES difficulty ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT challenge_map_id_fkey FOREIGN KEY ( map_id ) REFERENCES "map" ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT challenge_objective_id_fkey FOREIGN KEY ( objective_id ) REFERENCES objective ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ====== submission ======
CREATE TABLE submission
(
 "id"                      integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 player_id               integer NOT NULL,
 date_created            timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 is_fc                   bit(1) NOT NULL DEFAULT '0',
 proof_url               varchar(256) NOT NULL,
 player_notes            text NULL,
 suggested_difficulty_id integer NULL,
 is_verified             bit(1) NOT NULL DEFAULT '0',
 is_rejected             bit(1) NOT NULL DEFAULT '0',
 verifier_id             integer NULL,
 date_verified           timestamp NULL,
 verifier_notes          text NULL,
 new_challenge_id        integer NULL,
 challenge_id            integer NULL,
 CONSTRAINT submission_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT submission_challenge_id_fkey FOREIGN KEY ( challenge_id ) REFERENCES challenge ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT submission_new_challenge_id_fkey FOREIGN KEY ( new_challenge_id ) REFERENCES newchallenge ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT submission_player_id_fkey FOREIGN KEY ( player_id ) REFERENCES player ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT submission_suggested_difficulty_id_fkey FOREIGN KEY ( suggested_difficulty_id ) REFERENCES difficulty ( "id" ),
 CONSTRAINT submission_verifier_id_fkey FOREIGN KEY ( verifier_id ) REFERENCES account ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ====== change ======
CREATE TABLE change
(
 "id"           integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 change_type  text NOT NULL,
 campaign_id  integer NULL,
 map_id       integer NULL,
 challenge_id integer NULL,
 player_id    integer NULL,
 author_id    integer NOT NULL,
 description  text NOT NULL,
 "date"         timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT change_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT change_author_id_fkey FOREIGN KEY ( author_id ) REFERENCES account ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT change_campaign_id_fkey FOREIGN KEY ( campaign_id ) REFERENCES campaign ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT change_challenge_id_fkey FOREIGN KEY ( challenge_id ) REFERENCES challenge ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT change_map_id_fkey FOREIGN KEY ( map_id ) REFERENCES "map" ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT change_player_id_fkey FOREIGN KEY ( player_id ) REFERENCES player ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT check_change_change_type CHECK ( change_type in ('campaign', 'map', 'challenge', 'player', 'general') )
);

-- ====== farewellgoldendata ======
CREATE TABLE farewellgoldendata
(
 "id"                       integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 submission_id            integer NOT NULL,
 date_achieved            timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 platform                 varchar(32) NOT NULL,
 moonberry                bit(1) NOT NULL DEFAULT '0',
 used_keys                bit(1) NOT NULL DEFAULT '0',
 kept_keys                integer NOT NULL DEFAULT 0,
 repeat_collect           bit(1) NOT NULL DEFAULT '0',
 partial_run              bit(1) NOT NULL DEFAULT '0',
 berry_number             integer NOT NULL DEFAULT 202,
 date_202                 timestamp NULL,
 attempted_double_collect bit(1) NOT NULL DEFAULT '0',
 double_collect           bit(1) NOT NULL DEFAULT '0',
 no_moonberry_pickup      bit(1) NOT NULL DEFAULT '0',
 CONSTRAINT farewellgoldendata_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT farewellgoldendata_submission_id_fkey FOREIGN KEY ( submission_id ) REFERENCES submission ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE
);
