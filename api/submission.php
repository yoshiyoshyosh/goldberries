<?php

require_once('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $id = $_REQUEST['id'];
  $depth = isset($_REQUEST['depth']) ? intval($_REQUEST['depth']) : 2;

  $submissions = Submission::get_request($DB, $id);
  if (is_array($submissions)) {
    foreach ($submissions as $submission) {
      $submission->expand_foreign_keys($DB, $depth);
    }
  } else {
    $submissions->expand_foreign_keys($DB, $depth);
  }

  api_write($submissions);
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $account = get_user_data();
  check_access($account, true);

  $data = parse_post_body_as_json();
  $submission = new Submission();
  $submission->apply_db_data($data);

  if (!$submission->has_fields_set(['player_id', 'proof_url'])) {
    die_json(400, "player_id or proof_url is missing");
  }
  if ($submission->player_id !== $account->player->id && !is_verifier($account)) {
    die_json(403, "player_id does not match the own player");
  }
  check_url($submission->proof_url, 'proof_url');

  //no challenge_id
  if (isset($data['new_challenge'])) {
    $new_challenge = new NewChallenge();
    $new_challenge->apply_db_data($data->new_challenge);
    $new_challenge_id = $new_challenge->insert($DB);
    if ($new_challenge_id === false) {
      die_json(400, "New Challenge could not be inserted");
    }
    $submission->new_challenge_id = $new_challenge_id;
  } else if (isset($data['challenge_id'])) {
    $challenge = Challenge::get_by_id($DB, $data['challenge_id']);
    if ($challenge === false) {
      die_json(400, "Challenge with id {$data['challenge_id']} does not exist");
    }
    if ($challenge->difficulty_id <= 12) {
      check_url($submission->raw_session_url, 'raw_session_url');
    }
  } else {
    die_json(400, "challenge_id or new_challenge is missing");
  }

  $submission->date_created = new JsonDateTime();
  $submission->insert($DB);
  api_write($submission);
}