<?php

require_once ('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$account = get_user_data();
check_access($account, false);
if (!$account->is_admin) {
  die_json(403, "Not authorized");
}

//Set content type to plain text
header('Content-Type: text/plain');


$campaign_ids = [21, 22, 41, 46, 50, 78, 92, 116, 977, 168, 243, 273, 276, 310, 320, 332, 329, 358, 387, 408, 445, 446, 447, 448, 449, 533, 564, 590, 598, 599, 758, 730, 810, 1199, 825, 821, 1200, 1142, 1201, 858, 872, 948, 968, 995, 252, 755, 834];

//Loop over all campaigns, get all maps -> challenges in the campaign
//Change all challenges' objective_id to 2
//Save the challenges
for ($i = 0; $i < count($campaign_ids); $i++) {
  $campaign_id = $campaign_ids[$i];
  $campaign = Campaign::get_by_id($DB, $campaign_id);
  if ($campaign === false) {
    echo "Campaign $campaign_id not found\n";
    continue;
  }

  echo "Processing campaign (#{$campaign->id}): {$campaign->name}\n";
  $campaign->fetch_maps($DB, true);

  foreach ($campaign->maps as $map) {
    $map->fetch_challenges($DB, false, true);

    foreach ($map->challenges as $challenge) {
      $challenge->objective_id = 2;
      if ($challenge->update($DB)) {
        echo "Fixed challenge (#{$challenge->id})\n";
      } else {
        echo "Failed to fix challenge (#{$challenge->id})\n";
      }
    }
  }
}

echo "Done\n";