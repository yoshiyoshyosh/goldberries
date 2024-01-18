<?php

require_once('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $submissions = isset($_REQUEST['submissions']) && $_REQUEST['submissions'] === 'true';

  $id = $_REQUEST['id'];
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

  api_write($challenges);
}

?>