DROP TABLE IF EXISTS Difficulty;

-- ====== Difficulty ======
CREATE TABLE IF NOT EXISTS Difficulty
(
	id   SERIAL PRIMARY KEY,
	name varchar(32) NOT NULL,
	tier int NULL
);
