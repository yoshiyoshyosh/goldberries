<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Invalid Request Method');
}

$month = isset($_REQUEST['month']) ? $_REQUEST['month'] : null;
if ($month !== null && !preg_match('/^\d{4}-\d{2}$/', $month)) {
  die_json(400, 'Invalid month');
}

$where_campaign = "";
$where_map = "WHERE 1 = 1";
$where_challenge = "WHERE challenge.is_rejected = FALSE";
$where_submission = "WHERE submission.is_verified = TRUE";

if ($month !== null) {
  $where_campaign = "WHERE date_trunc('month', campaign.date_added, 'UTC') < '$month-01'";
  $where_map .= " AND date_trunc('month', map.date_added, 'UTC') < '$month-01'";
  $where_challenge .= " AND date_trunc('month', challenge.date_created, 'UTC') < '$month-01'";
  $where_submission .= " AND date_trunc('month', submission.date_achieved, 'UTC') < '$month-01'";
}

$query = "
SELECT
(SELECT COUNT(*) FROM campaign $where_campaign) AS count_campaigns,
(SELECT COUNT(*) FROM map $where_map) AS count_maps,
(SELECT COUNT(*) FROM challenge $where_challenge) AS count_challenge,
(SELECT COUNT(*) FROM submission $where_submission) AS count_submission,
(SELECT COUNT(*) FROM player) AS count_players,
(SELECT COUNT(*) AS real_campaign_count
FROM (SELECT
COUNT(*) AS map_count
FROM map
JOIN campaign ON map.campaign_id = campaign.id
$where_map
GROUP BY campaign.id
HAVING COUNT(*) > 1) AS real_campaigns) AS real_campaign_count
";
$result = pg_query($DB, $query);
$row = pg_fetch_assoc($result);

$overall_stats = array();
$overall_stats['campaigns'] = intval($row['count_campaigns']);
$overall_stats['maps'] = intval($row['count_maps']);
$overall_stats['challenges'] = intval($row['count_challenge']);
$overall_stats['submissions'] = intval($row['count_submission']);
$overall_stats['players'] = intval($row['count_players']);
$overall_stats['real_campaigns'] = intval($row['real_campaign_count']);


$time_filter = $month === null ? "1 = 1" : "date_trunc('month', submission.date_achieved, 'UTC') < '$month-01'::date + INTERVAL '1 month'";
$query = "SELECT
difficulty.id,
COUNT(submission.id) AS count_submissions
FROM submission
JOIN challenge ON submission.challenge_id = challenge.id
LEFT JOIN map ON challenge.map_id = map.id
JOIN difficulty ON challenge.difficulty_id = difficulty.id
WHERE $time_filter AND challenge.is_rejected = FALSE AND submission.is_verified = TRUE
GROUP BY difficulty.id
ORDER BY difficulty.id";
$result = pg_query($DB, $query);
$difficulty_stats = array();

while ($row = pg_fetch_assoc($result)) {
  $difficulty = intval($row['id']);
  $count = intval($row['count_submissions']);
  $difficulty_stats[$difficulty] = $count;
}

api_write(
  array(
    "overall" => $overall_stats,
    "difficulty" => $difficulty_stats
  )
);