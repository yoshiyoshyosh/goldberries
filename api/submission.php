<?php

require_once ('api_bootstrap.inc.php');

// ===== GET Request =====
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $queue = isset($_REQUEST['queue']) && $_REQUEST['queue'] === 'true';
  if ($queue) {
    $submissions = Submission::get_submission_queue($DB);
    api_write($submissions);
    exit();
  }

  $recent = isset($_REQUEST['recent']) && $_REQUEST['recent'] === 'true';
  if ($recent) {
    $type = isset($_REQUEST['type']) ? $_REQUEST['type'] : 'verified';
    $page = isset($_REQUEST['page']) ? intval($_REQUEST['page']) : 1;
    $per_page = isset($_REQUEST['per_page']) ? intval($_REQUEST['per_page']) : 10;
    // $per_page = min($per_page, 500);
    $search = isset($_REQUEST['search']) ? $_REQUEST['search'] : null;
    $player = isset($_REQUEST['player']) ? intval($_REQUEST['player']) : null;
    $result = Submission::get_recent_submissions($DB, $type, $page, $per_page, $search, $player);
    api_write($result);
    exit();
  }


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


// ===== POST Request =====
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $account = get_user_data();
  check_access($account, true);

  $data = parse_post_body_as_json();
  $submission = new Submission();
  $submission->apply_db_data(format_assoc_array_bools($data));

  if (!$submission->has_fields_set(['player_id', 'proof_url'])) {
    die_json(400, "player_id or proof_url is missing");
  }
  if ($submission->player_id !== $account->player->id && !is_verifier($account)) {
    die_json(403, "You are not allowed to make submissions for other players");
  }
  check_url($submission->proof_url, 'proof_url');


  //If $submission->id is set, then this is an update request
  if (isset($data['id'])) {
    $old_submission = Submission::get_by_id($DB, $submission->id);
    if ($old_submission === false) {
      die_json(400, "Submission with id {$submission->id} does not exist");
    }

    if (is_verifier($account)) {
      if ($old_submission->challenge_id !== $submission->challenge_id) {
        $challenge = Challenge::get_by_id($DB, $submission->challenge_id);
        if ($challenge === false) {
          die_json(400, "Challenge with id {$submission->challenge_id} does not exist");
        }
        $old_submission->challenge_id = $submission->challenge_id;
      }
      if ($submission->player_id !== $old_submission->player_id) {
        $new_player = Player::get_by_id($DB, $submission->player_id);
        if ($new_player === false) {
          die_json(400, "Player with id {$submission->player_id} does not exist");
        }
        $old_submission->player_id = $submission->player_id;
      }
      $old_submission->is_fc = $submission->is_fc;
      if ($old_submission->proof_url !== $submission->proof_url) {
        check_url($submission->proof_url, 'proof_url');
        $old_submission->proof_url = $submission->proof_url;
      }
      if ($old_submission->raw_session_url !== $submission->raw_session_url) {
        if ($submission->raw_session_url === null) {
          $old_submission->raw_session_url = null;
        } else {
          check_url($submission->raw_session_url, 'raw_session_url');
        }
        $old_submission->raw_session_url = $submission->raw_session_url;
      }

      if (
        $old_submission->verifier_id === null
        && !$old_submission->is_verified && !$old_submission->is_rejected
        && ($submission->is_verified || $submission->is_rejected)
      ) {
        $toLog = $submission->is_verified ? "verified" : "rejected";
        log_info("{$old_submission} was {$toLog} by '{$account->player->name}'", "Submission");
        $old_submission->date_verified = new JsonDateTime();
        $old_submission->verifier_id = $account->player->id;
      }
      $old_submission->is_verified = $submission->is_verified;
      $old_submission->is_rejected = $submission->is_rejected;
      $old_submission->player_notes = $submission->player_notes;
      if ($submission->suggested_difficulty_id !== null) {
        $difficulty = Difficulty::get_by_id($DB, $submission->suggested_difficulty_id);
        if ($difficulty === false) {
          die_json(400, "Difficulty with id {$submission->suggested_difficulty_id} does not exist");
        } else if ($difficulty->id === 13) {
          die_json(400, "Cannot suggest 'Guard Tier 3' as difficulty");
        } else if ($difficulty->id === 19) {
          die_json(400, "Cannot suggest 'Undetermined' as difficulty");
        }
      }
      $old_submission->suggested_difficulty_id = $submission->suggested_difficulty_id;
      $old_submission->verifier_notes = $submission->verifier_notes;
      $old_submission->new_challenge_id = $submission->is_verified || $submission->is_rejected ? null : $submission->new_challenge_id;

      if ($old_submission->update($DB)) {
        $old_submission->expand_foreign_keys($DB, 5);
        api_write($old_submission);
      } else {
        die_json(500, "Failed to update submission");
      }

    } else {
      //Only carry over the fields that the user is allowed to change
      $old_submission->player_notes = $submission->player_notes;
      if ($submission->suggested_difficulty_id !== null) {
        $difficulty = Difficulty::get_by_id($DB, $submission->suggested_difficulty_id);
        if ($difficulty === false) {
          die_json(400, "Difficulty with id {$submission->suggested_difficulty_id} does not exist");
        } else if ($difficulty->id === 13) {
          die_json(400, "Cannot suggest 'Guard Tier 3' as difficulty");
        } else if ($difficulty->id === 19) {
          die_json(400, "Cannot suggest 'Undetermined' as difficulty");
        }
      }
      $old_submission->suggested_difficulty_id = $submission->suggested_difficulty_id;
      if ($old_submission->update($DB)) {
        api_write($old_submission);
      } else {
        die_json(500, "Failed to update submission");
      }
    }

  } else {
    //Create a new submission

    //new challenge stuff
    if (isset($data['new_challenge'])) {
      $new_challenge = new NewChallenge();
      $new_challenge->apply_db_data($data['new_challenge']);
      if (!$new_challenge->insert($DB)) {
        die_json(400, "New Challenge could not be inserted");
      }
      $submission->new_challenge_id = $new_challenge->id;

    } else if (isset($data['challenge_id'])) {
      $challenge = Challenge::get_by_id($DB, $data['challenge_id']);
      if ($challenge === false) {
        die_json(400, "Challenge with id {$data['challenge_id']} does not exist");
      }
      if ($challenge->difficulty_id <= 12) {
        check_url($submission->raw_session_url, 'raw_session_url');
      }
      if ($challenge->requires_fc) {
        $submission->is_fc = true;
      }
    } else {
      die_json(400, "challenge_id or new_challenge is missing");
    }

    $submission->date_created = new JsonDateTime();
    $submission->insert($DB);
    $submission->expand_foreign_keys($DB, 5);
    api_write($submission);
  }
}

// ===== DELETE Request =====
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  $account = get_user_data();
  if ($account === null) {
    die_json(401, "You must be logged in to delete submissions");
  }

  $id = intval($_REQUEST['id']);
  $submission = Submission::get_by_id($DB, $id);
  if ($submission === false) {
    die_json(404, "Submission with id {$id} does not exist");
  }

  if ($submission->player_id !== $account->player->id && !is_verifier($account)) {
    die_json(403, "You are not allowed to delete submissions for other players");
  }

  if ($submission->delete($DB)) {
    http_response_code(200);
  } else {
    die_json(500, "Failed to delete submission");
  }
}