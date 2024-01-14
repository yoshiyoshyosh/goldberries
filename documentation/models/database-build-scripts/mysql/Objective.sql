DROP TABLE IF EXISTS `Objective`;



-- ************************************** `Objective`

CREATE TABLE IF NOT EXISTS `Objective`
(
 `id`                  int NOT NULL AUTO_INCREMENT ,
 `name`                varchar(64) NOT NULL ,
 `description`         text NOT NULL ,
 `display_name_suffix` varchar(32) NULL ,
 `is_arbitrary`        bit NOT NULL DEFAULT 0 ,

PRIMARY KEY (`id`)
);
