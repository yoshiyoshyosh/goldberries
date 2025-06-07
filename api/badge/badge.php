<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $id = $_REQUEST['id'];
  $badges = Badge::get_request($DB, $id);

  //no FKs
  // if (is_array($badges)) {
  //   foreach ($badges as $badge) {
  //     $badge->expand_foreign_keys($DB, 2, false);
  //   }
  // } else {
  //   $badges->expand_foreign_keys($DB, 2, false);
  // }

  api_write($badges);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $account = get_user_data();
  if ($account === null) {
    die_json(401, "Not logged in");
  } else if (!is_verifier($account)) {
    die_json(403, "Not authorized");
  }

  $data = format_assoc_array_bools(parse_post_body_as_json());
  $badge = new Badge();
  $badge->apply_db_data($data);

  if (isset($data['id'])) {
    // Update
    if (!$badge->update($DB)) {
      die_json(500, "Failed to update badge ($badge->id)");
    } else {
      log_info("'{$account->player->name}' updated {$badge}", "Badge");
    }
  } else {
    // Insert
    $badge->date_created = new JsonDateTime();
    if ($badge->insert($DB)) {
      log_info("'{$account->player->name}' created {$badge}", "Badge");
    } else {
      die_json(500, "Failed to create badge ($badge->id)");
    }
  }

  api_write($badge);
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

  $badge = Badge::get_by_id($DB, check_id($_REQUEST['id']));
  if ($badge === false) {
    die_json(404, "Badge not found");
  }

  if ($badge->delete($DB)) {
    log_info("'{$account->player->name}' deleted {$badge}", "Badge");
    api_write($badge);
  } else {
    die_json(500, "Failed to delete badge");
  }
}