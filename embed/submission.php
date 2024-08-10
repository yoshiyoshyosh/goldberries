<?php

require_once (dirname(__FILE__) . '/../bootstrap.inc.php');
require_once (dirname(__FILE__) . '/embed_include.php');

$DB = db_connect();

$regen = isset($_REQUEST['regen']) && $_REQUEST['regen'] === "true";
$id = intval($_REQUEST['id']);
if ($id <= 0) {
  http_response_code(400);
  die();
}

$submission = Submission::get_by_id($DB, $id);
if (!$submission) {
  http_response_code(404);
  die();
}

$submission->expand_foreign_keys($DB, 5);

//Objects
$player = $submission->player;
$challenge = $submission->challenge;
$for_str = "";
$is_new_challenge = $challenge === null;
if ($is_new_challenge) {
  $new_challenge = $submission->new_challenge;
  $for_str = "New Challenge: " . $new_challenge->name;
} else {
  $map = $challenge->map;
  $campaign = $challenge->get_campaign();
  $for_str = $map === null ? $campaign->get_name() : $map->get_name();
}

$real_url = constant("BASE_URL") . "/submission/" . $submission->id;
$proof_url = $submission->proof_url;
$regen_param = $regen ? "&regen=true" : "";
$embed_image_url = $is_new_challenge ? "" : "/embed/img/submission.php?id=" . $submission->id . $regen_param;

$title_str = "Submission by '{$player->name}'";
$description_str = "for {$for_str}";

output_image_embed($real_url, $title_str, $description_str, $embed_image_url);