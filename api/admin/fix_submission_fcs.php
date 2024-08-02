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

$query = "SELECT * FROM view_submissions WHERE challenge_requires_fc = TRUE AND submission_is_fc = FALSE";
$result = pg_query($DB, $query);

if (!$result) {
  die("Error in SQL query: " . pg_last_error());
}

// //Loop through all submissions that are marked incorrectly, fetch their submission and update it to be correct
while ($row = pg_fetch_assoc($result)) {
  $id = $row['submission_id'];
  $submission = Submission::get_by_id($DB, $id);
  $submission->is_fc = true;
  if ($submission->update($DB)) {
    echo "Fixed submission (#{$submission->id})\n";
  } else {
    echo "Failed to fix submission (#{$submission->id})\n";
  }
}

echo "Done\n";