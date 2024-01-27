<?php

require_once('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $all = isset($_REQUEST['all']) && $_REQUEST['all'] === 'true';
  if ($all) {
    $players = Player::get_request($DB, "all", 2); //$depth of 1 to avoid fetching all accounts
    api_write($players);
    exit();
  }

  $id = $_REQUEST['id'] ?? null;
  if ($id !== null) {
    $players = Player::get_request($DB, $id);
    api_write($players);
    exit();
  }

  $group = $_REQUEST['group'] ?? null;
  if ($group === null) {
    die_json(400, "Missing paramter 'group'");
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

  $request = parse_post_body_as_json();
  $player = new Player();
  $player->apply_db_data($request);

  if (isset($request['id'])) {
    //Update request
    die_json(400, "Not yet implemented");
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