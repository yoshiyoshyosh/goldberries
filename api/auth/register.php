<?php

require_once('../api_bootstrap.inc.php');

//=== Verification ===
if (isset($_GET['verify'])) {
  $code = $_GET['verify'];

  //Check if code is valid
  $result = pg_query_params_or_die($DB, "SELECT * FROM Account WHERE email_verify_code = $1", array($code));

  if (pg_num_rows($result) == 0) {
    die_json(401, "Invalid verification code");
  }

  $account = pg_fetch_assoc($result);
  $account_id = $account['id'];

  //Update account state in db
  $result = pg_query_params_or_die(
    $DB,
    "UPDATE Account SET email_verified = B'1', email_verify_code = NULL WHERE id = $1",
    array($account_id),
    "Failed to update database"
  );

  //redirect to login page
  header('Location: login.php');

  exit();
}


//=== Registration ===
$email = $_REQUEST['email'];
$password = $_REQUEST['password'];

if ($email == null || $password == null) {
  die_json(400, "Missing email or password");
}

if (!valid_password($password)) {
  die_json(400, "Password must be at least 8 characters long");
}
if (!valid_email($email)) {
  die_json(400, "Invalid email");
}


//Check if email is already registered
$result = pg_query_params_or_die($DB, "SELECT * FROM Account WHERE email = $1", array($email));

$account = pg_fetch_assoc($result);
if (pg_num_rows($result) > 0) {
  die_json(401, "Email is already registered");
}

//Create new account
$password_hash = password_hash($password, PASSWORD_DEFAULT);
$verify_code = generate_random_token(8);
$result = pg_query_params_or_die(
  $DB,
  "INSERT INTO Account (email, password, email_verify_code) VALUES ($1, $2, $3) RETURNING id",
  array($email, $password_hash, $verify_code),
  "Failed to create new account"
);

$result = pg_fetch_assoc($result);
$account_id = $result['id'];


//Send a confirmation email with code


//redirect to verify notice page
header('Location: verify_notice.php');
