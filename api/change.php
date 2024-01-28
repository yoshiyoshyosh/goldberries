<?php

require_once('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, "Only GET requests are supported");
}

$type = $_REQUEST['type'] ?? null;
if ($type === null) {
  die_json(400, "Missing parameter 'type'");
} else if ($type !== "campaign" && $type !== "map" && $type !== "challenge" && $type !== "player") {
  die_json(400, "Parameter 'type' must be one of (campaign, map, challenge, player)");
}

$id = $_REQUEST['id'] ?? null;
if ($id === null) {
  die_json(400, "Missing parameter 'id'");
}

$changes = Change::get_all_for_object($DB, $type, $id);
if ($changes === false) {
  die_json(500, "Failed to query database");
}

api_write($changes);