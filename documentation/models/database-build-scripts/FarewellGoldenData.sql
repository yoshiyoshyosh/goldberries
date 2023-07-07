DROP TABLE IF EXISTS FarewellGoldenData;

-- ====== FarewellGoldenData ======
CREATE TABLE IF NOT EXISTS FarewellGoldenData
(
	id                       SERIAL PRIMARY KEY,
	submission_id            int NOT NULL REFERENCES Submission (id) ON DELETE CASCADE ON UPDATE CASCADE,
	date_achieved            timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	platform                 varchar(64) NOT NULL,
	moonberry                boolean NOT NULL DEFAULT false,
	used_keys                boolean NOT NULL DEFAULT false,
	kept_keys                int NOT NULL DEFAULT 0,
	repeat_collect           boolean NOT NULL DEFAULT false,
	partial_run              boolean NOT NULL DEFAULT false,
	berry_number             int NOT NULL DEFAULT 202,
	date_202                 timestamp NULL,
	attempted_double_collect boolean NOT NULL DEFAULT false,
	double_collect           boolean NOT NULL DEFAULT false,
	no_moonberry_pickup      boolean NOT NULL DEFAULT false
);
