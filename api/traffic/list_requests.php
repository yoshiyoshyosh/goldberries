<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$account = get_user_data();
check_access($account, true);
if (!is_admin($account)) {
  die_json(403, "Forbidden");
}

//Time filters
$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : null;
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : null;
$where = [];
if ($start_date !== null) {
  //Validate date to be in ISO format: 2024-10-19T22:00:00.000Z
  if (!preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/', $start_date)) {
    die_json(400, "Invalid start_date format");
  }
  $where[] = "\"date\" AT TIME ZONE 'UTC' >= '$start_date'";
}
if ($end_date !== null) {
  if (!preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/', $end_date)) {
    die_json(400, "Invalid end_date format");
  }
  $where[] = "\"date\" AT TIME ZONE 'UTC' <= '$end_date'";
}
$where_str = count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "";
$where_cond = count($where) > 0 ? "AND " . implode(" AND ", $where) : "";


$response = []; //{ last_requests: [], most_requested: [] }

$query = "SELECT * FROM traffic $where_str ORDER BY date DESC LIMIT 500";
$result = pg_query_params_or_die($DB, $query, []);
$response['last_requests'] = pg_fetch_all($result);


$query = "SELECT page, COUNT(*) as count FROM traffic $where_str GROUP BY page ORDER BY count DESC LIMIT 100";
$result = pg_query_params_or_die($DB, $query, []);
$response['most_requested'] = pg_fetch_all($result);

api_write($response, true);