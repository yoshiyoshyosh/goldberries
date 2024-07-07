<?php

require_once ('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $campaign_id = isset($_GET['id']) ? intval($_GET['id']) : null;
  if ($campaign_id === null) {
    die_json(400, "Missing required parameter 'id'");
  }
  $campaign = Campaign::get_request($DB, $campaign_id, 1, false);
  if ($campaign === null) {
    die_json(404, "Campaign not found");
  }

  $player_id = isset($_GET['player_id']) ? intval($_GET['player_id']) : null;
  if ($player_id !== null) {
    //Player info request. This endpoint will return all submissions for all maps in the campaign for the player
    $query = "SELECT * FROM view_submissions WHERE submission_is_verified = true AND campaign_id = $campaign_id AND player_id = $player_id AND map_is_archived = false AND objective_is_arbitrary = false AND (challenge_is_arbitrary = false OR challenge_is_arbitrary IS NULL)";
    $result = pg_query($DB, $query);
    if (!$result) {
      die_json(500, "Failed to query database");
    }

    $campaign_view = parse_campaign_player_view($result);
    api_write($campaign_view);

  } else {
    //Campaign info request. This endpoint will return all campaign info, but only superficial data on all players
    $query = "SELECT * FROM view_submissions WHERE submission_is_verified = true AND campaign_id = $campaign_id AND map_is_archived = false AND objective_is_arbitrary = false AND (challenge_is_arbitrary = false OR challenge_is_arbitrary IS NULL)";
    $result = pg_query($DB, $query);
    if (!$result) {
      die_json(500, "Failed to query database");
    }

    $campaign_view = parse_campaign_view($result);
    $campaign_view["campaign"]->fetch_maps($DB, true);
    $campaign_view["campaign"]->fetch_challenges($DB, false, true);
    api_write($campaign_view);
  }
}


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

function parse_campaign_view($result)
{
  $campaigns = array(); //dictionary id -> campaign
  $players = array();

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

    //Add submission to player
    $player_id = $submission->player_id;
    if (!array_key_exists($player_id, $players)) {
      $players[$player_id] = array(
        "player" => $submission->player,
        "stats" => array(
          "clears" => 0,
          "full_clears" => 0,
          "major_sort_clears" => array(),
        ),
        "map_data" => array(),
        "last_submission" => null,
      );
    }
    //Update last submission
    if ($players[$player_id]["last_submission"] === null || $submission->date_created > $players[$player_id]["last_submission"]) {
      $players[$player_id]["last_submission"] = $submission->date_created;
    }

    if (!array_key_exists($map_id, $players[$player_id]["map_data"])) {
      $players[$player_id]["map_data"][$map_id] = $submission->is_fc;
      $players[$player_id]["stats"]["clears"]++;
      if ($map->sort_major !== null) {
        if (!array_key_exists($map->sort_major, $players[$player_id]["stats"]["major_sort_clears"])) {
          $players[$player_id]["stats"]["major_sort_clears"][$map->sort_major] = array(
            "clears" => 0,
            "full_clears" => 0
          );
        }
        $players[$player_id]["stats"]["major_sort_clears"][$map->sort_major]["clears"]++;
      }
      if ($submission->is_fc) {
        $players[$player_id]["stats"]["full_clears"]++;
        if ($map->sort_major !== null) {
          if (!array_key_exists($map->sort_major, $players[$player_id]["stats"]["major_sort_clears"])) {
            $players[$player_id]["stats"]["major_sort_clears"][$map->sort_major] = array(
              "clears" => 0,
              "full_clears" => 0
            );
          }
          $players[$player_id]["stats"]["major_sort_clears"][$map->sort_major]["full_clears"]++;
        }
      }
    } else {
      //Only update stats if the player already has a regular clear submission on the map, and we are currently looking
      //at a full clear submission.
      if (!$players[$player_id]["map_data"][$map_id] && $submission->is_fc) {
        $players[$player_id]["map_data"][$map_id] = true;
        $players[$player_id]["stats"]["full_clears"]++;
        if ($map->sort_major !== null) {
          if (!array_key_exists($map->sort_major, $players[$player_id]["stats"]["major_sort_clears"])) {
            $players[$player_id]["stats"]["major_sort_clears"][$map->sort_major] = array(
              "clears" => 0,
              "full_clears" => 0
            );
          }
          $players[$player_id]["stats"]["major_sort_clears"][$map->sort_major]["full_clears"]++;
        }
      }
    }
  }

  foreach ($campaigns as $campaign) {
    foreach ($campaign->maps as $map) {
      // foreach ($map->challenges as $challenge) {
      //   $challenge->submissions = array_values($challenge->submissions);
      // }
      $map->challenges = array_values($map->challenges);
    }
    $campaign->maps = array_values($campaign->maps);
    $campaign->challenges = array_values($campaign->challenges);
  }
  $campaigns = array_values($campaigns);

  //Unset the map_data to save data
  foreach ($players as $player_id => $player_data) {
    unset($players[$player_id]["map_data"]);
  }

  //Find the maximum amount of clears for a major sort lobby
  $max_major_sorts = array();
  if ($campaign->sort_major_name !== null) {
    foreach ($campaign->maps as $map) {
      if ($map->sort_major !== null) {
        if (!array_key_exists($map->sort_major, $max_major_sorts)) {
          $max_major_sorts[$map->sort_major] = 0;
        }
        $max_major_sorts[$map->sort_major]++;
      }
    }
  }

  //Add the index of the highest swept lobby to each player
  foreach ($players as $player_id => $player_data) {
    $players[$player_id]["highest_lobby_sweep"] = -1;
    $players[$player_id]["highest_lobby_sweep_fcs"] = -1;

    if ($campaign->sort_major_name !== null) {
      //Loop backwards through the possible indices of major sorts
      for ($i = count($campaign->sort_major_labels) - 1; $i >= 0; $i--) {
        if (!array_key_exists($i, $player_data["stats"]["major_sort_clears"])) {
          continue;
        }
        $lobby_max = $max_major_sorts[$i];
        if ($player_data["stats"]["major_sort_clears"][$i]["clears"] === $lobby_max) {
          $players[$player_id]["highest_lobby_sweep"] = $i;
          $players[$player_id]["highest_lobby_sweep_fcs"] = $player_data["stats"]["major_sort_clears"][$i]["full_clears"];
          break;
        }
      }
    }
  }

  //Flatten players array
  $players = array_values($players);

  //old sort
  // //Sort by clears descending, 2nd sort by full clears descending
  // usort($players, function ($a, $b) {
  //   if ($a["stats"]["clears"] === $b["stats"]["clears"]) {
  //     return $b["stats"]["full_clears"] - $a["stats"]["full_clears"];
  //   }
  //   return $b["stats"]["clears"] - $a["stats"]["clears"];
  // });

  //new sort:
  // Sort criteria:
  // 1. Highest lobby sweep (max amount of clears for a lobby)
  // 2. Amount of full clears in highest swept lobby (still needs max amount of clears)
  // 3. Amount clears in total
  // 4. Amount of full clears in total
  // 5. Date of last submission. Older means higher up
  usort($players, function ($a, $b) use ($campaign) {
    if ($campaign->sort_major_name !== null) {
      //Check 1. and 2.
      if ($a["highest_lobby_sweep"] !== $b["highest_lobby_sweep"]) {
        return $b["highest_lobby_sweep"] - $a["highest_lobby_sweep"];
      }
      // if ($a["highest_lobby_sweep_fcs"] !== $b["highest_lobby_sweep_fcs"]) {
      //   return $b["highest_lobby_sweep_fcs"] - $a["highest_lobby_sweep_fcs"];
      // }
    }
    //Check the remaining points
    if ($a["stats"]["clears"] === $b["stats"]["clears"]) {
      if ($a["stats"]["full_clears"] === $b["stats"]["full_clears"]) {
        //If either of the last submissions is null, we want to put the player with the null submission at the bottom
        if ($a["last_submission"] === null) {
          return 1;
        }
        if ($b["last_submission"] === null) {
          return -1;
        }
        return $a["last_submission"]->diff($b["last_submission"]);
      }
      return $b["stats"]["full_clears"] - $a["stats"]["full_clears"];
    }
    return $b["stats"]["clears"] - $a["stats"]["clears"];
  });


  return array(
    "campaign" => $campaigns[0],
    "players" => $players
  );
}