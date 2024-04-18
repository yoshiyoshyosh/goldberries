<?php

DEFINE('DISCORD_CLIENT_ID', '1196814348203593729');
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
  //Set cookie for 30 days
  setcookie('token', $token, time() + 60 * 60 * 24 * 30, '/');
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

function is_verifier($account = null)
{
  $account = $account ?? get_user_data();
  if ($account == null) {
    return false;
  }
  return $account->is_verifier === true || $account->is_admin === true;
}

function is_admin($account = null)
{
  $account = $account ?? get_user_data();
  if ($account == null) {
    return false;
  }
  return $account->is_admin === true;
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
  if ($reject_suspended && $account->is_suspended) {
    die_json(403, "Account is suspended");
  }
  if ($needs_player && $account->player === null) {
    die_json(403, "Account does not have a player claimed yet");
  }
}