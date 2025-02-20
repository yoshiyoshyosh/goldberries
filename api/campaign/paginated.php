<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$page = intval($_REQUEST['page']) === 0 ? 1 : intval($_REQUEST['page']);
$page = max(1, $page);
$per_page = intval($_REQUEST['per_page']) === 0 ? 50 : intval($_REQUEST['per_page']);
$per_page = max(1, min(1000, $per_page));
$search = isset($_REQUEST['search']) ? $_REQUEST['search'] : null;
$sort = isset($_REQUEST['sort']) ? $_REQUEST['sort'] : null;
$sort_dir = isset($_REQUEST['sort_dir']) ? $_REQUEST['sort_dir'] : null;
$depth = isset($_REQUEST['depth']) ? intval($_REQUEST['depth']) : 3;

$query = "SELECT * FROM view_campaigns";

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
$query .= " LIMIT " . $per_page . " OFFSET " . ($page - 1) * $per_page;

$result = pg_query_params_or_die($DB, $query);
$campaigns = parse_campaigns_flat($result);

//Extract maxCount
pg_result_seek($result, 0);
$maxCount = 0;
$row = pg_fetch_assoc($result);
if ($row) {
  $maxCount = intval($row['total_count']);
}

//Find the submission count for each challenge
//Step 1: Get all challenge IDs
$challenge_ids = [];
foreach ($campaigns as $campaign) {
  foreach ($campaign->maps as $map) {
    foreach ($map->challenges as $challenge) {
      $challenge_ids[] = $challenge->id;
    }
  }
  foreach ($campaign->challenges as $challenge) {
    $challenge_ids[] = $challenge->id;
  }
}

//Fetch the submission counts for each of those challenges
$where_str = count($challenge_ids) === 0 ? "0" : implode(',', $challenge_ids);
$query = "SELECT challenge_id, count(*) FROM submission WHERE challenge_id IN (" . $where_str . ") GROUP BY challenge_id";
$result = pg_query_params_or_die($DB, $query);

$count_submissions = [];
while ($row = pg_fetch_assoc($result)) {
  $count_submissions[$row['challenge_id']] = intval($row['count']);
}

//Assign the submission counts to the challenges
foreach ($campaigns as $campaign) {
  foreach ($campaign->maps as $map) {
    foreach ($map->challenges as $challenge) {
      $challenge->data['count_submissions'] = $count_submissions[$challenge->id] ?? 0;
    }
  }
  foreach ($campaign->challenges as $challenge) {
    $challenge->data['count_submissions'] = $count_submissions[$challenge->id] ?? 0;
  }
}

api_write(
  array(
    'campaigns' => $campaigns,
    'max_count' => $maxCount,
    'max_page' => ceil($maxCount / $per_page),
    'page' => $page,
    'per_page' => $per_page,
  )
);