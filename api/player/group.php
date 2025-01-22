<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$group = $_REQUEST['group'] ?? null;
if ($group === null) {
  die_json(400, "Missing paramter 'group'");
}

$players = Player::find_by_group($DB, $group);
if ($players === false) {
  die_json(400, "Invalid group");
}
api_write($players);