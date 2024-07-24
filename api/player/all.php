<?php

require_once ('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$customization = isset($_REQUEST['customization']) && $_REQUEST['customization'] === 'true';
$players = Player::get_request($DB, "all", 2, $customization); //$depth of 2 to avoid fetching all accounts
api_write($players);
exit();