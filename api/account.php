<?php

require_once('api_bootstrap.inc.php');

$account = get_user_data();
if ($account === null) {
  die_json(401, "Not logged in");
}


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  if (!is_admin($account)) {
    die_json(403, "Not authorized");
  }

  $id = $_REQUEST['id'] ?? null;
  if ($id === null) {
    if (isset($_GET['all'])) {
      $id = "all";
    } else {
      die_json(400, "Missing id");
    }
  }

  $accounts = Account::get_request($DB, $id);
  api_write($accounts);
  exit();
}

// Post Request
if ($_SERVER['REQUEST_METHOD'] === "POST") {
  $json = parse_post_body_as_json();
  $reqAccount = new Account();
  $reqAccount->apply_db_data($json);

  if (isset($json['id'])) {
    //Update request
    if (is_admin($account)) {


    } else if (is_verifier($account)) {


    } else {
      //User are allowed to: Update their email and password
      //Unlink their discord account (discord_id = null)
      //Set the claimed_player_id to an unclaimed player's id, if previously null

      if ($reqAccount->id !== $account->id) {
        die_json(403, "Not authorized");
      }

      if ($json['email']) {
        $account->email = $json['email'];

      } else if ($json['password']) {
        $account->password = password_hash($json['password'], PASSWORD_DEFAULT);

      } else if ($json['discord_id'] === null) {
        if ($account->email === null && $account->password === null) {
          die_json(400, "Cannot unlink discord account without email and password");
        }
        $account->discord_id = null;

      } else if ($json['claimed_player_id']) {
        $player = Player::get_by_id($DB, intval($json['claimed_player_id']));
        if ($player === false) {
          die_json(400, "Invalid claimed_player_id");
        }
        $claimedBy = Account::find_by_player_id($DB, $player->id);
        if ($claimedBy !== false && count($claimedBy) > 0) {
          die_json(400, "Player is already claimed");
        }
        $openClaim = Account::find_by_claimed_player_id($DB, $player->id);
        if ($openClaim !== false && count($openClaim) > 0) {
          die_json(400, "Player is currently being claimed by another account");
        }
        $account->claimed_player_id = intval($json['claimed_player_id']);
      } else {
        die_json(400, "Missing parameter");
      }

      $account->update($DB);
      $account->remove_sensitive_info();
      api_write($account);
      exit();
    }
  }
}