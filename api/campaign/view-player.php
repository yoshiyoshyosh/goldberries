<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

//Player info request. This endpoint will return all submissions for all maps in the campaign for the player

$campaign_id = isset($_GET['id']) ? intval($_GET['id']) : null;
if ($campaign_id === null) {
  die_json(400, "Missing required parameter 'id'");
}
$campaign = Campaign::get_request($DB, $campaign_id, 1, false);
if ($campaign === null) {
  die_json(404, "Campaign not found");
}

$player_id = isset($_GET['player_id']) ? intval($_GET['player_id']) : null;
if ($player_id === null) {
  die_json(400, "Missing required parameter 'player_id'");
}

$query = "SELECT 
  * 
FROM view_submissions
WHERE submission_is_verified = true
  AND campaign_id = $campaign_id
  AND player_id = $player_id
  AND map_is_archived = false
  AND objective_is_arbitrary = false
  AND submission_is_obsolete = false
  AND (challenge_is_arbitrary = false OR challenge_is_arbitrary IS NULL)";
$result = pg_query($DB, $query);
if (!$result) {
  die_json(500, "Failed to query database");
}

$campaign_view = parse_campaign_player_view($result);
api_write($campaign_view);

function parse_campaign_player_view($result)
{
  $maps = array(); //Fill this array with all challenges and submissions this player has made

  //loop through result rows
  while ($row = pg_fetch_assoc($result)) {
    $map_id = intval($row['map_id']);
    if (!array_key_exists($map_id, $maps)) {
      $map = new Map();
      $map->apply_db_data($row, "map_");
      $map->challenges = array();
      $maps[$map_id] = $map;
    }
    $map = $maps[$map_id];

    $challenge_id = intval($row['challenge_id']);
    $challenge = null;
    if (!array_key_exists($challenge_id, $map->challenges)) {
      $challenge = new Challenge();
      $challenge->apply_db_data($row, "challenge_");
      $challenge->submissions = array();
      $challenge->expand_foreign_keys($row, 1, false);
      $map->challenges[$challenge_id] = $challenge;
    } else {
      $challenge = $map->challenges[$challenge_id];
    }

    $submission = new Submission();
    $submission->apply_db_data($row, "submission_");
    $submission->expand_foreign_keys($row, 2, false);
    $submission->player = null;
    $challenge->submissions[] = $submission;
  }

  foreach ($maps as $map) {
    $map->challenges = array_values($map->challenges);
  }

  return $maps;
}