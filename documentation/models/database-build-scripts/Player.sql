DROP TABLE IF EXISTS Player;

-- ====== Player ======
CREATE TABLE IF NOT EXISTS Player
(
	id                SERIAL PRIMARY KEY,
	name              varchar(32) NOT NULL,
	password          varchar(128) NULL,
	is_verifier       boolean NOT NULL DEFAULT false,
	is_admin          boolean NOT NULL DEFAULT false,
	is_suspended      boolean NOT NULL DEFAULT false,
	suspension_reason text NULL,
	date_created      timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
