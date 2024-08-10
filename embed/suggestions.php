<?php

require_once (dirname(__FILE__) . '/../bootstrap.inc.php');
require_once (dirname(__FILE__) . '/embed_include.php');

$DB = db_connect();

$id = intval($_REQUEST['id']);

if ($id <= 0) {
  $real_url = constant("BASE_URL") . "/suggestions";
  $title_str = "Suggestion Box";
  $description_str = "See what other people have suggested for challenge placements or other website features";
  output_text_embed($real_url, $title_str, $description_str);
  exit();
}

$suggestion = Suggestion::get_by_id($DB, $id);
if (!$suggestion || $suggestion->is_verified !== true) {
  http_response_code(404);
  die();
}

$suggestion->expand_foreign_keys($DB, 5);
$suggestion->fetch_associated_content($DB);

//Objects
$author = $suggestion->author;
$comment = $suggestion->comment;
$comment_str = $comment === null ? "-" : $comment;
$description_str = "";

$challenge = $suggestion->challenge;
$campaign_str = "General";
if ($challenge !== null) {
  $campaign_str = $challenge->get_campaign()->get_name();
  // $description_str .= "For Campaign: " . $campaign_str . "\n\n";
}

$description_str .= "{$author->name}: {$comment_str}\n\n";

//Count votes
$votes = $suggestion->votes;
$votes_count = [
  "+" => 0,
  "-" => 0,
  "i" => 0
];
foreach ($votes as $vote) {
  $votes_count[$vote->vote]++;
}

$title_str = "";
if ($challenge !== null) {
  $title_str = "Suggestion: '" . $challenge->get_name(true) . "'";
  if ($suggestion->suggested_difficulty_id !== null) {
    $to_str = $suggestion->suggested_difficulty->to_tier_name();
    $from_str = $suggestion->current_difficulty->to_tier_name();
    $description_str .= "Placement: " . $from_str . " → " . $to_str . "\n";
  }
} else {
  $title_str = "General Suggestion";
}

$description_str .= "Votes: +{$votes_count['+']}, -{$votes_count['-']}, ={$votes_count['i']}\n";
$status_str = $suggestion->is_closed() ? "Closed" : "Open";
if ($suggestion->is_accepted === true) {
  $status_str .= " (Accepted)";
} else if ($suggestion->is_accepted === false) {
  $status_str .= " (Rejected)";
}
$description_str .= "Status: {$status_str}\n";

$real_url = constant("BASE_URL") . "/suggestion/" . $submission->id;

output_text_embed($real_url, $title_str, $description_str, $campaign_str);