<?php

require_once('../api_bootstrap.inc.php');

$email = $_REQUEST['email'];
$password = $_REQUEST['password'];

if ($email == null || $password == null) {
  die_json(400, "Missing email or password");
}

$accounts = Account::find_by_email($DB, $email);
if ($accounts === false) {
  die_json(401, "Failed to query database");
}
if (count($accounts) == 0) {
  die_json(401, "No account found with that email and password");
}
$account = $accounts[0];

if (!password_verify($password, $account->password)) {
  die_json(401, "No account found with that email and password");
}

if ($account->email_verified === false) {
  die_json(401, "Email is not verified");
}
if (is_suspended($account)) {
  die_json(401, "Account is suspended: " . $account->suspension_reason);
}

log_debug("User logged in to Account({$account->id}) via email", "Login");

successful_login($account);

//Redirect to test_session.php
header('Location: test_session.php');