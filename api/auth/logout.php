<?php

require_once('../api_bootstrap.inc.php');

$account = get_user_data();
if ($account == null) {
  die_json(401, "Not logged in");
}

if (logout()) {
  header('Location: ../test_session.php?msg=Logged out');
} else {
  die_json(500, "Failed to logout");
}