<?php

require_once ('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
  $type = $_REQUEST['type'] ?? null;
  if ($type === null) {
    die_json(400, "Missing parameter 'type'");
  } else if ($type !== "campaign" && $type !== "map" && $type !== "challenge" && $type !== "player" && $type !== "all") {
    die_json(400, "Parameter 'type' must be one of (campaign, map, challenge, player, all)");
  }

  $recent = isset($_REQUEST['recent']) ? $_REQUEST['recent'] === "true" : null;
  if ($recent != null && $recent) {
    $page = intval($_REQUEST['page']) === 0 ? 1 : intval($_REQUEST['page']);
    $per_page = intval($_REQUEST['per_page']) === 0 ? 50 : intval($_REQUEST['per_page']);

    $logs = Change::get_paginated($DB, $page, $per_page, $type);

    api_write($logs);
    exit();
  }


  if ($type === "all") {
    die_json(400, "Type 'all' is only valid for paginated requests");
  }

  $id = $_REQUEST['id'] ?? null;
  if ($id === null) {
    die_json(400, "Missing parameter 'id'");
  }

  $changes = Change::get_all_for_object($DB, $type, $id);
  if ($changes === false) {
    die_json(500, "Failed to query database");
  }

  api_write($changes);
}

// Delete Request
if ($_SERVER['REQUEST_METHOD'] === "DELETE") {
  $account = get_user_data();

  if (!isset($_REQUEST['id'])) {
    die_json(400, "Invalid id");
  }
  $id = intval($_REQUEST['id']);
  $target = Change::get_by_id($DB, $id);
  if ($target === false) {
    die_json(404, "Change not found");
  }

  if (!is_verifier($account)) {
    if ($target->player_id === null || $target->player_id !== $account->player_id) {
      die_json(403, "Not authorized");
    }
  }

  if ($target->delete($DB) === false) {
    log_error("Failed to delete {$target}", "Change");
    die_json(500, "Failed to delete change");
  } else {
    log_info("'{$account->player->name}' deleted {$target}", "Change");
    http_response_code(200);
    exit();
  }
}