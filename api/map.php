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
