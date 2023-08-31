<?php

require_once('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
	$diff = new Difficulty();
	api_unified_get('Difficulty', $diff);
}

?>
