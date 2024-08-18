-- Combined Build Script

-- =========== Drop Statements ===========
DROP VIEW view_challenge_changes;
DROP VIEW view_challenges;
DROP VIEW view_submissions;

DROP TABLE fwg_data;
DROP TABLE showcase;
DROP TABLE suggestion_vote;
DROP TABLE verification_notice;

DROP TABLE change;
DROP TABLE submission;
DROP TABLE suggestion;

DROP TABLE challenge;
DROP TABLE "session";

DROP TABLE account;
DROP TABLE "map";

DROP TABLE campaign;
DROP TABLE difficulty;
DROP TABLE logging;
DROP TABLE new_challenge;
DROP TABLE objective;
DROP TABLE player;



-- =========== Create Statements ===========

-- ====== campaign ======
CREATE TABLE campaign
(
 "id"                       integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 name                     varchar(128) NOT NULL,
 url                      text NOT NULL,
 date_added               timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
 icon_url                 text NULL,
 sort_major_name          varchar(32) NULL,
 sort_major_labels        text NULL,
 sort_major_colors text NULL,
 sort_minor_name          varchar(32) NULL,
 sort_minor_labels        text NULL,
 sort_minor_colors text NULL,
 author_gb_id             integer NULL,
 author_gb_name           varchar(128) NULL,
 note                     text NULL,
 CONSTRAINT campaign_pkey PRIMARY KEY ( "id" )
);

-- ====== objective ======
CREATE TABLE objective
(
 "id"                  integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 name                varchar(64) NOT NULL,
 description         text NOT NULL,
 display_name_suffix varchar(32) NULL,
 is_arbitrary        boolean NOT NULL DEFAULT false,
 icon_url            text NULL,
 CONSTRAINT objective_pkey PRIMARY KEY ( "id" )
);

-- ====== difficulty ======
CREATE TABLE difficulty
(
 "id"      integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 name    varchar(32) NOT NULL,
 subtier text NULL,
 sort    integer NOT NULL,
 CONSTRAINT difficulty_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT check_difficulty_subtier CHECK ( subtier in ('high', 'mid', 'low', 'guard') )
);

-- ====== new_challenge ======
CREATE TABLE new_challenge
(
 "id"          integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 url         text NOT NULL,
 name        varchar(128) NULL,
 description text NULL,
 CONSTRAINT newchallenge_pkey PRIMARY KEY ( "id" )
);

-- ====== logging ======
CREATE TABLE logging
(
 "id"      integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 message text NOT NULL,
 level   text NOT NULL,
 topic   varchar(64) NULL,
 "date"    timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT logging_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT check_logging_level CHECK ( level in ('debug', 'info', 'warn', 'error', 'critical') )
);

-- ====== player ======
CREATE TABLE player
(
 "id"   integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 name varchar(32) NOT NULL,
 CONSTRAINT player_pkey PRIMARY KEY ( "id" )
);

-- ====== account ======
CREATE TABLE account
(
 "id"               integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 player_id          integer NULL,
 claimed_player_id  integer NULL,
 email              varchar(64) NULL,
 password           varchar(128) NULL,
 discord_id         varchar(32) NULL,
 date_created       timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 is_verifier        boolean NOT NULL DEFAULT false,
 is_admin           boolean NOT NULL DEFAULT false,
 is_suspended       boolean NOT NULL DEFAULT false,
 suspension_reason  text NULL,
 email_verified     boolean NOT NULL DEFAULT false,
 email_verify_code  varchar(16) NULL,
 links              text NULL,
 input_method       text NULL,
 about_me           text NULL,
 name_color_start   text NULL,
 name_color_end     text NULL,
 last_player_rename timestamptz NULL,
 n_sub_verified     boolean NOT NULL DEFAULT true,
 n_chall_personal   boolean NOT NULL DEFAULT true,
 n_suggestion       boolean NOT NULL DEFAULT false,
 n_chall_moved      boolean NOT NULL DEFAULT false,
 CONSTRAINT account_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT account_claimed_player_id_fkey FOREIGN KEY ( claimed_player_id ) REFERENCES player ( "id" ) ON DELETE SET NULL ON UPDATE CASCADE,
 CONSTRAINT account_player_id_fkey FOREIGN KEY ( player_id ) REFERENCES player ( "id" ) ON DELETE SET NULL ON UPDATE CASCADE,
 CONSTRAINT check_account_input_method CHECK ( input_method IS NULL OR input_method IN ('keyboard', 'dpad', 'analog', 'hybrid', 'other') )
);

-- ====== session ======
CREATE TABLE session
(
 "id"       integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 account_id integer NOT NULL,
 "token"    varchar(64) NOT NULL,
 created    timestamptz NOT NULL,
 CONSTRAINT session_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT session_account_id_fkey FOREIGN KEY ( account_id ) REFERENCES account ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ====== map ======
CREATE TABLE "map"
(
 "id"               integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 campaign_id      integer NOT NULL,
 name             varchar(128) NOT NULL,
 url              text NULL,
 date_added       timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
 is_rejected      boolean NOT NULL DEFAULT false,
 rejection_reason text NULL,
 is_archived      boolean NOT NULL DEFAULT false,
 sort_major       integer NULL,
 sort_minor       integer NULL,
 sort_order       integer NULL,
 author_gb_id     integer NULL,
 author_gb_name   varchar(128) NULL,
 note             text NULL,
 collectibles     text NULL,
 CONSTRAINT map_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT map_campaign_id_fkey FOREIGN KEY ( campaign_id ) REFERENCES campaign ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ====== challenge ======
CREATE TABLE challenge
(
 "id"            integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 campaign_id   integer NULL,
 map_id        integer NULL,
 objective_id  integer NOT NULL,
 label         text NULL,
 description   text NULL,
 difficulty_id integer NOT NULL,
 date_created  timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
 requires_fc   boolean NOT NULL DEFAULT false,
 has_fc        boolean NOT NULL DEFAULT false,
 is_arbitrary  boolean NULL,
 sort          integer NULL,
 icon_url      text NULL,
 CONSTRAINT challenge_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT challenge_campaign_id_fkey FOREIGN KEY ( campaign_id ) REFERENCES campaign ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT challenge_difficulty_id_fkey FOREIGN KEY ( difficulty_id ) REFERENCES difficulty ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT challenge_map_id_fkey FOREIGN KEY ( map_id ) REFERENCES "map" ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT challenge_objective_id_fkey FOREIGN KEY ( objective_id ) REFERENCES objective ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT check_challenge_fc CHECK ( has_fc = false OR requires_fc = false )
);

-- ====== submission ======
CREATE TABLE submission
(
 "id"                      integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 challenge_id            integer NULL,
 player_id               integer NOT NULL,
 date_created            timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
 is_fc                   boolean NOT NULL DEFAULT false,
 proof_url               text NOT NULL,
 raw_session_url         text NULL,
 player_notes            text NULL,
 suggested_difficulty_id integer NULL,
 is_personal             boolean NOT NULL DEFAULT false,
 is_verified             boolean NULL,
 date_verified           timestamptz NULL,
 verifier_notes          text NULL,
 verifier_id             integer NULL,
 new_challenge_id        integer NULL,
 is_obsolete             boolean NOT NULL DEFAULT false,
 CONSTRAINT submission_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT submission_challenge_id_fkey FOREIGN KEY ( challenge_id ) REFERENCES challenge ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT submission_new_challenge_id_fkey FOREIGN KEY ( new_challenge_id ) REFERENCES new_challenge ( "id" ) ON DELETE SET NULL ON UPDATE CASCADE,
 CONSTRAINT submission_player_id_fkey FOREIGN KEY ( player_id ) REFERENCES player ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT submission_suggested_difficulty_id_fkey FOREIGN KEY ( suggested_difficulty_id ) REFERENCES difficulty ( "id" ) ON DELETE SET NULL ON UPDATE CASCADE,
 CONSTRAINT submission_verifier_id_fkey FOREIGN KEY ( verifier_id ) REFERENCES player ( "id" ) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ====== suggestion ======
CREATE TABLE suggestion
(
 "id"                    integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 author_id               integer NULL,
 challenge_id            integer NULL,
 current_difficulty_id   integer NULL,
 suggested_difficulty_id integer NULL,
 comment                 text NULL,
 is_verified             boolean NULL,
 date_created            timestamptz NOT NULL,
 is_accepted             boolean NULL,
 CONSTRAINT suggestion_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT suggestion_author_id_fkey FOREIGN KEY ( author_id ) REFERENCES player ( "id" ) ON DELETE SET NULL ON UPDATE CASCADE,
 CONSTRAINT suggestion_challenge_id_fkey FOREIGN KEY ( challenge_id ) REFERENCES challenge ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT suggestion_current_difficulty_id_fkey FOREIGN KEY ( current_difficulty_id ) REFERENCES difficulty ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT suggestion_suggested_difficulty_id_fkey FOREIGN KEY ( suggested_difficulty_id ) REFERENCES difficulty ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT check_suggestion_suggested_difficulty_id CHECK ( (challenge_id IS NOT NULL) OR (suggested_difficulty_id IS NULL) ),
 CONSTRAINT check_suggestion_current_difficulty_id CHECK ( (challenge_id IS NOT NULL) OR (current_difficulty_id IS NULL) )
);

-- ====== suggestion_vote ======
CREATE TABLE suggestion_vote
(
 "id"          integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 suggestion_id integer NOT NULL,
 player_id     integer NOT NULL,
 vote          text NOT NULL,
 comment       text NULL,
 CONSTRAINT suggestion_vote_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT suggestion_vote_player_id_fkey FOREIGN KEY ( player_id ) REFERENCES player ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT suggestion_vote_suggestion_id_fkey FOREIGN KEY ( suggestion_id ) REFERENCES suggestion ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT check_suggestion_vote_vote CHECK ( vote IN ('+', '-', 'i') )
);

-- ====== change ======
CREATE TABLE change
(
 "id"           integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 campaign_id  integer NULL,
 map_id       integer NULL,
 challenge_id integer NULL,
 player_id    integer NULL,
 author_id    integer NULL,
 description  text NOT NULL,
 "date"         timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT change_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT change_author_id_fkey FOREIGN KEY ( author_id ) REFERENCES player ( "id" ) ON DELETE SET NULL ON UPDATE CASCADE,
 CONSTRAINT change_campaign_id_fkey FOREIGN KEY ( campaign_id ) REFERENCES campaign ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT change_challenge_id_fkey FOREIGN KEY ( challenge_id ) REFERENCES challenge ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT change_map_id_fkey FOREIGN KEY ( map_id ) REFERENCES "map" ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT change_player_id_fkey FOREIGN KEY ( player_id ) REFERENCES player ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ====== fwg_data ======
CREATE TABLE fwg_data
(
 "id"                       integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 submission_id            integer NOT NULL,
 date_achieved            timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 platform                 varchar(32) NOT NULL,
 moonberry                boolean NOT NULL DEFAULT false,
 used_keys                boolean NOT NULL DEFAULT false,
 kept_keys                integer NOT NULL DEFAULT 0,
 repeat_collect           boolean NOT NULL DEFAULT false,
 partial_run              boolean NOT NULL DEFAULT false,
 berry_number             integer NOT NULL DEFAULT 202,
 date_202                 timestamptz NULL,
 attempted_double_collect boolean NOT NULL DEFAULT false,
 double_collect           boolean NOT NULL DEFAULT false,
 no_moonberry_pickup      boolean NOT NULL DEFAULT false,
 CONSTRAINT farewellgoldendata_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT farewellgoldendata_submission_id_fkey FOREIGN KEY ( submission_id ) REFERENCES submission ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ====== showcase ======
CREATE TABLE showcase
(
 "id"          integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 index         integer NOT NULL,
 account_id    integer NOT NULL,
 submission_id integer NOT NULL,
 CONSTRAINT showcase_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT showcase_account_id_fkey FOREIGN KEY ( account_id ) REFERENCES account ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT showcase_submission_id_fkey FOREIGN KEY ( submission_id ) REFERENCES submission ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT check_showcase_index CHECK ( index > -1 AND index < 10 )
);

-- ====== verification_notice ======
CREATE TABLE verification_notice
(
 "id"          integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 verifier_id   integer NOT NULL,
 submission_id integer NOT NULL,
 CONSTRAINT verification_notice_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT verification_notice_submission_id_unique UNIQUE ( submission_id ),
 CONSTRAINT verification_notice_submission_id_fkey FOREIGN KEY ( submission_id ) REFERENCES submission ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT verification_notice_verifier_id_fkey FOREIGN KEY ( verifier_id ) REFERENCES player ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE
);



-- =========== VIEWS ===========
CREATE VIEW "view_submissions" AS SELECT
  COALESCE(campaign.id, fg_campaign.id) AS campaign_id,
  COALESCE(campaign.name, fg_campaign.name) AS campaign_name,
  COALESCE(campaign.url, fg_campaign.url) AS campaign_url,
  COALESCE(campaign.date_added, fg_campaign.date_added) AS campaign_date_added,
  COALESCE(campaign.icon_url, fg_campaign.icon_url) AS campaign_icon_url,
  COALESCE(campaign.sort_major_name, fg_campaign.sort_major_name) AS campaign_sort_major_name,
  COALESCE(campaign.sort_major_labels, fg_campaign.sort_major_labels) AS campaign_sort_major_labels,
  COALESCE(campaign.sort_major_colors, fg_campaign.sort_major_colors) AS campaign_sort_major_colors,
  COALESCE(campaign.sort_minor_name, fg_campaign.sort_minor_name) AS campaign_sort_minor_name,
  COALESCE(campaign.sort_minor_labels, fg_campaign.sort_minor_labels) AS campaign_sort_minor_labels,
  COALESCE(campaign.sort_minor_colors, fg_campaign.sort_minor_colors) AS campaign_sort_minor_colors,
  COALESCE(campaign.author_gb_id, fg_campaign.author_gb_id) AS campaign_author_gb_id,
  COALESCE(campaign.author_gb_name, fg_campaign.author_gb_name) AS campaign_author_gb_name,
  COALESCE(campaign.note, fg_campaign.note) AS campaign_note,

  map.id AS map_id,
  map.campaign_id AS map_campaign_id,
  map.name AS map_name,
  map.url AS map_url,
  map.date_added AS map_date_added,
  map.is_rejected AS map_is_rejected,
  map.rejection_reason AS map_rejection_reason,
  map.is_archived AS map_is_archived,
  map.sort_major AS map_sort_major,
  map.sort_minor AS map_sort_minor,
  map.sort_order AS map_sort_order,
  map.author_gb_id AS map_author_gb_id,
  map.author_gb_name AS map_author_gb_name,
  map.note AS map_note,
  map.collectibles AS map_collectibles,

  challenge.id AS challenge_id,
  challenge.campaign_id AS challenge_campaign_id,
  challenge.map_id AS challenge_map_id,
  challenge.objective_id AS challenge_objective_id,
  challenge.label AS challenge_label,
  challenge.description AS challenge_description,
  challenge.difficulty_id AS challenge_difficulty_id,
  challenge.date_created AS challenge_date_created,
  challenge.requires_fc AS challenge_requires_fc,
  challenge.has_fc AS challenge_has_fc,
  challenge.is_arbitrary AS challenge_is_arbitrary,
  challenge.sort AS challenge_sort,
  challenge.icon_url AS challenge_icon_url,

  cd.id AS difficulty_id,
  cd.name AS difficulty_name,
  cd.subtier AS difficulty_subtier,
  cd.sort AS difficulty_sort,

  objective.id AS objective_id,
  objective.name AS objective_name,
  objective.description AS objective_description,
  objective.display_name_suffix AS objective_display_name_suffix,
  objective.is_arbitrary AS objective_is_arbitrary,
  objective.icon_url AS objective_icon_url,

  submission.id AS submission_id,
  submission.challenge_id AS submission_challenge_id,
  submission.player_id AS submission_player_id,
  submission.date_created AS submission_date_created,
  submission.is_fc AS submission_is_fc,
  submission.proof_url AS submission_proof_url,
  submission.raw_session_url AS submission_raw_session_url,
  submission.player_notes AS submission_player_notes,
  submission.suggested_difficulty_id AS submission_suggested_difficulty_id,
  submission.is_personal AS submission_is_personal,
  submission.is_verified AS submission_is_verified,
  submission.date_verified AS submission_date_verified,
  submission.verifier_notes AS submission_verifier_notes,
  submission.verifier_id AS submission_verifier_id,
  submission.new_challenge_id AS submission_new_challenge_id,
  submission.is_obsolete AS submission_is_obsolete,

  p.id AS player_id,
  p.name AS player_name,
  pa.is_verifier AS player_account_is_verifier,
  pa.is_admin AS player_account_is_admin,
  pa.is_suspended AS player_account_is_suspended,
  pa.suspension_reason AS player_account_suspension_reason,
  pa.name_color_start AS player_account_name_color_start,
  pa.name_color_end AS player_account_name_color_end,

  v.id AS verifier_id,
  v.name AS verifier_name,
  va.is_verifier AS verifier_account_is_verifier,
  va.is_admin AS verifier_account_is_admin,
  va.is_suspended AS verifier_account_is_suspended,
  va.suspension_reason AS verifier_account_suspension_reason,
  va.name_color_start AS verifier_account_name_color_start,
  va.name_color_end AS verifier_account_name_color_end,

  pd.id AS suggested_difficulty_id,
  pd.name AS suggested_difficulty_name,
  pd.subtier AS suggested_difficulty_subtier,
  pd.sort AS suggested_difficulty_sort,
  
  new_challenge.id AS new_challenge_id,
  new_challenge.url AS new_challenge_url,
  new_challenge.name AS new_challenge_name,
  new_challenge.description AS new_challenge_description
  

FROM submission
LEFT JOIN challenge  ON submission.challenge_id = challenge.id
LEFT JOIN map ON challenge.map_id = map.id
LEFT JOIN campaign  ON map.campaign_id = campaign.id
LEFT JOIN campaign fg_campaign ON challenge.campaign_id = fg_campaign.id

LEFT JOIN difficulty cd ON challenge.difficulty_id = cd.id
LEFT JOIN objective  ON challenge.objective_id = objective.id
JOIN player p ON p.id = submission.player_id
LEFT JOIN player v ON v.id = submission.verifier_id
LEFT JOIN difficulty pd ON submission.suggested_difficulty_id = pd.id
LEFT JOIN account pa ON p.id = pa.player_id
LEFT JOIN account va ON v.id = va.player_id
LEFT JOIN new_challenge ON submission.new_challenge_id = new_challenge.id

WHERE map.is_rejected = false OR map.is_rejected IS NULL

ORDER BY COALESCE(campaign.name, fg_campaign.name), COALESCE(campaign.id, fg_campaign.id), map.sort_major, map.sort_minor, map.sort_order, map.name, challenge.sort, cd.sort DESC, submission.date_created, submission.id ;



CREATE VIEW "view_challenges" AS SELECT
  COALESCE(campaign.id, fg_campaign.id) AS campaign_id,
  COALESCE(campaign.name, fg_campaign.name) AS campaign_name,
  COALESCE(campaign.url, fg_campaign.url) AS campaign_url,
  COALESCE(campaign.date_added, fg_campaign.date_added) AS campaign_date_added,
  COALESCE(campaign.icon_url, fg_campaign.icon_url) AS campaign_icon_url,
  COALESCE(campaign.sort_major_name, fg_campaign.sort_major_name) AS campaign_sort_major_name,
  COALESCE(campaign.sort_major_labels, fg_campaign.sort_major_labels) AS campaign_sort_major_labels,              
  COALESCE(campaign.sort_major_colors, fg_campaign.sort_major_colors) AS campaign_sort_major_colors,
  COALESCE(campaign.sort_minor_name, fg_campaign.sort_minor_name) AS campaign_sort_minor_name,
  COALESCE(campaign.sort_minor_labels, fg_campaign.sort_minor_labels) AS campaign_sort_minor_labels,              
  COALESCE(campaign.sort_minor_colors, fg_campaign.sort_minor_colors) AS campaign_sort_minor_colors,
  COALESCE(campaign.author_gb_id, fg_campaign.author_gb_id) AS campaign_author_gb_id,
  COALESCE(campaign.author_gb_name, fg_campaign.author_gb_name) AS campaign_author_gb_name,
  COALESCE(campaign.note, fg_campaign.note) AS campaign_note,

  map.id AS map_id,
  map.campaign_id AS map_campaign_id,
  map.name AS map_name,
  map.url AS map_url,
  map.date_added AS map_date_added,
  map.is_rejected AS map_is_rejected,
  map.rejection_reason AS map_rejection_reason,
  map.is_archived AS map_is_archived,
  map.sort_major AS map_sort_major,
  map.sort_minor AS map_sort_minor,
  map.sort_order AS map_sort_order,
  map.author_gb_id AS map_author_gb_id,
  map.author_gb_name AS map_author_gb_name,
  map.note AS map_note,
  map.collectibles AS map_collectibles,

  challenge.id AS challenge_id,
  challenge.campaign_id AS challenge_campaign_id,
  challenge.map_id AS challenge_map_id,
  challenge.objective_id AS challenge_objective_id,
  challenge.label AS challenge_label,
  challenge.description AS challenge_description,
  challenge.difficulty_id AS challenge_difficulty_id,
  challenge.date_created AS challenge_date_created,
  challenge.requires_fc AS challenge_requires_fc,
  challenge.has_fc AS challenge_has_fc,
  challenge.is_arbitrary AS challenge_is_arbitrary,
  challenge.sort AS challenge_sort,
  challenge.icon_url AS challenge_icon_url,

  cd.id AS difficulty_id,
  cd.name AS difficulty_name,
  cd.subtier AS difficulty_subtier,
  cd.sort AS difficulty_sort,

  objective.id AS objective_id,
  objective.name AS objective_name,
  objective.description AS objective_description,
  objective.display_name_suffix AS objective_display_name_suffix,
  objective.is_arbitrary AS objective_is_arbitrary,
  objective.icon_url AS objective_icon_url,

  COUNT(submission.id) AS count_submissions

FROM challenge
LEFT JOIN map  ON challenge.map_id = map.id
LEFT JOIN campaign  ON map.campaign_id = campaign.id
LEFT JOIN campaign fg_campaign ON challenge.campaign_id = fg_campaign.id
JOIN difficulty cd ON challenge.difficulty_id = cd.id
JOIN objective  ON challenge.objective_id = objective.id
LEFT JOIN submission  ON challenge.id = submission.challenge_id

GROUP BY campaign.id, fg_campaign.id, map.id, challenge.id, cd.id, objective.id
ORDER BY COALESCE(campaign.name, fg_campaign.name), COALESCE(campaign.id, fg_campaign.id), map.sort_major, map.sort_minor, map.sort_order, map.name, challenge.sort, cd.sort DESC ;




CREATE VIEW "view_challenge_changes" AS SELECT
  COALESCE(campaign.id, fg_campaign.id) AS campaign_id,                                            
  COALESCE(campaign.name, fg_campaign.name) AS campaign_name,                                        
  COALESCE(campaign.url, fg_campaign.url) AS campaign_url,                                          
  COALESCE(campaign.date_added, fg_campaign.date_added) AS campaign_date_added,                            
  COALESCE(campaign.icon_url, fg_campaign.icon_url) AS campaign_icon_url,                                
  COALESCE(campaign.sort_major_name, fg_campaign.sort_major_name) AS campaign_sort_major_name,                  
  COALESCE(campaign.sort_major_labels, fg_campaign.sort_major_labels) AS campaign_sort_major_labels,              
  COALESCE(campaign.sort_major_colors, fg_campaign.sort_major_colors) AS campaign_sort_major_colors,
  COALESCE(campaign.sort_minor_name, fg_campaign.sort_minor_name) AS campaign_sort_minor_name,                  
  COALESCE(campaign.sort_minor_labels, fg_campaign.sort_minor_labels) AS campaign_sort_minor_labels,              
  COALESCE(campaign.sort_minor_colors, fg_campaign.sort_minor_colors) AS campaign_sort_minor_colors,
  COALESCE(campaign.author_gb_id, fg_campaign.author_gb_id) AS campaign_author_gb_id,                        
  COALESCE(campaign.author_gb_name, fg_campaign.author_gb_name) AS campaign_author_gb_name,                  
  COALESCE(campaign.note, fg_campaign.note) AS campaign_note,
                                                                         
  map.id AS map_id,                                                      
  map.campaign_id AS map_campaign_id,                                    
  map.name AS map_name,                                                  
  map.url AS map_url,                                                    
  map.date_added AS map_date_added,                                      
  map.is_rejected AS map_is_rejected,                                    
  map.rejection_reason AS map_rejection_reason,
  map.is_archived AS map_is_archived,
  map.sort_major AS map_sort_major,
  map.sort_minor AS map_sort_minor,
  map.sort_order AS map_sort_order,
  map.author_gb_id AS map_author_gb_id,
  map.author_gb_name AS map_author_gb_name,
  map.note AS map_note,
  map.collectibles AS map_collectibles,

  challenge.id AS challenge_id,
  challenge.campaign_id AS challenge_campaign_id,
  challenge.map_id AS challenge_map_id,
  challenge.objective_id AS challenge_objective_id,
  challenge.label AS challenge_label,
  challenge.description AS challenge_description,
  challenge.difficulty_id AS challenge_difficulty_id,
  challenge.date_created AS challenge_date_created,
  challenge.requires_fc AS challenge_requires_fc,
  challenge.has_fc AS challenge_has_fc,
  challenge.is_arbitrary AS challenge_is_arbitrary,
  challenge.sort AS challenge_sort,
  challenge.icon_url AS challenge_icon_url,

  cd.id AS difficulty_id,
  cd.name AS difficulty_name,
  cd.subtier AS difficulty_subtier,
  cd.sort AS difficulty_sort,

  objective.id AS objective_id,
  objective.name AS objective_name,
  objective.description AS objective_description,
  objective.display_name_suffix AS objective_display_name_suffix,
  objective.is_arbitrary AS objective_is_arbitrary,
  objective.icon_url AS objective_icon_url,
  
  change.id AS change_id,
  change.campaign_id AS change_campaign_id,
  change.map_id AS change_map_id,
  change.challenge_id AS change_challenge_id,
  change.player_id AS change_player_id,
  change.author_id AS change_author_id,
  change.description AS change_description,
  change.date AS change_date,

  p.id AS author_id,
  p.name AS author_name,
  pa.is_verifier AS author_account_is_verifier,
  pa.is_admin AS author_account_is_admin,
  pa.is_suspended AS author_account_is_suspended,
  pa.suspension_reason AS author_account_suspension_reason,
  pa.name_color_start AS author_account_name_color_start,
  pa.name_color_end AS author_account_name_color_end
  
FROM change
JOIN challenge ON change.challenge_id = challenge.id
LEFT JOIN map ON challenge.map_id = map.id
LEFT JOIN campaign ON map.campaign_id = campaign.id
LEFT JOIN campaign fg_campaign ON challenge.campaign_id = fg_campaign.id
JOIN difficulty cd ON challenge.difficulty_id = cd.id
JOIN objective  ON challenge.objective_id = objective.id 
LEFT JOIN player p ON change.author_id = p.id
LEFT JOIN account pa ON p.id = pa.player_id
ORDER BY change.date DESC ;