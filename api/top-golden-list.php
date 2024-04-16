<?php

require_once ('api_bootstrap.inc.php');

$query = "
SELECT                                                                   
  campaign.id AS campaign_id,                                            
  campaign.name AS campaign_name,                                        
  campaign.url AS campaign_url,                                          
  campaign.date_added AS campaign_date_added,                            
  campaign.icon_url AS campaign_icon_url,                                
  campaign.sort_major_name AS campaign_sort_major_name,                  
  campaign.sort_major_labels AS campaign_sort_major_labels,              
  campaign.sort_major_colors AS campaign_sort_major_colors,
  campaign.sort_minor_name AS campaign_sort_minor_name,                  
  campaign.sort_minor_labels AS campaign_sort_minor_labels,              
  campaign.sort_minor_colors AS campaign_sort_minor_colors,
  campaign.author_gb_id AS campaign_author_gb_id,                        
  campaign.author_gb_name AS campaign_author_gb_name,                    
                                                                         
  map.id AS map_id,                                                      
  map.campaign_id AS map_campaign_id,                                    
  map.name AS map_name,                                                  
  map.url AS map_url,                                                    
  map.date_added AS map_date_added,                                      
  map.is_rejected AS map_is_rejected,                                    
  map.rejection_reason AS map_rejection_reason,
  map.is_archived AS map_is_archived,
  map.has_fc AS map_has_fc,
  map.sort_major AS map_sort_major,
  map.sort_minor AS map_sort_minor,
  map.sort_order AS map_sort_order,
  map.author_gb_id AS map_author_gb_id,
  map.author_gb_name AS map_author_gb_name,

  challenge.id AS challenge_id,
  challenge.campaign_id AS challenge_campaign_id,
  challenge.map_id AS challenge_map_id,
  challenge.objective_id AS challenge_objective_id,
  challenge.description AS challenge_description,
  challenge.difficulty_id AS challenge_difficulty_id,
  challenge.date_created AS challenge_date_created,
  challenge.requires_fc AS challenge_requires_fc,
  challenge.has_fc AS challenge_has_fc,
  challenge.is_arbitrary AS challenge_is_arbitrary,
  challenge.sort AS challenge_sort,

  cd.id AS difficulty_id,
  cd.name AS difficulty_name,
  cd.subtier AS difficulty_subtier,
  cd.sort AS difficulty_sort,

  objective.id AS objective_id,
  objective.name AS objective_name,
  objective.description AS objective_description,
  objective.display_name_suffix AS objective_display_name_suffix,
  objective.is_arbitrary AS objective_is_arbitrary,
  objective.icon_url AS objective_icon_url,

  submission.id AS submission_id,
  submission.challenge_id AS submission_challenge_id,
  submission.player_id AS submission_player_id,
  submission.date_created AS submission_date_created,
  submission.is_fc AS submission_is_fc,
  submission.proof_url AS submission_proof_url,
  submission.raw_session_url AS submission_raw_session_url,
  submission.player_notes AS submission_player_notes,
  submission.suggested_difficulty_id AS submission_suggested_difficulty_id,
  submission.is_verified AS submission_is_verified,
  submission.date_verified AS submission_date_verified,
  submission.verifier_notes AS submission_verifier_notes,
  submission.verifier_id AS submission_verifier_id,
  submission.new_challenge_id AS submission_new_challenge_id,

  p.id AS player_id,
  p.name AS player_name,
  pa.is_verifier AS player_account_is_verifier,
  pa.is_admin AS player_account_is_admin,
  pa.is_suspended AS player_account_is_suspended,
  pa.suspension_reason AS player_account_suspension_reason,
  pa.name_color_start AS player_account_name_color_start,
  pa.name_color_end AS player_account_name_color_end,

  v.id AS verifier_id,
  v.name AS verifier_name,
  va.is_verifier AS verifier_account_is_verifier,
  va.is_admin AS verifier_account_is_admin,
  va.is_suspended AS verifier_account_is_suspended,
  va.suspension_reason AS verifier_account_suspension_reason,
  va.name_color_start AS verifier_account_name_color_start,
  va.name_color_end AS verifier_account_name_color_end,

  pd.id AS suggested_difficulty_id,
  pd.name AS suggested_difficulty_name,
  pd.subtier AS suggested_difficulty_subtier,
  pd.sort AS suggested_difficulty_sort

FROM campaign
JOIN map  ON campaign.id = map.campaign_id
JOIN challenge  ON map.id = challenge.map_id
JOIN difficulty cd ON challenge.difficulty_id = cd.id
JOIN objective  ON challenge.objective_id = objective.id
JOIN submission  ON challenge.id = submission.challenge_id
JOIN player p ON p.id = submission.player_id
LEFT JOIN player v ON v.id = submission.verifier_id
LEFT JOIN difficulty pd ON submission.suggested_difficulty_id = pd.id
LEFT JOIN account pa ON p.id = pa.player_id
LEFT JOIN account va ON v.id = va.player_id
";

$where = "WHERE submission.is_verified = true AND cd.id != 18";
if (isset($_GET['campaign'])) {
  $where .= " AND campaign.id = " . intval($_GET['campaign']);
}
if (isset($_GET['map'])) {
  $where .= " AND map.id = " . intval($_GET['map']);
}
if (isset($_GET['player'])) {
  $where .= " AND p.id = " . intval($_GET['player']);
}

if (!isset($_GET['archived']) || $_GET['archived'] === "false") {
  $where .= " AND map.is_archived = false";
}
if (!isset($_GET['arbitrary']) || $_GET['arbitrary'] === "false") {
  $where .= " AND objective.is_arbitrary = false AND (challenge.is_arbitrary = false OR challenge.is_arbitrary IS NULL)";
}

$query = $query . $where;
$query .= " ORDER BY cd.sort DESC, map.name ASC, submission.id ASC";

$result = pg_query($DB, $query);
if (!$result) {
  die_json(500, "Failed to query database");
}


$queryDifficulties = "SELECT * FROM difficulty WHERE difficulty.id != 18 AND difficulty.id != 13 ORDER BY sort DESC";
$resultDifficulties = pg_query($DB, $queryDifficulties);
if (!$resultDifficulties) {
  die_json(500, "Failed to query database");
}

$response = array(
  "tiers" => array(),
  "challenges" => array(),
  "campaigns" => array(),
  "maps" => array(),
);

$difficulties = array();
//Loop through difficulties
while ($row = pg_fetch_assoc($resultDifficulties)) {
  $difficulty = new Difficulty();
  $difficulty->apply_db_data($row);

  $tierIndex = get_tier_index($difficulty);
  $subtierIndex = get_subtier_index($difficulty);

  if (!isset($response['tiers'][$tierIndex]))
    $response['tiers'][$tierIndex] = array();
  if (!isset($response['tiers'][$tierIndex][$subtierIndex]))
    $response['tiers'][$tierIndex][$subtierIndex] = array();

  $response['tiers'][$tierIndex][$subtierIndex] = $difficulty;
  $difficulties[$difficulty->id] = $difficulty;
}

//loop through result rows
while ($row = pg_fetch_assoc($result)) {
  $campaign_id = intval($row['campaign_id']);
  if (!array_key_exists($campaign_id, $response['campaigns'])) {
    $campaign = new Campaign();
    $campaign->apply_db_data($row, "campaign_");
    $response['campaigns'][$campaign_id] = $campaign;
  }

  $map_id = intval($row['map_id']);
  if (!array_key_exists($map_id, $response['maps'])) {
    $map = new Map();
    $map->apply_db_data($row, "map_");
    $response['maps'][$map_id] = $map;
  }

  $challenge_id = intval($row['challenge_id']);
  if (!array_key_exists($challenge_id, $response['challenges'])) {
    $challenge = new Challenge();
    $challenge->apply_db_data($row, "challenge_");
    $challenge->submissions = array();
    $challenge->expand_foreign_keys($row, 1, false);
    $response['challenges'][$challenge_id] = $challenge;
  } else {
    $challenge = $response['challenges'][$challenge_id];
  }

  $submission = new Submission();
  $submission->apply_db_data($row, "submission_");
  $submission->expand_foreign_keys($row, 2, false);
  $challenge->submissions[$submission->id] = $submission;
}

//Flatten challenges
$response['challenges'] = array_values($response['challenges']);

//Flatten submissions
foreach ($response['challenges'] as $challengeIndex => $challenge) {
  $response['challenges'][$challengeIndex]->submissions = array_values($challenge->submissions);
}

api_write($response);