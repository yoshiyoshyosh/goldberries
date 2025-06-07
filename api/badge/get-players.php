<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, "Not supported by this endpoint");
}

$id = $_REQUEST['id'] ?? null;
if ($id === null) {
  die_json(400, "Missing id");
}

$badge = Badge::get_by_id($DB, $id);
if ($badge === false) {
  die_json(404, "Badge not found");
}

$badges = BadgePlayer::get_all_for_badge($DB, $id);
api_write($badges);