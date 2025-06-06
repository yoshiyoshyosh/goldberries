<?php
require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

// $account = get_user_data();
// check_access($account, false);
// if (!is_admin($account)) {
//   die_json(403, "Not authorized");
// }

//Set content type to plain text
header('Content-Type: text/html');
echo "<html><head><title>Jitio Help</title></head><body>";


$query = "SELECT * FROM map WHERE collectibles IS NULL ORDER BY id ASC";
$result = pg_query_params_or_die($DB, $query);

$total = pg_num_rows($result);

if ($total > 0) {
  echo "Found $total maps without collectibles set<br><br>";
} else {
  echo "All maps have collectibles set :catpop:";
}

while ($row = pg_fetch_assoc($result)) {
  $map = new Map();
  $map->apply_db_data($row);
  $map->expand_foreign_keys($DB);

  $map_name = $map->get_name();
  $map_url = $map->get_url();

  echo "$map_name <a href='$map_url' target='_blank'>[Link]</a><br>";
}

echo "</body></html>";