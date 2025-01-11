<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$account = get_user_data();
check_access($account, false);
if (!is_admin($account)) {
  die_json(403, 'Not authorized');
}

//Set content type to plain text
header('Content-Type: text/plain');

//Go through all suggestions that have a challenge_id set but dont have a current_difficulty_id set
$query = "SELECT id FROM suggestion WHERE challenge_id IS NOT NULL AND current_difficulty_id IS NULL";
$result = pg_query($DB, $query);

if (!$result) {
  die_json(500, "Failed to query database");
}

$i = 0;
while ($row = pg_fetch_assoc($result)) {
  $i++;
  $suggestion_id = $row['id'];
  $suggestion = Suggestion::get_by_id($DB, $suggestion_id);
  $suggestion->expand_foreign_keys($DB, 5, true);

  //Set the current difficulty id to be equal to the challenges difficulty id
  $suggestion->current_difficulty_id = $suggestion->challenge->difficulty_id;

  if ($suggestion->update($DB)) {
    echo "Updated suggestion #{$i}: $suggestion_id\n";
  } else {
    echo "Failed to update suggestion #{$i}: $suggestion_id\n";
  }
}

echo "\nFinished processing {$i} suggestions.\n";