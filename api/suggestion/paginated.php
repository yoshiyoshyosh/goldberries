<?php

require_once ('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$account = get_user_data();

$page = intval($_REQUEST['page']) <= 0 ? 1 : intval($_REQUEST['page']);
$per_page = intval($_REQUEST['per_page']) <= 0 ? 20 : intval($_REQUEST['per_page']);
$challenge = intval($_REQUEST['challenge']) === 0 ? null : intval($_REQUEST['challenge']);
$expired = $_REQUEST['expired'] === 'true' ? true : ($_REQUEST['expired'] === 'false' ? false : null);
$type = isset($_REQUEST['type']) ? $_REQUEST['type'] : "all";

$suggestions = Suggestion::get_paginated($DB, $page, $per_page, $challenge, $expired, $account, $type);

api_write($suggestions);
exit();