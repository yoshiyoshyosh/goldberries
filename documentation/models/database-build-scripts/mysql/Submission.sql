DROP TABLE IF EXISTS `Submission`;



-- ************************************** `Submission`

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
