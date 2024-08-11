<?php

require_once (dirname(__FILE__) . '/../bootstrap.inc.php');
require_once (dirname(__FILE__) . '/embed_include.php');

$DB = db_connect();

$real_url = constant("BASE_URL") . "/top-golden-list";
$title_str = "Frequently Asked Questions";
$description_str = "Have you tried turning it off and on again?";
output_text_embed($real_url, $title_str, $description_str, "");
exit();