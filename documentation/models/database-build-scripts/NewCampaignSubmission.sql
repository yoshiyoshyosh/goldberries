DROP TABLE IF EXISTS NewCampaignSubmission;

-- ====== NewCampaignSubmission ======
CREATE TABLE IF NOT EXISTS NewCampaignSubmission
(
	id          SERIAL PRIMARY KEY,
	url         varchar(256) NOT NULL,
	description text NOT NULL
);
