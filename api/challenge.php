<?php

require_once('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $id = $_REQUEST['id'];
  $submissions = isset($_REQUEST['submissions']) && $_REQUEST['submissions'] === 'true';
  $is_full_game = isset($_REQUEST['is_full_game']) && $_REQUEST['is_full_game'] === 'true';
  $depth = isset($_REQUEST['depth']) ? intval($_REQUEST['depth']) : 3;

  $challenges = Challenge::get_request($DB, $id);
  if ($submissions) {
    if (is_array($challenges)) {
      foreach ($challenges as $challenge) {
        $challenge->fetch_submissions($DB);
      }
    } else {
      $challenges->fetch_submissions($DB);
    }
  }

  if (is_array($challenges)) {
    foreach ($challenges as $challenge) {
      $challenge->expand_foreign_keys($DB, $depth);
    }
  } else {
    $challenges->expand_foreign_keys($DB, $depth);
  }

  api_write($challenges);
}
