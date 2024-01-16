DROP TABLE IF EXISTS `Account`;



-- ************************************** `Account`

CREATE TABLE IF NOT EXISTS `Account`
(
 `id`                int NOT NULL AUTO_INCREMENT ,
 `player_id`         int NOT NULL ,
 `claimed_player_id` int NOT NULL ,
 `email`             varchar(128) NULL ,
 `password`          varchar(128) NULL ,
 `discord_id`        varchar(32) NULL ,
 `session_token`     varchar(64) NULL ,
 `session_created`   datetime NULL ,
 `date_created`      datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 `is_verifier`       bit NOT NULL DEFAULT 0 ,
 `is_admin`          bit NOT NULL DEFAULT 0 ,
 `is_suspended`      bit NOT NULL DEFAULT 0 ,
 `suspension_reason` text NULL ,

PRIMARY KEY (`id`),
KEY `FK_1` (`player_id`),
CONSTRAINT `FK_24_1` FOREIGN KEY `FK_1` (`player_id`) REFERENCES `Player` (`id`),
KEY `FK_2` (`claimed_player_id`),
CONSTRAINT `FK_25_1` FOREIGN KEY `FK_2` (`claimed_player_id`) REFERENCES `Player` (`id`)
);
