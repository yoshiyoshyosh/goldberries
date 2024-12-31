<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $submissions = isset($_REQUEST['submissions']) && $_REQUEST['submissions'] === 'true';
  $depth = isset($_REQUEST['depth']) ? intval($_REQUEST['depth']) : 3;

  if (!isset($_REQUEST['id'])) {
    die_json(400, "Missing id");
  }

  $id = $_REQUEST['id'];
  $challenges = Challenge::get_request($DB, $id);
  if ($submissions) {
    if (is_array($challenges)) {
      foreach ($challenges as $challenge) {
        $challenge->fetch_submissions($DB, true);
      }
    } else {
      $challenges->fetch_submissions($DB, true);
    }
  }

  if (is_array($challenges)) {
    foreach ($challenges as $challenge) {
      $challenge->expand_foreign_keys($DB, $depth);
    }
  } else {
    $challenges->expand_foreign_keys($DB, $depth);
  }

  api_write($challenges);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $account = get_user_data();
  if ($account === null) {
    die_json(401, "Not logged in");
  } else if (!is_verifier($account)) {
    die_json(403, "Not authorized");
  }

  $data = format_assoc_array_bools(parse_post_body_as_json());


  // ====== Special Challenge Requests =====

  if ($data["split"] === "t") {
    //Split request. data is the challenge that is to be split
    $challenge = Challenge::get_by_id($DB, $data["id"]);
    if ($challenge === false) {
      die_json(404, "Challenge not found");
    }
    if ($challenge->has_fc === false) {
      die_json(400, "Only C/FC challenges can be split");
    }

    //Step 1: Clone challenge and set requires_fc to true
    $new_challenge = new Challenge();
    $new_challenge->campaign_id = $challenge->campaign_id;
    $new_challenge->map_id = $challenge->map_id;
    $new_challenge->objective_id = $challenge->objective_id;
    $new_challenge->difficulty_id = $challenge->difficulty_id;

    $new_challenge->label = $challenge->label;
    $new_challenge->description = $challenge->description;
    $new_challenge->date_created = $challenge->date_created;
    $new_challenge->sort = $challenge->sort;
    $new_challenge->requires_fc = true;

    $new_challenge->is_placed = $challenge->is_placed;

    if (!$new_challenge->insert($DB)) {
      die_json(500, "Failed to create challenge");
    }
    log_info("'{$account->player->name}' created {$new_challenge} via challenge splitting", "Challenge");

    //Step 2: Update original challenge to be non-FC
    $challenge->has_fc = false;
    if (!$challenge->update($DB)) {
      die_json(500, "Failed to update challenge");
    }
    log_info("'{$account->player->name}' updated {$challenge} via challenge splitting", "Challenge");

    //Step 3: Update FC submissions to point to the new challenge
    //For this, first get all submissions of the original challenge

    if (!$challenge->fetch_all_submissions($DB)) {
      die_json(500, "Failed to fetch submissions");
    }

    foreach ($challenge->submissions as $submission) {
      if ($submission->is_fc === false)
        continue; //Skip non-FC submissions
      $submission->challenge_id = $new_challenge->id;
      if (!$submission->update($DB)) {
        die_json(500, "Failed to move FC submission to newly created challenge ({$new_challenge->id})");
      }
    }

    http_response_code(200);
    die();

  } else if ($data["merge"] === "t") {
    //Merge request. data contains the fields: "id_a" and "id_b"
    //The challenge with id_b will be merged into the challenge with id_a

    $challenge_a = Challenge::get_by_id($DB, $data["id_a"]);
    if ($challenge_a === false) {
      die_json(404, "Challenge A not found");
    }
    $challenge_b = Challenge::get_by_id($DB, $data["id_b"]);
    if ($challenge_b === false) {
      die_json(404, "Challenge B not found");
    }

    if ($challenge_a->campaign_id !== $challenge_b->campaign_id) {
      die_json(400, "Challenges are not from the same campaign");
    } else if ($challenge_a->map_id !== $challenge_b->map_id) {
      die_json(400, "Challenges are not from the same map");
    }

    //Both challenges need to have has_fc set to false, and only one of them can have requires_fc set to true
    if ($challenge_a->has_fc || $challenge_b->has_fc) {
      die_json(400, "Cannot merge has_fc challenges");
    } else if ($challenge_a->requires_fc && $challenge_b->requires_fc) {
      die_json(400, "Can only merge a regular clear and an FC challenge");
    }

    //Reassign submissions from challenge_b to challenge_a
    if (!$challenge_b->fetch_all_submissions($DB)) {
      die_json(500, "Failed to fetch all submissions");
    }

    foreach ($challenge_b->submissions as $submission) {
      $submission->challenge_id = $challenge_a->id;
      if (!$submission->update($DB)) {
        die_json(500, "Failed to move submission to challenge A");
      }
    }

    //Delete challenge_b
    if (!$challenge_b->delete($DB)) {
      die_json(500, "Failed to delete challenge B");
    }
    log_info("'{$account->player->name}' deleted {$challenge_b} via challenge merging", "Challenge");

    //Update challenge_a
    $challenge_a->has_fc = true;
    $challenge_a->requires_fc = false;
    if (!$challenge_a->update($DB)) {
      die_json(500, "Failed to update challenge A");
    }
    log_info("'{$account->player->name}' updated {$challenge_a} via challenge merging", "Challenge");

    http_response_code(200);
    die();

  } else if ($data["mark_personal"] === 't') {
    //Request to mark all submissions for a challenge as personal
    $challenge = Challenge::get_by_id($DB, $data["id"]);
    if ($challenge === false) {
      die_json(404, "Challenge not found");
    }

    if (!$challenge->fetch_submissions($DB)) {
      die_json(500, "Failed to fetch submissions");
    }

    send_webhook_challenge_marked_personal($challenge);
    foreach ($challenge->submissions as $submission) {
      //Only mark submissions that have a suggestion set as personal
      if ($submission->suggested_difficulty_id !== null && !$submission->is_personal) {
        $submission->is_personal = true;
        if (!$submission->update($DB)) {
          die_json(500, "Failed to mark submission as personal");
        }
      }
    }

    log_info("'{$account->player->name}' marked all submissions for {$challenge} as personal", "Challenge");
    http_response_code(200);
    die();
  }

  // ======================================
  //Regular challenge creation/update request from here

  $challenge = new Challenge();
  $challenge->apply_db_data($data);

  if ($challenge->map_id === null && $challenge->campaign_id === null) {
    die_json(400, "Missing map_id or campaign_id");
  }
  if ($challenge->map_id !== null) {
    $map = Map::get_by_id($DB, $challenge->map_id);
    if ($map === false) {
      die_json(404, "Map not found");
    }
    $challenge->campaign_id = null;
  } else if ($challenge->campaign_id !== null) {
    $campaign = Campaign::get_by_id($DB, $challenge->campaign_id);
    if ($campaign === false) {
      die_json(404, "Campaign not found");
    }
    $challenge->map_id = null;
  }

  if (isset($data['id'])) {
    $skip_webhook = isset($data['skip_webhook']) && $data['skip_webhook'] === 't';
    // Update
    $old_challenge = Challenge::get_by_id($DB, $data['id']);

    //Temporary: if a challenge is unplaced, and is moved to a different difficulty, it will become placed
    if ($old_challenge->is_placed === false && $old_challenge->difficulty_id !== $challenge->difficulty_id) {
      $challenge->is_placed = true;
    }

    if ($challenge->update($DB)) {
      Challenge::generate_changelog($DB, $old_challenge, $challenge);
      log_info("'{$account->player->name}' updated {$challenge}", "Challenge");
      submission_embed_change($challenge->id, "challenge");
      if ($old_challenge->difficulty_id !== $challenge->difficulty_id && (!$skip_webhook || true)) {
        send_webhook_challenge_moved($old_challenge, $challenge->difficulty_id, $skip_webhook);
      }
      api_write($challenge);
    } else {
      die_json(500, "Failed to update challenge");
    }

  } else {
    // Insert
    $challenge->date_created = new JsonDateTime();
    if ($challenge->insert($DB)) {
      log_info("'{$account->player->name}' created {$challenge}", "Challenge");
      $challenge->expand_foreign_keys($DB, 5);
      api_write($challenge);
    } else {
      die_json(500, "Failed to create challenge");
    }
  }
}


if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  $account = get_user_data();
  if ($account === null) {
    die_json(401, "Not logged in");
  } else if (!is_verifier($account)) {
    die_json(403, "Not authorized");
  }

  if (!isset($_REQUEST['id'])) {
    die_json(400, "Missing id");

  }

  $id = intval($_REQUEST['id']);
  if ($id === 0 || $id < 0) {
    die_json(400, "Invalid id");
  }

  $challenge = Challenge::get_by_id($DB, $id);
  if ($challenge === false) {
    die_json(404, "Challenge not found");
  }
  if ($challenge->delete($DB)) {
    log_info("'{$account->player->name}' deleted {$challenge}", "Challenge");
    submission_embed_change($challenge->id, "challenge");
    api_write($challenge);
  } else {
    die_json(500, "Failed to delete challenge");
  }
}