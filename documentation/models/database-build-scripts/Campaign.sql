DROP TABLE IF EXISTS `Campaign`;



-- ************************************** `Campaign`

CREATE TABLE IF NOT EXISTS `Campaign`
(
 `id`         int NOT NULL AUTO_INCREMENT ,
 `name`       varchar(45) NOT NULL ,
 `url`        varchar(45) NOT NULL ,
 `date_added` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 `icon_url`   varchar(45) NULL ,

PRIMARY KEY (`id`)
);