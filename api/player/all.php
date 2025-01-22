<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$customization = isset($_REQUEST['customization']) && $_REQUEST['customization'] === 'true';
$players = Player::find_by_group($DB, "all", $customization);
api_write($players);