DROP TABLE IF EXISTS Logging;

-- ====== LOGGING ======
CREATE TABLE IF NOT EXISTS Logging
(
	id       SERIAL PRIMARY KEY,
	message  text NOT NULL,
	level    text NOT NULL,
	topic    varchar(64) NULL,
	log_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT check_level CHECK (level in ('debug', 'info', 'warn', 'error', 'critical'))
);
