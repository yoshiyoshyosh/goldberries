<?php

require_once ('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$account = get_user_data();
check_access($account, false);
if (!$account->is_admin) {
  die_json(403, 'Not authorized');
}

//Set content type to plain text
header('Content-Type: text/plain');


$submission_ids = [
  41887,
  41888,
  41889,
  41890,
  41891,
  41892,
  41893,
  41897,
  41898,
  41899,
  41900,
  41901,
  41902,
  41903,
  41904,
  41905,
  41906,
  41907,
  41908,
  41909,
  41910,
  41912,
  41913,
  41914,
  41915,
  41916,
  41918,
  41919,
  41920,
  41921,
  41922,
  41923,
  41924,
  41925,
  41926,
  41927,
  41928,
  41929,
  41930,
  41931,
  41932,
  41933,
  41934,
  41935,
  41936,
  41937,
  41938,
  41939,
  41940,
  41941,
  41942,
  41943,
  41944,
  41945,
  41946,
  41947,
  41948,
  41950,
  41951,
  41952,
  41953,
  41954,
  41955,
  41956,
  41978,
  41979,
  41980,
  41982,
  41983,
  41984,
  41985,
  41987,
  41988,
  41990,
  41991,
  41993,
  41994,
  41995,
  41996,
  41997,
  41998,
  41999,
  42020,
  42021,
  42022,
  42023,
  42024,
  42025,
  42026,
  42027,
  42028,
  42029,
  42030,
  42031,
  42032,
  42033,
  42034,
  42035,
  42036
];

//Loop through submission ids, get the submission and set the date_created to NULL
echo "Starting processing\n\n";

$i = 0;
foreach ($submission_ids as $submission_id) {
  $i++;
  $submission = Submission::get_by_id($DB, $submission_id);
  if ($submission === false) {
    echo "Error fetching submission #{$i}: $submission_id\n";
    continue;
  }
  $submission->date_created = null;
  if ($submission->update($DB) === false) {
    echo "Error updating submission #{$i}: $submission_id\n";
  } else {
    echo "Submission #{$i}: $submission_id updated\n";
  }
}

echo "\nFinished processing {$i} submissions.\n";