<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $challenges = isset($_REQUEST['challenges']) && $_REQUEST['challenges'] === 'true';
  $submissions = isset($_REQUEST['submissions']) && $_REQUEST['submissions'] === 'true';

  $id = $_REQUEST['id'];
  $maps = Map::get_request($DB, $id);
  if ($challenges) {
    if (is_array($maps)) {
      foreach ($maps as $map) {
        $map->fetch_challenges($DB, $submissions, true, true);
      }
    } else {
      $maps->fetch_challenges($DB, $submissions, true, true);
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

  $data_arr = format_assoc_array_bools(parse_post_body_as_json());

  if (!array_is_list($data_arr)) {
    // If the data is just a single object, put it in an array
    $data_arr = array($data_arr);
  }

  $maps = array();
  foreach ($data_arr as $data) {
    $map = new Map();
    $map->apply_db_data($data);
    $maps[] = $map;

    $campaign = Campaign::get_by_id($DB, $map->campaign_id);
    if ($campaign === false) {
      die_json(400, "Invalid campaign_id");
    }

    if (isset($data['id'])) {
      // Update
      $old_map = Map::get_by_id($DB, $data['id']);
      if (!$map->update($DB)) {
        die_json(500, "Failed to update map ($map->id)");
      } else {
        Map::generate_changelog($DB, $old_map, $map);
        submission_embed_change($map->id, "map");
        log_info("'{$account->player->name}' updated {$map}", "Map");
      }

    } else {
      // Insert
      $map->date_added = new JsonDateTime();
      if (!$map->insert($DB)) {
        die_json(500, "Failed to create map ($map->id)");
      } else {
        log_info("'{$account->player->name}' created {$map}", "Map");
      }
    }
  }

  if (count($maps) == 1) {
    api_write($maps[0]);
  } else {
    api_write($maps);
  }
}


if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  $account = get_user_data();
  if ($account === null) {
    die_json(401, "Not logged in");
  } else if (!is_verifier($account)) {
    die_json(403, "Not authorized");
  }

  if (!isset($_REQUEST['id'])) {
    die_json(400, "Missing id");
  }

  $id = intval($_REQUEST['id']);
  if ($id === 0 || $id < 0) {
    die_json(400, "Invalid id");
  }

  $map = Map::get_by_id($DB, $id);
  if ($map === false) {
    die_json(404, "Map not found");
  }

  if ($map->delete($DB)) {
    log_info("'{$account->player->name}' deleted {$map}", "Map");
    submission_embed_change($map->id, "map"); //Delete all embeds referencing this map
    api_write($map);
  } else {
    die_json(500, "Failed to delete map");
  }
}