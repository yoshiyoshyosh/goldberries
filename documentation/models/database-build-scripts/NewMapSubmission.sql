DROP TABLE IF EXISTS `NewMapSubmission`;



-- ************************************** `NewMapSubmission`

CREATE TABLE IF NOT EXISTS `NewMapSubmission`
(
 `id`          int NOT NULL AUTO_INCREMENT ,
 `url`         varchar(45) NOT NULL ,
 `name`        varchar(45) NOT NULL ,
 `description` varchar(45) NOT NULL ,

PRIMARY KEY (`id`)
);