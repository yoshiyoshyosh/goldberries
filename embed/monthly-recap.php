<?php

require_once (dirname(__FILE__) . '/../bootstrap.inc.php');
require_once (dirname(__FILE__) . '/embed_include.php');

$DB = db_connect();

$real_url = constant("BASE_URL") . "/top-golden-list";
$title_str = "Monthly Recap";
$description_str = "Take a look through history and see what happened in the past.";
output_text_embed($real_url, $title_str, $description_str, "");
exit();