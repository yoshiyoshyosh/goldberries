<?php

require_once ('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$type = $_REQUEST['type'] ?? null;
if ($type === null) {
  die_json(400, "Missing parameter 'type'");
} else if ($type !== "campaign" && $type !== "map" && $type !== "challenge" && $type !== "player" && $type !== "all") {
  die_json(400, "Parameter 'type' must be one of (campaign, map, challenge, player, all)");
}

$page = intval($_REQUEST['page']) === 0 ? 1 : intval($_REQUEST['page']);
$per_page = intval($_REQUEST['per_page']) === 0 ? 50 : intval($_REQUEST['per_page']);

$logs = Change::get_paginated($DB, $page, $per_page, $type);

api_write($logs);