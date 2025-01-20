<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$account = get_user_data();
check_access($account, false);
if (!is_admin($account)) {
  die_json(403, "Not authorized");
}

//List all difficulty suggestions for challenges that are in tier 7 and high standard
$query = "SELECT submission.id as submission_id, submission.suggested_difficulty_id, submission.is_personal 
FROM submission 
  JOIN challenge ON submission.challenge_id = challenge.id
  JOIN difficulty ON challenge.difficulty_id = difficulty.id
WHERE difficulty.id IN (3, 4)
ORDER BY submission.id";

$result = pg_query_params_or_die($DB, $query, []);
$suggestions = pg_fetch_all($result);

api_write($suggestions, true);