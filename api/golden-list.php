<?php

require_once('api_bootstrap.inc.php');

$query = "
SELECT
  campaign.id AS campaign_id,
  campaign.name AS campaign_name,
  campaign.url AS campaign_url,
  campaign.date_added AS campaign_date_added,
  campaign.icon_url AS campaign_icon_url,
  campaign.sort_major_name AS campaign_sort_major_name,
  campaign.sort_major_labels AS campaign_sort_major_labels,
  campaign.sort_major_accent_colors AS campaign_sort_major_accent_colors,
  campaign.sort_minor_name AS campaign_sort_minor_name,
  campaign.sort_minor_labels AS campaign_sort_minor_labels,
  campaign.sort_minor_accent_colors AS campaign_sort_minor_accent_colors,
  campaign.authors AS campaign_authors,

  map.id AS map_id,
  map.name AS map_name,
  map.url AS map_url,
  map.side AS map_side,
  map.is_rejected AS map_is_rejected,
  map.rejection_reason AS map_rejection_reason,
  map.is_archived AS map_is_archived,
  map.campaign_id AS map_campaign_id,
  map.sort_major AS map_sort_major,
  map.sort_minor AS map_sort_minor,
  map.sort_order AS map_sort_order,
  map.date_added AS map_date_added,
  map.authors AS map_authors,

  challenge.id AS challenge_id,
  challenge.challenge_type AS challenge_challenge_type,
  challenge.campaign_id AS challenge_campaign_id,
  challenge.map_id AS challenge_map_id,
  challenge.objective_id AS challenge_objective_id,
  challenge.description AS challenge_description,
  challenge.difficulty_id AS challenge_difficulty_id,
  challenge.date_created AS challenge_date_created,
  challenge.requires_fc AS challenge_requires_fc,
  challenge.has_fc AS challenge_has_fc,
  challenge.requires_special AS challenge_requires_special,
  challenge.has_special AS challenge_has_special,

  cd.id AS difficulty_id,
  cd.name AS difficulty_name,
  cd.subtier AS difficulty_subtier,
  cd.sort AS difficulty_sort,
  cd.color AS difficulty_color,
  cd.color_group AS difficulty_color_group,

  objective.id AS objective_id,
  objective.name AS objective_name,
  objective.description AS objective_description,
  objective.display_name_suffix AS objective_display_name_suffix,
  objective.is_arbitrary AS objective_is_arbitrary,

  submission.id AS submission_id,
  submission.challenge_id AS submission_challenge_id,
  submission.player_id AS submission_player_id,
  submission.date_created AS submission_date_created,
  submission.is_fc AS submission_is_fc,
  submission.is_special AS submission_is_special,
  submission.proof_url AS submission_proof_url,
  submission.player_notes AS submission_player_notes,
  submission.suggested_difficulty_id AS submission_suggested_difficulty_id,
  submission.is_verified AS submission_is_verified,
  submission.verifier_id AS submission_verifier_id,
  submission.date_verified AS submission_date_verified,
  submission.verifier_notes AS submission_verifier_notes,

  p.id AS player_id,
  p.name AS player_name,
  p.password AS player_password,
  p.is_verifier AS player_is_verifier,
  p.is_admin AS player_is_admin,
  p.is_suspended AS player_is_suspended,
  p.suspension_reason AS player_suspension_reason,
  p.date_created AS player_date_created,

  v.id AS verifier_id,
  v.name AS verifier_name,
  v.password AS verifier_password,
  v.is_verifier AS verifier_is_verifier,
  v.is_admin AS verifier_is_admin,
  v.is_suspended AS verifier_is_suspended,
  v.suspension_reason AS verifier_suspension_reason,
  v.date_created AS verifier_date_created,

  pd.id AS suggested_difficulty_id,
  pd.name AS suggested_difficulty_name,
  pd.subtier AS suggested_difficulty_subtier,
  pd.sort AS suggested_difficulty_sort,
  pd.color AS suggested_difficulty_color,
  pd.color_group AS suggested_difficulty_color_group

FROM campaign
JOIN map  ON campaign.id = map.campaign_id
JOIN challenge  ON map.id = challenge.map_id
JOIN difficulty cd ON challenge.difficulty_id = cd.id
JOIN objective  ON challenge.objective_id = objective.id
JOIN submission  ON challenge.id = submission.challenge_id
JOIN player p ON p.id = submission.player_id
LEFT JOIN player v ON v.id = submission.verifier_id
LEFT JOIN difficulty pd ON submission.suggested_difficulty_id = pd.id
";

$where = "";
if (isset($_GET['campaign'])) {
  $where = "WHERE campaign.id = " . intval($_GET['campaign']);
} else if (isset($_GET['map'])) {
  $where = "WHERE map.id = " . intval($_GET['map']);
} else if (isset($_GET['challenge'])) {
  $where = "WHERE challenge.id = " . intval($_GET['challenge']);
} else if (isset($_GET['player'])) {
  $where = "WHERE p.id = " . intval($_GET['player']);
} else if (isset($_GET['verifier'])) {
  $where = "WHERE v.id = " . intval($_GET['verifier']);
}

$listWhere = "";
if (isset($_GET['hard'])) {
  $listWhere = "cd.id < 18"; //18 is Standard, id < 18 is everything tiered
} else if (isset($_GET['standard'])) {
  $listWhere = "cd.id = 18";
} else if (isset($_GET['undetermined'])) {
  $listWhere = "cd.id = 19";
}

if ($listWhere != "") {
  $where = $where . ($where === "" ? "WHERE " : " AND ") . $listWhere;
}
$query = $query . $where;

$result = pg_query($DB, $query) or die('Query failed: ' . pg_last_error());

$campaigns = array(); //dictionary id -> campaign

//loop through result rows
while ($row = pg_fetch_assoc($result)) {
  $campaign_id = intval($row['campaign_id']);
  if (!array_key_exists($campaign_id, $campaigns)) {
    $campaign = new Campaign();
    $campaign->apply_db_data($row, "campaign_");
    $campaign->maps = array();
    $campaigns[$campaign_id] = $campaign;
  }
  $campaign = $campaigns[$campaign_id];

  $map_id = intval($row['map_id']);
  if (!array_key_exists($map_id, $campaign->maps)) {
    $map = new Map();
    $map->apply_db_data($row, "map_");
    $map->challenges = array();
    $campaign->maps[$map_id] = $map;
  }
  $map = $campaign->maps[$map_id];

  $challenge_id = intval($row['challenge_id']);
  if (!array_key_exists($challenge_id, $map->challenges)) {
    $challenge = new Challenge();
    $challenge->apply_db_data($row, "challenge_");
    $challenge->submissions = array();
    $challenge->expand_from_sql_result($row, ["campaign", "map"]);
    $map->challenges[$challenge_id] = $challenge;
  }
  $challenge = $map->challenges[$challenge_id];

  $submission = new Submission();
  $submission->apply_db_data($row, "submission_");
  $submission->expand_from_sql_result($row, ["challenge"]);
  $challenge->submissions[$submission->id] = $submission;
}

foreach ($campaigns as $campaign) {
  foreach ($campaign->maps as $map) {
    foreach ($map->challenges as $challenge) {
      $challenge->submissions = array_values($challenge->submissions);
    }
    $map->challenges = array_values($map->challenges);
  }
  $campaign->maps = array_values($campaign->maps);
}
$campaigns = array_values($campaigns);

api_write($campaigns);