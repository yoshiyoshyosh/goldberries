<?php

require_once ('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(400, 'Invalid request method');
}

$type = isset($_REQUEST['type']) ? $_REQUEST['type'] : "all";

if ($type === "all") {
  $month = isset($_REQUEST['month']) ? $_REQUEST['month'] : null;
  if ($month !== null && !preg_match('/^\d{4}-\d{2}$/', $month)) {
    die_json(400, 'Invalid month');
  }

  $time_filter = $month === null ? "" : "WHERE date_trunc('month', map.date_added, 'UTC') < '$month-01' ";
  $time_filter_added = $month === null ? "" : "WHERE date_trunc('month', date_added, 'UTC') < '$month-01' ";
  $time_filter_created = $month === null ? "" : "WHERE date_trunc('month', date_created, 'UTC') < '$month-01' ";

  $query = "
SELECT
  (SELECT COUNT(*) FROM campaign $time_filter_added) AS count_campaigns,
  (SELECT COUNT(*) FROM map $time_filter_added) AS count_maps,
  (SELECT COUNT(*) FROM challenge $time_filter_created) AS count_challenge,
  (SELECT COUNT(*) FROM submission $time_filter_created) AS count_submission,
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


  $time_filter = $month === null ? "" : "WHERE date_trunc('month', submission.date_created, 'UTC') < '$month-01'::date + INTERVAL '1 month'";
  $query = "
SELECT
  difficulty.id,
  COUNT(submission.id) AS count_submissions
FROM submission
JOIN challenge ON submission.challenge_id = challenge.id
JOIN difficulty ON challenge.difficulty_id = difficulty.id
$time_filter
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

  $all_clears_tier_sort = isset($_REQUEST['all_clears_tier_sort']) ? intval($_REQUEST['all_clears_tier_sort']) : 17;
  $first_clears_tier_sort = isset($_REQUEST['first_clears_tier_sort']) ? intval($_REQUEST['first_clears_tier_sort']) : 7;

  if ($all_clears_tier_sort < 7) {
    die_json(400, 'all_clears_tier_sort has to be at least Low Tier 3');
  } else if ($all_clears_tier_sort > 19) {
    die_json(400, 'all_clears_tier_sort has to be at most High Tier 0');
  }
  if ($first_clears_tier_sort < 3) {
    die_json(400, 'first_clears_tier_sort has to be at least Tier 7');
  } else if ($first_clears_tier_sort > 19) {
    die_json(400, 'first_clears_tier_sort has to be at most High Tier 0');
  }



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
  $query = "SELECT * FROM view_submissions WHERE submission_is_verified = TRUE AND submission_new_challenge_id IS NULL AND difficulty_sort >= $all_clears_tier_sort AND $time_filter ORDER BY submission_date_created DESC";
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


  //Newly cleared t3+ challenges
  $time_filter = "submission_date_created AT TIME ZONE 'UTC' >= '$month-01' AND submission_date_created AT TIME ZONE 'UTC' < '$month-01'::date + INTERVAL '1 month'";
  $query = "SELECT * FROM view_submissions WHERE submission_is_verified = TRUE AND submission_new_challenge_id IS NULL AND difficulty_sort >= $first_clears_tier_sort AND $time_filter ORDER BY submission_date_created DESC";
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
    $first_submission = $challenge->submissions[0];
    if ($first_submission->date_created >= $month . "-01") {
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
  //Loop through newly cleared t3 challenges and remove the first submission from the t0 submissions, if it exists
  foreach ($newly_cleared_t3 as $challenge) {
    foreach ($submissions_t0 as $key => $t0_submission) {
      if ($challenge->submissions[0]->id === $t0_submission->id) {
        //Remove the submission, without breaking the array structure. Dont just unset, as it will transform it into an object
        array_splice($submissions_t0, $key, 1);
        break;
      }
    }
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


  api_write(
    array(
      "tier_clears" => $tier_clears,
      "submissions_t0" => $submissions_t0,
      "challenge_changes" => $challenge_changes,
      "newly_cleared_t3" => $newly_cleared_t3,
    )
  );

} else if ($type === "chart_tier_clears_monthly") {
  $query = "SELECT
      DATE_TRUNC('month', submission.date_created, 'UTC') AT TIME ZONE 'UTC' AS date_month,
      difficulty.id,
      difficulty.name,
      COUNT(*) AS count
    FROM submission
    JOIN challenge ON submission.challenge_id = challenge.id
    JOIN difficulty ON challenge.difficulty_id = difficulty.id
    WHERE submission.is_verified = TRUE AND submission.date_created IS NOT NULL
    GROUP BY DATE_TRUNC('month', submission.date_created, 'UTC') AT TIME ZONE 'UTC', difficulty.id
    ORDER BY date_month ASC, difficulty.sort DESC";
  $result = pg_query($DB, $query);
  if (!$result) {
    die_json(500, "Failed to query database");
  }

  $data = array();
  while ($row = pg_fetch_assoc($result)) {
    $date = $row['date_month'];
    $difficulty = intval($row['id']);
    $count = intval($row['count']);

    if (!isset($data[$date])) {
      $data[$date] = array();
    }
    $data[$date][$difficulty] = $count;
  }

  api_write($data);
} else if ($type === "table_tier_clear_counts") {
  $query = "SELECT
      player.id,
      player.name,
      account.name_color_start AS account_name_color_start,
      account.name_color_end AS account_name_color_end,
      account.input_method AS account_input_method,
      COUNT(*) FILTER (WHERE difficulty.name = 'Tier 0') AS t0,
      COUNT(*) FILTER (WHERE difficulty.name = 'Tier 1') AS t1,
      COUNT(*) FILTER (WHERE difficulty.name = 'Tier 2') AS t2,
      COUNT(*) FILTER (WHERE difficulty.name = 'Tier 3') AS t3,
      COUNT(*) FILTER (WHERE difficulty.name = 'Tier 4') AS t4,
      COUNT(*) FILTER (WHERE difficulty.name = 'Tier 5') AS t5,
      COUNT(*) FILTER (WHERE difficulty.name = 'Tier 6') AS t6,
      COUNT(*) FILTER (WHERE difficulty.name = 'Tier 7') AS t7,
      COUNT(*) FILTER (WHERE difficulty.name = 'Standard') AS standard,
      COUNT(*) AS total
    FROM submission
    JOIN challenge ON submission.challenge_id = challenge.id
    JOIN difficulty ON challenge.difficulty_id = difficulty.id
    JOIN player ON submission.player_id = player.id
    LEFT JOIN account ON player.id = account.player_id
    GROUP BY player.id, account.id
    ORDER BY player.name ASC";
  $result = pg_query($DB, $query);
  if (!$result) {
    die_json(500, "Failed to query database");
  }

  $data = array();
  while ($row = pg_fetch_assoc($result)) {
    $player = new Player();
    $player->apply_db_data($row);
    // $player->expand_foreign_keys($row, 5);
    $row_data = array();

    $row_data['player'] = $player;
    $row_data['clears'] = array();
    $row_data['total'] = intval($row['total']);
    $row_data['clears']['2'] = intval($row['t0']);
    $row_data['clears']['5'] = intval($row['t1']);
    $row_data['clears']['8'] = intval($row['t2']);
    $row_data['clears']['11'] = intval($row['t3']);
    $row_data['clears']['14'] = intval($row['t4']);
    $row_data['clears']['15'] = intval($row['t5']);
    $row_data['clears']['16'] = intval($row['t6']);
    $row_data['clears']['17'] = intval($row['t7']);
    $row_data['clears']['18'] = intval($row['standard']);

    $data[] = $row_data;
  }

  api_write($data);
} else {
  die_json(400, 'Invalid type');
}
