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


$gold_to_silver = [
  11,
  918,
  1175,
  1241,
  1257,
  1258,
  1259,
  1354,
  1355,
  1356,
  1357,
  1358,
  1359,
  1360,
  1616,
  1767,
  1855
];
$silver_to_gold = [
  947,
  1496,
  1646,
  1647,
  1648
];

$combined = [];
foreach ($gold_to_silver as $map_id) {
  $combined[] = array(
    "id" => $map_id,
    "objective_id" => 2
  );
}
foreach ($silver_to_gold as $map_id) {
  $combined[] = array(
    "id" => $map_id,
    "objective_id" => 1
  );
}

//Loop over all campaigns, get all maps -> challenges in the campaign
//Change all challenges' objective_id to 2
//Save the challenges
foreach ($combined as $map_info) {
  $map_id = $map_info["id"];
  $objective_id = $map_info['objective_id'];
  $map = Map::get_by_id($DB, $map_id);
  if ($map === false) {
    echo "Map $map_id not found\n";
    continue;
  }

  echo "Processing map ({$map->id}): {$map->name}\n";
  $map->fetch_challenges($DB, false, true);

  foreach ($map->challenges as $challenge) {
    $challenge->objective_id = $objective_id;
    if ($challenge->update($DB)) {
      echo "Changed challenge ({$challenge->id}) to objective ID ({$objective_id})\n";
    } else {
      echo "Failed to fix challenge ({$challenge->id})\n";
    }
  }
}

echo "\nDone\n";