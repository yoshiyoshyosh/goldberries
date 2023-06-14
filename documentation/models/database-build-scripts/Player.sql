DROP TABLE IF EXISTS `Player`;



-- ************************************** `Player`

CREATE TABLE IF NOT EXISTS `Player`
(
 `id`                int NOT NULL AUTO_INCREMENT ,
 `name`              varchar(45) NOT NULL ,
 `password`          varchar(45) NOT NULL ,
 `is_verifier`       bit NOT NULL ,
 `is_admin`          bit NOT NULL ,
 `is_suspended`      bit NOT NULL ,
 `suspension_reason` varchar(45) NULL ,
 `date_created`      datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,

PRIMARY KEY (`id`)
);