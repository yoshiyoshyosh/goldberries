<?php

require_once('../api_bootstrap.inc.php');

$account = get_user_data();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  die_json(405, 'Method Not Allowed');
}

// ===== POST Request =====
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  check_access($account, true);

  if (!is_helper($account)) {
    die_json(403, 'Not Authorized');
  }

  $data = format_assoc_array_bools(parse_post_body_as_json());
  $notice = new VerificationNotice();
  $notice->apply_db_data($data);

  $notice->verifier_id = $account->player->id;
  $submission = Submission::get_by_id($DB, $notice->submission_id);
  if ($submission === false) {
    die_json(400, "Submission not found");
  }
  if ($submission->is_verified !== null) {
    die_json(400, "Submission has already been verified");
  }

  if ($notice->insert($DB)) {
    $notice->expand_foreign_keys($DB, 5);
    api_write($notice);
  } else {
    die_json(500, "Failed to create VerificationNotice");
  }
}

// ===== DELETE Request =====
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  check_access($account, true);

  if (!is_helper($account)) {
    die_json(403, 'Not Authorized');
  }

  $id = $_REQUEST['id'] ?? null;
  if ($id === null) {
    die_json(400, "Missing id");
  }

  $notice = VerificationNotice::get_by_id($DB, $id);
  if ($notice === false) {
    die_json(404, "VerificationNotice not found");
  }

  if (!$notice->delete($DB)) {
    die_json(500, "Failed to delete VerificationNotice");
  }

  log_info("{$notice} was removed by '{$account->player->name}'", "VerificationNotice");
  http_response_code(200);
}
