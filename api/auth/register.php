<?php

require_once ('../api_bootstrap.inc.php');

//=== Verification ===
if (isset($_GET['verify'])) {
  $code = $_GET['verify'];

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

  if ($account->email_verified == true) {
    die_json(400, "Email is already verified");
  }

  $account->email_verified = true;
  $account->email_verify_code = null;
  if ($account->update($DB) === false) {
    die_json(500, "Failed to update database");
  }

  log_info("User verified email for {$account}", "Login");

  http_response_code(200);
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
$accounts = Account::find_by_email($DB, $email);
if ($accounts === false) {
  die_json(500, "Failed to check if email is already registered");
}
if (count($accounts) > 0) {
  die_json(401, "Email is already registered");
}

//Create the account
$account = new Account();
$account->email = $email;
$account->password = password_hash($password, PASSWORD_DEFAULT);
$account->email_verify_code = generate_random_token(8);
if ($account->insert($DB) === false) {
  die_json(500, "Failed to create account");
}

log_info("User registered {$account} via email ({$account->email})", "Login");

//Send a confirmation email with code
$subject = "Verify Your Email | Goldberries.net";
$message = "Hello,\n\n";
$message .= "activate your Goldberries.net account by clicking the link below:\n\n";
$message .= constant('BASE_URL') . "/verify-email/{$account->email_verify_code}\n\n";
$message .= "If you did not sign up, please ignore this email.\n\n";
$message .= "Thank you,\n";
$message .= "Goldberries.net Team";
$sender = constant('NOREPLY_EMAIL');
$recipient = $account->email;
$headers = "From: " . $sender;

if (mail($recipient, $subject, $message, $headers) === false) {
  die_json(500, "Failed to send email");
}

//redirect to verify notice page
http_response_code(200);