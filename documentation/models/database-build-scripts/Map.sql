DROP TABLE IF EXISTS Map;

-- ====== Map ======
CREATE TABLE IF NOT EXISTS Map
(
	id               SERIAL PRIMARY KEY,
	name             varchar(128) NOT NULL,
	url              varchar(256) NULL, /* Gamebanana / archive.org URL */
	side             varchar(64) NULL, /* A-Side, B-Side, etc. */
	is_rejected      boolean NOT NULL DEFAULT false,
	rejection_reason text NULL,
	is_archived      boolean NOT NULL DEFAULT false,
	campaign_id      int NULL REFERENCES Campaign (id) ON DELETE CASCADE ON UPDATE CASCADE,
	sort_1           int NULL,
	sort_2           int NULL,
	sort_3           int NULL,
	date_added       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
