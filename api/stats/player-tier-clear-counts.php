<?php

require_once ('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(400, 'Invalid request method');
}

$query = "SELECT
    player.id,
    player.name,
    account.name_color_start AS account_name_color_start,
    account.name_color_end AS account_name_color_end,
    account.input_method AS account_input_method,
    COUNT(*) FILTER (WHERE difficulty.name = 'Tier 0') AS t0,
    COUNT(*) FILTER (WHERE difficulty.name = 'Tier 1') AS t1,
    COUNT(*) FILTER (WHERE difficulty.name = 'Tier 2') AS t2,
    COUNT(*) FILTER (WHERE difficulty.name = 'Tier 3') AS t3,
    COUNT(*) FILTER (WHERE difficulty.name = 'Tier 4') AS t4,
    COUNT(*) FILTER (WHERE difficulty.name = 'Tier 5') AS t5,
    COUNT(*) FILTER (WHERE difficulty.name = 'Tier 6') AS t6,
    COUNT(*) FILTER (WHERE difficulty.name = 'Tier 7') AS t7,
    COUNT(*) FILTER (WHERE difficulty.name = 'Standard') AS standard,
    COUNT(*) AS total
  FROM submission
  JOIN challenge ON submission.challenge_id = challenge.id
  JOIN difficulty ON challenge.difficulty_id = difficulty.id
  JOIN player ON submission.player_id = player.id
  LEFT JOIN account ON player.id = account.player_id
  GROUP BY player.id, account.id
  ORDER BY player.name ASC";
$result = pg_query($DB, $query);
if (!$result) {
  die_json(500, "Failed to query database");
}

$data = array();
while ($row = pg_fetch_assoc($result)) {
  $player = new Player();
  $player->apply_db_data($row);
  // $player->expand_foreign_keys($row, 5);
  $row_data = array();

  $row_data['player'] = $player;
  $row_data['clears'] = array();
  $row_data['total'] = intval($row['total']);
  $row_data['clears']['2'] = intval($row['t0']);
  $row_data['clears']['5'] = intval($row['t1']);
  $row_data['clears']['8'] = intval($row['t2']);
  $row_data['clears']['11'] = intval($row['t3']);
  $row_data['clears']['14'] = intval($row['t4']);
  $row_data['clears']['15'] = intval($row['t5']);
  $row_data['clears']['16'] = intval($row['t6']);
  $row_data['clears']['17'] = intval($row['t7']);
  $row_data['clears']['18'] = intval($row['standard']);

  $data[] = $row_data;
}

api_write($data);