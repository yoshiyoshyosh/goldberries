<?php

require_once('../api_bootstrap.inc.php');

//Check if user is logged in
if (is_logged_in()) {
  header('Location: test_session.php');
  exit();
}

if (isset($_REQUEST['code'])) {
  //Got code from discord oauth, now get access token

  $state = $_REQUEST['state'];
  if ($state != $_SESSION['state']) {
    die_json(401, "Invalid state: Got '" . $state . "', Expected '" . $_SESSION['state'] . "'"); //CSRF attack
  }

  $token = apiRequest(
    constant('DISCORD_TOKEN_URL'),
    array(
      "grant_type" => "authorization_code",
      'client_id' => constant('DISCORD_CLIENT_ID'),
      'client_secret' => getenv('DISCORD_CLIENT_SECRET'),
      'redirect_uri' => constant('DISCORD_REDIRECT_URI'),
      'code' => $_REQUEST['code']
    )
  );

  //Store access token in session
  $_SESSION['access_token'] = $token->access_token;

  //Identify the user
  $user = apiRequest(constant('DISCORD_API_URL') . '/users/@me');
  $_SESSION['discord_user'] = $user;
  $user_id = $user->id;

  if ($user_id == null) {
    die_json(500, "Failed to get discord user id");
  }

  //Check if user is in database
  $accounts = Account::find_by_discord_id($DB, $user_id);
  $account = null;

  if ($accounts == false) {
    //No account was found
    if ($_SESSION['login'] == true) {
      die_json(401, "User is not registered");
    }
    //User is not in database, create new account
    $account = new Account();
    $account->discord_id = $user_id;
    if ($account->insert($DB) === false) {
      die_json(500, "Failed to create account");
    }
    log_info("User registered Account({$account->id}) via Discord (id: {$user_id})", "Login");
  } else {
    //User account was found, try to login
    $account = $accounts[0];
    if (is_suspended($account)) {
      die_json(401, "Account is suspended: " . $account->suspension_reason);
    }
    log_debug("User logged in to Account({$account->id}) via Discord", "Login");
  }

  //Login user
  if (successful_login($account)) {
    //Redirect to test_session.php
    header('Location: ../test_session.php');
  } else {
    die_json(500, "Failed to login");
  }

} else {
  //Redirect to discord oauth
  //Rememeber if user was trying to login or register
  $_SESSION['login'] = isset($_GET['login']);

  //Redirect to discord oauth
  header("Location: " . get_discord_url());
}

function apiRequest($url, $post = FALSE, $headers = array())
{
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

  $response = curl_exec($ch);


  if ($post) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post));
  }
  $headers[] = 'Accept: application/json';

  if (isset($_SESSION['access_token']))
    $headers[] = 'Authorization: Bearer ' . $_SESSION['access_token'];

  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

  $response = curl_exec($ch);
  return json_decode($response);
}