<?php

require_once('../api_bootstrap.inc.php');

$email = $_REQUEST['email'];
$password = $_REQUEST['password'];

if ($email == null || $password == null) {
  die_json(400, "Missing email or password");
}

$result = pg_query_params_or_die($DB, "SELECT * FROM Account WHERE email = $1", array($email));

if (pg_num_rows($result) == 0) {
  die_json(401, "No account found with that email and password");
}

$account = pg_fetch_assoc($result);

if (!password_verify($password, $account['password'])) {
  die_json(401, "No account found with that email and password");
}

if ($account['email_verified'] == 0) {
  die_json(401, "Email is not verified");
}

$account_id = $account['id'];
successful_login($account_id);

//Redirect to test_session.php
header('Location: test_session.php');