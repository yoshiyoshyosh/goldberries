DROP TABLE IF EXISTS `FarewellGoldenData`;



-- ************************************** `FarewellGoldenData`

CREATE TABLE IF NOT EXISTS `FarewellGoldenData`
(
 `id`                       int NOT NULL AUTO_INCREMENT ,
 `submission_id`            int NOT NULL ,
 `date_achieved`            datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 `platform`                 varchar(64) NOT NULL ,
 `moonberry`                bit NOT NULL DEFAULT 0 ,
 `used_keys`                bit NOT NULL DEFAULT 0 ,
 `kept_keys`                int NOT NULL DEFAULT 0 ,
 `repeat_collect`           bit NOT NULL DEFAULT 0 ,
 `partial_run`              bit NOT NULL DEFAULT 0 ,
 `berry_number`             int NOT NULL DEFAULT 202 ,
 `date_202`                 datetime NULL ,
 `attempted_double_collect` bit NOT NULL DEFAULT 0 ,
 `double_collect`           bit NOT NULL DEFAULT 0 ,
 `no_moonberry_pickup`      bit NOT NULL DEFAULT 0 ,

PRIMARY KEY (`id`),
KEY `FK_1` (`submission_id`),
CONSTRAINT `FK_20` FOREIGN KEY `FK_1` (`submission_id`) REFERENCES `Submission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);
