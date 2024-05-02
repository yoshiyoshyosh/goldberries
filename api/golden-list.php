<?php

require_once ('api_bootstrap.inc.php');

$query = "SELECT * FROM view_submissions";

$where = "WHERE submission_is_verified = true";
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
  $where .= " AND challenge_difficulty_id < 18"; //18 is Standard, id < 18 is everything tiered
} else if (isset($_GET['standard'])) {
  $where .= " AND challenge_difficulty_id = 18";
} else if (isset($_GET['undetermined'])) {
  $where .= " AND challenge_difficulty_id = 19";
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

$campaigns = array(); //dictionary id -> campaign

//loop through result rows
while ($row = pg_fetch_assoc($result)) {
  $campaign_id = intval($row['campaign_id']);
  if (!array_key_exists($campaign_id, $campaigns)) {
    $campaign = new Campaign();
    $campaign->apply_db_data($row, "campaign_");
    $campaign->maps = array();
    $campaign->challenges = array();
    $campaigns[$campaign_id] = $campaign;
  }
  $campaign = $campaigns[$campaign_id];

  $map = null;
  if (isset($row['map_id'])) {
    $map_id = intval($row['map_id']);
    if (!array_key_exists($map_id, $campaign->maps)) {
      $map = new Map();
      $map->apply_db_data($row, "map_");
      $map->challenges = array();
      $campaign->maps[$map_id] = $map;
    }
    $map = $campaign->maps[$map_id];
  }

  $challenge_id = intval($row['challenge_id']);
  $challenge = null;
  if (($map === null || !array_key_exists($challenge_id, $map->challenges)) && !array_key_exists($challenge_id, $campaign->challenges)) {
    $challenge = new Challenge();
    $challenge->apply_db_data($row, "challenge_");
    $challenge->submissions = array();
    $challenge->expand_foreign_keys($row, 1, false);
    if ($challenge->map_id === null) {
      $campaign->challenges[$challenge_id] = $challenge;
    } else {
      $map->challenges[$challenge_id] = $challenge;
    }
  } else {
    if ($map !== null) {
      $challenge = $map->challenges[$challenge_id];
    } else {
      $challenge = $campaign->challenges[$challenge_id];
    }
  }

  $submission = new Submission();
  $submission->apply_db_data($row, "submission_");
  $submission->expand_foreign_keys($row, 2, false);
  $challenge->submissions[$submission->id] = $submission;
}

foreach ($campaigns as $campaign) {
  foreach ($campaign->maps as $map) {
    foreach ($map->challenges as $challenge) {
      $challenge->submissions = array_values($challenge->submissions);
    }
    $map->challenges = array_values($map->challenges);
  }
  $campaign->maps = array_values($campaign->maps);
  $campaign->challenges = array_values($campaign->challenges);
}
$campaigns = array_values($campaigns);

api_write($campaigns);