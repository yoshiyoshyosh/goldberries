<?php

require_once ('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$search = $_REQUEST['q'] ?? null;
if ($search == null) {
  die_json(400, "Missing search parameter");
}

//Trim search string
$search = trim($search);
if ($search == "") {
  die_json(400, "Search parameter cannot be empty");
}
//Make sure the string is at least 3 characters long
if (strlen($search) < 3) {
  die_json(400, "Search parameter must be at least 3 characters long");
}
$search = pg_escape_string($search);


//query parameter 'in' is optional and is an arraya of what data to search in
$in = $_REQUEST['in'] ?? null;
if ($in == null) {
  $in = array("players", "campaigns", "maps", "authors");
} else {
  //if 'in' is a string, convert it to an array
  if (!is_array($in)) {
    $in = array($in);
  }
  if (count($in) == 0) {
    die_json(400, "Invalid 'in' parameter");
  }
}


$response = array();
$response['q'] = $search;
$response['in'] = $in;

if (in_array("players", $in)) {
  $players = Player::search_by_name($DB, $search);
  $response['players'] = $players;
}

if (in_array("campaigns", $in)) {
  $campaigns = Campaign::search_by_name($DB, $search);
  $response['campaigns'] = $campaigns;
}

if (in_array("maps", $in)) {
  $maps = Map::search_by_name($DB, $search);
  $response['maps'] = $maps;
}

if (in_array("authors", $in)) {
  //Authors are searched for in campaigns and maps
  //Fields: campaign.author_gb_name and map.author_gb_name

  $query = "SELECT DISTINCT author_gb_name FROM campaign WHERE campaign.author_gb_name ILIKE '%" . $search . "%'";
  $result = pg_query($DB, $query);
  if (!$result) {
    die_json(500, "Could not query database");
  }
  $response['authors'] = array();
  while ($row = pg_fetch_assoc($result)) {
    $name = $row['author_gb_name'];
    $response['authors'][$name] = array();
  }

  $query = "SELECT DISTINCT author_gb_name FROM map WHERE map.author_gb_name ILIKE '%" . $search . "%'";
  $result = pg_query($DB, $query);
  if (!$result) {
    die_json(500, "Could not query database");
  }
  while ($row = pg_fetch_assoc($result)) {
    $name = $row['author_gb_name'];
    //Check for duplicates
    if (!in_array($name, $response['authors'])) {
      $response['authors'][$name] = array();
    }
  }


  //Now, list all maps and campaigns for each author
  foreach ($response['authors'] as $name => $value) {
    $response['authors'][$name]['name'] = $name;

    $campaigns = Campaign::find_by_author($DB, $name);
    $response['authors'][$name]['campaigns'] = $campaigns;

    $maps = Map::find_by_author($DB, $name);
    $response['authors'][$name]['maps'] = $maps;
  }

  //Flatten the authors array
  $response['authors'] = array_values($response['authors']);

  //Sort the authors array by name alphabetically
  usort($response['authors'], function ($a, $b) {
    return strcasecmp($a['name'], $b['name']);
  });
}

api_write($response);