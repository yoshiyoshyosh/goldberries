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


//Queries to implement:
//1. Count of user agents
//2. mobile vs. desktop usage
//3. Count of referrers
//4. List of most requested pages (top 100)
//5. Avg. serve time

$response = [];

//===== 1. USER AGENTS =====
$query = "SELECT user_agent, COUNT(*) as count FROM traffic $where_str GROUP BY user_agent ORDER BY count DESC";
$result = pg_query_params_or_die($DB, $query, []);
$response['user_agents'] = pg_fetch_all($result);

//===== 2. MOBILE VS. DESKTOP =====
$query = "SELECT
	(SELECT COUNT(*) FROM traffic WHERE user_agent ILIKE '%_mobile' AND user_agent NOT ILIKE 'bot_%' $where_cond) AS mobile,
	(SELECT COUNT(*) FROM traffic WHERE user_agent NOT ILIKE '%_mobile' AND user_agent IS NOT NULL AND user_agent NOT ILIKE 'bot_%' $where_cond) AS desktop,
	(SELECT COUNT(*) FROM traffic WHERE user_agent ILIKE 'bot_%' $where_cond) AS user_bots,
	(SELECT COUNT(*) FROM traffic WHERE user_agent IS NULL $where_cond) AS unknown
";
$result = pg_query_params_or_die($DB, $query, []);
$response['device_usage'] = pg_fetch_assoc($result);

//===== 3. REFERRERS =====
$query = "SELECT
	referrer,
   COUNT(*) AS count
FROM traffic
  WHERE (referrer NOT ILIKE '/%' OR referrer IS NULL) $where_cond
GROUP BY  traffic.referrer
ORDER BY count DESC
";
$result = pg_query_params_or_die($DB, $query, []);
$response['referrers'] = pg_fetch_all($result);

//===== 4. MOST REQUESTED PAGES =====
$query = "SELECT page, COUNT(*) AS count FROM traffic $where_str GROUP BY traffic.page ORDER BY count DESC LIMIT 100";
$result = pg_query_params_or_die($DB, $query, []);
$response['most_requested_pages'] = pg_fetch_all($result);

//===== 5. AVG. SERVE TIME =====
$query = "SELECT ROUND(AVG(serve_time)) AS avg_serve_time FROM traffic $where_str";
$result = pg_query_params_or_die($DB, $query, []);
$response['avg_serve_time'] = pg_fetch_assoc($result);


api_write($response, true);