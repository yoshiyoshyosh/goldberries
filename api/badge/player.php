<?php

require_once('../api_bootstrap.inc.php');

$account = get_user_data();

// ===== GET Request =====
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $id = $_REQUEST['id'] ?? null;
  if ($id === null) {
    die_json(400, "Missing id");
  }
  $badgePlayers = BadgePlayer::get_request($DB, $id);
  if (is_array($badgePlayers)) {
    foreach ($badgePlayers as $badgePlayer) {
      $badgePlayer->expand_foreign_keys($DB, 3, false);
    }
  } else {
    $badgePlayers->expand_foreign_keys($DB, 3, false);
  }
  api_write($badgePlayers);
}

// ===== POST Request =====
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  check_access($account, true);
  if (!is_verifier($account)) {
    die_json(403, "You cannot modify badges");
  }

  $data = format_assoc_array_bools(parse_post_body_as_json());
  $badgePlayer = new BadgePlayer();
  $badgePlayer->apply_db_data($data);

  if ($badgePlayer->insert($DB)) {
    api_write($badgePlayer);
  } else {
    die_json(500, "Failed to create badgePlayer mapping");
  }
}

// ===== DELETE Request =====
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  check_access($account, true);
  if (!is_verifier($account)) {
    die_json(403, "You cannot modify badges");
  }

  $id = $_REQUEST['id'] ?? null;
  if ($id === null) {
    die_json(400, "Missing id");
  }

  $badgePlayer = BadgePlayer::get_by_id($DB, $id);
  if ($badgePlayer === false) {
    die_json(404, "badgePlayer not found");
  }
  if (!$badgePlayer->delete($DB)) {
    die_json(500, "Failed to delete badgePlayer");
  }

  http_response_code(200);
}
