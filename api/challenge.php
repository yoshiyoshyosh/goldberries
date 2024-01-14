<?php

require_once('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $challenge = new Challenge();
  $out = api_unified_get($DB, 'Challenge', $challenge);
  $out->fetch_submissions($DB);
  api_write($out);
}

?>