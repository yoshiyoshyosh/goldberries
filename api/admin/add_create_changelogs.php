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

$KNOWN_VERIFIER_IDS = [
  "Ella" => 664,
  "eggybu" => 20,
  "eggfie" => 20,
  "Limballs" => 20,
  "Limballs [Max% Deathless]" => 20,
  "Limballs [All Sides Deathless]" => 20,
];

$process = 99999;
$total = 0;
echo "Processing changelog creation entries\n";

echo "\n\n========== CAMPAIGNS ==========\n";
$query = "SELECT * FROM logging WHERE message ILIKE '%created (,%'";
$result = pg_query_params_or_die($DB, $query);
while ($row = pg_fetch_assoc($result)) {
  if ($total >= $process) {
    break;
  }
  $total++;

  $message = $row['message'];
  $date = $row['date'];
  echo "\n$total: $message\n";
  //Message will look like this: 'viddie' created (Campaign, id:1739, name:'Test Campaign (by test)')
  //Tasks:
  //- 1: Extract the verifier name and the campaign id
  //- 2: Check if the campaign exists
  //- 3: Check if a changelog creation entry already exists for this campaign
  //- 4: Fetch the ID of the verifier
  //- 5: Create a changelog entry for this campaign, with the verifier ID as author and the date of the log entry as the date

  //Step 1: Extract the verifier name and the campaign id
  $matches = [];
  preg_match("/'(.+)' created \(, id: (\d+)\)/", $message, $matches);
  $verifier_name = $matches[1];
  $campaign_id = $matches[2];


  //Step 2: Check if campaign exists
  $campaign = Campaign::get_by_id($DB, $campaign_id);
  if ($campaign === false) {
    echo "\tCampaign with ID $campaign_id does not exist\n";
    continue;
  }
  echo "\tCampaign: $campaign\n";

  //Step 3: Check if changelog entry exists
  $query = "SELECT id FROM change WHERE campaign_id = $1  AND description = 'Created campaign'";
  $temp_result = pg_query_params_or_die($DB, $query, [$campaign_id]);
  $row = pg_fetch_assoc($temp_result);
  if ($row !== false) {
    echo "\tChangelog entry already exists for campaign with ID $campaign_id\n";
    continue;
  }

  //Step 4: Fetch verifier ID
  $verifier_id = $KNOWN_VERIFIER_IDS[$verifier_name] ?? null;
  if ($verifier_id === null) {
    $query = "SELECT id FROM player WHERE name = $1";
    $temp_result = pg_query_params_or_die($DB, $query, [$verifier_name]);
    $row = pg_fetch_assoc($temp_result);
    if ($row === false) {
      echo "\tVerifier with name $verifier_name does not exist\n";
      break;
    } else {
      $verifier_id = $row['id'];
      $KNOWN_VERIFIER_IDS[$verifier_name] = $verifier_id;
    }
  }


  //Step 5: Create changelog entry
  $change = new Change();
  $change->author_id = $verifier_id;
  $change->campaign_id = $campaign_id;
  $change->description = 'Created campaign';
  $change->date = new JsonDateTime($date);
  if ($change->insert($DB)) {
    echo "\tCreated changelog entry for campaign with ID $campaign_id\n";
  } else {
    echo "\tFailed to create changelog entry for campaign with ID $campaign_id\n";
  }
}


echo "\n\n========== MAPS ==========\n";
$query = "SELECT * FROM logging WHERE message ILIKE '%created (Map%'";
$result = pg_query_params_or_die($DB, $query);
while ($row = pg_fetch_assoc($result)) {
  if ($total >= $process || true) {
    break;
  }
  $total++;

  $message = $row['message'];
  $date = $row['date'];
  echo "\n$total: $message\n";

  //Step 1: Extract the verifier name and the campaign id
  $matches = [];
  preg_match("/'(.+)' created \(Map, id:(\d+),/", $message, $matches);
  $verifier_name = $matches[1];
  $map_id = $matches[2];


  //Step 2: Check if map exists
  $map = Map::get_by_id($DB, $map_id);
  if ($map === false) {
    echo "\tMap with ID $map_id does not exist\n";
    continue;
  }
  echo "\tMap: $map\n";

  //Step 3: Check if changelog entry exists
  $query = "SELECT id FROM change WHERE map_id = $1  AND description = 'Created map'";
  $temp_result = pg_query_params_or_die($DB, $query, [$map_id]);
  $row = pg_fetch_assoc($temp_result);
  if ($row !== false) {
    echo "\tChangelog entry already exists for map with ID $map_id\n";
    continue;
  }

  //Step 4: Fetch verifier ID
  $verifier_id = $KNOWN_VERIFIER_IDS[$verifier_name] ?? null;
  if ($verifier_id === null) {
    $query = "SELECT id FROM player WHERE name = $1";
    $temp_result = pg_query_params_or_die($DB, $query, [$verifier_name]);
    $row = pg_fetch_assoc($temp_result);
    if ($row === false) {
      echo "\tVerifier with name $verifier_name does not exist\n";
      break;
    } else {
      $verifier_id = $row['id'];
      $KNOWN_VERIFIER_IDS[$verifier_name] = $verifier_id;
    }
  }

  //Step 5: Create changelog entry
  $change = new Change();
  $change->author_id = $verifier_id;
  $change->map_id = $map_id;
  $change->description = 'Created map';
  $change->date = new JsonDateTime($date);
  if ($change->insert($DB)) {
    echo "\tCreated changelog entry for map with ID $map_id\n";
  } else {
    echo "\tFailed to create changelog entry for map with ID $map_id\n";
  }
}


echo "\n\n========== CHALLENGES ==========\n";
$query = "SELECT * FROM logging WHERE message ILIKE '%created (Challenge%'";
$result = pg_query_params_or_die($DB, $query);
while ($row = pg_fetch_assoc($result)) {
  if ($total >= $process || true) {
    break;
  }
  $total++;

  $message = $row['message'];
  $date = $row['date'];
  echo "\n$total: $message\n";

  //Step 1: Extract the verifier name and the campaign id
  $matches = [];
  preg_match("/'(.+)' created \(Challenge, id:(\d+),/", $message, $matches);
  $verifier_name = $matches[1];
  $challenge_id = $matches[2];
  $is_via_split = strpos($message, "via challenge split") !== false;


  //Step 2: Check if challenge exists
  $challenge = Challenge::get_by_id($DB, $challenge_id);
  if ($challenge === false) {
    echo "\tChallenge with ID $challenge_id does not exist\n";
    continue;
  }
  echo "\tChallenge: $challenge\n";

  //Step 3: Check if changelog entry exists
  $query = "SELECT id FROM change WHERE challenge_id = $1  AND description ILIKE 'Created challenge%'";
  $temp_result = pg_query_params_or_die($DB, $query, [$challenge_id]);
  $row = pg_fetch_assoc($temp_result);
  if ($row !== false) {
    echo "\tChangelog entry already exists for challenge with ID $challenge_id\n";
    continue;
  }

  //Step 4: Fetch verifier ID
  $verifier_id = $KNOWN_VERIFIER_IDS[$verifier_name] ?? null;
  if ($verifier_id === null) {
    $query = "SELECT id FROM player WHERE name = $1";
    $temp_result = pg_query_params_or_die($DB, $query, [$verifier_name]);
    $row = pg_fetch_assoc($temp_result);
    if ($row === false) {
      echo "\tVerifier with name $verifier_name does not exist\n";
      break;
    } else {
      $verifier_id = $row['id'];
      $KNOWN_VERIFIER_IDS[$verifier_name] = $verifier_id;
    }
  }

  //Step 5: Create changelog entry
  $change = new Change();
  $change->author_id = $verifier_id;
  $change->challenge_id = $challenge_id;
  $change->description = $is_via_split ? "Created challenge via split" : "Created challenge";
  $change->date = new JsonDateTime($date);
  if ($change->insert($DB)) {
    echo "\tCreated changelog entry for challenge with ID $challenge_id\n";
  } else {
    echo "\tFailed to create changelog entry for challenge with ID $challenge_id\n";
  }
}

echo "\n\nDone processing '$total' entries\n";