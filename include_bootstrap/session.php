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

function successful_login($account_id)
{
  global $DB;

  $token = create_session_token();

  //Update the Account table to set 'session_token' to $token and 'session_created' to NOW()
  $result = pg_query_params($DB, "UPDATE Account SET session_token = $1, session_created = NOW() WHERE id = $2", array($token, $account_id));
  if ($result) {
    return true;
  } else {
    return false;
  }
}

function logout()
{
  global $DB;

  $account = get_user_data();
  if ($account == null) {
    return false;
  }

  $account_id = $account['id'];

  //Update the Account table to set 'session_token' to NULL and 'session_created' to NULL
  $query = pg_query_params($DB, "UPDATE Account SET session_token = NULL, session_created = NULL WHERE id = $1", array($account_id));
  if ($query != false) {
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
  $result = pg_query_params(
    $DB,
    "SELECT * FROM Account WHERE session_token = $1 AND session_created > NOW() - INTERVAL '$session_expire_days days'",
    array($_SESSION['token'])
  );
  if ($result == false) {
    return null;
  }
  return pg_fetch_assoc($result);
}

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