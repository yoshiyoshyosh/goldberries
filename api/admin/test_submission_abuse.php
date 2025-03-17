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

$limit = intval($_GET['limit']) ?? 100;
$limit = max(1, min(5000, $limit));
$offset = intval($_GET['offset']) ?? 0;

echo "Processing (max: $limit, offset: $offset) submissions to check for abuse...\n";

$query = "SELECT * FROM submission WHERE submission.is_verified = TRUE AND submission.date_created > '2024-08-01 23:30:57' LIMIT $limit OFFSET $offset";
$result = pg_query_params_or_die($DB, $query);

$total = 0;
while ($row = pg_fetch_assoc($result)) {
  $total++;
  $submission = new Submission();
  $submission->apply_db_data($row);

  $id = $submission->id;
  // Filter the date start with when the submission was created (submission->date_created) and up to 1 month later
  $dateFilter = "logging.date >= '$submission->date_created' AND logging.date <= '$submission->date_created'::timestamp + interval '1 month'";
  $query = "SELECT * FROM logging WHERE $dateFilter AND logging.topic IN ('Submission', 'Embed') AND (logging.message ILIKE '%$id%was verified by%' OR logging.message ILIKE '%Deleted all embeds%$id%')";
  $temp_result = pg_query_params_or_die($DB, $query);
  $count = pg_num_rows($temp_result);

  if ($count >= 1) {
    echo "Submission $id was verified properly\n";
  } else {
    echo "\nDANGER: Submission $id wasn't properly verified\n\n";
  }
}

echo "\n\nDone processing '$total' entries\n";