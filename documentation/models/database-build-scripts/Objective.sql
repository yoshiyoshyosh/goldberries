DROP TABLE IF EXISTS `Objective`;



-- ************************************** `Objective`

CREATE TABLE IF NOT EXISTS `Objective`
(
 `id`                  int NOT NULL AUTO_INCREMENT ,
 `name`                varchar(45) NOT NULL ,
 `description`         varchar(45) NOT NULL ,
 `is_arbitrary`        bit NOT NULL ,
 `display_name_suffix` varchar(45) NULL ,

PRIMARY KEY (`id`)
);