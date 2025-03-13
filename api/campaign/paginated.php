<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

//Ugly, but needed to prevent sql injection
$valid_sorts = ["campaign_id", "campaign_name", "campaign_url", "campaign_date_added", "campaign_icon_url", "campaign_sort_major_name", "campaign_sort_major_labels", "campaign_sort_major_colors", "campaign_sort_minor_name", "campaign_sort_minor_labels", "campaign_sort_minor_colors", "campaign_author_gb_id", "campaign_author_gb_name", "campaign_note", "map_id", "map_campaign_id", "map_name", "map_url", "map_date_added", "map_is_rejected", "map_rejection_reason", "map_is_archived", "map_sort_major", "map_sort_minor", "map_sort_order", "map_author_gb_id", "map_author_gb_name", "map_note", "map_collectibles", "map_golden_changes", "map_counts_for_id", "for_map_id", "for_map_campaign_id", "for_map_name", "for_map_url", "for_map_date_added", "for_map_is_rejected", "for_map_rejection_reason", "for_map_is_archived", "for_map_sort_major", "for_map_sort_minor", "for_map_sort_order", "for_map_author_gb_id", "for_map_author_gb_name", "for_map_note", "for_map_collectibles", "for_map_golden_changes", "for_map_counts_for_id", "challenge_id", "challenge_campaign_id", "challenge_map_id", "challenge_objective_id", "challenge_label", "challenge_description", "challenge_difficulty_id", "challenge_date_created", "challenge_requires_fc", "challenge_has_fc", "challenge_is_arbitrary", "challenge_sort", "challenge_icon_url", "challenge_is_rejected", "difficulty_id", "difficulty_name", "difficulty_subtier", "difficulty_sort", "objective_id", "objective_name", "objective_description", "objective_display_name_suffix", "objective_is_arbitrary", "objective_icon_url"];

$page = intval($_REQUEST['page']) === 0 ? 1 : intval($_REQUEST['page']);
$page = max(1, $page);
$per_page = intval($_REQUEST['per_page']) === 0 ? 50 : intval($_REQUEST['per_page']);
$per_page = max(1, min(1000, $per_page));
$search = isset($_REQUEST['search']) ? $_REQUEST['search'] : null;
$sort = isset($_REQUEST['sort']) ? $_REQUEST['sort'] : null;
$sort_dir = isset($_REQUEST['sort_dir']) ? strtolower($_REQUEST['sort_dir']) : null;
$depth = 3;

$query = "SELECT * FROM view_campaigns";

if ($search !== null) {
  $search = pg_escape_string($search);
  $query .= " WHERE campaign_name ILIKE '%" . $search . "%' OR map_name ILIKE '%" . $search . "%'";
}

if ($sort !== null) {
  if (!in_array($sort, $valid_sorts)) {
    die_json(400, "Invalid sort");
  }
  $query .= " ORDER BY " . $sort;
  if ($sort_dir !== null) {
    if ($sort_dir !== 'asc' && $sort_dir !== 'desc') {
      die_json(400, "Invalid sort_dir");
    }
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