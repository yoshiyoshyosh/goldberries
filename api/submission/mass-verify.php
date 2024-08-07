<?php

require_once ('../api_bootstrap.inc.php');

// ===== POST Request =====
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  die_json(405, 'Method Not Allowed');
}

$account = get_user_data();
check_access($account, true);

if (!is_verifier($account)) {
  die_json(403, 'Not Authorized');
}

$data = parse_post_body_as_json();

if (!isset($data['ids']) || !is_array($data['ids'])) {
  die_json(400, "ids is missing");
}
$ids = $data['ids'];

if (!isset($data['is_verified']) || !is_bool($data['is_verified'])) {
  die_json(400, "is_verified is missing");
}
$is_verified = $data['is_verified'];

$verifier_notes = null;
if (isset($data['verifier_notes'])) {
  $verifier_notes = trim($data['verifier_notes']);
  if (strlen($verifier_notes) > 5000) {
    die_json(400, "Verifier notes can't be longer than 5000 characters");
  }
  if (strlen($verifier_notes) === 0) {
    $verifier_notes = null;
  }
}

$submissions = [];

//Loop through the submission IDs and get the submission objects
foreach ($ids as $id) {
  $submission = Submission::get_by_id($DB, $id);
  if ($submission === false) {
    die_json(400, "Submission (id:{$id}) does not exist");
  }
  if ($submission->is_verified !== null) {
    die_json(400, "Submission (id:{$id}) has already been verified");
  }

  $submission->is_verified = $is_verified;
  $submission->verifier_notes = $verifier_notes;
  $submission->date_verified = new JsonDateTime();
  $submission->verifier_id = $account->player->id;

  if ($submission->update($DB)) {
    submission_embed_change($submission->id, "submission");
    VerificationNotice::delete_for_submission_id($DB, $submission->id);
    $submission->expand_foreign_keys($DB, 5);
    $submissions[] = $submission;
  } else {
    die_json(500, "Failed to update submission (id:{$id})");
  }
}

// Next, for the submission webhook notification we want to group all notifications by:
// - Player ID
// - Campaign ID

$grouped_submissions = [];
foreach ($submissions as $submission) {
  $player_id = $submission->player_id;
  $campaign_id = $submission->challenge->campaign_id;

  if (!isset($grouped_submissions[$player_id])) {
    $grouped_submissions[$player_id] = [];
  }
  if (!isset($grouped_submissions[$player_id][$campaign_id])) {
    $grouped_submissions[$player_id][$campaign_id] = [];
  }

  $grouped_submissions[$player_id][$campaign_id][] = $submission;
}

// Then we can send the webhook notification for each group

foreach ($grouped_submissions as $player_id => $campaigns) {
  foreach ($campaigns as $campaign_id => $submissions) {
    if (count($submissions) === 1) {
      send_webhook_submission_verified($submissions[0]);
    } else {
      send_webhook_multi_submission_verified($submissions);
    }
  }
}

api_write($submissions);