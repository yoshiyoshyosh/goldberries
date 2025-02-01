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

$TIER_NAMES = [
  1 => "High Tier 0",
  2 => "Mid Tier 0",
  3 => "Low Tier 0",
  23 => "Tier 0.5",
  4 => "High Tier 1",
  5 => "Mid Tier 1",
  6 => "Low Tier 1",
  7 => "High Tier 2",
  8 => "Mid Tier 2",
  9 => "Low Tier 2",
  10 => "High Tier 3",
  11 => "Mid Tier 3",
  12 => "Low Tier 3",
  14 => "Tier 4",
  15 => "Tier 5",
  16 => "Tier 6",
  17 => "Tier 7",
  24 => "Tier 7.5",
  22 => "High Standard",
  18 => "Mid Standard",
  21 => "Low Standard",
  20 => "Trivial",
  19 => "Undetermined"
];

//Content type: text
header('Content-Type: text/plain');
echo "Undoing tier 7.5 split\n\n";

//First, check if tier 7.5 still exists
$query = "SELECT id FROM difficulty WHERE name = 'Tier 7.5'";
$result = pg_query_params_or_die($DB, $query);
if (pg_num_rows($result) == 0) {
  echo "Tier 7.5 does not exist\n";
  die();
}
echo "Tier 7.5 exists\n\n";
$tier = pg_fetch_assoc($result);


//Then, get all of the challenges in tier 7.5
echo "Fetching challenges...\n";
$query = "SELECT * FROM challenge WHERE difficulty_id = $1";
$result = pg_query_params_or_die($DB, $query, [$tier['id']]);
$challenges = [];
while ($row = pg_fetch_assoc($result)) {
  $challenge = new Challenge();
  $challenge->apply_db_data($row);
  // $challenge->fetch_all_submissions($DB);
  $challenges[] = $challenge;
}
echo "Fetched '" . count($challenges) . "' challenges from tier 7.5\n\n";

//Move all challenges that are currently in tier 7.5 back to where they were before
//To do this, loop through the challenges, fetch the most recent changelog for the challenge that starts with 'Moved from' and parse which tier it originated from
//Then, update the challenge's difficulty_id to the original tier
$i = 0;
echo "Moving challenges back to their original tier...\n\n";
foreach ($challenges as $challenge) {
  // if ($i === 1)
  //   break;
  $i++;
  echo "$i: Checking out challenge " . $challenge->id . "\n";
  $query = "SELECT * FROM change
    WHERE challenge_id = $1 AND description ILIKE 'Moved from%'
    ORDER BY \"date\" DESC
    LIMIT 1";
  $result = pg_query_params_or_die($DB, $query, [$challenge->id]);

  //Check num of rows. if its 1, then a change was found. if its 0, then the challenges was placed directly in t7.5
  if (pg_num_rows($result) == 0) {
    echo "\tNo change found for challenge with id " . $challenge->id . "\n";
    echo "\tMoving challenge to 'Undetermined'...\n";
    $challenge->difficulty_id = 19;
    if (!$challenge->update($DB)) {
      echo "\tFailed to update challenge with id " . $challenge->id . "\n";
      die();
    }
    echo "\tMoved challenge to 'Undetermined'\n\n";
    continue;
  }

  $row = pg_fetch_assoc($result);
  $change = new Change();
  $change->apply_db_data($row);

  //The change->description will have the format: Moved from 'High Standard' to 'Tier 7.5'
  //Parse the original tier from between the first set of single quotes
  $original_tier = substr($change->description, strpos($change->description, "'") + 1);
  $original_tier = substr($original_tier, 0, strpos($original_tier, "'"));

  //Lookup the id of the original tier from the TIER_NAMES array
  $original_tier_id = array_search($original_tier, $TIER_NAMES);

  //Move the challenge back to the original tier
  $challenge->difficulty_id = $original_tier_id;
  if (!$challenge->update($DB)) {
    echo "\tFailed to update challenge with id " . $challenge->id . "\n";
    die();
  }
  echo "\tMoved challenge back to tier '" . $original_tier . "'\n";

  //Delete the changelog entry
  if (!$change->delete($DB)) {
    echo "\tFailed to delete changelog entry with id " . $change->id . "\n";
  }
  echo "\tDeleted changelog entry\n\n";
}

echo "Done moving '$i' challenges back to their original tier\n\n";


//Step 2: Restore the backed up difficulty suggestions
$backup_file = file_get_contents('../../assets/data/tier_7_split_backup.json');
$backup_data = json_decode($backup_file, true);

//Data format:
//[{"submission_id":32,"suggested_difficulty_id":17,"is_personal":"f"},...]

echo "Restoring backup data...\n";
$i = 0;
foreach ($backup_data as $key => $value) {
  $i++;
  $id = $value['submission_id'];
  $suggested_difficulty_id = $value['suggested_difficulty_id'];
  $is_personal = $value['is_personal'];

  $query = "UPDATE submission SET suggested_difficulty_id = $1, is_personal = $2 WHERE id = $3";
  $result = pg_query_params_or_die($DB, $query, [$suggested_difficulty_id, $is_personal, $id]);

  if ($result) {
    echo "\t$i: Updated submission with id $id\n";
  } else {
    echo "\t$i: Failed to update submission with id $id\n";
  }
}

echo "Done restoring backup data ($i records)\n\n";

//Step 3: Unset all difficulty suggestions that reference tier 7.5, and if they are set to personal, remove that flag
echo "Unsetting difficulty suggestions that reference tier 7.5...\n";
$query = "UPDATE submission SET suggested_difficulty_id = NULL, is_personal = 'f' WHERE suggested_difficulty_id = $1";
$result = pg_query_params_or_die($DB, $query, [$tier['id']]);
echo "Done unsetting difficulty suggestions\n\n";

//Step 3.5: Check if there are any challenges still placed in t7.5
$query = "SELECT * FROM challenge WHERE difficulty_id = $1";
$result = pg_query_params_or_die($DB, $query, [$tier['id']]);
if (pg_num_rows($result) > 0) {
  echo "There are still challenges placed in tier 7.5\n";
  die();
}

//Step 4: Delete tier 7.5
echo "Deleting tier 7.5...\n";
$query = "DELETE FROM difficulty WHERE id = $1";
$result = pg_query_params_or_die($DB, $query, [$tier['id']]);
echo "Done deleting tier 7.5\n\n";