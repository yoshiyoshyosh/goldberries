<?php

require_once ('../api_bootstrap.inc.php');

$account = get_user_data();

// ===== GET Request =====
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  if ($account === null || (!is_verifier($account) && !is_admin($account))) {
    die_json(403, "Not authorized");
  }

  if (isset($_REQUEST['page'])) {
    $page = intval($_REQUEST['page']) ?? 1;
    $per_page = intval($_REQUEST['per_page']) ?? 50;
    $level = $_REQUEST['level'] ?? null;
    $topic = $_REQUEST['topic'] ?? null;
    $search = $_REQUEST['search'] ?? null;
    $start_date = $_REQUEST['start_date'] ?? null;
    $end_date = $_REQUEST['end_date'] ?? null;

    $logs = Logging::get_paginated($DB, $page, $per_page, $level, $topic, $search, $start_date, $end_date);

    api_write($logs);
    exit();
  }
}

// ===== DELETE Request =====
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  if ($account === null || (!is_admin($account))) {
    die_json(403, "Not authorized");
  }

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
