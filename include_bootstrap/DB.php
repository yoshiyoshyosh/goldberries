<?php

$DB = pg_connect(constant("DB_STRING")) or die('Could not connect: ' . pg_last_error());

?>
