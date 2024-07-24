<?php

require_once ('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$account = get_user_data();
if ($account === null) {
  die_json(401, "Not logged in");
}
if (!is_verifier($account)) {
  die_json(403, "Not authorized");
}

$accounts = Account::get_all_player_claims($DB);
foreach ($accounts as $account) {
  $account->expand_foreign_keys($DB, 2);
  $account->remove_sensitive_info();
}
api_write($accounts);
exit();