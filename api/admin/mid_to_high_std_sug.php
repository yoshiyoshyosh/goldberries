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

$query = "SELECT * FROM view_submissions WHERE submission_suggested_difficulty_id = 18 AND challenge_difficulty_id <> 18";
$result = pg_query($DB, $query);

if (!$result) {
  die("Error in SQL query: " . pg_last_error());
}

// //Loop through all submissions that are marked incorrectly, fetch their submission and update it to be correct
$i = 0;
while ($row = pg_fetch_assoc($result)) {
  $i++;
  $id = $row['submission_id'];
  $submission = Submission::get_by_id($DB, $id);
  $submission->suggested_difficulty_id = 22;
  if ($submission->update($DB)) {
    echo "$i: Changed submission's mid std suggestion to high std (#{$submission->id})\n";
  } else {
    echo "$i: Failed to fix submission (#{$submission->id})\n";
  }
}

echo "Done processing $i submissions.\n";