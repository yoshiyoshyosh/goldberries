<?php

function submission_embed_get_name($submission)
{
  //image name needs to have format:
  //{campaign_id}-{map_id}-{challenge_id}-{submission_id}-{player_id}
  //If one of the objects doesnt exist in the hierarchy, it will be replaced with 0
  $challenge = $submission->challenge;
  $map = $challenge->map;
  $campaign = $challenge->get_campaign();
  $player = $submission->player;
  return $campaign->id . "-" . ($map !== null ? $map->id : 0) . "-" . $challenge->id . "-" . $submission->id . "-" . $player->id;
}
function submission_embed_change($object_id, $object_type)
{
  //When one object in the hierarchy gets changed, all cached embeds referencing this object need to be deleted
  //To do this, build a regex pattern that matches all embeds that reference this object

  //The pattern will be:
  //campaign_id-map_id-challenge_id-submission_id-player_id.jpg

  //$object_type will be either of ("campaign", "map", "challenge", "submission", "player")
  //Based on the object type, fill in the object_id into the pattern

  $object_indices = ["campaign" => 0, "map" => 1, "challenge" => 2, "submission" => 3, "player" => 4];
  $index = $object_indices[$object_type];

  $pattern = "";
  for ($i = 0; $i < 5; $i++) {
    if ($i == $index) {
      $pattern .= $object_id;
    } else {
      $pattern .= "[0-9]+";
    }
    if ($i < 4) {
      $pattern .= "-";
    }
  }

  $pattern .= "\.jpg";
  // error_log("Pattern: $pattern");

  //List all files in the submission folder
  $base_path = "../embed/img/submission";
  // $files = glob("submission/*");
  $files = array_diff(scandir($base_path), array('.', '..'));
  // error_log("Files: " . print_r($files, true));
  foreach ($files as $file) {
    // error_log("Checking file: $file");
    //If the file matches the pattern, delete it
    if (preg_match("/$pattern/", $file)) {
      unlink($base_path . "/" . $file);
    }
  }

  //Log what has happened
  log_debug("Deleted all embeds referencing '$object_type' with id $object_id", "Embed");
}

