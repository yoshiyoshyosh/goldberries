<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$all_submissions = isset($_GET['all_submissions']) && $_GET['all_submissions'] === "true";
$limit_challenges = isset($_GET['limit_challenges']) ? intval($_GET['limit_challenges']) : null;

//Advanced filters
$sub_count = isset($_GET['sub_count']) ? intval($_GET['sub_count']) : null;
$sub_count_is_min = isset($_GET['sub_count_is_min']) ? $_GET['sub_count_is_min'] === 'true' : true;
$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : null;
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : null;
//Clear states: 0 = all, 1 = Only C, 2 = Only FC, 3 = Only FC or C/FC (No C), 4 = Only C or C/FC (No FC)
$clear_state = isset($_GET['clear_state']) ? intval($_GET['clear_state']) : 0;



$query = "SELECT * FROM view_submissions";
$where = [];
$where[] = "submission_is_verified = true";
$where[] = "(map_is_rejected = FALSE OR map_is_rejected IS NULL)";

$is_player = isset($_GET['player']);
$is_campaign = isset($_GET['campaign']);
$show_standard = false;
if ($is_player) {
  $where[] = "player_id = " . intval($_GET['player']);
  $show_standard = true;
} else {
  $where[] = "(player_account_is_suspended IS NULL OR player_account_is_suspended = false)";
}
if ($is_campaign) {
  $where[] = "campaign_id = " . intval($_GET['campaign']);
  $show_standard = true;
}
if (!$show_standard) {
  $where[] = "challenge_difficulty_id != 20";
  $where[] = "challenge_difficulty_id != 18";
}


if (isset($_GET['map'])) {
  $where[] = "map_id = " . intval($_GET['map']);
}

if (!isset($_GET['archived']) || $_GET['archived'] === "false") {
  $where[] = "(map_is_archived = FALSE OR map_is_archived IS NULL)";
}
if (!isset($_GET['arbitrary']) || $_GET['arbitrary'] === "false") {
  $where[] = "objective_is_arbitrary = false";
  $where[] = "(challenge_is_arbitrary = false OR challenge_is_arbitrary IS NULL)";
}

//Filters
if (isset($_GET["hide_objectives"])) {
  //hide_objectives will be an array of objective.id's to not include in the search
  $hide_objectives = $_GET["hide_objectives"];
  $where[] = "objective_id NOT IN (" . implode(",", $hide_objectives) . ")";
}
if ($clear_state !== 0) {
  if ($clear_state === 1) {
    $where[] = "challenge_has_fc = false";
    $where[] = "challenge_requires_fc = false";
  } else if ($clear_state === 2) {
    $where[] = "challenge_requires_fc = true";
    $where[] = "challenge_has_fc = false";
  } else if ($clear_state === 3) {
    $where[] = "(challenge_requires_fc = true OR challenge_has_fc = true)";
  } else if ($clear_state === 4) {
    $where[] = "challenge_requires_fc = false";
  }
}
if ($start_date !== null) {
  //Validate date to be in ISO format: 2024-10-19T22:00:00.000Z
  if (!preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/', $start_date)) {
    die_json(400, "Invalid start_date format");
  }
  $where[] = "submission_date_created AT TIME ZONE 'UTC' >= '$start_date'";
}
if ($end_date !== null) {
  if (!preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/', $end_date)) {
    die_json(400, "Invalid end_date format");
  }
  $where[] = "submission_date_created AT TIME ZONE 'UTC' <= '$end_date'";
}


$where_string = implode(" AND ", $where);
$query = $query . " WHERE " . $where_string;
$query .= " ORDER BY difficulty_sort DESC, challenge_sort DESC, map_name ASC, submission_date_created ASC, submission_id ASC";

$result = pg_query($DB, $query);
if (!$result) {
  die_json(500, "Failed to query database. Query: $query");
}


$difficulty_filter = "difficulty.id != 13";
if (!$show_standard) {
  $difficulty_filter .= " AND difficulty.id != 20 AND difficulty.id != 18";
}

$queryDifficulties = "SELECT * FROM difficulty WHERE $difficulty_filter ORDER BY sort DESC";
$resultDifficulties = pg_query($DB, $queryDifficulties);
if (!$resultDifficulties) {
  die_json(500, "Failed to query database");
}

$response = array(
  "tiers" => array(),
  "challenges" => array(),
  "campaigns" => array(),
  "maps" => array(),
);

$difficulties = array();
//Loop through difficulties
while ($row = pg_fetch_assoc($resultDifficulties)) {
  $difficulty = new Difficulty();
  $difficulty->apply_db_data($row);

  $tierIndex = get_tier_index($difficulty);
  $subtierIndex = get_subtier_index($difficulty);

  if (!isset($response['tiers'][$tierIndex]))
    $response['tiers'][$tierIndex] = array();
  if (!isset($response['tiers'][$tierIndex][$subtierIndex]))
    $response['tiers'][$tierIndex][$subtierIndex] = array();

  $response['tiers'][$tierIndex][$subtierIndex] = $difficulty;
  $difficulties[$difficulty->id] = $difficulty;
}

//Flatten tiers object
$response['tiers'] = array_values($response['tiers']);

//loop through result rows
$challenge_index = 0;
while ($row = pg_fetch_assoc($result)) {
  $campaign_id = intval($row['campaign_id']);
  if (!array_key_exists($campaign_id, $response['campaigns'])) {
    $campaign = new Campaign();
    $campaign->apply_db_data($row, "campaign_");
    $response['campaigns'][$campaign_id] = $campaign;
  }

  if (isset($row['map_id'])) {
    $map_id = intval($row['map_id']);
    if (!array_key_exists($map_id, $response['maps'])) {
      $map = new Map();
      $map->apply_db_data($row, "map_");
      $response['maps'][$map_id] = $map;
    }
  }

  $challenge_id = intval($row['challenge_id']);
  if (!array_key_exists($challenge_id, $response['challenges'])) {
    $challenge_index++;
    if ($limit_challenges !== null && $challenge_index > $limit_challenges) {
      break;
    }
    $challenge = new Challenge();
    $challenge->apply_db_data($row, "challenge_");
    $challenge->submissions = array();
    $challenge->expand_foreign_keys($row, 1, false);
    $response['challenges'][$challenge_id] = $challenge;
  } else {
    $challenge = $response['challenges'][$challenge_id];
  }

  $submission = new Submission();
  $submission->apply_db_data($row, "submission_");
  $submission->expand_foreign_keys($row, 2, false);
  $challenge->submissions[$submission->id] = $submission;
}

//Flatten submissions
foreach ($response['challenges'] as $challenge_id => $challenge) {
  if ($sub_count !== null) {
    $count = count($challenge->submissions);
    if ($sub_count_is_min && $count < $sub_count) {
      unset($response['challenges'][$challenge_id]);
      continue;
    } else if (!$sub_count_is_min && $count > $sub_count) {
      unset($response['challenges'][$challenge_id]);
      continue;
    }
  }

  $response['challenges'][$challenge_id]->submissions = array_values($challenge->submissions);
  //Set challenge->data->submission_count to the number of submissions
  //Then, delete all submissions except the first one from the challenge
  $response['challenges'][$challenge_id]->data = array(
    "submission_count" => count($challenge->submissions),
  );

  if (!$is_player) {
    $response['challenges'][$challenge_id]->data["is_stable"] = is_challenge_stable($challenge);
  }

  if (!$all_submissions) {
    $response['challenges'][$challenge_id]->submissions = array($challenge->submissions[0]);
  }
}

//Flatten challenges
$response['challenges'] = array_values($response['challenges']);

api_write($response);

function is_challenge_stable($challenge)
{
  $min_suggestions = 5;
  $min_overlap = 0.8;

  if ($challenge->difficulty_id === 20 || $challenge->difficulty_id === 19) {
    return false;
  }

  $count_suggestions = 0;
  $count_for = 0;
  $count_against = 0;
  foreach ($challenge->submissions as $submission) {
    if ($submission->suggested_difficulty_id !== null && $submission->is_personal === false) {
      $count_suggestions++;
      if ($submission->suggested_difficulty_id === $challenge->difficulty_id) {
        $count_for++;
      } else {
        $count_against++;
      }
    }
  }

  if ($count_suggestions < $min_suggestions) {
    return false;
  }

  $overlap = $count_for / $count_suggestions;
  return $overlap >= $min_overlap;
}