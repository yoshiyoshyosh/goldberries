<?php

require_once('api_bootstrap.inc.php');

$account = get_user_data();
if ($account === null) {
  die_json(401, "Not logged in");
}


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  if (!is_verifier($account)) {
    die_json(403, "Not authorized");
  }

  if (isset($_REQUEST['claimed_players']) && $_REQUEST['claimed_players'] === "true") {
    $accounts = Account::get_all_player_claims($DB);
    foreach ($accounts as $account) {
      $account->expand_foreign_keys($DB, 2);
      $account->remove_sensitive_info();
    }
    api_write($accounts);
    exit();
  }


  $id = $_REQUEST['id'] ?? null;
  if ($id === null) {
    die_json(400, "Missing id");
  }

  $accounts = Account::get_request($DB, $id);
  if (is_array($accounts)) {
    foreach ($accounts as $account) {
      $account->remove_sensitive_info();
    }
  } else {
    $accounts->remove_sensitive_info();
  }
  api_write($accounts);
  exit();
}

// Post Request
if ($_SERVER['REQUEST_METHOD'] === "POST") {
  $request = format_assoc_array_bools(parse_post_body_as_json());

  if (isset($request['id'])) {
    $id = intval($request['id']);

    //Update request
    if (is_verifier($account)) {
      //Verifiers are allowed to change all properties, except is_verifier, is_admin, for all accounts except other verifiers and admins
      $target = Account::get_by_id($DB, $id);
      if ($target === false) {
        die_json(400, "Invalid id");
      }

      if ($account->id !== $target->id && is_verifier($target) && !is_admin($account)) {
        die_json(403, "You cannot change other verifiers' accounts");
      }

      $accountReq = new Account();
      $accountReq->apply_db_data($request);

      $target->player_id = $accountReq->player_id;
      $target->claimed_player_id = $accountReq->claimed_player_id;
      $target->email = $accountReq->email;
      if (isset($request['unlink_discord']) && $request['unlink_discord'] === 't') {
        $target->discord_id = null;
      }
      if (isset($request['reset_session']) && $request['reset_session'] === 't') {
        $target->session_token = null;
      }
      $target->is_suspended = $accountReq->is_suspended;
      $target->suspension_reason = $accountReq->suspension_reason;
      $target->email_verified = $accountReq->email_verified;

      if ($accountReq->password !== null) {
        $target->password = password_hash($accountReq->password, PASSWORD_DEFAULT);
      }

      if (is_admin($account)) {
        $target->is_verifier = $accountReq->is_verifier;
        $target->is_admin = $accountReq->is_admin;
      }

      if ($target->update($DB) === false) {
        log_error("Failed to update {$target} in database", "Account");
        die_json(500, "Failed to update account in database");
      } else {
        log_info("Updated {$target} in database", "Account");
        $target->remove_sensitive_info();
        $target->expand_foreign_keys($DB, 2);
        api_write($target);
        exit();
      }

    } else {
      //User are allowed to: Update their email and password
      //Unlink their discord account (discord_id = null)
      //Set the claimed_player_id to an unclaimed player's id, if previously null
      if ($id !== $account->id) {
        die_json(403, "Not authorized");
      }

      $changes = "";

      if (isset($request['email'])) {
        if (!filter_var($request['email'], FILTER_VALIDATE_EMAIL)) {
          die_json(400, "Invalid email");
        }
        $changes .= "email ({$account->email} -> {$request['email']}), ";
        $account->email = $request['email'];
      }
      if (isset($request['unlink_email']) && $request['unlink_email'] === true) {
        if ($account->discord_id === null) {
          die_json(400, "Cannot unlink email without discord account linked");
        }
        $changes .= "unlink email ({$account->email} -> null), ";
        $account->email = null;
        $account->password = null;
      }

      if (isset($request['password'])) {
        $changes .= "password, ";
        $account->password = password_hash($request['password'], PASSWORD_DEFAULT);
      }

      if (isset($request['unlink_discord']) && $request['unlink_discord'] === true) {
        if ($account->email === null && $account->password === null) {
          die_json(400, "Cannot unlink discord account without email and password");
        }
        $changes .= "discord_id ({$account->discord_id} -> null), ";
        $account->discord_id = null;
      }

      if (isset($request['claimed_player_id'])) {
        if ($account->claimed_player_id !== null) {
          die_json(400, "Cannot change claimed_player_id");
        }

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
        $changes .= "claimed_player_id (null -> {$claimed_player_id}, player.name '{$player->name}'), ";
      }

      if ($account->update($DB) === false) {
        log_error("Failed to update {$account} in database with changes: {$changes}", "Account");
        die_json(500, "Failed to update account in database");
      }
      log_info("Updated {$account} in database with changes: {$changes}", "Account");
      $account->remove_sensitive_info();
      api_write($account);
      exit();
    }
  }
}