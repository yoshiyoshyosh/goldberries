<?php

require_once ('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$page = intval($_REQUEST['page']) ?? 1;
$per_page = intval($_REQUEST['per_page']) ?? 50;
$search = isset($_REQUEST['search']) ? $_REQUEST['search'] : null;
$sort = isset($_REQUEST['sort']) ? $_REQUEST['sort'] : null;
$sort_dir = isset($_REQUEST['sort_dir']) ? $_REQUEST['sort_dir'] : null;
$depth = isset($_REQUEST['depth']) ? intval($_REQUEST['depth']) : 3;

$query = "SELECT * FROM view_challenges";

if ($search !== null) {
  $search = pg_escape_string($search);
  $query .= " WHERE campaign_name ILIKE '%" . $search . "%' OR map_name ILIKE '%" . $search . "%'";
}

if ($sort !== null) {
  $sort = pg_escape_string($sort);
  $query .= " ORDER BY " . $sort;
  if ($sort_dir !== null) {
    $sort_dir = pg_escape_string($sort_dir);
    $query .= " " . $sort_dir;
  }
}

$query = "
    WITH challenges AS (
      " . $query . "
    )
    SELECT *, count(*) OVER () AS total_count
    FROM challenges";

if ($per_page !== -1) {
  $query .= " LIMIT " . $per_page . " OFFSET " . ($page - 1) * $per_page;
}

$result = pg_query($DB, $query);
if (!$result) {
  die_json(500, "Failed to query database");
}

$maxCount = 0;
$challenges = array();
while ($row = pg_fetch_assoc($result)) {
  $challenge = new Challenge();
  $challenge->apply_db_data($row, "challenge_");
  $challenge->expand_foreign_keys($row, $depth);
  $challenges[] = $challenge;

  $challenge->data = array(
    'count_submissions' => intval($row['count_submissions']),
  );

  if ($maxCount === 0) {
    $maxCount = intval($row['total_count']);
  }
}

api_write(
  array(
    'challenges' => $challenges,
    'max_count' => $maxCount,
    'max_page' => ceil($maxCount / $per_page),
    'page' => $page,
    'per_page' => $per_page,
  )
);