<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$type = $_GET['type'] ?? null;
if ($type === null) {
  die_json(400, "Missing 'type' parameter");
}
if (!in_array($type, ['challenge', 'map', 'campaign', 'difficulty', 'player', 'submission'])) {
  die_json(400, "Invalid 'type' parameter");
}

$count = isset($_REQUEST["count"]) ? intval($_REQUEST["count"]) : 1;
$count = max(1, min(100, $count));

$query = "SELECT * FROM {$type} ORDER BY RANDOM() LIMIT {$count}";
$result = pg_query($DB, $query);

$skel = null;
if ($type === 'challenge')
  $skel = new Challenge();
if ($type === 'map')
  $skel = new Map();
if ($type === 'campaign')
  $skel = new Campaign();
if ($type === 'difficulty')
  $skel = new Difficulty();
if ($type === 'player')
  $skel = new Player();
if ($type === 'submission')
  $skel = new Submission();

$objects = array();
while ($row = pg_fetch_assoc($result)) {
  $obj = clone $skel;
  $obj->apply_db_data($row);
  $obj->expand_foreign_keys($DB, 5);
  $objects[] = $obj;
}
api_write($objects);