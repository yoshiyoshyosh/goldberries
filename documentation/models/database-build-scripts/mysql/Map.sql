DROP TABLE IF EXISTS `Map`;



-- ************************************** `Map`

CREATE TABLE IF NOT EXISTS `Map`
(
 `id`               int NOT NULL AUTO_INCREMENT ,
 `name`             varchar(128) NOT NULL ,
 `url`              varchar(256) NULL COMMENT 'GameBanana / Google Drive URL' ,
 `side`             varchar(64) NULL COMMENT '"A-Side", "B-Side", "C-Side", ...' ,
 `is_rejected`      bit NOT NULL DEFAULT 0 ,
 `rejection_reason` text NULL ,
 `is_archived`      bit NOT NULL DEFAULT 0 ,
 `campaign_id`      int NOT NULL ,
 `sort_major`       int NULL ,
 `sort_minor`       int NULL ,
 `sort_order`       int NULL ,
 `date_added`       datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 `author_gb_id`     int NULL ,
 `author_gb_name`   varchar(128) NULL ,

PRIMARY KEY (`id`),
KEY `FK_1` (`campaign_id`),
CONSTRAINT `FK_1` FOREIGN KEY `FK_1` (`campaign_id`) REFERENCES `Campaign` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);