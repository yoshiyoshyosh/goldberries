<?php

require_once('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $challenges = isset($_REQUEST['challenges']) && $_REQUEST['challenges'] === 'true';
  $submissions = isset($_REQUEST['submissions']) && $_REQUEST['submissions'] === 'true';

  $id = $_REQUEST['id'];
  $maps = Map::get_request($DB, $id);
  if ($challenges) {
    if (is_array($maps)) {
      foreach ($maps as $map) {
        $map->fetch_challenges($DB, $submissions);
      }
    } else {
      $maps->fetch_challenges($DB, $submissions);
    }
  }

  api_write($maps);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $account = get_user_data();
  if ($account === null) {
    die_json(401, "Not logged in");
  } else if (!is_verifier($account)) {
    die_json(403, "Not authorized");
  }

  $data = format_assoc_array_bools(parse_post_body_as_json());
  $map = new Map();
  $map->apply_db_data($data);

  if (isset($data['id'])) {
    // Update
    if ($map->update($DB)) {
      api_write($map);
    } else {
      die_json(500, "Failed to update map");
    }

  } else {
    // Insert
    $map->date_added = new JsonDateTime();
    if ($map->insert($DB)) {
      api_write($map);
    } else {
      die_json(500, "Failed to create map");
    }
  }
}


if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  $account = get_user_data();
  if ($account === null) {
    die_json(401, "Not logged in");
  } else if (!is_verifier($account)) {
    die_json(403, "Not authorized");
  }

  if (isset($_REQUEST['id'])) {
    $id = $_REQUEST['id'];
    $map = new Map();
    $map->id = $id;
    if ($map->delete($DB)) {
      api_write($map);
    } else {
      die_json(500, "Failed to delete map");
    }
  } else {
    die_json(400, "Missing id");
  }
}