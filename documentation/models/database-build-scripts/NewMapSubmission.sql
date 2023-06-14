DROP TABLE IF EXISTS `NewMapSubmission`;



-- ************************************** `NewMapSubmission`

CREATE TABLE IF NOT EXISTS `NewMapSubmission`
(
 `id`          int NOT NULL AUTO_INCREMENT ,
 `url`         varchar(256) NOT NULL ,
 `name`        varchar(128) NOT NULL ,
 `description` text NOT NULL ,

PRIMARY KEY (`id`)
);