<?php

require_once('../api_bootstrap.inc.php');

$account = get_user_data();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $settings = ServerSettings::get_settings($DB);
  api_write($settings);
  exit();
}

// ===== POST Request =====
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  check_access($account, true);

  if (!is_admin($account)) {
    die_json(403, 'Not Authorized');
  }

  $data = format_assoc_array_bools(parse_post_body_as_json());
  $settings = new ServerSettings();
  $settings->apply_db_data($data);
  $settings->id = 1; //Just in case that the frontend ever not sends an id

  if ($settings->update($DB)) {
    api_write($settings);
  } else {
    die_json(500, "Failed to update ServerSettings");
  }
}

// ===== DELETE Request =====
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  die_json(405, 'Method Not Allowed');
}
