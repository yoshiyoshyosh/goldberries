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
  $request = parse_post_body_as_json();

  if (isset($request['id'])) {
    $id = intval($request['id']);

    //Update request
    if (is_admin($account)) {


    } else if (is_verifier($account)) {


    } else {
      //User are allowed to: Update their email and password
      //Unlink their discord account (discord_id = null)
      //Set the claimed_player_id to an unclaimed player's id, if previously null

      if ($id !== $account->id) {
        die_json(403, "Not authorized");
      }

      if (isset($request['email'])) {
        $account->email = $request['email'];

      }

      if (isset($request['password'])) {
        $account->password = password_hash($request['password'], PASSWORD_DEFAULT);

      }

      if (isset($request['unlink_discord']) && $request['unlink_discord'] === true) {
        if ($account->email === null && $account->password === null) {
          die_json(400, "Cannot unlink discord account without email and password");
        }
        $account->discord_id = null;

      }

      if (isset($request['claimed_player_id'])) {
        $claimed_player_id = intval($request['claimed_player_id']);
        $player = Player::get_by_id($DB, $claimed_player_id);
        if ($player === false) {
          die_json(400, "Invalid claimed_player_id");
        }
        $claimedBy = Account::find_by_player_id($DB, $player->id);
        if ($claimedBy !== false && count($claimedBy) > 0) {
          die_json(400, "Player is already claimed");
        }
        $openClaim = Account::find_by_claimed_player_id($DB, $player->id);
        if ($openClaim !== false && count($openClaim) > 0) {
          die_json(409, "Another account has made a claim on this player that is currently under review. If you believe this is an error, please contact a team member!");
        }
        $account->claimed_player_id = $claimed_player_id;
      }

      $account->update($DB);
      $account->remove_sensitive_info();
      api_write($account);
      exit();
    }
  }
}