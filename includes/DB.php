<?php
require_once("includes/config.php");

$DB_CONN = pg_connect(constant("DB_STRING")) or die('Could not connect: ' . pg_last_error());
?>
