<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Invalid request method');
}

$query = "SELECT
    DATE_TRUNC('month', submission.date_achieved, 'UTC') AT TIME ZONE 'UTC' AS date_month,
    difficulty.id,
    difficulty.name,
    COUNT(*) AS count
  FROM submission
  JOIN challenge ON submission.challenge_id = challenge.id
  LEFT JOIN map ON challenge.map_id = map.id
  JOIN difficulty ON challenge.difficulty_id = difficulty.id
  WHERE submission.is_verified = TRUE AND (map.is_rejected = FALSE OR map.is_rejected IS NULL) AND submission.date_achieved IS NOT NULL
  GROUP BY DATE_TRUNC('month', submission.date_achieved, 'UTC') AT TIME ZONE 'UTC', difficulty.id
  ORDER BY date_month ASC, difficulty.sort DESC";
$result = pg_query($DB, $query);
if (!$result) {
  die_json(500, "Failed to query database");
}

$data = array();
while ($row = pg_fetch_assoc($result)) {
  $date = $row['date_month'];
  $difficulty = intval($row['id']);
  $count = intval($row['count']);

  if (!isset($data[$date])) {
    $data[$date] = array(
      "date" => $date
    );
  }
  $data[$date][$difficulty] = $count;
}

//Flatten data
$data = array_values($data);

api_write($data);