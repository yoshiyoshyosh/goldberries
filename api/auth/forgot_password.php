<?php

require_once ('../api_bootstrap.inc.php');

//=== Verification ===
if (isset ($_REQUEST['token'])) {
  $code = $_REQUEST['token'];
  $password = $_REQUEST['password'] ?? null;
  if ($password == null) {
    die_json(400, "Missing password");
  }
  if (!valid_password($password)) {
    die_json(400, "Password must be at least 8 characters long");
  }

  //Check if code is valid
  $accounts = Account::find_by_email_verify_code($DB, $code);
  if ($accounts === false) {
    die_json(500, "Failed to check if code is valid");
  }
  if (count($accounts) == 0) {
    die_json(401, "Invalid verification code");
  }

  //Update account state in db
  $account = $accounts[0];

  if ($account->email_verified == false) {
    die_json(400, "Email is not verified");
  }

  $account->email_verify_code = null;
  $account->password = password_hash($password, PASSWORD_DEFAULT);
  if ($account->update($DB) === false) {
    die_json(500, "Failed to update database");
  }

  log_info("User set a new password for {$account}", "Login");

  http_response_code(200);
  exit();
}


//=== Registration ===
$email = $_REQUEST['email'] ?? null;
if ($email == null) {
  die_json(400, "Missing email or password");
}
if (!valid_email($email)) {
  die_json(400, "Invalid email");
}

//Check if email is registered
$accounts = Account::find_by_email($DB, $email);
if ($accounts === false) {
  die_json(500, "Failed to check if email is already registered");
}
if (count($accounts) == 0) {
  //Don't reveal if email is registered or not
  // die_json(401, "Email is not registered");
  http_response_code(200);
  exit();
}

$account = $accounts[0];

if ($account->email_verified == false) {
  die_json(400, "Account's email has not been verified yet");
}

$account->email_verify_code = generate_random_token(8);
if ($account->update($DB) === false) {
  die_json(500, "Failed to update account");
}

log_info("User request password to be reset for {$account}", "Login");

//Send email with code
$subject = "Password recovery | Goldberries.net";
$message = "Hello,\n\n";
$message .= "You requested to reset your password. Please use the following link reset your password:\n\n";
$message .= constant('BASE_URL') . "/forgot-password/{$account->email_verify_code}\n\n";
$message .= "If you did not request this, please ignore this email.\n\n";
$message .= "Thank you,\n";
$message .= "Goldberries.net Team";
$sender = constant('ADMIN_EMAIL');
$recipient = $account->email;
$headers = "From: " . $sender;

if (mail($recipient, $subject, $message, $headers) === false) {
  die_json(500, "Failed to send email");
}

http_response_code(200);