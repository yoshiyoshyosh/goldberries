<?php

require_once('../api_bootstrap.inc.php');

$account = get_user_data();
if ($account === null) {
  die_json(401, "Not logged in");
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  if (!is_verifier($account)) {
    die_json(403, "Not authorized");
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

  //Update request
  if (is_verifier($account) && (!isset($request['self']) || $request['self'] !== 't')) {
    if (!isset($request['id'])) {
      die_json(400, "Invalid id");
    }
    $id = intval($request['id']);
    $target = Account::get_by_id($DB, $id);
    if ($target === false) {
      die_json(400, "Invalid id");
    }

    if ($account->id !== $target->id && !can_modify_account($account, $target)) {
      die_json(403, "You cannot modify this account");
    }

    $accountReq = new Account();
    $accountReq->apply_db_data($request);

    if ($target->player_id !== null) {
      submission_embed_change($target->player_id, "player");
    }
    if ($accountReq->player_id !== null) {
      submission_embed_change($accountReq->player_id, "player");
    }
    $target->player_id = $accountReq->player_id;
    $target->claimed_player_id = $accountReq->claimed_player_id;
    //Customization stuff
    $target->links = $accountReq->links;
    $target->name_color_start = $accountReq->name_color_start;
    $target->name_color_end = $accountReq->name_color_end;
    $target->input_method = $accountReq->input_method;
    $target->about_me = $accountReq->about_me;

    if (Account::is_valid_country($accountReq->country)) {
      $target->country = $accountReq->country;
    }

    $target->last_player_rename = $accountReq->last_player_rename;

    $new_email = isset($request['new_email']) ? $request['new_email'] : null;
    if ($new_email !== null) {
      if (!filter_var($new_email, FILTER_VALIDATE_EMAIL)) {
        die_json(400, "Invalid email");
      }
      $accounts = Account::find_by_email($DB, $new_email);
      if ($accounts === false) {
        die_json(500, "Failed to check if email is already registered");
      }
      if (count($accounts) > 0) {
        if ($accounts[0]->id !== $target->id) {
          die_json(401, "Email is already registered");
        }
      }

      //Only update email if new_email is set
      $target->email = $new_email;
    }
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

    //Assigning roles
    if ($accountReq->role !== $target->role) {
      if (can_assign_role($account, $accountReq->role)) {
        $target->role = $accountReq->role;
        $role_name = get_role_name($target->role);
        log_warn("'{$account->player->name}' assigned role '{$role_name}' to {$target}", "Account");
      } else {
        die_json(403, "You cannot assign this role");
      }
    }

    if ($target->update($DB) === false) {
      log_error("Failed to update {$target} in database", "Account");
      die_json(500, "Failed to update account in database");
    } else {
      log_info("'{$account->player->name}' updated {$target} in database", "Account");
      $target->remove_sensitive_info();
      $target->expand_foreign_keys($DB, 2);
      api_write($target);
      exit();
    }

  } else {
    //Dont need to check $id, as self modifying requests only modify the own $account
    if (!isset($request['self']) || $request['self'] !== 't') {
      die_json(403, "Not authorized");
    }

    //User are allowed to: Update their email and password
    //Unlink their discord account (discord_id = null)
    //Set the claimed_player_id to an unclaimed player's id, if previously null

    $changes = "";

    if (isset($request['email']) && $request['email'] !== $account->email) {
      if (!filter_var($request['email'], FILTER_VALIDATE_EMAIL)) {
        die_json(400, "Invalid email");
      }
      $accounts = Account::find_by_email($DB, $request['email']);
      if ($accounts === false) {
        die_json(500, "Failed to check if email is already registered");
      }
      if (count($accounts) > 0) {
        die_json(401, "Email is already registered");
      }
      $changes .= "email ({$account->email} -> {$request['email']}), ";
      $account->email = $request['email'];
      $account->email_verified = true; //Skip email verification if it's been added later
    }
    if (isset($request['unlink_email']) && $request['unlink_email'] === 't') {
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

    if (isset($request['unlink_discord']) && $request['unlink_discord'] === 't') {
      if ($account->email === null && $account->password === null) {
        die_json(400, "Cannot unlink discord account without email and password");
      }
      $changes .= "unlink discord ({$account->discord_id} -> null), ";
      $account->discord_id = null;
    }

    if (isset($request['claimed_player_id']) && $request['claimed_player_id'] !== $account->claimed_player_id) {
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

    if (isset($request['links']) && $request['links'] !== $account->links) {
      $linkList = $request['links'];
      if ($linkList !== null && !is_array($linkList)) {
        die_json(400, "Invalid links");
      }
      if ($linkList !== null && count($linkList) > 10) {
        die_json(400, "Too many links");
      }
      $account->links = $request['links'];
      $linksStr = $account->links === null ? "null" : implode("\t", $account->links);
      $changes .= "links (new list: {$linksStr}), ";
    }
    if (array_key_exists("name_color_start", $request) && $request['name_color_start'] !== $account->name_color_start) {
      if ($request['name_color_start'] !== null && strlen($request['name_color_start']) > 7) {
        die_json(400, "Invalid name_color_start");
      }
      $account->name_color_start = $request['name_color_start'];
      $changes .= "name_color_start ({$account->name_color_start}), ";
    }
    if (array_key_exists("name_color_end", $request) && $request['name_color_end'] !== $account->name_color_end) {
      if ($request['name_color_end'] !== null && strlen($request['name_color_end']) > 7) {
        die_json(400, "Invalid name_color_end");
      }
      $account->name_color_end = $request['name_color_end'];
      $changes .= "name_color_end ({$account->name_color_end}), ";
    }
    if (array_key_exists("input_method", $request) && $request['input_method'] !== $account->input_method) {
      $account->input_method = $request['input_method'];
      $changes .= "input_method ({$account->input_method}), ";
    }
    if (array_key_exists("about_me", $request) && $request['about_me'] !== $account->about_me) {
      if ($request['about_me'] !== null && strlen($request['about_me']) > 5000) {
        die_json(400, "About me can't be longer than 5000 characters");
      }
      $account->about_me = $request['about_me'];
      $changes .= "about_me ({$account->about_me}), ";
    }
    if (array_key_exists("country", $request) && $request['country'] !== $account->country) {
      if (!Account::is_valid_country($request['country'])) {
        die_json(400, "Invalid country");
      }
      $account->country = $request['country'];
      $changes .= "country ({$account->country}), ";
    }

    //Notification settings
    if (array_key_exists("n_sub_verified", $request) && ($request['n_sub_verified'] === 't') !== $account->n_sub_verified) {
      $account->n_sub_verified = $request['n_sub_verified'] === 't';
      $changes .= "n_sub_verified ({$account->n_sub_verified}), ";
    }
    if (array_key_exists("n_chall_personal", $request) && ($request['n_chall_personal'] === 't') !== $account->n_chall_personal) {
      $account->n_chall_personal = $request['n_chall_personal'] === 't';
      $changes .= "n_chall_personal ({$account->n_chall_personal}), ";
    }
    if (array_key_exists("n_suggestion", $request) && ($request['n_suggestion'] === 't') !== $account->n_suggestion) {
      $account->n_suggestion = $request['n_suggestion'] === 't';
      $changes .= "n_suggestion ({$account->n_suggestion}), ";
    }
    if (array_key_exists("n_chall_moved", $request) && ($request['n_chall_moved'] === 't') !== $account->n_chall_moved) {
      $account->n_chall_moved = $request['n_chall_moved'] === 't';
      $changes .= "n_chall_moved ({$account->n_chall_moved}), ";
    }

    if ($account->update($DB) === false) {
      log_error("Failed to update {$account} in database with changes: {$changes}", "Account");
      die_json(500, "Failed to update account in database");
    }
    log_info("Updated {$account} in database with changes: {$changes}", "Account");
    if ($account->player_id !== null) {
      submission_embed_change($account->player_id, "player");
    }
    $account->remove_sensitive_info();
    api_write($account);
    exit();
  }
}

// Delete Request
if ($_SERVER['REQUEST_METHOD'] === "DELETE") {
  if (is_verifier($account) && !isset($_REQUEST['self'])) {
    if (!isset($_REQUEST['id'])) {
      die_json(400, "Invalid id");
    }
    $id = intval($_REQUEST['id']);
    $target = Account::get_by_id($DB, $id);
    if ($target === false) {
      die_json(400, "Invalid id");
    }

    if ($account->id !== $target->id && !can_modify_account($account, $target)) {
      die_json(403, "You cannot delete this account");
    }

    if ($target->delete($DB) === false) {
      log_error("Failed to delete {$target}", "Account");
      die_json(500, "Failed to delete account");
    } else {
      log_info("'{$account->player->name}' deleted {$target}", "Account");
      http_response_code(200);
      exit();
    }

  } else {
    if (!isset($_REQUEST['self']) || $_REQUEST['self'] !== "true") {
      die_json(403, "Not authorized");
    }

    if ($account->delete($DB) === false) {
      log_error("Failed to delete {$account} in database", "Account");
      die_json(500, "Failed to delete account");
    }
    log_info("User self-deleted {$account}", "Account");

    //Delete session server-side
    $_SESSION['token'] = null;

    http_response_code(200);
    exit();
  }
}