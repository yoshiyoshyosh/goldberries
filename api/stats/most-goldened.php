<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Invalid request method');
}

$date = isset($_REQUEST['date']) ? $_REQUEST['date'] : null;
if ($date !== null && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
  die_json(400, 'Invalid date');
}
$time_filter = $date !== null ? "DATE_TRUNC('day', submission_date_created, 'UTC') AT TIME ZONE 'UTC' <= '$date'" : "TRUE";

$data = [
  "campaigns" => [],
  "maps" => [],
];

$cached_campaigns = [];

// ====== CAMPAIGNS ======
$query = "SELECT
  campaign_id,
  COUNT(*) AS submission_count
FROM view_submissions
WHERE (map_is_rejected = FALSE OR map_is_rejected IS NULL)
  AND submission_is_verified = TRUE
  AND $time_filter
GROUP BY
  campaign_id
ORDER BY submission_count DESC
LIMIT 300";
$result = pg_query($DB, $query);
if (!$result) {
  die_json(500, "Failed to query database");
}

$ids = [];
while ($row = pg_fetch_assoc($result)) {
  $id = intval($row['campaign_id']);
  $ids[] = $id;
  $data['campaigns'][] = [
    'campaign' => $id,
    'submission_count' => intval($row['submission_count']),
  ];
}
$campaigns = Campaign::get_many_by_id($DB, $ids);
foreach ($campaigns as $campaign) {
  //Find the entry in $data['campaigns'] that corresponds to this campaign and replace the id with the actual campaign
  $cached_campaigns[$campaign->id] = $campaign;
  foreach ($data['campaigns'] as &$entry) {
    if ($entry['campaign'] === $campaign->id) {
      $entry['campaign'] = $campaign;
      break;
    }
  }
}


// ====== MAPS ======
$query = "SELECT
  map_id,
  COUNT(*) AS submission_count
FROM view_submissions
WHERE ((challenge_is_arbitrary IS NULL AND objective_is_arbitrary = false) OR challenge_is_arbitrary = false)
  AND (map_is_rejected = FALSE OR map_is_rejected IS NULL)
  AND challenge_is_rejected = FALSE
  AND map_id IS NOT NULL
  AND submission_is_verified = TRUE
  AND $time_filter
GROUP BY
  map_id
ORDER BY submission_count DESC
LIMIT 300";
$result = pg_query($DB, $query);
if (!$result) {
  die_json(500, "Failed to query database");
}

$ids = [];
while ($row = pg_fetch_assoc($result)) {
  $id = intval($row['map_id']);
  $ids[] = $id;
  $data['maps'][] = [
    'map' => $id,
    'submission_count' => intval($row['submission_count']),
  ];
}
$maps = Map::get_many_by_id($DB, $ids);
foreach ($maps as $map) {
  if (!isset($cached_campaigns[$map->campaign_id])) {
    $map->expand_foreign_keys($DB, 5);
    $cached_campaigns[$map->campaign_id] = $map->campaign;
  } else {
    $map->campaign = $cached_campaigns[$map->campaign_id];
  }
  //Find the entry in $data['maps'] that corresponds to this map and replace the id with the actual map
  foreach ($data['maps'] as &$entry) {
    if ($entry['map'] === $map->id) {
      $entry['map'] = $map;
      break;
    }
  }
}

api_write($data);