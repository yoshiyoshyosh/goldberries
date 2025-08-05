<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$account = get_user_data();
check_access($account, false);
if (!is_admin($account)) {
  die_json(403, "Not authorized");
}

//Set content type to plain text
header('Content-Type: text/plain');


// Split by year
$player_id = intval($_GET['player_id']); // Default to player_id 1 if not provided
if ($player_id <= 0) {
  die_json(400, 'Invalid player_id');
}

for ($i = 0; $i < 5; $i++) {
  $start_year = 2021 + $i;
  $end_year = $start_year + 1;
  echo "\n\nYear: " . $start_year . " -> " . $end_year . "\n";

  $query = "SELECT
    difficulty.sort AS tier,
    ROUND(AVG(submission.time_taken) / 3600, 2) AS avg_time_taken,
    ROUND(STDDEV(submission.time_taken) / 3600, 2) AS std_dev_time_taken,
    COUNT(submission.id) AS count_subs
  FROM submission
  JOIN challenge ON submission.challenge_id = challenge.id
  JOIN difficulty ON challenge.difficulty_id = difficulty.id
  WHERE submission.player_id = $player_id AND submission.time_taken IS NOT NULL AND difficulty.sort >= 2 AND submission.date_created >= '$start_year-01-01' AND submission.date_created < '$end_year-01-01'
  GROUP BY difficulty.id
  ORDER BY difficulty.sort ASC";
  $result = pg_query_params_or_die($DB, $query);

  $old_entry = null;
  $base_values = 0;
  $base_count_subs = 0;
  echo "tier\tsubs\tavg\tstddev\tsteps\t%/step\n";
  //Loop through all entries. store the first entry. starting with the 2nd entry, calculate the following:
  // x = old_tier -> new_tier (a string, so '2->4')
  // y = log_t(new_avg_time_taken / old_avg_time_taken) | with t = new_tier - old_tier
  while ($row = pg_fetch_assoc($result)) {
    $new_entry = $row;

    $new_avg = $new_entry['avg_time_taken'];
    $new_std_dev = $new_entry['std_dev_time_taken'];
    $new_tier = $new_entry['tier'];
    $subs = $new_entry['count_subs'];

    if ($old_entry) {
      $ratio = $new_avg / $old_entry['avg_time_taken'];
      $base = $new_tier - $old_entry['tier'];

      $step = $old_entry['tier'] . "->" . $new_tier;
      $y = pow($ratio, 1 / $base);
      echo "$new_tier\t$subs\t" . round($new_avg, 2) . "\t" . round($new_std_dev, 2) . "\t$step\t" . round($y, 4) . "\n";
      $base_values += $y;
      // $base_values += $y * $new_entry['count_subs'];
      $base_count_subs += $subs;
    } else {
      echo "$new_tier\t$subs\t" . round($new_avg, 2) . "\t" . round($new_std_dev, 2) . "\t-\t-\n";
    }
    $old_entry = $new_entry;
  }

  if ($base_count_subs == 0) {
    echo "No submissions found for this year.\n";
    continue;
  }
  // $avg_base_value = $base_values / ($base_count_subs);
  $avg_base_value = $base_values / (pg_num_rows($result) - 1);
  echo "avg_base_value: " . round($avg_base_value, 4) . "\n";
}
