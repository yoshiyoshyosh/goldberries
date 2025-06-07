<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, "Not supported by this endpoint");
}

$id = $_REQUEST['id'] ?? null;
if ($id === null) {
  die_json(400, "Missing id");
}

$player = Player::get_by_id($DB, $id);
if ($player === false) {
  die_json(404, "Player not found");
}

$badges = Badge::get_all_for_player($DB, $id);
api_write($badges);