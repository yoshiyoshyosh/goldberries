DROP TABLE IF EXISTS `Player`;



-- ************************************** `Player`

CREATE TABLE IF NOT EXISTS `Player`
(
 `id`                int NOT NULL AUTO_INCREMENT ,
 `name`              varchar(32) NOT NULL ,
 `password`          varchar(128) NULL ,
 `is_verifier`       bit NOT NULL DEFAULT 0,
 `is_admin`          bit NOT NULL DEFAULT 0,
 `is_suspended`      bit NOT NULL DEFAULT 0,
 `suspension_reason` text NULL ,
 `date_created`      datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,

PRIMARY KEY (`id`)
);