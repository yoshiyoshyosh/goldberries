<?php

require_once ('api_bootstrap.inc.php');

//Set content type to plain text
header('Content-Type: text/plain');

$query = "SELECT * FROM player";
$result = pg_query($DB, $query);

//Loop over all rows
while ($row = pg_fetch_assoc($result)) {
  $player = new Player();
  $player->apply_db_data($row);

  if (is_valid_name($player->name)) {
    echo "'" . $player->name . "' - OK\n";
  } else {
    echo "\n'" . $player->name . "' - Invalid\n";
  }
}