DROP TABLE IF EXISTS `Log`;



-- ************************************** `Log`

CREATE TABLE IF NOT EXISTS `Log`
(
 `id`      int NOT NULL AUTO_INCREMENT ,
 `message` varchar(45) NOT NULL ,
 `level`   enum('debug', 'info', 'warn', 'error', 'critical') NOT NULL ,
 `topic`   varchar(45) NULL ,
 `date`    datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ,

PRIMARY KEY (`id`)
);