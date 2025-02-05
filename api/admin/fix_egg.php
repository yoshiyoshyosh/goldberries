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

//Go through all submissions of egg that are in either tier 1, 2 or 3
$query = "SELECT 
	submission.id
FROM submission 
JOIN challenge ON submission.challenge_id = challenge.id
JOIN difficulty ON challenge.difficulty_id = difficulty.id
WHERE submission.player_id = 20 AND difficulty.id IN (22, 18, 21)
ORDER BY submission.id";
$result = pg_query_params_or_die($DB, $query);

$i = 0;
while ($row = pg_fetch_assoc($result)) {
  $i++;
  $submission_id = $row['id'];
  $submission = Submission::get_by_id($DB, $submission_id);

  //Clear the difficulty suggestion
  $submission->is_personal = false;
  $submission->suggested_difficulty_id = null;

  if ($submission->update($DB)) {
    echo "Updated submission #{$i}: $submission_id\n";
  } else {
    echo "Failed to update submission #{$i}: $submission_id\n";
  }
}

echo "\nFinished processing {$i} submissions.\n";