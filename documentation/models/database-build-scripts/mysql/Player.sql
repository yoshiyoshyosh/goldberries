DROP TABLE IF EXISTS `Player`;



-- ************************************** `Player`

CREATE TABLE IF NOT EXISTS `Player`
(
 `id`   int NOT NULL AUTO_INCREMENT ,
 `name` varchar(32) NOT NULL ,

PRIMARY KEY (`id`)
);
