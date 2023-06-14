DROP TABLE IF EXISTS `Change`;



-- ************************************** `Change`

CREATE TABLE IF NOT EXISTS `Change`
(
 `id`           int NOT NULL AUTO_INCREMENT ,
 `change_type`  enum('campaign', 'map', 'challenge', 'player', 'general') NOT NULL ,
 `campaign_id`  int NULL ,
 `map_id`       int NULL ,
 `challenge_id` int NULL ,
 `player_id`    int NULL ,
 `author`       int NOT NULL ,
 `description`  varchar(45) NOT NULL ,
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