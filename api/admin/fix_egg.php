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
$query = "SELECT 
	submission.id
FROM submission 
JOIN challenge ON submission.challenge_id = challenge.id
JOIN difficulty ON challenge.difficulty_id = difficulty.id
WHERE player_id = 20 AND difficulty.sort <= 5 AND submission.is_personal = true AND submission.suggested_difficulty_id IS NOT NULL
ORDER BY submission.id";
$result = pg_query_params_or_die($DB, $query);

$i = 0;
while ($row = pg_fetch_assoc($result)) {
  $i++;
  $submission_id = $row['id'];
  $submission = Submission::get_by_id($DB, $submission_id);
  $submission->is_personal = false;
  if ($submission->update($DB)) {
    echo "Updated submission #{$i}: $submission_id\n";
  } else {
    echo "Failed to update submission #{$i}: $submission_id\n";
  }
}

echo "\nFinished processing {$i} submissions.\n";