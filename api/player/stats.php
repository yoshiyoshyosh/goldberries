<?php

require_once ('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

if (!isset($_REQUEST['id'])) {
  die_json(400, "Missing id parameter");
}

$id = intval($_REQUEST['id']);
if ($id == 0) {
  die_json(400, "Invalid player id");
}

$query = "SELECT difficulty_id, COUNT(difficulty_id) FROM view_submissions WHERE player_id = $id AND submission_is_verified = true GROUP BY difficulty_id";
$result = pg_query($DB, $query);
if (!$result) {
  die_json(500, "Could not query database");
}

$response = array(
  "count_by_difficulty" => array(),
  "count_total_hard_list" => 0,
  "count_total_standard_list" => 0,
);

while ($row = pg_fetch_assoc($result)) {
  $diff_id = intval($row["difficulty_id"]);
  $count = intval($row["count"]);

  $response["count_by_difficulty"][$diff_id] = $count;

  if ($diff_id == 18) {
    $response["count_total_standard_list"] += $count;
  } else if ($diff_id < 18) {
    $response["count_total_hard_list"] += $count;
  }
}

api_write($response);