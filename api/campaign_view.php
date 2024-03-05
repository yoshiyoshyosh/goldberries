<?php

require_once('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $id = $_REQUEST['id'];
  $campaign = Campaign::get_request($DB, $id);
  $campaign->fetch_maps($DB, true, true);

  $players = array();
  $submissions = array();
  //Loop through campaign->maps->challenges->submissions
  //Populate $players with unique players
  //Populate $submissions with an associative array of player_id => submissions
  //where all submissions are an associative array of map_id => submission

  foreach ($campaign->maps as $map) {
    foreach ($map->challenges as $challenge) {
      if ($challenge->is_challenge_arbitrary()) {
        continue;
      }
      foreach ($challenge->submissions as $submission) {
        $player_id = $submission->player_id;
        if (!array_key_exists($player_id, $players)) {
          $players[$player_id] = $submission->player;
        }
        if (!array_key_exists($player_id, $submissions)) {
          $submissions[$player_id] = array();
        }
        //unset the $submission->player property to save data
        $submission->player = null;
        $submissions[$player_id][$map->id] = $submission;
      }
    }
  }


  $response = array(
    "campaign" => $campaign,
    "players" => $players,
    "submissions" => $submissions
  );
  api_write($response);
}