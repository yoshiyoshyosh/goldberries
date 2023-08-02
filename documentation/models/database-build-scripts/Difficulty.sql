DROP TABLE IF EXISTS Difficulty;
DROP TYPE IF EXISTS difficulty_subtier_t;

-- ====== Difficulty ======
CREATE TYPE difficulty_subtier_t AS ENUM ('high', 'mid', 'low', 'guard');
CREATE TABLE IF NOT EXISTS Difficulty
(
	id           SERIAL PRIMARY KEY,
	name         varchar(32) NOT NULL,
	subtier      difficulty_subtier_t NULL,
	sort         int NOT NULL,
	color        char(6) CHECK (color SIMILAR TO '[0-9A-F]{6}'),
	color_group  char(6) CHECK (color_group SIMILAR TO '[0-9A-F]{6}')
);
