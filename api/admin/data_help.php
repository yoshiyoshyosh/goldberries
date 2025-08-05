<?php
require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

//Set content type to plain text
header('Content-Type: text/html');
echo "<html><head><title>Data Help</title></head><body>";

$query = "SELECT 
  m.*
FROM map m,
     LATERAL regexp_split_to_table(m.collectibles, E'\t') AS col
WHERE
    split_part(col, '|', 1)::int = 1
    AND split_part(col, '|', 3) = '0'
ORDER BY m.id ASC";
$result = pg_query_params_or_die($DB, $query);

$total = pg_num_rows($result);

if ($total > 0) {
  echo "Found $total maps with 'Silver Berry x0' set in the collectibles list.<br><br>";
} else {
  // echo "All maps have collectibles set :catpop:";
}

while ($row = pg_fetch_assoc($result)) {
  $map = new Map();
  $map->apply_db_data($row);
  $map->expand_foreign_keys($DB);

  $map_name = $map->get_name();
  $map_url = $map->get_url();

  echo "$map_name <a href='$map_url' target='_blank'>[Link]</a><br>";
}


echo "<br><br><br>";


$query = "SELECT
  challenge.*
FROM challenge
JOIN difficulty ON difficulty.id = challenge.difficulty_id
WHERE difficulty.id = 19";
$result = pg_query_params_or_die($DB, $query);

$total = pg_num_rows($result);

if ($total > 0) {
  echo "Found $total challenges of Undetermined difficulty.<br><br>";
} else {
  // echo "All maps have collectibles set :catpop:";
}

while ($row = pg_fetch_assoc($result)) {
  $challenge = new Challenge();
  $challenge->apply_db_data($row);
  $challenge->expand_foreign_keys($DB, 5);

  $challenge_name = $challenge->get_name();
  $challenge_url = $challenge->get_url();

  echo "$challenge_name <a href='$challenge_url' target='_blank'>[Link]</a><br>";
}

echo "</body></html>";