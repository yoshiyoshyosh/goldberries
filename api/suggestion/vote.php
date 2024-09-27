<?php

require_once('../api_bootstrap.inc.php');

$account = get_user_data();

// ===== GET Request =====
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $depth = isset($_REQUEST['depth']) ? intval($_REQUEST['depth']) : 2;
  $id = $_REQUEST['id'] ?? null;
  if ($id === null) {
    die_json(400, "Missing id");
  }

  $votes = SuggestionVote::get_request($DB, $id, $depth);
  api_write($votes);
  exit();
}

// ===== POST Request =====
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  check_access($account, true);

  $data = format_assoc_array_bools(parse_post_body_as_json());
  $vote = new SuggestionVote();
  $vote->apply_db_data($data);

  if ($vote->comment !== null && strlen($vote->comment) > 1500) {
    die_json(400, "Comment can't be longer than 1500 characters");
  }

  //Create a new vote
  $suggestion = Suggestion::get_by_id($DB, $data['suggestion_id']);
  if ($suggestion === false) {
    die_json(404, "suggestion with id {$data['suggestion_id']} does not exist");
  }
  if ($suggestion->is_verified !== true && !is_verifier($account)) {
    die_json(400, "Suggestion is not verified yet");
  }
  if ($suggestion->is_closed()) {
    die_json(400, "Suggestion is closed");
  }
  if (SuggestionVote::has_voted_on_suggestion($DB, $account->player_id, $data['suggestion_id'])) {
    die_json(400, "You already voted on this suggestion");
  }
  if ($suggestion->challenge_id !== null && $suggestion->suggested_difficulty_id !== null) {
    //Placement suggestion
    if (Challenge::get_player_submission($DB, $suggestion->challenge_id, $account->player_id) === null) {
      //Player has not submitted to this challenge
      if ($vote->comment === null || $vote->comment === "" || strlen($vote->comment) < 10) {
        die_json(400, "Please elaborate on your position with a comment");
      }
    }
  }
  $vote->player_id = $account->player_id;

  if ($vote->insert($DB)) {
    $vote->expand_foreign_keys($DB, 5);
    api_write($vote);
  } else {
    die_json(500, "Failed to create vote");
  }
}

// ===== DELETE Request =====
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  check_access($account, true);

  $id = $_REQUEST['id'] ?? null;
  if ($id === null) {
    die_json(400, "Missing id");
  }

  $vote = SuggestionVote::get_by_id($DB, $id);
  if ($vote === false) {
    die_json(404, "Vote not found");
  }
  if ($vote->player_id !== $account->player_id && !is_verifier($account)) {
    die_json(403, "You can only delete your own votes");
  }

  $suggestion = Suggestion::get_by_id($DB, $vote->suggestion_id);
  if ($suggestion === false) {
    die_json(404, "Suggestion not found");
  }

  if ($suggestion->is_closed() && !is_verifier($account)) {
    die_json(400, "Suggestion is closed");
  }

  if (!$vote->delete($DB)) {
    die_json(500, "Failed to delete vote");
  }

  http_response_code(200);
}
