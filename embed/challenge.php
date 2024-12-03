<?php

require_once(dirname(__FILE__) . '/../bootstrap.inc.php');
require_once(dirname(__FILE__) . '/embed_include.php');

$DB = db_connect();

$id = intval($_REQUEST['id']);
if ($id <= 0) {
  http_response_code(400);
  die();
}

$challenge = Challenge::get_by_id($DB, $id);
if (!$challenge) {
  http_response_code(404);
  die();
}

$challenge->expand_foreign_keys($DB, 5);
$challenge->fetch_submissions($DB);
$title_str = "Challenge: " . $challenge->get_name(true);
$description_str = "";
$campaign_str = $challenge->get_campaign()->get_name();
// $description_str .= "For Campaign: " . $campaign_str . "\n\n";
$description_str .= "Difficulty: " . $challenge->difficulty->to_tier_name() . "\n";

$count_submissions = 0;
foreach ($challenge->submissions as $submission) {
  if ($submission->is_verified) {
    $count_submissions++;
  }
}
$description_str .= "# of Submissions: {$count_submissions}";

if ($count_submissions > 0) {
  $submission = null;
  foreach ($challenge->submissions as $sub) {
    if ($sub->is_verified) {
      $submission = $sub;
      break;
    }
  }
  $description_str .= "\n\n";
  $description_str .= "First Cleared: " . date_to_short_string($submission->date_achieved) . " (by " . $submission->player->name . ")";
}

$real_url = $challenge->get_url();

output_text_embed($real_url, $title_str, $description_str, $campaign_str);