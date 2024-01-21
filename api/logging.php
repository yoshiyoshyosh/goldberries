<?php

require_once('api_bootstrap.inc.php');

$account = get_user_data();
if ($account === null || (!is_verifier($account) && !is_admin($account))) {
  die_json(403, "Not authorized");
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $time = $_REQUEST['time'] ?? "day";
  $level = $_REQUEST['level'] ?? null;
  $topic = $_REQUEST['topic'] ?? null;
  $search = $_REQUEST['search'] ?? null;

  $logs = Logging::get_all($DB, $time, $level, $topic, $search);
  if ($logs === false) {
    die_json(500, "Failed to get logs");
  }

  api_write($logs);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  $id = $_REQUEST['id'] ?? null;
  if ($id === null) {
    die_json(400, "Missing id");
  }

  $log = Logging::get_by_id($DB, $id);
  if ($log === false) {
    die_json(404, "Log not found");
  }

  if (!$log->delete($DB)) {
    die_json(500, "Failed to delete log");
  }

  http_response_code(200);
}
