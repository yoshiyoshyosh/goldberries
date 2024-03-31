<?php

require_once ('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $all = isset($_REQUEST['all']) && $_REQUEST['all'] === 'true';
  $customization = isset($_REQUEST['customization']) && $_REQUEST['customization'] === 'true';

  if ($all) {
    $players = Player::get_request($DB, "all", 2, $customization); //$depth of 1 to avoid fetching all accounts
    api_write($players);
    exit();
  }

  $id = $_REQUEST['id'] ?? null;
  if ($id !== null) {
    $players = Player::get_request($DB, $id, 2, $customization);
    api_write($players);
    exit();
  }

  $group = $_REQUEST['group'] ?? null;
  if ($group === null) {
    die_json(400, "Missing paramter 'group' or 'id'");
  }

  if ($group === "unclaimed") {
    $players = Player::find_unclaimed_players($DB);
    if ($players === false) {
      die_json(500, "Failed to query database");
    }
    api_write($players);
    exit();
  }

  $players = Player::find_by_group($DB, $group);
  if ($players === false) {
    die_json(400, "Invalid group");
  }
  api_write($players);
}

// Post Request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $account = get_user_data();
  if ($account === null) {
    die_json(401, "Not logged in");
  }

  $request = format_assoc_array_bools(parse_post_body_as_json());
  $player = new Player();
  $player->apply_db_data($request);

  if (isset($request['id'])) {
    //Update request
    $log_change = isset($request['log_change']) && $request['log_change'] === 't';
    if (is_verifier($account) && (!isset($request['self']) || $request['self'] !== 't')) {
      if (!isset($request['id'])) {
        die_json(400, "Invalid id");
      }
      $id = intval($request['id']);
      //Verifiers are allowed to rename all players
      $target = Player::get_by_id($DB, $id);
      if ($target === false) {
        die_json(400, "Invalid id");
      }

      if (!isset($request['name'])) {
        die_json(400, "Missing parameter 'name'");
      }
      $new_name = trim($request['name']);
      if ($new_name === "" || strlen($new_name) > 32 || strlen($new_name) < 3) {
        die_json(400, "Name needs to be between 3 and 32 characters long");
      }
      if ($new_name !== $target->name && Player::name_exists($DB, $new_name)) {
        die_json(400, "Player name is already taken");
      }

      $old_name = $target->name;
      $target->name = $new_name;

      if ($old_name !== $new_name && $log_change) {
        Change::create_change($DB, "player", $target->id, "Renamed from '{$old_name}' to '{$new_name}'");
      }


      if ($target->update($DB) === false) {
        log_error("Failed to update {$target} in database", "Player");
        die_json(500, "Failed to update account in database");
      } else {
        log_info("'{$account->player->name}' renamed '{$old_name}' to '{$new_name}'", "Player");
        api_write($target);
        exit();
      }

    } else {
      //Dont need to check $id, as self modifying requests only modify the own $account
      if (!isset($request['self']) || $request['self'] !== 't') {
        die_json(403, "Not authorized");
      }

      $last_rename = $account->last_player_rename;
      //$last_rename is null if the player has never renamed themselves, otherwise its a JsonDateTime
      if ($last_rename !== null && $last_rename->getTimestamp() + 86400 > time()) {
        die_json(400, "You can only rename your player once every 24 hours");
      }

      if (!isset($request['name'])) {
        die_json(400, "Missing parameter 'name'");
      }
      $new_name = trim($request['name']);
      if ($new_name === "" || strlen($new_name) > 32 || strlen($new_name) < 3) {
        die_json(400, "Name needs to be between 3 and 32 characters long");
      }
      if ($new_name !== $target->name && Player::name_exists($DB, $new_name)) {
        die_json(400, "Player name is already taken");
      }

      $target = $account->player;
      $old_name = $target->name;

      if ($old_name !== $new_name && $log_change) {
        Change::create_change($DB, "player", $target->id, "Renamed from '{$old_name}' to '{$new_name}'");
      }

      $target->name = $new_name;

      if ($target->update($DB) === false) {
        log_error("Failed to rename self {$target} in database to '{$new_name}'", "Player");
        die_json(500, "Failed to update player in database");
      }
      $account->last_player_rename = new JsonDateTime();
      if ($account->update($DB) === false) {
        log_error("Failed to update {$account} in database after renaming self {$target}", "Account");
      }
      log_info("Renamed self  from '{$old_name}' to '{$new_name}'", "Player");
      api_write($target);
      exit();
    }
  }

  //Create request
  if ($account->player_id !== null) {
    die_json(400, "Account already has a player");
  }
  if (!isset($request['name'])) {
    die_json(400, "Missing parameter 'name'");
  }
  $player->name = trim($player->name);
  if (Player::name_exists($DB, $player->name)) {
    die_json(400, "Player name is already taken");
  }

  if ($player->insert($DB) === false) {
    die_json(500, "Failed to insert player into database");
  }

  log_info("Created {$player} for {$account}", "Account");

  $account->player_id = $player->id;
  $account->claimed_player_id = null;
  if ($account->update($DB) === false) {
    log_error("Failed to update {$account} in database after creating {$player}", "Account");
    die_json(500, "Failed to update account in database");
  }

  http_response_code(200);
}

// Delete Request
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  $account = get_user_data();
  if ($account === null) {
    die_json(401, "Not logged in");
  } else if (!is_verifier($account)) {
    die_json(403, "Not authorized");
  }

  $id = $_REQUEST['id'] ?? null;
  if ($id === null) {
    die_json(400, "Missing parameter 'id'");
  }

  $id = intval($id);
  if ($id === 0) {
    die_json(400, "Invalid id");
  }
  if ($id === $account->player_id) {
    die_json(400, "Cannot delete own player");
  }

  $player = Player::get_by_id($DB, $id);
  if ($player === false) {
    die_json(404, "Player not found");
  }

  if ($player->delete($DB) === false) {
    log_error("'{$account->player->name}' failed to delete {$player} from database", "Player");
    die_json(500, "Failed to delete player from database");
  }

  log_info("'{$account->player->name}' deleted {$player}", "Player");
  http_response_code(200);
}