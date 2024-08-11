<?php

require_once (dirname(__FILE__) . '/../bootstrap.inc.php');
require_once (dirname(__FILE__) . '/embed_include.php');

$DB = db_connect();

$real_url = constant("BASE_URL") . "/top-golden-list";
$title_str = "Rules";
$description_str = "Rules for submissions and maps, as well as general recommendations.";
output_text_embed($real_url, $title_str, $description_str, "");
exit();