DROP TABLE IF EXISTS Objective;

-- ====== Objective ======
CREATE TABLE IF NOT EXISTS Objective
(
	id                  SERIAL PRIMARY KEY,
	name                varchar(64) NOT NULL,
	description         text NOT NULL,
	is_arbitrary        boolean NOT NULL DEFAULT false,
	display_name_suffix varchar(32) NULL
);
