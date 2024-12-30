<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$query = "SELECT * FROM view_submissions";

$where = "WHERE submission_is_verified = true AND map_id IS NOT NULL AND (player_account_is_suspended IS NULL OR player_account_is_suspended = false)";
if (isset($_GET['campaign'])) {
  $where .= " AND campaign_id = " . intval($_GET['campaign']);
} else if (isset($_GET['map'])) {
  $where .= " AND map_id = " . intval($_GET['map']);
} else if (isset($_GET['challenge'])) {
  $where .= " AND challenge_id = " . intval($_GET['challenge']);
} else if (isset($_GET['player'])) {
  $where .= " AND player_id = " . intval($_GET['player']);
} else if (isset($_GET['verifier'])) {
  $where .= " AND verifier_id = " . intval($_GET['verifier']);
}

if (isset($_GET['hard'])) {
  $where .= " AND difficulty_sort >= $TIERED_SORT_START";
} else if (isset($_GET['standard'])) {
  $where .= " AND difficulty_sort >= $STANDARD_SORT_START AND difficulty_sort <= $STANDARD_SORT_END"; //Standard, Low Standard, High Standard
} else if (isset($_GET['undetermined'])) {
  $where .= " AND challenge_difficulty_id = $UNDETERMINED_ID";
}

if (!isset($_GET['archived']) || $_GET['archived'] === "false") {
  $where .= " AND map_is_archived = false";
}
if (!isset($_GET['arbitrary']) || $_GET['arbitrary'] === "false") {
  $where .= " AND objective_is_arbitrary = false AND (challenge_is_arbitrary = false OR challenge_is_arbitrary IS NULL)";
}

$query = $query . " " . $where;

$result = pg_query($DB, $query);
if (!$result) {
  die_json(500, "Failed to query database");
}

$campaigns = parse_campaigns($result);
api_write($campaigns);