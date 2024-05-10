<?php

require_once ('../api_bootstrap.inc.php');

$account = get_user_data();

if ($account == null) {
  die_json(401, "Not logged in");
}

$account->expand_foreign_keys($DB, 3);
$account->remove_sensitive_info(false);
api_write($account);