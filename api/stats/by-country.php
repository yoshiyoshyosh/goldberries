<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Invalid request method');
}

//Overall submission count
$query = "SELECT 
  COUNT(submission.id) AS submission_count,
  account.country AS country
FROM submission
JOIN player ON submission.player_id = player.id
LEFT JOIN account ON player.id = account.player_id
WHERE submission.is_verified = TRUE
GROUP BY account.country
ORDER BY submission_count DESC";
$result = pg_query($DB, $query);
if (!$result) {
  die_json(500, "Failed to query database");
}

$data = array(
  "submission_count" => array(),
  "difficulty_count" => array()
);

while ($row = pg_fetch_assoc($result)) {
  $country = $row['country'] ?? "unknown";
  $submission_count = intval($row['submission_count']);

  $data["submission_count"][] = ["country" => $country, "submission_count" => $submission_count];
}


//Diffculty count
$query = "SELECT 
  account.country AS country,
  difficulty.id AS difficulty_id,
  COUNT(submission.id) AS submission_count
FROM submission
JOIN challenge ON submission.challenge_id = challenge.id
JOIN difficulty ON challenge.difficulty_id = difficulty.id
JOIN player ON submission.player_id = player.id
LEFT JOIN account ON player.id = account.player_id
WHERE submission.is_verified = TRUE
GROUP BY account.country, difficulty.id
ORDER BY account.country ASC, difficulty.sort DESC, submission_count DESC";
$result = pg_query($DB, $query);

if (!$result) {
  die_json(500, "Failed to query database");
}

while ($row = pg_fetch_assoc($result)) {
  $country = $row['country'] ?? "unknown";
  $difficulty_id = intval($row['difficulty_id']);
  $submission_count = intval($row['submission_count']);

  if (!isset($data["difficulty_count"][$country])) {
    $data["difficulty_count"][$country] = [];
  }

  $data["difficulty_count"][$country][] = ["difficulty_id" => $difficulty_id, "submission_count" => $submission_count];
}

api_write($data);