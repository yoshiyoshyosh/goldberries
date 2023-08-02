DROP TABLE IF EXISTS Campaign;

-- ====== Campaign ======
CREATE TABLE IF NOT EXISTS Campaign
(
	id                       SERIAL PRIMARY KEY,
	name                     varchar(128) NOT NULL,
	url                      varchar(256) NOT NULL,
	date_added               timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	icon_url                 varchar(256) NULL,
	authors                  text NULL,
	sort_major_name          varchar(32) NULL,
	sort_major_labels        text NULL,
	sort_major_accent_colors text CHECK (sort_major_accent_colors ~* '[0-9A-F\t]'),
	sort_minor_name          varchar(32) NULL,
	sort_minor_labels        text NULL,
	sort_minor_accent_colors text CHECK (sort_minor_accent_colors ~* '[0-9A-F\t]')
);
