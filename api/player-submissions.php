<?php

require_once ('api_bootstrap.inc.php');

$query = "SELECT * FROM view_submissions WHERE submission_is_verified = true";

$id = isset($_GET['player_id']) ? intval($_GET['player_id']) : null;
if ($id === null) {
  die_json(400, "Missing player_id");
}

$show_archived = isset($_GET['archived']) ? $_GET['archived'] === "true" : false;
$show_arbitrary = isset($_GET['arbitrary']) ? $_GET['arbitrary'] === "true" : false;

$query .= " AND player_id = $1";

if (!$show_archived) {
  $query .= " AND map_is_archived = false";
}
if (!$show_arbitrary) {
  $query .= " AND objective_is_arbitrary = false AND (challenge_is_arbitrary = false OR challenge_is_arbitrary IS NULL)";
}


$result = pg_query_params($DB, $query, array($id));
if (!$result) {
  die_json(500, "Failed to query database");
}

$submissions = array();

while ($row = pg_fetch_assoc($result)) {
  $submission = new Submission();
  $submission->apply_db_data($row, 'submission_');
  $submission->expand_foreign_keys($row, 5);
  $submissions[] = $submission;
}

api_write($submissions);