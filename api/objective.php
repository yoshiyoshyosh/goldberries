<?php

require_once ('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $submission_count = isset($_REQUEST['submission_count']) && $_REQUEST['submission_count'] === 'true';
  if ($submission_count) {
    $whereAddition = '';

    $type = isset($_REQUEST['type']) ? $_REQUEST['type'] : null;
    $id = isset($_REQUEST['id']) ? intval($_REQUEST['id']) : 0;

    if ($type !== null) {
      if ($id < 1 || $id === null) {
        die_json(400, "Invalid ID");
      }
      if ($type === "campaign") {
        $whereAddition = "AND (campaign.id = $id OR map.campaign_id = $id)";
      } else if ($type === "player") {
        $whereAddition = "AND submission.player_id = $id";
      }
    }

    $query = "SELECT 
        objective.id AS objective_id,
        COUNT(*) AS submission_count
      FROM submission
      JOIN challenge ON submission.challenge_id = challenge.id
      JOIN difficulty ON challenge.difficulty_id = difficulty.id
      JOIN objective ON challenge.objective_id = objective.id
      LEFT JOIN map ON challenge.map_id = map.id
      LEFT JOIN campaign ON challenge.campaign_id = campaign.id
      WHERE submission.is_verified = true AND difficulty.sort > 2 $whereAddition
      GROUP BY objective.id";
    $result = pg_query($DB, $query);

    $response = array();
    while ($row = pg_fetch_assoc($result)) {
      $response[$row['objective_id']] = $row['submission_count'];
    }

    api_write($response);
    exit();
  }



  $id = $_REQUEST['id'];
  $objectives = Objective::get_request($DB, $id);
  api_write($objectives);
}
