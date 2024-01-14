DROP TABLE IF EXISTS `Author`;



-- ************************************** `Author`

CREATE TABLE IF NOT EXISTS `Author`
(
 `id`    int NOT NULL AUTO_INCREMENT ,
 `gb_id` int NOT NULL ,
 `name`  varchar(128) NOT NULL ,

PRIMARY KEY (`id`)
);
