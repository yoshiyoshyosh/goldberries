<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, "Method not allowed");
}

if (!isset($_REQUEST['id'])) {
  die_json(400, "Missing id");
}

$id = $_REQUEST['id'];
$post = Post::get_by_id($DB, $id, 1, false);

$date = $post->date_created;

// Get the previous and the next post in the same type
$response = [
  "previous" => null,
  "next" => null
];

$query = "SELECT * FROM post WHERE type = '$post->type' AND date_created < '$date' ORDER BY date_created DESC LIMIT 1";
$result = pg_query_params_or_die($DB, $query);
if (pg_num_rows($result) > 0) {
  $row = pg_fetch_assoc($result);
  $response['previous'] = new Post();
  $response['previous']->apply_db_data($row);
  $response['previous']->expand_foreign_keys($DB, 3);
}

$query = "SELECT * FROM post WHERE type = '$post->type' AND date_created > '$date' ORDER BY date_created ASC LIMIT 1";
$result = pg_query_params_or_die($DB, $query);
if (pg_num_rows($result) > 0) {
  $row = pg_fetch_assoc($result);
  $response['next'] = new Post();
  $response['next']->apply_db_data($row);
  $response['next']->expand_foreign_keys($DB, 3);
}

api_write($response);