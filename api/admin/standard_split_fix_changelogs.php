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
  "Standard" => "Mid Standard",
];

$process = 99999;
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
  echo "Found " . pg_num_rows($result) . " entries for difficulty '$old'\n";

  $i = 0;
  while ($row = pg_fetch_assoc($result)) {
    $i++;
    $id = $row['id'];
    $description = $row['description'];
    $old_description = $description;
    $new_description = str_replace("'$old'", "'$new'", $description);
    $query = "UPDATE change SET description = $1 WHERE id = $2";
    $temp_result = pg_query_params($DB, $query, [$new_description, $id]);
    if (!$temp_result) {
      die("Error in SQL query: " . pg_last_error());
    }
    echo "$i - Updated changelog ($id): $old_description -> $new_description\n";

    if ($i >= $process) {
      break;
    }
  }

  echo "Done processing '$old'\n\n";
}

echo "Done processing all entries\n";