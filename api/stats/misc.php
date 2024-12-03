<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Invalid request method');
}

$response = [
  "suggestions" => [
    "accepted" => 0,
    "rejected" => 0
  ],
  "submissions" => [
    "since_release" => 0
  ],
  "difficulties" => [
    "distinct_players" => []
  ],
  "players" => [
    "total" => 0,
  ],
];

$query = "SELECT
  (SELECT COUNT(*) FROM suggestion WHERE is_verified = TRUE AND is_accepted = TRUE) AS count_accepted,
  (SELECT COUNT(*) FROM suggestion WHERE is_verified = TRUE AND is_accepted = false) AS count_rejected,
  (SELECT COUNT(*) FROM submission WHERE submission.is_verified = TRUE AND submission.date_achieved >= '2024-08-02') AS submissions_since_release,
  (SELECT COUNT(*) FROM player) AS total_players";
$result = pg_query($DB, $query);
if (!$result) {
  die_json(500, "Failed to query database");
}

$row = pg_fetch_assoc($result);
$response["suggestions"]["accepted"] = intval($row["count_accepted"]);
$response["suggestions"]["rejected"] = intval($row["count_rejected"]);
$response["submissions"]["since_release"] = intval($row["submissions_since_release"]);
$response["players"]["total"] = intval($row["total_players"]);

$query = "SELECT
  diff.id,
  (SELECT 
  COUNT(*) 
FROM (SELECT DISTINCT player.id
	FROM submission
	JOIN challenge ON challenge.id = submission.challenge_id
	JOIN player ON player.id = submission.player_id
  LEFT JOIN map ON map.id = challenge.map_id
	WHERE challenge.difficulty_id = diff.id AND submission.is_verified = TRUE AND (map.is_rejected IS NULL OR map.is_rejected = FALSE)) AS temp) AS player_count
FROM difficulty diff";
$result = pg_query($DB, $query);
if (!$result) {
  die_json(500, "Failed to query database");
}

while ($row = pg_fetch_assoc($result)) {
  $response["difficulties"]["distinct_players"][$row["id"]] = intval($row["player_count"]);
}

api_write($response);