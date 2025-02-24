<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Invalid request method');
}

//TODO - Rework this entire endpoint when subtiers are removed

//Fetch all difficulties first
$query = "SELECT * FROM difficulty WHERE id NOT IN ($TRIVIAL_ID, $UNDETERMINED_ID) ORDER BY sort DESC";
$result = pg_query_params_or_die($DB, $query);


$difficulties = [];
while ($row = pg_fetch_assoc($result)) {
  $difficulty = new Difficulty();
  $difficulty->apply_db_data($row, '');
  $difficulties[] = $difficulty;
}

$selects = [];
foreach ($difficulties as $difficulty) {
  $selects[] = "COUNT(submission.id) FILTER (WHERE difficulty.name = '$difficulty->name') AS t$difficulty->sort";
}
$selects_str = implode(', ', $selects);


$query = "SELECT
    player.id,
    player.name,
    account.role AS account_role,
    account.name_color_start AS account_name_color_start,
    account.name_color_end AS account_name_color_end,
    account.input_method AS account_input_method,
    $selects_str,
    COUNT(submission.id) AS total
  FROM player
  LEFT JOIN submission ON submission.player_id = player.id
  LEFT JOIN account ON player.id = account.player_id
  LEFT JOIN challenge ON submission.challenge_id = challenge.id
  LEFT JOIN objective ON challenge.objective_id = objective.id
  LEFT JOIN difficulty ON challenge.difficulty_id = difficulty.id
  LEFT JOIN map ON challenge.map_id = map.id
  WHERE submission.id IS NULL OR 
    (submission.is_verified = TRUE AND (map.is_rejected = FALSE OR map.id IS NULL) AND challenge.is_rejected = FALSE AND submission.is_obsolete = FALSE)
  GROUP BY player.id, account.id
  ORDER BY total DESC";
$result = pg_query($DB, $query);
if (!$result) {
  die_json(500, "Failed to query database");
}

$data = array();
while ($row = pg_fetch_assoc($result)) {
  $player = new Player();
  $player->apply_db_data($row, '', false);

  $row_data = [];
  $row_data['player'] = $player;
  $row_data['clears'] = [];
  foreach ($difficulties as $difficulty) {
    $row_data['clears'][$difficulty->id] = intval($row["t$difficulty->sort"]);
  }
  $row_data['total'] = intval($row['total']);

  $data[] = $row_data;
}

api_write($data);