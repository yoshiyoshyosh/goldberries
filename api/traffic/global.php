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

$interval = isset($_GET['interval']) ? $_GET['interval'] : "all";
//Acceptable values: minute, hour, day, month, all (no interval)
if (!in_array($interval, ['minute', 'hour', 'day', 'month', 'all'])) {
  die_json(400, "Invalid interval value");
}
$select_interval_str = $interval === "all" ? "" : "date_trunc('$interval', \"date\" AT TIME ZONE 'UTC') as interval_date, ";
$group_by_interval_str = $interval === "all" ? "" : "GROUP BY interval_date";
$group_by_interval_pre = $interval === "all" ? "" : "interval_date, ";
$order_by_interval_str = $interval === "all" ? "" : "ORDER BY interval_date DESC";
$order_by_interval_pre = $interval === "all" ? "" : "interval_date DESC, ";


//Queries to implement:
//1. Count of user agents
//2. mobile vs. desktop usage
//3. Count of referrers
//4. Simple fields (avg. serve time, total requests, ...)

$response = [];

//===== 1. USER AGENTS =====
$query = "SELECT $select_interval_str user_agent, COUNT(*) as count FROM traffic $where_str GROUP BY $group_by_interval_pre user_agent ORDER BY $order_by_interval_pre count DESC";
$result = pg_query_params_or_die($DB, $query, []);
$response['user_agents'] = unpack_all_interval_response($interval, $result, false, "user_agent", "count");

//===== 2. MOBILE VS. DESKTOP =====
$query = "SELECT
	$select_interval_str
	COUNT(*) filter (WHERE user_agent ILIKE '%_mobile' AND user_agent NOT ILIKE 'bot_%') AS mobile,
	COUNT(*) filter (WHERE user_agent NOT ILIKE '%_mobile' AND user_agent IS NOT NULL AND user_agent NOT ILIKE 'bot_%') AS desktop,
	COUNT(*) filter (WHERE user_agent ILIKE 'bot_%') AS user_bots,
	COUNT(*) filter (WHERE user_agent IS NULL) AS unknown
FROM traffic
$where_str
$group_by_interval_str
$order_by_interval_str
";
$result = pg_query_params_or_die($DB, $query, []);
$response["device_usage"] = unpack_all_interval_response($interval, $result, true);

//===== 3. REFERRERS =====
$query = "SELECT
  $select_interval_str
	referrer,
  COUNT(*) AS count
FROM traffic
  WHERE (referrer NOT ILIKE '/%' OR referrer IS NULL) $where_cond
GROUP BY $group_by_interval_pre referrer
ORDER BY $order_by_interval_pre count DESC
";
$result = pg_query_params_or_die($DB, $query, []);
$response['referrers'] = unpack_all_interval_response($interval, $result, false, "referrer", "count");

//===== 4. SIMPLE FIELDS =====
$query = "SELECT
	$select_interval_str
	ROUND(AVG(serve_time)) AS avg_serve_time,
	COUNT(*) AS total_requests,
	COUNT(*) filter (WHERE referrer IS NULL) AS total_new_requests
FROM traffic
$where_str
$group_by_interval_str
$order_by_interval_str
";
$result = pg_query_params_or_die($DB, $query, []);
$response["basic"] = unpack_all_interval_response($interval, $result, true);


api_write($response, true);

function unpack_all_interval_response($interval, $result, $assoc = false, $key_key = null, $value_key = null)
{
  if ($interval === "all") {
    if ($assoc) {
      return pg_fetch_assoc($result);
    }
    return pg_fetch_all($result);
  }

  $ret = [];
  while ($row = pg_fetch_assoc($result)) {
    $interval_date = $row['interval_date'];
    unset($row['interval_date']);

    //Problem: if 2 group-by fields are used, the data has to be inserted into the previous row, unless the date changes
    //If only 1 group-by field is used, the data can just be inserted as a new row

    if ($assoc) {
      //1 group by
      $row['date'] = $interval_date;
      $ret[] = $row;
    } else {
      //2 group by's
      //Last row
      $size = count($ret);
      $key = $row[$key_key] ?? "null";
      $value = $row[$value_key];
      if ($size > 0 && $ret[$size - 1]['date'] === $interval_date) {
        $ret[$size - 1][$key] = $value;
      } else {
        $ret[] = [
          "date" => $interval_date,
          $key => $value
        ];
      }
    }
  }
  return $ret;
}