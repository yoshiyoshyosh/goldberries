DROP TABLE IF EXISTS `Submission`;



-- ************************************** `Submission`

CREATE TABLE IF NOT EXISTS `Submission`
(
 `id`                         int NOT NULL AUTO_INCREMENT ,
 `challenge_id`               int NULL ,
 `player_id`                  int NULL ,
 `date_created`               datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 `proof_url`                  varchar(256) NOT NULL ,
 `player_notes`               text NULL ,
 `is_verified`                bit NOT NULL DEFAULT 0,
 `verifier_id`                int NULL ,
 `date_verified`              datetime NULL ,
 `verifier_notes`             text NULL ,
 `new_map_submission_id`      int NULL ,
 `new_campaign_submission_id` int NULL ,

PRIMARY KEY (`id`),
KEY `FK_1` (`challenge_id`),
CONSTRAINT `FK_3` FOREIGN KEY `FK_1` (`challenge_id`) REFERENCES `Challenge` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
KEY `FK_2` (`verifier_id`),
CONSTRAINT `FK_5` FOREIGN KEY `FK_2` (`verifier_id`) REFERENCES `Player` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
KEY `FK_3` (`player_id`),
CONSTRAINT `FK_6` FOREIGN KEY `FK_3` (`player_id`) REFERENCES `Player` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
KEY `FK_4` (`new_map_submission_id`),
CONSTRAINT `FK_16` FOREIGN KEY `FK_4` (`new_map_submission_id`) REFERENCES `NewMapSubmission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
KEY `FK_6` (`new_campaign_submission_id`),
CONSTRAINT `FK_18` FOREIGN KEY `FK_6` (`new_campaign_submission_id`) REFERENCES `NewCampaignSubmission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);