DROP TABLE IF EXISTS `Difficulty`;



-- ************************************** `Difficulty`

CREATE TABLE IF NOT EXISTS `Difficulty`
(
 `id`   int NOT NULL AUTO_INCREMENT ,
 `name` varchar(32) NOT NULL ,
 `tier` int NULL ,

PRIMARY KEY (`id`)
);