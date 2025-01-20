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

//Content type: text
header('Content-Type: text/plain');

//Read file from assets/tier_7_split_backup.json
$backup_file = file_get_contents('../../assets/data/tier_7_split_backup.json');
$backup_data = json_decode($backup_file, true);

//Data format:
//[{"submission_id":32,"suggested_difficulty_id":17,"is_personal":"f"},...]

echo "Restoring backup data...\n";
$i = 0;
foreach ($backup_data as $key => $value) {
  $i++;
  $id = $value['submission_id'];
  $suggested_difficulty_id = $value['suggested_difficulty_id'];
  $is_personal = $value['is_personal'];

  $query = "UPDATE submission SET suggested_difficulty_id = $1, is_personal = $2 WHERE id = $3";
  $result = pg_query_params_or_die($DB, $query, [$suggested_difficulty_id, $is_personal, $id]);

  if ($result) {
    echo "$i: Updated submission with id $id\n";
  } else {
    echo "$i: Failed to update submission with id $id\n";
  }
}

echo "Done restoring backup data ($i records)\n";