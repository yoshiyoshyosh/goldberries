<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$as_text = isset($_GET['as_text']) && $_GET['as_text'] === "true";

$query = "SELECT * FROM view_challenges WHERE challenge_is_placed = FALSE ORDER BY challenge_id ASC";
$result = pg_query($DB, $query);

if (!$result) {
  die_json(500, 'Internal Server Error');
}

$challenges = array();
while ($row = pg_fetch_assoc($result)) {
  $challenge = new Challenge();
  $challenge->apply_db_data($row, "challenge_");
  $challenge->expand_foreign_keys($row, 5);
  $challenges[] = $challenge;

  $challenge->data = array(
    'count_submissions' => intval($row['count_submissions']),
  );
}

if ($as_text) {
  // set content type to plain html
  header('Content-Type: text/html');
  echo "These challenges are registered as \"unplaced\":<br><br>";
  echo "Total challenges: " . count($challenges) . "<br><br>";
  foreach ($challenges as $challenge) {
    echo "ID (" . $challenge->id . "): " . $challenge->get_name() . " - <a href=\"" . $challenge->get_url() . "\">Link</a><br>";
  }
} else {
  api_write($challenges);
}