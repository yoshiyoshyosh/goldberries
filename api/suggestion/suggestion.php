<?php

require_once('../api_bootstrap.inc.php');

$account = get_user_data();

// ===== GET Request =====
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $id = isset($_REQUEST['id']) ? intval($_REQUEST['id']) : null;
  if ($id === null) {
    die_json(400, "Missing id");
  }

  $suggestion = Suggestion::get_request($DB, $id, 5, true);
  if ($suggestion === false) {
    die_json(404, "Suggestion not found");
  }
  if (is_array($suggestion)) {
    foreach ($suggestion as $s) {
      $s->fetch_associated_content($DB);
    }
  } else {
    $suggestion->fetch_associated_content($DB);
  }
  api_write($suggestion);
  exit();
}

// ===== POST Request =====
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  check_access($account, true);

  $data = format_assoc_array_bools(parse_post_body_as_json());
  $suggestion = new Suggestion();
  $suggestion->apply_db_data($data);

  //Update request
  if (isset($data['id'])) {
    $old_suggestion = Suggestion::get_by_id($DB, $suggestion->id);
    if ($old_suggestion === false) {
      die_json(400, "Suggestion with id {$suggestion->id} does not exist");
    }

    if (!is_verifier($account)) {
      die_json(403, "Not authorized");
    }

    if ($old_suggestion->is_verified !== true && $old_suggestion->is_verified !== $suggestion->is_verified) {
      $toLog = $suggestion->is_verified ? "verified" : "rejected";
      log_info("{$old_suggestion} was {$toLog} by '{$account->player->name}'", "Suggestion");
      $old_suggestion->is_verified = $suggestion->is_verified;

      if ($suggestion->is_verified === true) {
        send_webhook_suggestion_verified($old_suggestion);
      } else {
        $old_suggestion->date_accepted = new JsonDateTime();
      }
    }
    if ($old_suggestion->is_accepted !== $suggestion->is_accepted) {
      $toLog = $suggestion->is_accepted ? "accepted" : "rejected";
      log_info("{$old_suggestion} was {$toLog} by '{$account->player->name}'", "Suggestion");
      $old_suggestion->is_accepted = $suggestion->is_accepted;
      $old_suggestion->date_accepted = new JsonDateTime();
      send_webhook_suggestion_accepted($old_suggestion);
    }

    if ($old_suggestion->update($DB)) {
      $old_suggestion->expand_foreign_keys($DB, 5);
      api_write($old_suggestion);
    } else {
      die_json(500, "Failed to update suggestion");
    }

  } else {
    //Create a new suggestion
    //Challenge id is optional
    if (isset($data['challenge_id'])) {
      $challenge = Challenge::get_by_id($DB, $data['challenge_id']);
      if ($challenge === false) {
        die_json(400, "Challenge with id {$data['challenge_id']} does not exist");
      }

      $suggestion->current_difficulty_id = $challenge->difficulty_id;

      if (isset($data['suggested_difficulty_id'])) {
        $difficulty = Difficulty::get_by_id($DB, $data['suggested_difficulty_id']);
        if ($difficulty === false) {
          die_json(400, "Difficulty with id {$data['suggested_difficulty_id']} does not exist");
        }
        if ($difficulty->id === $TRIVIAL_ID) {
          die_json(400, "Trivial difficulty is not allowed for suggestions");
        }

        //Placement suggestions are not allowed for trivial challenges
        if ($challenge->difficulty_id === $TRIVIAL_ID) {
          die_json(400, "Placement suggestions cannot be made for trivial challenges");
        }

        //Check if the same challenge had a recent suggestion for placement change
        if (Suggestion::had_recent_placement_suggestion($DB, $challenge->id)) {
          $placement_suggestion_cooldown = Suggestion::$placement_cooldown_days;
          die_json(400, "At least {$placement_suggestion_cooldown} days must pass between placement suggestions for the same challenge");
        }
      }
    } else {
      if (isset($data['current_difficulty_id'])) {
        die_json(400, "General suggestions must not have a difficulty suggestion set");
      }
      if (isset($data['suggested_difficulty_id'])) {
        die_json(400, "General suggestions must not have a difficulty suggestion set");
      }
    }

    if (isset($data['comment']) && strlen($data['comment']) > 1000) {
      die_json(400, "Comment cannot be longer than 1000 characters");
    }
    $suggestion->author_id = $account->player_id;
    $suggestion->date_created = new JsonDateTime();

    //Skip verification process
    //$suggestion->is_verified = true;

    if ($suggestion->insert($DB)) {
      $suggestion->expand_foreign_keys($DB, 5);

      //Create a vote for the suggestion
      $vote = new SuggestionVote();
      $vote->suggestion_id = $suggestion->id;
      $vote->player_id = $account->player_id;
      $vote->vote = "+";
      if (!$vote->insert($DB)) {
        log_error("Created suggestion but failed to create own vote for suggestion {$suggestion->id}", "Suggestion");
      }

      api_write($suggestion);
    } else {
      die_json(500, "Failed to create suggestion");
    }
  }
}

// ===== DELETE Request =====
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  check_access($account, true);

  $id = $_REQUEST['id'] ?? null;
  if ($id === null) {
    die_json(400, "Missing id");
  }

  $suggestion = Suggestion::get_by_id($DB, $id);
  if ($suggestion === false) {
    die_json(404, "Suggestion not found");
  }
  if (!is_verifier($account)) {
    if ($suggestion->author_id !== $account->player_id) {
      die_json(403, "You can only delete your own suggestions");
    }
    if ($suggestion->is_verified === true) {
      die_json(403, "You cannot delete in-progress suggestions");
    }
    if ($suggestion->is_accepted !== null) {
      die_json(403, "You cannot delete completed suggestions");
    }
  }

  if (!$suggestion->delete($DB)) {
    die_json(500, "Failed to delete suggestion");
  }

  log_info("{$suggestion} was deleted by '{$account->player->name}'", "Suggestion");
  http_response_code(200);
}
