<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$response = [
  "verified_submissions" => [],
  "created_objects" => [],
];


$query = "SELECT
  player.*,
  account.role AS account_role,
  account.is_suspended AS account_is_suspended,
  account.suspension_reason AS account_suspension_reason,
  account.name_color_start AS account_name_color_start,
  account.name_color_end AS account_name_color_end,
  COUNT(*) AS verified_count
FROM submission
  JOIN player ON submission.verifier_id = player.id
  LEFT JOIN account ON account.player_id = player.id
WHERE account.is_suspended = FALSE
GROUP BY player.id, account.id
ORDER BY verified_count DESC";

$result = pg_query_params_or_die($DB, $query);
while ($row = pg_fetch_assoc($result)) {
  $player = new Player();
  $player->apply_db_data($row, "", false);
  $verified_count = intval($row['verified_count']);
  $response['verified_submissions'][] = [
    'player' => $player,
    'count' => $verified_count,
  ];
}


$query = "SELECT
	player.*,
  account.role AS account_role,
  account.is_suspended AS account_is_suspended,
  account.suspension_reason AS account_suspension_reason,
  account.name_color_start AS account_name_color_start,
  account.name_color_end AS account_name_color_end,
	COUNT(*) FILTER (WHERE change.description ILIKE 'Created campaign') AS campaigns_created,
	COUNT(*) FILTER (WHERE change.description ILIKE 'Created map') AS maps_created,
	COUNT(*) FILTER (WHERE change.description ILIKE 'Created challenge%') AS challenges_created,
	COUNT(*) AS total_created
FROM change
  JOIN player ON change.author_id = player.id
  LEFT JOIN account ON account.player_id = player.id
WHERE change.description ILIKE 'Created %'
GROUP BY player.id, account.id
ORDER BY total_created DESC";

$result = pg_query_params_or_die($DB, $query);
while ($row = pg_fetch_assoc($result)) {
  $player = new Player();
  $player->apply_db_data($row, "", false);
  $campaigns_created = intval($row['campaigns_created']);
  $maps_created = intval($row['maps_created']);
  $challenges_created = intval($row['challenges_created']);
  $total_created = intval($row['total_created']);
  $response['created_objects'][] = [
    'player' => $player,
    'campaigns' => $campaigns_created,
    'maps' => $maps_created,
    'challenges' => $challenges_created,
    'total' => $total_created,
  ];
}

api_write($response);