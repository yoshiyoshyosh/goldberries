<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$account = get_user_data();
check_access($account, false);
if (!is_admin($account)) {
  die_json(403, "Not authorized");
}

//Set content type to plain text
header('Content-Type: text/plain');


$campaign_id = 730;
$silver_objective_id = 2;
$collectibles = [
  ["1", "", "", ""],
  ["13", "4", "", "Required for FC, unlocked via a global flag"],
  ["2", "", "", ""],
];

$campaign = Campaign::get_by_id($DB, $campaign_id);

if ($campaign === null) {
  echo "Campaign ({$campaign_id}) not found\n";
  die();
}

echo "Processing campaign ({$campaign->id}): {$campaign->get_name()}\n";

$campaign->fetch_maps($DB, true);

foreach ($campaign->maps as $map) {
  echo "\nProcessing map ({$map->id}): {$map->name}\n";
  if ($map->sort_major !== 4) {
    echo "  Skipping map ({$map->id}) because it is not a great maze map\n";
    continue;
  }

  //Add collectibles to the map
  $map->collectibles = new StringList(4);
  $map->collectibles->arr = $collectibles;
  if ($map->update($DB)) {
    echo "  Added collectibles to map ({$map->id})\n";
  } else {
    echo "  Failed to add collectibles to map ({$map->id})\n";
    continue;
  }

  $has_true_fc_challenge = false;
  foreach ($map->challenges as $challenge) {
    // if ($challenge->objective_id == 4 && $challenge->label === "True Full Clear") {
    //   $has_true_fc_challenge = true;
    //   break;
    // }

    if ($challenge->objective_id === 1) {
      $challenge->objective_id = $silver_objective_id;
      if ($challenge->update($DB)) {
        echo "  Changed challenge ({$challenge->id}) to Silver objective ID ({$silver_objective_id})\n";
      } else {
        echo "  Failed to fix challenge ({$challenge->id})\n";
        continue;
      }
    }
  }

  // if (!$has_true_fc_challenge) {
  //   $challenge = new Challenge();
  //   $challenge->map_id = $map->id;
  //   $challenge->objective_id = 4;
  //   $challenge->label = "True Full Clear";
  //   $challenge->icon_url = "/icons/sca-greenberry.png";
  //   if ($challenge->insert($DB)) {
  //     echo "  Added True Full Clear challenge to map ({$map->id})\n";
  //   } else {
  //     echo "  Failed to add True Full Clear challenge to map ({$map->id})\n";
  //   }
  // }
}

echo "\nDone\n";