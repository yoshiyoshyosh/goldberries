<?php

require_once ('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(400, 'Invalid request method');
}

$type = isset($_REQUEST['type']) ? $_REQUEST['type'] : "all";

if ($type === "all") {
  $query = "
SELECT
  (SELECT COUNT(*) FROM campaign) AS count_campaigns,
  (SELECT COUNT(*) FROM map) AS count_maps,
  (SELECT COUNT(*) FROM challenge) AS count_challenge,
  (SELECT COUNT(*) FROM submission) AS count_submission,
  (SELECT COUNT(*) FROM player) AS count_players,
  (SELECT COUNT(*) AS real_campaign_count
FROM (SELECT
  COUNT(*) AS map_count
FROM map
JOIN campaign ON map.campaign_id = campaign.id
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

  $query = "
SELECT
  difficulty.id,
  COUNT(submission.id) AS count_submissions
FROM submission
JOIN challenge ON submission.challenge_id = challenge.id
JOIN difficulty ON challenge.difficulty_id = difficulty.id
GROUP BY difficulty.id
ORDER BY difficulty.id
  ";
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

} else if ($type === "monthly_recap") {
  $month = isset($_REQUEST['month']) ? $_REQUEST['month'] : null;
  if ($month === null || !preg_match('/^\d{4}-\d{2}$/', $month)) {
    die_json(400, 'Invalid month');
  }
  //$month is a string in the format 'YYYY-MM'


  //Tier clears
  $time_filter = "date_trunc('month', submission.date_created, 'UTC') AT TIME ZONE 'UTC' = '$month-01'";
  $query = "
SELECT
  date_trunc('month', submission.date_created, 'UTC') AT TIME ZONE 'UTC' AS date_achieved,
  difficulty.id,
  COUNT(submission.id) AS count_submissions
FROM submission
JOIN challenge ON submission.challenge_id = challenge.id
JOIN difficulty ON challenge.difficulty_id = difficulty.id
WHERE $time_filter AND submission.is_verified = true
GROUP BY date_trunc('month', submission.date_created, 'UTC') AT TIME ZONE 'UTC', difficulty.id
ORDER BY date_achieved DESC, difficulty.id
  ";

  $result = pg_query($DB, $query);
  if (!$result) {
    die_json(500, "Failed to query database");
  }
  $tier_clears = array();

  while ($row = pg_fetch_assoc($result)) {
    $date = $row['date_achieved'];
    $difficulty = intval($row['id']);
    $count = intval($row['count_submissions']);

    $tier_clears[$difficulty] = $count;
  }


  //t0+ submissions
  $time_filter = "submission_date_created AT TIME ZONE 'UTC' >= '$month-01' AND submission_date_created AT TIME ZONE 'UTC' < '$month-01'::date + INTERVAL '1 month'";
  $query = "SELECT * FROM view_submissions WHERE submission_is_verified = TRUE AND difficulty_sort > 16 AND $time_filter ORDER BY submission_date_created DESC";
  $result = pg_query($DB, $query);
  if (!$result) {
    die_json(500, "Failed to query database");
  }
  $submissions_t0 = array();
  while ($row = pg_fetch_assoc($result)) {
    $submission = new Submission();
    $submission->apply_db_data($row, "submission_");
    $submission->expand_foreign_keys($row, 5);
    $submissions_t0[] = $submission;
  }


  //Challenge changes
  $time_filter = "change_date >= '$month-01' AND change_date < '$month-01'::date + INTERVAL '1 month'";
  $query = "SELECT * FROM view_challenge_changes WHERE $time_filter AND change_description ILIKE 'Moved%'";
  $result = pg_query($DB, $query);
  if (!$result) {
    die_json(500, "Failed to query database");
  }
  $challenge_changes = array();
  while ($row = pg_fetch_assoc($result)) {
    $change = new Change();
    $change->apply_db_data($row, "change_");
    $change->expand_foreign_keys($row, 5);
    $challenge_changes[] = $change;
  }


  //Newly cleared t3+ challenges
  $time_filter = "submission_date_created AT TIME ZONE 'UTC' >= '$month-01' AND submission_date_created AT TIME ZONE 'UTC' < '$month-01'::date + INTERVAL '1 month'";
  $query = "SELECT * FROM view_submissions WHERE submission_is_verified = TRUE AND difficulty_sort > 6 AND $time_filter ORDER BY submission_date_created DESC";
  $result = pg_query($DB, $query);
  if (!$result) {
    die_json(500, "Failed to query database");
  }
  $submissions_t3 = array();
  while ($row = pg_fetch_assoc($result)) {
    $submission = new Submission();
    $submission->apply_db_data($row, "submission_");
    $submission->expand_foreign_keys($row, 5);
    $submissions_t3[] = $submission;
  }
  //Loop through t3 submissions, have the challenge fetch all submissions and check if all submissions are from this month or newer
  $newly_cleared_t3 = array();
  foreach ($submissions_t3 as $submission) {
    $challenge = $submission->challenge;
    $challenge->fetch_submissions($DB);
    $newly_cleared = true;
    foreach ($challenge->submissions as $sub) {
      $date = $sub->date_created; //Format: JsonDateTime (which is just DateTime with a custom __toString method)
      if ($date < $month . "-01") {
        $newly_cleared = false;
        break;
      }
    }
    if ($newly_cleared) {
      //Check if the challenge has already been added
      $already_added = false;
      foreach ($newly_cleared_t3 as $c) {
        if ($c->id === $challenge->id) {
          $already_added = true;
          break;
        }
      }
      if (!$already_added)
        $newly_cleared_t3[] = $challenge;
    }
  }


  api_write(
    array(
      "tier_clears" => $tier_clears,
      "submissions_t0" => $submissions_t0,
      "challenge_changes" => $challenge_changes,
      "newly_cleared_t3" => $newly_cleared_t3,
    )
  );

} else {
  die_json(400, 'Invalid type');
}
