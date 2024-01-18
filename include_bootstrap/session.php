<?php

DEFINE('DISCORD_CLIENT_ID', '1196814348203593729');
DEFINE('DISCORD_CLIENT_SECRET', getenv('DISCORD_CLIENT_SECRET'));
DEFINE('DISCORD_OAUTH_URL', 'https://discord.com/api/oauth2/authorize?client_id=1196814348203593729&response_type=code&redirect_uri=https%3A%2F%2Fstats.vi-home.de%2Fgb_api%2Fapi%2Fauth%2Fdiscord_auth.php&scope=identify');
DEFINE('DISCORD_TOKEN_URL', 'https://discord.com/api/oauth2/token');
DEFINE('DISCORD_REDIRECT_URI', 'https://stats.vi-home.de/gb_api/api/auth/discord_auth.php');
DEFINE('DISCORD_API_URL', 'https://discord.com/api');
$session_expire_days = 7;

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
  $account->session_token = $token;
  $account->session_created = new DateTime();
  $account->expand_foreign_keys($DB);

  if (!$account->update($DB)) {
    return false;
  }

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

  $account->session_token = null;
  $account->session_created = null;

  if ($account->update($DB)) {
    session_destroy();
    return true;
  } else {
    return false;
  }
}

function create_session_token($length = 32)
{
  $token = generate_random_token($length);
  $_SESSION['token'] = $token;
  return $token;
}
function generate_random_token($length)
{
  return bin2hex(random_bytes($length));
}

function get_user_data()
{
  global $DB;
  global $session_expire_days;

  if (!isset($_SESSION['token'])) {
    return null;
  }

  //Fetch account from database
  //Respect the expire time of the session
  $accounts = Account::find_by_session_token($DB, $_SESSION['token']);
  if ($accounts == false) {
    return null;
  }
  if (count($accounts) == 0 || count($accounts) > 1) {
    return null;
  }

  $account = $accounts[0];
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
  return $account->is_verifier === true;
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