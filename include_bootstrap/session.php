<?php

DEFINE('DISCORD_CLIENT_ID', getenv('DISCORD_CLIENT_ID'));
DEFINE('DISCORD_CLIENT_SECRET', getenv('DISCORD_CLIENT_SECRET'));
DEFINE('DISCORD_TOKEN_URL', 'https://discord.com/api/oauth2/token');
DEFINE('DISCORD_API_URL', 'https://discord.com/api');
if (getenv('DEBUG') === 'true') {
  DEFINE('DISCORD_OAUTH_URL', 'https://discord.com/api/oauth2/authorize?client_id=1196814348203593729&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%2Fapi%2Fauth%2Fdiscord_auth.php&scope=identify');
  DEFINE('DISCORD_REDIRECT_URI', 'http://localhost/api/auth/discord_auth.php');
  DEFINE('REDIRECT_POST_LOGIN', 'http://localhost:3000');
  DEFINE('REDIRECT_POST_LINK_ACCOUNT', 'http://localhost:3000/my-account');
} else {
  DEFINE('DISCORD_OAUTH_URL', 'https://discord.com/oauth2/authorize?client_id=1196814348203593729&response_type=code&redirect_uri=https%3A%2F%2Fgoldberries.net%2Fapi%2Fauth%2Fdiscord_auth.php&scope=identify');
  DEFINE('DISCORD_REDIRECT_URI', 'https://goldberries.net/api/auth/discord_auth.php');
  DEFINE('REDIRECT_POST_LOGIN', 'https://goldberries.net');
  DEFINE('REDIRECT_POST_LINK_ACCOUNT', 'https://goldberries.net/my-account');
}

//Role Management
$USER = 0;
$EX_HELPER = 10;
$EX_VERIFIER = 11;
$EX_ADMIN = 12;
$HELPER = 20;
$VERIFIER = 30;
$ADMIN = 40;
//===============

session_start();

function get_discord_url()
{
  $state = generate_random_token(32);
  $_SESSION['state'] = $state;
  return constant('DISCORD_OAUTH_URL') . '&state=' . $state;
}

function get_discord_token_url()
{
  return constant('DISCORD_TOKEN_URL');
}

//method = mail, discord
function successful_login($account, $method)
{
  global $DB;

  $token = create_session_token();

  $session = new Session();
  $session->token = $token;
  $session->account_id = $account->id;
  $session->created = new JsonDateTime();
  if (!$session->insert($DB)) {
    return false;
  }

  $account->expand_foreign_keys($DB);
  $methodStr = $method === "mail" ? "email" : "Discord";
  log_debug("User logged in to {$account} via {$methodStr}", "Login");

  return true;
}

function logout()
{
  global $DB;

  $account = get_user_data();
  if ($account == null) {
    return false;
  }

  $token = get_token();
  //Currently, this check is unnecessary, as the token is always set if the account is set
  //In the future, get_user_data() for an API token might return an account, while not owning a session token
  if ($token === null) {
    return false;
  }

  $sessions = Session::find_by_token($DB, $token);
  if ($sessions === false) {
    return false;
  }
  if (count($sessions) === 0) {
    return false;
  }

  $session = $sessions[0];
  if ($session->account_id !== $account->id) {
    return false;
  }

  if ($session->delete($DB)) {
    //Unset cookie
    setcookie('token', '', time() - 3600, '/');
    unset($_COOKIE['token']);
    session_destroy();
    return true;
  } else {
    return false;
  }
}

function create_session_token($length = 32)
{
  $token = generate_random_token($length);
  //Set cookie for 365 days
  setcookie('token', $token, time() + 60 * 60 * 24 * 365, '/');
  return $token;
}
function generate_random_token($length)
{
  return bin2hex(random_bytes($length));
}


function get_token()
{
  if (!isset($_COOKIE['token']))
    return null;
  return $_COOKIE['token'];
}

function get_user_data()
{
  global $DB;

  $token = get_token();
  if ($token == null) {
    return null;
  }

  //Fetch account from database
  //Respect the expire time of the session
  $account = Account::find_by_session_token($DB, $token);
  if ($account == false) {
    return null;
  }
  if (is_suspended($account)) {
    return null;
  }
  $account->expand_foreign_keys($DB);
  return $account;
}

// === Utility Functions ===

function is_logged_in()
{
  return get_user_data() != null;
}

function valid_password($password)
{
  return strlen($password) >= 8;
}

function valid_email($email)
{
  return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function is_helper($account = null)
{
  global $HELPER;
  $account = $account ?? get_user_data();
  if ($account == null) {
    return false;
  }
  return $account->role >= $HELPER;
}

function is_verifier($account = null)
{
  global $VERIFIER;
  $account = $account ?? get_user_data();
  if ($account == null) {
    return false;
  }
  return $account->role >= $VERIFIER;
}

function is_admin($account = null)
{
  global $ADMIN;
  $account = $account ?? get_user_data();
  if ($account == null) {
    return false;
  }
  return $account->role === $ADMIN;
}

function can_modify_account($account, $target)
{
  global $VERIFIER, $ADMIN;

  if ($account === null || $target === null) {
    return false;
  }

  //Anything below VERIFIER can't modify anything
  if ($account->role < $VERIFIER) {
    return false;
  }

  //VERIFIERs can only modify lower roles
  if ($account->role === $VERIFIER && $account->role > $target->role) {
    return true;
  }

  //Admins can modify anyone
  if ($account->role === $ADMIN) {
    return true;
  }

  //Just in case something goes wrong and someone somehow gets a higher role number than $ADMIN
  return false;
}

function can_assign_role($account, $role)
{
  global $USER, $EX_HELPER, $HELPER, $VERIFIER, $ADMIN;

  if ($account === null) {
    return false;
  }

  //Anything below VERIFIER can't modify anything
  if ($account->role < $VERIFIER) {
    return false;
  }

  //VERIFIERs can only assign user, ex-helper and helper
  if ($account->role === $VERIFIER && array_search($role, [$USER, $EX_HELPER, $HELPER]) !== false) {
    return true;
  }

  //Admins can assign any role
  if ($account->role === $ADMIN) {
    return true;
  }

  return false;
}

function get_role_name($role)
{
  global $USER, $EX_HELPER, $EX_VERIFIER, $EX_ADMIN, $HELPER, $VERIFIER, $ADMIN;

  switch ($role) {
    case $USER:
      return "User";
    case $EX_HELPER:
      return "Ex-Helper";
    case $EX_VERIFIER:
      return "Ex-Verifier";
    case $EX_ADMIN:
      return "Ex-Admin";
    case $HELPER:
      return "Helper";
    case $VERIFIER:
      return "Verifier";
    case $ADMIN:
      return "Admin";
    default:
      return "Unknown";
  }
}

function helper_can_delete($date_time)
{
  //Can only delete objects that are less than 24 hours old
  return $date_time->getTimestamp() > time() - 86400;
}

function is_suspended($account = null)
{
  $account = $account ?? get_user_data();
  if ($account == null) {
    return false;
  }
  return $account->is_suspended === true;
}

function check_access($account, $needs_player = true, $reject_suspended = true)
{
  if ($account === null) {
    die_json(401, "Not logged in");
  }
  if ($reject_suspended && is_suspended($account)) {
    die_json(403, "Account is suspended");
  }
  if ($needs_player && $account->player === null) {
    die_json(403, "Account does not have a player claimed yet");
  }
}