<?php

require_once('api_bootstrap.inc.php');

$account = get_user_data();
if ($account === null || (!is_verifier($account) && !is_admin($account))) {
  die_json(403, "Not authorized");
}

$last = $_REQUEST['last'] ?? "day";
$level = $_REQUEST['level'] ?? null;
$topic = $_REQUEST['topic'] ?? null;
$search = $_REQUEST['search'] ?? null;

$logs = Logging::get_all($DB, $last, $level, $topic, $search);
if ($logs === false) {
  die_json(500, "Failed to get logs");
}

api_write($logs);