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

$diffs_to_replace = [
  "High Tier 0" => "Tier 20",
  "Mid Tier 0" => "Tier 19",
  "Low Tier 0" => "Tier 18",
  "Tier 0.5" => "Tier 17",
  "High Tier 1" => "Tier 16",
  "Mid Tier 1" => "Tier 15",
  "Low Tier 1" => "Tier 14",
  "High Tier 2" => "Tier 13",
  "Mid Tier 2" => "Tier 12",
  "Low Tier 2" => "Tier 11",
  "High Tier 3" => "Tier 10",
  "Mid Tier 3" => "Tier 9",
  "Low Tier 3" => "Tier 8",

  //To avoid overlap, tiers 4-7 need temporary names
  "Tier 4" => "Temp_T7",
  "Tier 5" => "Temp_T6",

  "Tier 6" => "Tier 5",
  "Tier 7" => "Tier 4",
  "High Standard" => "Tier 3",
  "Mid Standard" => "Tier 2",
  "Low Standard" => "Tier 1",
  "Trivial" => "Untiered",

  //Restore overlap tiers
  "Temp_T7" => "Tier 7",
  "Temp_T6" => "Tier 6"
];

$process = 99999;
$total = 0;
echo "Processing difficulty name changes\n\n";

foreach ($diffs_to_replace as $old => $new) {
  echo "Processing difficulty '$old'\n";
  //A message could look like: Moved from 'Standard' to 'High Standard'
  //We want to select all changelogs that contain the old difficulty term, bounded by single quotes, then replace it with the new term
  $query = "SELECT * FROM change WHERE description LIKE 'Moved from%' AND description ILIKE '%''$old''%' ORDER BY id";
  $result = pg_query($DB, $query);
  if (!$result) {
    die("Error in SQL query: " . pg_last_error());
  }
  echo "\tFound " . pg_num_rows($result) . " entries for difficulty '$old'\n";

  $i = 0;
  while ($row = pg_fetch_assoc($result)) {
    $i++;
    $total++;

    $id = $row['id'];
    $description = $row['description'];
    $old_description = $description;
    $new_description = str_replace("'$old'", "'$new'", $description);
    $query = "UPDATE change SET description = $1 WHERE id = $2";
    $temp_result = pg_query_params($DB, $query, [$new_description, $id]);
    if (!$temp_result) {
      die("Error in SQL query: " . pg_last_error());
    }
    echo "\t$i - Updated changelog ($id): $old_description -> $new_description\n";

    if ($i >= $process) {
      break;
    }
  }

  echo "Done processing '$old' ($i entries)\n\n";
}

echo "Done processing '$total' entries\n";