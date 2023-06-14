DROP TABLE IF EXISTS `NewCampaignSubmission`;



-- ************************************** `NewCampaignSubmission`

CREATE TABLE IF NOT EXISTS `NewCampaignSubmission`
(
 `id`          int NOT NULL AUTO_INCREMENT ,
 `url`         varchar(45) NOT NULL ,
 `description` varchar(45) NOT NULL ,

PRIMARY KEY (`id`)
);