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


$challenge_ids = [2703, 2704, 2712, 2714];

//Loop over all challenges, get all maps -> challenges in the challenge
//Change all challenges' objective_id to 2
//Save the challenges
for ($i = 0; $i < count($challenge_ids); $i++) {
  $challenge_id = $challenge_ids[$i];
  $challenge = Challenge::get_by_id($DB, $challenge_id);
  if ($challenge === false) {
    echo "Challenge $challenge_id not found\n";
    continue;
  }

  $challenge->expand_foreign_keys($DB, 5);
  echo "Processing challenge (#{$challenge->id}): {$challenge->get_name()}\n";
  $challenge->fetch_submissions($DB);

  foreach ($challenge->submissions as $submission) {
    $submission->verifier_notes = $submission->player_notes;
    $submission->player_notes = '';
    if ($submission->update($DB)) {
      echo "Fixed submission (#{$submission->id})\n";
    } else {
      echo "Failed to fix submission (#{$submission->id})\n";
    }
  }
}

echo "Done\n";