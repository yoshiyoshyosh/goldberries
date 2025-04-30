<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Invalid request method');
}

//Verify that base is a valid float
$base = floatval($_GET['base']) ?? 1.43;
if ($base === floatval(0)) {
  die_json(400, 'Invalid base');
}

$weight = floatval($_GET['weight']) ?? 1;
if ($weight === floatval(0)) {
  $weight = 1;
}

$max = intval($_GET['max']) ?? 999999;
if ($max < 1) {
  $max = 999999;
}

$query = "SELECT
	t.player_id AS player_id,
	p.name AS player_name,
	pa.role AS player_account_role,
	pa.is_suspended AS player_account_is_suspended,
	pa.suspension_reason AS player_account_suspension_reason,
	pa.name_color_start AS player_account_name_color_start,
	pa.name_color_end AS player_account_name_color_end,
	ROUND(SUM(POWER($base, t.difficulty_sort - 1) * POWER($weight, t.rank - 1))) AS points
FROM (
	SELECT
		submission.player_id AS player_id,
		difficulty.sort AS difficulty_sort,
		ROW_NUMBER() OVER (PARTITION BY submission.player_id ORDER BY difficulty.sort DESC) AS rank
	FROM submission
	JOIN challenge ON submission.challenge_id = challenge.id
	JOIN difficulty ON challenge.difficulty_id = difficulty.id
	WHERE difficulty.sort > 0 AND submission.is_verified = TRUE
	ORDER BY rank ASC
) AS t
JOIN player p ON t.player_id = p.id
LEFT JOIN account pa ON p.id = pa.player_id
WHERE t.rank <= $max
GROUP BY t.player_id, p.id, pa.id
ORDER BY points DESC";
$result = pg_query_params_or_die($DB, $query);

$data = [];
while ($row = pg_fetch_assoc($result)) {
  $player = new Player();
  $player->apply_db_data($row, 'player_', false);

  $points = intval($row['points']);
  $data[] = [
    'player' => $player,
    'points' => $points,
  ];
}

api_write($data);