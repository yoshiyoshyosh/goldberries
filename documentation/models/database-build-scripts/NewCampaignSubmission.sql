DROP TABLE IF EXISTS `NewCampaignSubmission`;



-- ************************************** `NewCampaignSubmission`

CREATE TABLE IF NOT EXISTS `NewCampaignSubmission`
(
 `id`          int NOT NULL AUTO_INCREMENT ,
 `url`         varchar(256) NOT NULL ,
 `description` text NOT NULL ,

PRIMARY KEY (`id`)
);