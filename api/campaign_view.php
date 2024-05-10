<?php

require_once ('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $include_archived = isset($_GET['archived']) && $_GET['archived'] === "true";
  //Campaign view doesnt show arbitrary challenges either way
  //$include_arbitrary = isset($_GET['arbitrary']) && $_GET['arbitrary'] === "true";

  $id = $_REQUEST['id'];
  $campaign = Campaign::get_request($DB, $id);
  $campaign->fetch_maps($DB, true, true, $include_archived, false);

  $players = array();
  $submissions = array();
  //Loop through campaign->maps->challenges->submissions
  //Populate $players with unique players
  //Populate $submissions with an associative array of player_id => submissions
  //where all submissions are an associative array of map_id => submission

  foreach ($campaign->maps as $map) {
    if ($map->is_archived && !$include_archived) {
      continue;
    }
    foreach ($map->challenges as $challenge) {
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

      //Lastly, unset the $challenge->submissions property to save data
      $challenge->submissions = null;
    }
  }


  $response = array(
    "campaign" => $campaign,
    "players" => $players,
    "submissions" => $submissions
  );
  api_write($response);
}