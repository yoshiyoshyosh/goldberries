DROP TABLE IF EXISTS Campaign;

-- ====== Campaign ======
CREATE TABLE IF NOT EXISTS Campaign
(
	id         SERIAL PRIMARY KEY,
	name       varchar(128) NOT NULL,
	url        varchar(256) NOT NULL,
	date_added timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	icon_url   varchar(256) NULL
);
