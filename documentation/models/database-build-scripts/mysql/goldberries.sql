-- Combined Build Script

-- =========== Drop Statements ===========
DROP TABLE IF EXISTS `FarewellGoldenData`;
DROP TABLE IF EXISTS `Change`;
DROP TABLE IF EXISTS `Submission`;
DROP TABLE IF EXISTS `Challenge`;
DROP TABLE IF EXISTS `Map`;
DROP TABLE IF EXISTS `Campaign`;
DROP TABLE IF EXISTS `Logging`;
DROP TABLE IF EXISTS `NewChallenge`;
DROP TABLE IF EXISTS `Player`;
DROP TABLE IF EXISTS `Difficulty`;
DROP TABLE IF EXISTS `Objective`;
DROP TABLE IF EXISTS `Author`;



-- =========== Create Statements ===========

-- ====== Author ======
CREATE TABLE IF NOT EXISTS `Author`
(
 `id`    int NOT NULL AUTO_INCREMENT ,
 `gb_id` int NOT NULL ,
 `name`  varchar(128) NOT NULL ,
PRIMARY KEY (`id`)
);

-- ====== Objective ======
CREATE TABLE IF NOT EXISTS `Objective`
(
 `id`                  int NOT NULL AUTO_INCREMENT ,
 `name`                varchar(64) NOT NULL ,
 `description`         text NOT NULL ,
 `display_name_suffix` varchar(32) NULL ,
 `is_arbitrary`        bit NOT NULL DEFAULT 0 ,
PRIMARY KEY (`id`)
);

-- ====== Difficulty ======
CREATE TABLE IF NOT EXISTS `Difficulty`
(
 `id`      int NOT NULL AUTO_INCREMENT ,
 `name`    varchar(32) NOT NULL ,
 `subtier` enum('high', 'mid', 'low', 'guard') NULL ,
 `sort`    int NOT NULL ,
PRIMARY KEY (`id`)
);

-- ====== Player ======
CREATE TABLE IF NOT EXISTS `Player`
(
 `id`                int NOT NULL AUTO_INCREMENT ,
 `name`              varchar(32) NOT NULL ,
 `password`          varchar(128) NULL ,
 `is_verifier`       bit NOT NULL DEFAULT 0 ,
 `is_admin`          bit NOT NULL DEFAULT 0 ,
 `is_suspended`      bit NOT NULL DEFAULT 0 ,
 `suspension_reason` text NULL ,
 `date_created`      datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,
PRIMARY KEY (`id`)
);

-- ====== NewChallenge ======
CREATE TABLE IF NOT EXISTS `NewChallenge`
(
 `id`          int NOT NULL AUTO_INCREMENT ,
 `url`         varchar(256) NOT NULL ,
 `name`        varchar(128) NULL ,
 `description` text NOT NULL ,
PRIMARY KEY (`id`)
);

-- ====== Logging ======
CREATE TABLE IF NOT EXISTS `Logging`
(
 `id`      int NOT NULL AUTO_INCREMENT ,
 `message` text NOT NULL ,
 `level`   enum('debug', 'info', 'warn', 'error', 'critical') NOT NULL ,
 `topic`   varchar(64) NULL ,
 `date`    datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,
PRIMARY KEY (`id`)
);

-- ====== Campaign ======
CREATE TABLE IF NOT EXISTS `Campaign`
(
 `id`                       int NOT NULL AUTO_INCREMENT ,
 `name`                     varchar(128) NOT NULL ,
 `url`                      varchar(256) NOT NULL ,
 `author_id`                int NOT NULL ,
 `date_added`               datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 `icon_url`                 varchar(256) NULL ,
 `sort_major_name`          varchar(32) NULL ,
 `sort_major_labels`        text NULL ,
 `sort_major_accent_colors` text NULL ,
 `sort_minor_name`          varchar(32) NULL ,
 `sort_minor_labels`        text NULL ,
 `sort_minor_accent_colors` text NULL ,
PRIMARY KEY (`id`),
KEY `FK_1` (`author_id`),
CONSTRAINT `FK_25_1` FOREIGN KEY `FK_1` (`author_id`) REFERENCES `Author` (`id`)
);

-- ====== Map ======
CREATE TABLE IF NOT EXISTS `Map`
(
 `id`               int NOT NULL AUTO_INCREMENT ,
 `name`             varchar(128) NOT NULL ,
 `url`              varchar(256) NULL COMMENT 'GameBanana / Google Drive URL' ,
 `author_id`        int NULL ,
 `side`             varchar(64) NULL COMMENT '"A-Side", "B-Side", "C-Side", ...' ,
 `is_rejected`      bit NOT NULL DEFAULT 0 ,
 `rejection_reason` text NULL ,
 `is_archived`      bit NOT NULL DEFAULT 0 ,
 `campaign_id`      int NOT NULL ,
 `sort_major`       int NULL ,
 `sort_minor`       int NULL ,
 `sort_order`       int NULL ,
 `date_added`       datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,
PRIMARY KEY (`id`),
KEY `FK_1` (`campaign_id`),
CONSTRAINT `FK_1` FOREIGN KEY `FK_1` (`campaign_id`) REFERENCES `Campaign` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
KEY `FK_2` (`author_id`),
CONSTRAINT `FK_26` FOREIGN KEY `FK_2` (`author_id`) REFERENCES `Author` (`id`)
);

-- ====== Challenge ======
CREATE TABLE IF NOT EXISTS `Challenge`
(
 `id`             int NOT NULL AUTO_INCREMENT ,
 `challenge_type` enum('map', 'campaign') NOT NULL ,
 `campaign_id`    int NULL ,
 `map_id`         int NULL ,
 `objective_id`   int NOT NULL ,
 `description`    text NULL ,
 `difficulty_id`  int NOT NULL ,
 `date_created`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 `requires_fc`    bit NOT NULL DEFAULT 0 ,
 `has_fc`         bit NOT NULL DEFAULT 0 ,
 `is_arbitrary`   bit NULL ,
PRIMARY KEY (`id`),
KEY `FK_1` (`map_id`),
CONSTRAINT `FK_2` FOREIGN KEY `FK_1` (`map_id`) REFERENCES `Map` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
KEY `FK_2` (`difficulty_id`),
CONSTRAINT `FK_4` FOREIGN KEY `FK_2` (`difficulty_id`) REFERENCES `Difficulty` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
KEY `FK_3` (`campaign_id`),
CONSTRAINT `FK_7` FOREIGN KEY `FK_3` (`campaign_id`) REFERENCES `Campaign` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
KEY `FK_4` (`objective_id`),
CONSTRAINT `FK_8` FOREIGN KEY `FK_4` (`objective_id`) REFERENCES `Objective` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ====== Submission ======
CREATE TABLE IF NOT EXISTS `Submission`
(
 `id`                      int NOT NULL AUTO_INCREMENT ,
 `challenge_id`            int NULL ,
 `player_id`               int NOT NULL ,
 `date_created`            datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 `is_fc`                   bit NOT NULL DEFAULT 0 ,
 `proof_url`               varchar(256) NOT NULL ,
 `player_notes`            text NULL ,
 `suggested_difficulty_id` int NULL ,
 `is_verified`             bit NOT NULL DEFAULT 0 ,
 `is_rejected`             bit NOT NULL DEFAULT 0 ,
 `verifier_id`             int NULL ,
 `date_verified`           datetime NULL ,
 `verifier_notes`          text NULL ,
 `new_challenge_id`        int NULL ,
PRIMARY KEY (`id`),
KEY `FK_1` (`challenge_id`),
CONSTRAINT `FK_3` FOREIGN KEY `FK_1` (`challenge_id`) REFERENCES `Challenge` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
KEY `FK_2` (`verifier_id`),
CONSTRAINT `FK_5` FOREIGN KEY `FK_2` (`verifier_id`) REFERENCES `Player` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
KEY `FK_3` (`player_id`),
CONSTRAINT `FK_6` FOREIGN KEY `FK_3` (`player_id`) REFERENCES `Player` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
KEY `FK_4` (`new_challenge_id`),
CONSTRAINT `FK_16` FOREIGN KEY `FK_4` (`new_challenge_id`) REFERENCES `NewChallenge` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
KEY `FK_6_1` (`suggested_difficulty_id`),
CONSTRAINT `FK_24` FOREIGN KEY `FK_6_1` (`suggested_difficulty_id`) REFERENCES `Difficulty` (`id`)
);

-- ====== Change ======
CREATE TABLE IF NOT EXISTS `Change`
(
 `id`           int NOT NULL AUTO_INCREMENT ,
 `change_type`  enum('campaign', 'map', 'challenge', 'player', 'general') NOT NULL ,
 `campaign_id`  int NULL ,
 `map_id`       int NULL ,
 `challenge_id` int NULL ,
 `player_id`    int NULL ,
 `author`       int NOT NULL ,
 `description`  text NOT NULL ,
 `date`         datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,
PRIMARY KEY (`id`),
KEY `FK_1` (`campaign_id`),
CONSTRAINT `FK_9` FOREIGN KEY `FK_1` (`campaign_id`) REFERENCES `Campaign` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
KEY `FK_2` (`map_id`),
CONSTRAINT `FK_10` FOREIGN KEY `FK_2` (`map_id`) REFERENCES `Map` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
KEY `FK_3` (`challenge_id`),
CONSTRAINT `FK_11` FOREIGN KEY `FK_3` (`challenge_id`) REFERENCES `Challenge` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
KEY `FK_4` (`player_id`),
CONSTRAINT `FK_12` FOREIGN KEY `FK_4` (`player_id`) REFERENCES `Player` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
KEY `FK_5` (`author`),
CONSTRAINT `FK_13` FOREIGN KEY `FK_5` (`author`) REFERENCES `Player` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ====== FarewellGoldenData ======
CREATE TABLE IF NOT EXISTS `FarewellGoldenData`
(
 `id`                       int NOT NULL AUTO_INCREMENT ,
 `submission_id`            int NOT NULL ,
 `date_achieved`            datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 `platform`                 varchar(64) NOT NULL ,
 `moonberry`                bit NOT NULL DEFAULT 0 ,
 `used_keys`                bit NOT NULL DEFAULT 0 ,
 `kept_keys`                int NOT NULL DEFAULT 0 ,
 `repeat_collect`           bit NOT NULL DEFAULT 0 ,
 `partial_run`              bit NOT NULL DEFAULT 0 ,
 `berry_number`             int NOT NULL DEFAULT 202 ,
 `date_202`                 datetime NULL ,
 `attempted_double_collect` bit NOT NULL DEFAULT 0 ,
 `double_collect`           bit NOT NULL DEFAULT 0 ,
 `no_moonberry_pickup`      bit NOT NULL DEFAULT 0 ,
PRIMARY KEY (`id`),
KEY `FK_1` (`submission_id`),
CONSTRAINT `FK_20` FOREIGN KEY `FK_1` (`submission_id`) REFERENCES `Submission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);
