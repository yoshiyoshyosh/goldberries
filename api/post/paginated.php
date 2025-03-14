<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$page = intval($_REQUEST['page']) === 0 ? 1 : intval($_REQUEST['page']);
$page = max(1, $page);
$per_page = intval($_REQUEST['per_page']) === 0 ? 15 : intval($_REQUEST['per_page']);
$per_page = max(1, min(100, $per_page));
$search = isset($_REQUEST['search']) ? $_REQUEST['search'] : null;
$author_id = isset($_REQUEST['author_id']) ? intval($_REQUEST['author_id']) : null;

if (!isset($_REQUEST['type'])) {
  die_json(400, 'Missing type');
} else if (!in_array($_REQUEST['type'], Post::$TYPES)) {
  die_json(400, 'Invalid type');
}
$type = $_REQUEST['type'];

$response = Post::get_paginated($DB, $page, $per_page, $type, $search, $author_id);
api_write($response);