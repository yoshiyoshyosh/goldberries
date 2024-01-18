<?php

require_once('api_bootstrap.inc.php');

$account = get_user_data();
if ($account === null || (!is_admin($account))) {
  die_json(403, "Not authorized");
}

$id = $_REQUEST['id'] ?? null;
if ($id === null) {
  if (isset($_GET['all'])) {
    $id = "all";
  } else {
    die_json(400, "Missing id");
  }
}

$accounts = Account::get_request($DB, $id);
api_write($accounts);