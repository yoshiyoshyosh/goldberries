<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

//Ugly, but needed to prevent sql injection
$valid_sorts = ["campaign_id", "campaign_name", "campaign_url", "campaign_date_added", "campaign_icon_url", "campaign_sort_major_name", "campaign_sort_major_labels", "campaign_sort_major_colors", "campaign_sort_minor_name", "campaign_sort_minor_labels", "campaign_sort_minor_colors", "campaign_author_gb_id", "campaign_author_gb_name", "campaign_note", "map_id", "map_campaign_id", "map_name", "map_url", "map_date_added", "map_is_rejected", "map_rejection_reason", "map_is_archived", "map_sort_major", "map_sort_minor", "map_sort_order", "map_author_gb_id", "map_author_gb_name", "map_note", "map_collectibles", "map_golden_changes", "map_counts_for_id", "for_map_id", "for_map_campaign_id", "for_map_name", "for_map_url", "for_map_date_added", "for_map_is_rejected", "for_map_rejection_reason", "for_map_is_archived", "for_map_sort_major", "for_map_sort_minor", "for_map_sort_order", "for_map_author_gb_id", "for_map_author_gb_name", "for_map_note", "for_map_collectibles", "for_map_golden_changes", "for_map_counts_for_id", "challenge_id", "challenge_campaign_id", "challenge_map_id", "challenge_objective_id", "challenge_label", "challenge_description", "challenge_difficulty_id", "challenge_date_created", "challenge_requires_fc", "challenge_has_fc", "challenge_is_arbitrary", "challenge_sort", "challenge_icon_url", "challenge_is_rejected", "difficulty_id", "difficulty_name", "difficulty_subtier", "difficulty_sort", "objective_id", "objective_name", "objective_description", "objective_display_name_suffix", "objective_is_arbitrary", "objective_icon_url", "count_submissions"];

$page = intval($_REQUEST['page']) === 0 ? 1 : intval($_REQUEST['page']);
$page = max(1, $page);
$per_page = intval($_REQUEST['per_page']) === 0 ? 50 : intval($_REQUEST['per_page']);
$per_page = max(1, min(1000, $per_page));
$search = isset($_REQUEST['search']) ? $_REQUEST['search'] : null;
$sort = isset($_REQUEST['sort']) ? $_REQUEST['sort'] : null;
$sort_dir = isset($_REQUEST['sort_dir']) ? strtolower($_REQUEST['sort_dir']) : null;
$depth = 3;

$query = "SELECT * FROM view_challenges";

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

if ($per_page !== -1) {
  $query .= " LIMIT " . $per_page . " OFFSET " . ($page - 1) * $per_page;
}

$result = pg_query_params_or_die($DB, $query);

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