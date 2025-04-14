<?php

require_once('../api_bootstrap.inc.php');

// ===== GET Request =====
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $id = $_REQUEST['id'];
  // $depth = isset($_REQUEST['depth']) ? intval($_REQUEST['depth']) : 4;
  $depth = 4; //Doesnt work when not set to the maximum

  $submissions = Submission::get_request($DB, $id);
  if (is_array($submissions)) {
    foreach ($submissions as $submission) {
      $submission->expand_foreign_keys($DB, $depth);
      if ($submission->challenge !== null) {
        $submission->challenge->attach_campaign_challenges($DB);
      }
    }
  } else {
    $submissions->expand_foreign_keys($DB, $depth);
    if ($submissions->challenge !== null) {
      $submissions->challenge->attach_campaign_challenges($DB);
    }
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
  $skip_webhook = isset($data['skip_webhook']) && $data['skip_webhook'] === true;

  if (!$submission->has_fields_set(['player_id', 'proof_url'])) {
    die_json(400, "player_id or proof_url is missing");
  }
  if ($submission->player_id !== $account->player->id && !is_helper($account)) {
    die_json(403, "You are not allowed to make submissions for other players");
  }
  check_url($submission->proof_url, 'proof_url');


  //If $submission->id is set, then this is an update request
  if (isset($data['id'])) {
    $old_submission = Submission::get_by_id($DB, $submission->id);
    if ($old_submission === false) {
      die_json(400, "Submission with id {$submission->id} does not exist");
    }
    if ($old_submission->player_id !== $account->player->id && !is_helper($account)) {
      die_json(403, "You are not allowed to edit submissions for other players");
    }

    $log_message = null;

    if (is_helper($account)) {
      if ($old_submission->challenge_id !== $submission->challenge_id) {
        $challenge = Challenge::get_by_id($DB, $submission->challenge_id);
        if ($challenge === false) {
          die_json(400, "Challenge with id {$submission->challenge_id} does not exist");
        }
        if ($challenge->requires_fc && !$submission->is_fc) {
          die_json(400, "Submission cannot be moved to this challenge, as it requires FC");
        }
        if (!$challenge->requires_fc && !$challenge->has_fc && $submission->is_fc) {
          die_json(400, "Submission cannot be moved to this challenge, as it requires non-FC");
        }
        // if ($challenge->is_rejected) {
        //   die_json(400, "Challenge with id {$submission->challenge_id} is rejected and does not accept submissions.");
        // }
        $old_submission->challenge_id = $submission->challenge_id;
      }
      if ($submission->player_id !== $old_submission->player_id) {
        $new_player = Player::get_by_id($DB, $submission->player_id);
        if ($new_player === false) {
          die_json(400, "Player with id {$submission->player_id} does not exist");
        }
        $old_submission->player_id = $submission->player_id;
        $log_message = "'{$account->player->name}' assigned {$old_submission} to different player '{$new_player->name}'";
      }
      if ($old_submission->is_fc !== $submission->is_fc) {
        if ($old_submission->challenge_id !== null) {
          $challenge = Challenge::get_by_id($DB, $old_submission->challenge_id);
          if (!$challenge->requires_fc && !$challenge->has_fc && $submission->is_fc) {
            die_json(400, "Cannot set is_fc on this challenge");
          }
          if ($challenge->requires_fc && !$submission->is_fc) {
            die_json(400, "Cannot unset is_fc on this challenge");
          }
          $old_submission->is_fc = $submission->is_fc;
        }
      }
      $old_submission->is_obsolete = $submission->is_obsolete;
      $old_submission->is_personal = $submission->is_personal;
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

      $was_verified = false;
      $is_first_clear = false;
      if ($old_submission->is_verified !== $submission->is_verified) {
        if ($old_submission->challenge_id === null && $submission->is_verified !== null) {
          die_json(400, "Cannot verify or reject a submission without a challenge");
        }
        if ($old_submission->player_id === $account->player->id) {
          die_json(400, "Cannot change verification of your own submission");
        }
        $toLog = $submission->is_verified ? "verified" : "rejected";
        log_info("{$old_submission} was {$toLog} by '{$account->player->name}'", "Submission");
        $was_verified = true;
        $old_submission->date_verified = new JsonDateTime();
        $old_submission->verifier_id = $account->player->id;

        //Check if this is the first submission for this challenge
        if ($submission->is_verified) {
          $challenge = Challenge::get_by_id($DB, $old_submission->challenge_id);
          $challenge->fetch_submissions($DB, true);
          if (count($challenge->submissions) === 0) {
            $is_first_clear = true;
          }
        }
      }
      $old_submission->is_verified = $submission->is_verified;
      if ($submission->player_notes !== null && strlen($submission->player_notes) > 5000) {
        die_json(400, "Notes can't be longer than 5000 characters");
      }
      $old_submission->player_notes = $submission->player_notes;
      if ($submission->suggested_difficulty_id !== null) {
        $difficulty = Difficulty::get_by_id($DB, $submission->suggested_difficulty_id);
        if ($difficulty === false) {
          die_json(400, "Difficulty with id {$submission->suggested_difficulty_id} does not exist");
        } else if ($difficulty->id === $UNDETERMINED_ID) {
          die_json(400, "Cannot suggest 'Undetermined' as difficulty");
        }
      }
      $old_submission->suggested_difficulty_id = $submission->suggested_difficulty_id;
      $old_submission->frac = $submission->frac;
      if ($old_submission->suggested_difficulty_id !== null) {
        $old_submission->frac = $old_submission->frac === 0.5 ? null : $old_submission->frac;
      } else {
        $old_submission->frac = null;
      }

      if ($submission->verifier_notes !== null && strlen($submission->verifier_notes) > 5000) {
        die_json(400, "Verifier notes can't be longer than 5000 characters");
      }
      $old_submission->verifier_notes = $submission->verifier_notes;

      if ($submission->time_taken !== null) {
        if ($submission->time_taken < 0) {
          die_json(400, "Time taken can't be negative");
        } else if ($submission->time_taken > 60 * 60 * 99999) {
          die_json(400, "Time taken can't be this high");
        }
      }
      $old_submission->time_taken = $submission->time_taken;

      // $old_submission->date_created = $submission->date_created; //Verifiers no longer need to be able to change this
      $old_submission->date_achieved = $submission->date_achieved;
      $old_submission->new_challenge_id = $submission->is_verified === true ? null : $submission->new_challenge_id;

      if ($old_submission->update($DB)) {
        submission_embed_change($old_submission->id, "submission");
        if (!$was_verified) {
          if ($log_message !== null) {
            log_info($log_message, "Submission");
          } else {
            log_info("'{$account->player->name}' updated {$old_submission}", "Submission");
          }
        } else {
          VerificationNotice::delete_for_submission_id($DB, $old_submission->id);
        }
        $old_submission->expand_foreign_keys($DB, 5);
        if ($was_verified && !$skip_webhook) {
          send_webhook_submission_verified($old_submission);
          if ($is_first_clear) {
            send_webhook_first_clear_verified($old_submission);
          }
        }
        api_write($old_submission);
      } else {
        die_json(500, "Failed to update submission");
      }

    } else {
      //Only carry over the fields that the user is allowed to change
      if ($submission->player_notes !== null && strlen($submission->player_notes) > 5000) {
        die_json(400, "Notes can't be longer than 5000 characters");
      }
      $old_submission->player_notes = $submission->player_notes;

      if ($submission->suggested_difficulty_id !== null) {
        $difficulty = Difficulty::get_by_id($DB, $submission->suggested_difficulty_id);
        if ($difficulty === false) {
          die_json(400, "Difficulty with id {$submission->suggested_difficulty_id} does not exist");
        } else if ($difficulty->id === $UNDETERMINED_ID) {
          die_json(400, "Cannot suggest 'Undetermined' as difficulty");
        } else if ($difficulty->id === $TRIVIAL_ID) {
          die_json(400, "Cannot suggest 'Untiered' as difficulty");
        }
      }
      $old_submission->suggested_difficulty_id = $submission->suggested_difficulty_id;
      $old_submission->frac = $submission->frac;
      if ($old_submission->suggested_difficulty_id !== null) {
        $old_submission->frac = $old_submission->frac === 0.5 ? null : $old_submission->frac;
      } else {
        $old_submission->frac = null;
      }
      $old_submission->is_personal = $submission->is_personal;

      if ($submission->time_taken !== null) {
        if ($submission->time_taken < 0) {
          die_json(400, "Time taken can't be negative");
        } else if ($submission->time_taken > 60 * 60 * 99999) {
          die_json(400, "Time taken can't be this high");
        }
      }
      $old_submission->time_taken = $submission->time_taken;

      if ($old_submission->update($DB)) {
        //Dont need to delete embed, as user changes never appear in the embed anyways
        // submission_embed_change($old_submission->id, "submission");
        log_info("'{$account->player->name}' updated their own {$old_submission}", "Submission");
        api_write($old_submission);
      } else {
        die_json(500, "Failed to update submission");
      }
    }

  } else {
    //Create a new submission

    //Check if submissions are enabled
    $settings = ServerSettings::get_settings($DB);
    if (!$settings->submissions_enabled) {
      die_json(400, "Submissions are currently disabled");
    }

    //Create blank submission and only carry over fields that the player is allowed to set
    $new_submission = new Submission();
    $new_submission->challenge_id = $submission->challenge_id;
    $new_submission->player_id = $submission->player_id;
    $new_submission->is_fc = $submission->is_fc;
    $new_submission->proof_url = $submission->proof_url;
    $new_submission->raw_session_url = $submission->raw_session_url;
    $new_submission->player_notes = $submission->player_notes;
    $new_submission->suggested_difficulty_id = $submission->suggested_difficulty_id;
    $new_submission->frac = $submission->frac;
    $new_submission->is_personal = $submission->is_personal;
    $new_submission->time_taken = $submission->time_taken;
    $new_submission->date_achieved = $submission->date_achieved;

    //new challenge stuff
    if (isset($data['new_challenge'])) {
      $new_challenge = new NewChallenge();
      $new_challenge->apply_db_data($data['new_challenge']);
      if (!$new_challenge->insert($DB)) {
        die_json(400, "New Challenge could not be inserted");
      }
      $new_submission->new_challenge_id = $new_challenge->id;

    } else if (isset($data['challenge_id'])) {
      $challenge = Challenge::get_by_id($DB, $data['challenge_id']);
      if ($challenge === false) {
        die_json(400, "Challenge with id {$data['challenge_id']} does not exist");
      }
      if ($challenge->is_rejected) {
        die_json(400, "This challenge is rejected and does not accept submissions.");
      }
      if ($challenge->difficulty->sort >= $RAW_SESSION_REQUIRED_SORT) {
        check_url($new_submission->raw_session_url, 'raw_session_url');
      }
      if ($challenge->requires_fc) {
        $new_submission->is_fc = true;
      }
      if (!$challenge->requires_fc && !$challenge->has_fc) {
        $new_submission->is_fc = false;
      }
      if ($challenge->map_id !== null) {
        $map = Map::get_by_id($DB, $challenge->map_id);
        if ($map->is_rejected) {
          die_json(400, "Rejected maps don't accept submissions");
        }
      }
      $player_submission = Challenge::get_player_submission($DB, $challenge->id, $data['player_id']);
      if ($player_submission !== null) {
        die_json(400, "You already have a submission for this challenge");
      }
    } else {
      die_json(400, "challenge_id or new_challenge is missing");
    }

    if (isset($data['player_notes']) && strlen($data['player_notes']) > 5000) {
      die_json(400, "Notes can't be longer than 5000 characters");
    }

    if ($new_submission->suggested_difficulty_id !== null) {
      $difficulty = Difficulty::get_by_id($DB, $new_submission->suggested_difficulty_id);
      if ($difficulty === false) {
        die_json(400, "Difficulty with id {$new_submission->suggested_difficulty_id} does not exist");
      } else if ($difficulty->id === $UNDETERMINED_ID) {
        die_json(400, "Cannot suggest 'Undetermined' as difficulty");
      } else if ($difficulty->id === $TRIVIAL_ID) {
        die_json(400, "Cannot suggest 'Untiered' as difficulty");
      }
      //frac of 0.5 is the default value, so assume null
      $new_submission->frac = $new_submission->frac === 0.5 ? null : $new_submission->frac;
    } else {
      $new_submission->frac = null;
    }
    if ($new_submission->time_taken !== null) {
      if ($new_submission->time_taken < 0) {
        die_json(400, "Time taken can't be negative");
      } else if ($new_submission->time_taken > 60 * 60 * 99999) {
        die_json(400, "Time taken can't be this high");
      }
    }

    $new_submission->date_created = new JsonDateTime();
    if ($new_submission->date_achieved === null) {
      $new_submission->date_achieved = $submission->date_created;
    }
    $new_submission->insert($DB);
    $new_submission->expand_foreign_keys($DB, 5);
    api_write($new_submission);
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

  //Trying to delete submission for another player
  if ($submission->player_id !== $account->player->id) {
    if (!is_helper($account)) {
      die_json(403, "You are not allowed to delete submissions for other players");
    }
    //If the account is a helper, they can only delete objects that were created within the last 24 hours
    if ($account->role === $HELPER && !helper_can_delete($submission->date_created)) {
      die_json(403, "You can only delete submissions that were created within the last 24 hours");
    }
  }

  if ($submission->id === 46033) { //The golden challenge
    die_json(403, "This submission cannot be deleted (we use this as example in the rules)");
  }


  if ($submission->delete($DB)) {
    log_info("'{$account->player->name}' deleted {$submission}", "Submission");
    http_response_code(200);
  } else {
    die_json(500, "Failed to delete submission");
  }
}