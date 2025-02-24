<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Invalid Request Method');
}

$month = isset($_REQUEST['month']) ? $_REQUEST['month'] : null;
if ($month !== null && !preg_match('/^\d{4}-\d{2}$/', $month)) {
  die_json(400, 'Invalid month');
}

$time_filter = $month === null ? "" : "WHERE date_trunc('month', map.date_added, 'UTC') < '$month-01' ";
$time_filter_added = $month === null ? "" : "WHERE date_trunc('month', date_added, 'UTC') < '$month-01' ";
$time_filter_created = $month === null ? "" : "WHERE date_trunc('month', date_created, 'UTC') < '$month-01' ";
$time_filter_achieved = $month === null ? "" : "WHERE date_trunc('month', date_achieved, 'UTC') < '$month-01' ";

$query = "
SELECT
(SELECT COUNT(*) FROM campaign $time_filter_added) AS count_campaigns,
(SELECT COUNT(*) FROM map $time_filter_added) AS count_maps,
(SELECT COUNT(*) FROM challenge $time_filter_created) AS count_challenge,
(SELECT COUNT(*) FROM submission $time_filter_achieved) AS count_submission,
(SELECT COUNT(*) FROM player) AS count_players,
(SELECT COUNT(*) AS real_campaign_count
FROM (SELECT
COUNT(*) AS map_count
FROM map
JOIN campaign ON map.campaign_id = campaign.id
$time_filter
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
WHERE $time_filter AND (map.is_rejected = FALSE OR map.is_rejected IS NULL) AND challenge.is_rejected = FALSE AND submission.is_verified = TRUE
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