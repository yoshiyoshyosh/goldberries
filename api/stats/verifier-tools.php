<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$account = get_user_data();
if ($account === null) {
  die_json(401, "Not logged in");
} else if (!is_helper($account)) {
  die_json(403, "Forbidden");
}

$query = "
SELECT
  (SELECT COUNT(*) FROM submission WHERE is_verified IS NULL) AS submissions_in_queue,
  (SELECT COUNT(*) FROM account WHERE claimed_player_id IS NOT NULL) AS open_player_claims,
  (SELECT COUNT(*) FROM suggestion WHERE is_verified IS NULL) AS pending_suggestions
";
$result = pg_query($DB, $query);
if (!$result) {
  die_json(500, "Could not query database");
}

$row = pg_fetch_assoc($result);
api_write($row);