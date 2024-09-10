<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$account = get_user_data();

$challenge = intval($_REQUEST['challenge']) === 0 ? null : intval($_REQUEST['challenge']);
if ($challenge === null) {
  die_json(400, "Missing required parameter 'challenge'");
}

$suggestion = Suggestion::get_last_placement_suggestion($DB, $challenge);

if ($suggestion === null) {
  die_json(404, "No suggestions yets");
}

api_write($suggestion);