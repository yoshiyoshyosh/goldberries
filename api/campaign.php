<?php

require_once('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $maps = isset($_REQUEST['maps']) && $_REQUEST['maps'] === 'true';
  $challenges = isset($_REQUEST['challenges']) && $_REQUEST['challenges'] === 'true';
  $submissions = isset($_REQUEST['submissions']) && $_REQUEST['submissions'] === 'true';

  $id = $_REQUEST['id'];
  $campaigns = Campaign::get_request($DB, $id);
  if ($maps) {
    if (is_array($campaigns)) {
      foreach ($campaigns as $campaign) {
        $campaign->fetch_maps($DB, $challenges, $submissions);
      }
    } else {
      $campaigns->fetch_maps($DB, $challenges, $submissions);
    }
  }

  api_write($campaigns);
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $account = get_user_data();
  if ($account === null) {
    die_json(401, "Not logged in");
  } else if (!is_verifier($account)) {
    die_json(403, "Not authorized");
  }

  $data = format_assoc_array_bools(parse_post_body_as_json());
  $campaign = new Campaign();
  $campaign->apply_db_data($data);

  if (isset($data['id'])) {
    // Update
    $old_campaign = Campaign::get_by_id($DB, $data['id']);
    if ($campaign->update($DB)) {
      Campaign::generate_changelog($DB, $old_campaign, $campaign);
      api_write($campaign);
    } else {
      die_json(500, "Failed to update campaign");
    }

  } else {
    // Insert
    $campaign->date_added = new JsonDateTime();
    if ($campaign->insert($DB)) {
      api_write($campaign);
    } else {
      die_json(500, "Failed to create campaign");
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
    $campaign = new Campaign();
    $campaign->id = $id;
    if ($campaign->delete($DB)) {
      api_write($campaign);
    } else {
      die_json(500, "Failed to delete campaign");
    }
  } else {
    die_json(400, "Missing id");
  }
}
