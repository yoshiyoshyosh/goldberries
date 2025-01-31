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

$HIGH_T0_ID = 1;
$TIERS = [
  2 => ["name" => "Mid Tier 0", "sort" => 19],
  3 => ["name" => "Low Tier 0", "sort" => 18],
  23 => ["name" => "Tier 0.5", "sort" => 17],
  4 => ["name" => "High Tier 1", "sort" => 16],
  5 => ["name" => "Mid Tier 1", "sort" => 15],
  6 => ["name" => "Low Tier 1", "sort" => 14],
  7 => ["name" => "High Tier 2", "sort" => 13],
  8 => ["name" => "Mid Tier 2", "sort" => 12],
  9 => ["name" => "Low Tier 2", "sort" => 11],
  10 => ["name" => "High Tier 3", "sort" => 10],
  11 => ["name" => "Mid Tier 3", "sort" => 9],
  12 => ["name" => "Low Tier 3", "sort" => 8],
  14 => ["name" => "Tier 4", "sort" => 7],
  15 => ["name" => "Tier 5", "sort" => 6],
  16 => ["name" => "Tier 6", "sort" => 5],
  17 => ["name" => "Tier 7", "sort" => 4],
  22 => ["name" => "High Standard", "sort" => 3],
  18 => ["name" => "Mid Standard", "sort" => 2],
  21 => ["name" => "Low Standard", "sort" => 1],
  20 => ["name" => "Untiered", "sort" => 0],
  19 => ["name" => "Undetermined", "sort" => -1]
];

//Content type: text
header('Content-Type: text/plain');
echo "Launching tier rework\n\n";

//First, check if tier 7.5 still exists
$query = "SELECT id FROM difficulty WHERE \"name\" = 'Tier 0' AND subtier = 'high'";
$result = pg_query_params_or_die($DB, $query);
if (pg_num_rows($result) == 0) {
  echo "High Tier 0 does not exist\n";
  die();
}
echo "High Tier 0 exists\n";


//Step 1: Delete high t0
$query = "DELETE FROM difficulty WHERE id = $1";
$result = pg_query_params_or_die($DB, $query, [$HIGH_T0_ID]);
echo "Deleted High Tier 0\n\n";

//Step 2: Loop through all $TIERS and update the sort values, unset the subtier field and change the name to be 'Tier X' where X is the sort value, EXCEPT for tiers Trivial and Undetermined
echo "Updating difficulty table\n";
foreach ($TIERS as $tier_id => $tier) {
  if ($tier_id === 19) {
    echo "Skipping Undetermined\n";
    continue;
  }

  $sort = $tier['sort'];
  $new_name = "Tier " . $sort;
  $query = "UPDATE difficulty SET sort = $1, name = $2, subtier = NULL WHERE id = $3";
  $result = pg_query_params_or_die($DB, $query, [$sort, $new_name, $tier_id]);
  echo "\tUpdated " . $tier['name'] . " -> $new_name\n";
}
echo "Updated difficulty table\n\n";