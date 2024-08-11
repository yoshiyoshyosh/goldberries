<?php

require_once (dirname(__FILE__) . '/../bootstrap.inc.php');
require_once (dirname(__FILE__) . '/embed_include.php');

$DB = db_connect();

$id = intval($_REQUEST['id']);
if ($id <= 0) {
  http_response_code(400);
  die();
}

$player = Player::get_by_id($DB, $id);
if (!$player) {
  http_response_code(404);
  die();
}

$player->expand_foreign_keys($DB, 5);
$title_str = "" . $player->name;
$description_str = "";

$showcase_url = constant("BASE_URL_API") . "/showcase?player_id=" . $player->id;
$response = fetch_data($showcase_url);
//Parse JSON
$showcase = json_decode($response, true);

$type = $showcase["type"];
$type_str = $type === "custom" ? "Showcase Submissions" : "Hardest Submissions";
$submissions = $showcase["submissions"];

$description_str .= "{$type_str}:\n";
for ($i = 0; $i < count($submissions); $i++) {
  $submission_data = $submissions[$i];
  $submission = Submission::get_by_id($DB, $submission_data["id"]);
  $submission->expand_foreign_keys($DB, 5);
  $challenge_name = $submission->challenge->get_name(true);
  $tier_name = $submission->challenge->difficulty->to_tier_name();
  $description_str .= "  - ({$tier_name}) {$challenge_name}\n";

  if ($i >= 2) {
    break;
  }
}

$account = $player->get_account($DB);
if ($account) {
  $description_str .= "\n";
  if ($account->input_method !== null) {
    $input_method_str = input_method_to_string($account->input_method);
    $description_str .= "Input Method: {$input_method_str}\n";
  }
  if ($account->about_me !== null) {
    $max_length = 100;
    $about_me = $account->about_me;
    if (strlen($about_me) > $max_length) {
      $about_me = substr($about_me, 0, $max_length) . "...";
    }
    $description_str .= "About Me: {$about_me}\n";
  }
}

$real_url = $player->get_url();

output_text_embed($real_url, $title_str, $description_str, "");