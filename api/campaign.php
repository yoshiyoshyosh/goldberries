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
