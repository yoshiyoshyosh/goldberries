<?php

require_once('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $camp = new Campaign();
  //api_unified_output($DB, 'Campaign', $camp);
  $campaign = api_unified_get($DB, 'Campaign', $camp);
  if (is_array($campaign)) {
    foreach ($campaign as $c) {
      expand_campaign($DB, $c);
    }
  } else {
    expand_campaign($DB, $campaign);
  }
  api_write($campaign);
}

function expand_campaign($DB, $campaign)
{
  $campaign->fetch_maps($DB);
  foreach ($campaign->maps as $map) {
    $map->fetch_challenges($DB);
    foreach ($map->challenges as $challenge) {
      $challenge->expand_foreign_keys($DB, ['campaign', 'map']);
      $challenge->fetch_submissions($DB);
      foreach ($challenge->submissions as $submission) {
        $submission->expand_foreign_keys($DB, ['challenge']);
      }
    }
  }
}

?>