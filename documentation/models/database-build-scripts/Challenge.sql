DROP TABLE IF EXISTS `Challenge`;



-- ************************************** `Challenge`

CREATE TABLE IF NOT EXISTS `Challenge`
(
 `id`                 int NOT NULL AUTO_INCREMENT ,
 `challenge_type`     enum('map', 'campaign') NOT NULL ,
 `campaign_id`        int NULL ,
 `map_id`             int NULL ,
 `objective_id`       int NOT NULL ,
 `description`        text NULL ,
 `difficulty_id`      int NOT NULL ,
 `difficulty_subtier` enum('high', 'mid', 'low', 'guard') NULL ,
 `date_created`       datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 `requires_fc`        bit NOT NULL DEFAULT 0 ,
 `requires_special`   bit NOT NULL DEFAULT 0 ,
 `has_fc`             bit NOT NULL DEFAULT 0 ,
 `has_special`        bit NOT NULL DEFAULT 0 ,

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