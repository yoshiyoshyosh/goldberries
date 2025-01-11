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


$campaign_ids = [
  1216,
];

$silver_objective_id = 2;

foreach ($campaign_ids as $campaign_id) {
  $campaign = Campaign::get_by_id($DB, $campaign_id);

  if ($campaign === null) {
    echo "Campaign ({$campaign_id}) not found\n";
    continue;
  }
  echo "Processing campaign ({$campaign->id}): {$campaign->get_name()}\n";

  $campaign->fetch_maps($DB, true);

  foreach ($campaign->maps as $map) {
    echo "Processing map ({$map->id}): {$map->name}\n";
    foreach ($map->challenges as $challenge) {
      $challenge->objective_id = $silver_objective_id;
      if ($challenge->update($DB)) {
        echo "Changed challenge ({$challenge->id}) to Silver objective ID ({$silver_objective_id})\n";
      } else {
        echo "Failed to fix challenge ({$challenge->id})\n";
      }
    }
  }
}

echo "\nDone\n";