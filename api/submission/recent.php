<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$verified = !isset($_REQUEST['verified']) ? null : $_REQUEST['verified'] === "true";
$page = isset($_REQUEST['page']) ? intval($_REQUEST['page']) : 1;
$page = max(1, $page);
$per_page = isset($_REQUEST['per_page']) ? intval($_REQUEST['per_page']) : 10;
$per_page = max(1, min(1000, $per_page));
$search = isset($_REQUEST['search']) ? $_REQUEST['search'] : null;
$player = isset($_REQUEST['player']) ? intval($_REQUEST['player']) : null;
$result = Submission::get_recent_submissions($DB, $verified, $page, $per_page, $search, $player);
api_write($result);