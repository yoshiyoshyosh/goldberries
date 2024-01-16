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

  //Check if user is in database
  $result = pg_query_params_or_die($DB, "SELECT * FROM Account WHERE discord_id = $1", array($user_id));

  $account = pg_fetch_assoc($result);
  $account_id = null;

  if ($account == false) {
    //No account was found
    if ($_SESSION['login'] == true) {
      //User is not in database, but was trying to login
      die_json(401, "User is not registered");
    }
    //User is not in database, create new account
    $query = pg_query_params_or_die($DB, "INSERT INTO Account (discord_id) VALUES ($1) RETURNING id", array($user_id), "Failed to create new account");
    $result = pg_fetch_assoc($query);
    $account_id = $result['id'];
  } else {
    $account_id = $account['id'];
  }

  //Login user
  if (successful_login($account_id)) {
    //Redirect to test_session.php
    header('Location: test_session.php');
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