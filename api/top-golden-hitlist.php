<?php

require_once('api_bootstrap.inc.php');

$query = "SELECT * FROM view_challenges WHERE difficulty_id != 18 AND difficulty_id != 19 AND count_submissions = 0";

$result = pg_query($DB, $query);
if (!$result) {
  die_json(500, "Failed to query database");
}


$queryDifficulties = "SELECT * FROM difficulty WHERE difficulty.id != 18 AND difficulty.id != 19 ORDER BY sort DESC";
$resultDifficulties = pg_query($DB, $queryDifficulties);
if (!$resultDifficulties) {
  die_json(500, "Failed to query database");
}

$response = array(
  "tiers" => array(),
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

  $response['tiers'][$tierIndex][$subtierIndex] = array(
    "difficulty" => $difficulty,
    "challenges" => array(),
  );
  $difficulties[$difficulty->id] = $difficulty;
}

//loop through result rows
while ($row = pg_fetch_assoc($result)) {
  $campaign_id = intval($row['campaign_id']);
  if (!array_key_exists($campaign_id, $response['campaigns'])) {
    $campaign = new Campaign();
    $campaign->apply_db_data($row, "campaign_");
    $response['campaigns'][$campaign_id] = $campaign;
  }

  $map_id = intval($row['map_id']);
  if (!array_key_exists($map_id, $response['maps'])) {
    $map = new Map();
    $map->apply_db_data($row, "map_");
    $response['maps'][$map_id] = $map;
  }

  $difficulty_id = intval($row['challenge_difficulty_id']);
  $difficulty = $difficulties[$difficulty_id];
  $tierIndex = get_tier_index($difficulty);
  $subtierIndex = get_subtier_index($difficulty);

  $challenge_id = intval($row['challenge_id']);
  $challenge = find_challenge_in_array($response['tiers'][$tierIndex][$subtierIndex]['challenges'], $challenge_id);
  if ($challenge === null) {
    $challenge = new Challenge();
    $challenge->apply_db_data($row, "challenge_");
    $challenge->submissions = array();
    $challenge->expand_foreign_keys($row, 1, false);
    $response['tiers'][$tierIndex][$subtierIndex]['challenges'][] = $challenge;
  }
}

api_write($response);