DROP TABLE IF EXISTS `Campaign`;



-- ************************************** `Campaign`

CREATE TABLE IF NOT EXISTS `Campaign`
(
 `id`                       int NOT NULL AUTO_INCREMENT ,
 `name`                     varchar(128) NOT NULL ,
 `url`                      varchar(256) NOT NULL ,
 `date_added`               datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 `icon_url`                 varchar(256) NULL ,
 `sort_major_name`          varchar(32) NULL ,
 `sort_major_labels`        text NULL ,
 `sort_major_accent_colors` text NULL ,
 `sort_minor_name`          varchar(32) NULL ,
 `sort_minor_labels`        text NULL ,
 `sort_minor_accent_colors` text NULL ,
 `author_gb_id`             int NULL ,
 `author_gb_name`           varchar(128) NULL ,

PRIMARY KEY (`id`)
);
