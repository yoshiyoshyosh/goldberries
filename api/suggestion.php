<?php

require_once ('api_bootstrap.inc.php');

$account = get_user_data();

// ===== GET Request =====
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $id = isset($_REQUEST['id']) ? intval($_REQUEST['id']) : null;
  if ($id !== null) {
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


  $page = intval($_REQUEST['page']) <= 0 ? 1 : intval($_REQUEST['page']);
  $per_page = intval($_REQUEST['per_page']) <= 0 ? 20 : intval($_REQUEST['per_page']);
  $challenge = intval($_REQUEST['challenge']) === 0 ? null : intval($_REQUEST['challenge']);
  $expired = $_REQUEST['expired'] === 'true' ? true : ($_REQUEST['expired'] === 'false' ? false : null);

  $suggestions = Suggestion::get_paginated($DB, $page, $per_page, $challenge, $expired, $account);

  api_write($suggestions);
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

    if ($old_suggestion->is_verified === null && $suggestion->is_verified !== null) {
      $toLog = $suggestion->is_verified ? "verified" : "rejected";
      log_info("{$old_suggestion} was {$toLog} by '{$account->player->name}'", "Suggestion");
      $old_suggestion->is_verified = $suggestion->is_verified;
    }
    if ($old_suggestion->is_accepted === null && $suggestion->is_accepted !== null) {
      $toLog = $suggestion->is_accepted ? "verified" : "rejected";
      log_info("{$old_suggestion} was {$toLog} by '{$account->player->name}'", "Suggestion");
      $old_suggestion->is_accepted = $suggestion->is_accepted;
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
    }
    $suggestion->author_id = $account->player_id;
    $suggestion->date_created = new JsonDateTime();

    if ($suggestion->insert($DB)) {
      $suggestion->expand_foreign_keys($DB, 5);
      api_write($suggestion);
    } else {
      die_json(500, "Failed to create suggestion");
    }
  }
}

// ===== DELETE Request =====
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  if ($account === null || (!is_verifier($account))) {
    die_json(403, "Not authorized");
  }

  $id = $_REQUEST['id'] ?? null;
  if ($id === null) {
    die_json(400, "Missing id");
  }

  $suggestion = Suggestion::get_by_id($DB, $id);
  if ($suggestion === false) {
    die_json(404, "Suggestion not found");
  }

  if (!$suggestion->delete($DB)) {
    die_json(500, "Failed to delete suggestion");
  }

  http_response_code(200);
}
