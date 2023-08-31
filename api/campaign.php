<?php

require_once('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
	$camp = new Campaign();
	api_unified_get($DB, 'Campaign', $camp);
}

?>
