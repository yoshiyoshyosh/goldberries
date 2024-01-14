DROP TABLE IF EXISTS `NewChallenge`;



-- ************************************** `NewChallenge`

CREATE TABLE IF NOT EXISTS `NewChallenge`
(
 `id`          int NOT NULL AUTO_INCREMENT ,
 `url`         varchar(256) NOT NULL ,
 `name`        varchar(128) NULL ,
 `description` text NOT NULL ,

PRIMARY KEY (`id`)
);
