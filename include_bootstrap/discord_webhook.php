<?php

$webhooks_enabled = true;

function remove_backticks($str)
{
  return preg_replace('/`/', '', $str);
}

function send_webhook_suggestion_verified($suggestion)
{
  global $DB;
  global $webhooks_enabled;
  if (!$webhooks_enabled) {
    return;
  }

  $suggestion->expand_foreign_keys($DB, 5);

  $webhook_url = constant('SUGGESTION_BOX_WEBHOOK_URL');
  $timestamp = date("c", strtotime("now"));

  $challenge = $suggestion->challenge;
  $map = $challenge !== null ? $challenge->map : null;
  $campaign = $challenge !== null ? $challenge->get_campaign() : null;
  if ($challenge !== null) {
    $challenge->fetch_submissions($DB);
  }

  //Send notification to the suggestion box
  send_webhook_suggestion_notification($suggestion);

  $name = $map === null ? ($campaign === null ? "General Suggestion" : $campaign->get_name()) : $map->get_name();
  $title = "Suggestion for '$name' by {$suggestion->author->name}";
  if ($map === null && $campaign === null) {
    $title = "General Suggestion by {$suggestion->author->name}";
  }
  $suggestion_url = constant("BASE_URL") . "/suggestions/" . $suggestion->id;

  $objective = "";

  $fields = [];

  $fields[] = [
    "name" => "Author: `" . $suggestion->author->get_name_escaped() . "`",
    "value" => "Comment: `" . remove_backticks($suggestion->comment) . "`",
    "inline" => false,
  ];

  if ($challenge && $suggestion->suggested_difficulty_id !== null) {
    $objective = $challenge->objective->name;
    if ($challenge->get_suffix() !== null) {
      $objective .= " [" . $challenge->get_suffix() . "]";
    }

    $current_diff_name = $challenge->difficulty->to_tier_name();
    $suggested_diff_name = $suggestion->suggested_difficulty->to_tier_name();

    $fields[] = [
      "name" => "Placement",
      "value" => $current_diff_name . " -> " . $suggested_diff_name,
      "inline" => false
    ];


    //Put in the embed:
    // - # of (non-personal) suggested difficulties (and % of all submissions)
    // - count of each tier suggested, sorted from most common to least common (and % of all suggestions) 

    $difficulties = [];
    $count_submissions = count($challenge->submissions);
    $count_suggestions = 0;
    foreach ($challenge->submissions as $submission) {
      $diff_suggestion = $submission->suggested_difficulty;
      //Not sure if this is the best way to handle personal suggestions in the embed
      if ($diff_suggestion === null)
        continue;
      if ($submission->is_personal)
        continue;

      $count_suggestions++;

      $diff_id = $diff_suggestion->id;
      if (!isset($difficulties[$diff_id])) {
        $difficulties[$diff_id] = [
          "difficulty" => $diff_suggestion,
          "count" => 0
        ];
      }
      $difficulties[$diff_id]["count"]++;
    }

    $difficulties = array_values($difficulties);
    usort($difficulties, function ($a, $b) {
      return $b["count"] - $a["count"];
    });

    $difficulties_str_arr = [];
    foreach ($difficulties as $diff) {
      $diff_name = $diff["difficulty"]->to_tier_name();
      $diff_count = $diff["count"];
      $diff_percent = round($diff_count / $count_suggestions * 100, 1);
      $difficulties_str_arr[] = "$diff_name: $diff_count ($diff_percent%)";
    }
    $difficulties_str = implode(", ", $difficulties_str_arr);

    $suggestions_percent = round($count_suggestions / $count_submissions * 100, 1);
    // $fields[] = [
    //   "name" => "Data",
    //   "value" => "$count_suggestions difficulty suggestions ({$suggestions_percent}%, from {$count_submissions} submissions)",
    //   "inline" => false
    // ];
    $fields[] = [
      "name" => "Difficulty Suggestions ({$count_suggestions}/{$count_submissions} submissions)",
      "value" => "$difficulties_str",
      "inline" => false
    ];
  }


  $json_data = json_encode([
    "content" => "", //"New Suggestion: $name",
    // "username" => "krasin.space",
    //"avatar_url" => "https://ru.gravatar.com/userimage/28503754/1168e2bddca84fec2a63addb348c571d.jpg?size=512",
    // "tts" => false,
    // "file" => "",
    "allowed_mentions" => [
      "parse" => []
    ],
    "embeds" => [
      [
        "title" => $title,
        "type" => "rich",
        "description" => $objective,
        "url" => $suggestion_url,
        "timestamp" => $timestamp,
        "color" => hexdec("3333ff"),

        // "footer" => [
        //   "text" => "Footer text",
        //   "icon_url" => $suggestion_url,
        // ],
        // "image" => [
        //     "url" => "https://ru.gravatar.com/userimage/28503754/1168e2bddca84fec2a63addb348c571d.jpg?size=600"
        // ],
        //"thumbnail" => [
        //    "url" => "https://ru.gravatar.com/userimage/28503754/1168e2bddca84fec2a63addb348c571d.jpg?size=400"
        //],
        // "author" => [
        //     "name" => "krasin.space",
        //     "url" => "https://krasin.space/"
        // ],

        "fields" => $fields,
      ]
    ]

  ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

  send_webhook($webhook_url, $json_data);
}

function send_webhook_suggestion_notification($suggestion)
{
  global $DB;
  global $webhooks_enabled;
  if (!$webhooks_enabled) {
    return;
  }

  $webhook_url = constant('SUGGESTION_BOX_WEBHOOK_URL');

  if ($suggestion->challenge_id === null)
    return;
  $challenge = $suggestion->challenge;
  $challenge_name = $challenge->get_name_for_discord();

  $ping_list = [];
  $allowed_mentions = ["users" => []];
  foreach ($challenge->submissions as $submission) {
    $account = $submission->player->get_account($DB);
    if ($account !== null && $account->discord_id !== null && $account->n_suggestion) {
      $ping_list[] = "<@{$account->discord_id}>";
      $allowed_mentions["users"][] = $account->discord_id;
    }
  }
  $ping_addition = count($ping_list) > 0 ? " " . implode(" ", $ping_list) : "";
  $message = ":memo: A new suggestion was made for {$challenge_name}!{$ping_addition}";
  send_simple_webhook_message($webhook_url, $message, $allowed_mentions);
}

function send_webhook_suggestion_accepted($suggestion)
{
  global $DB;
  global $webhooks_enabled;
  if (!$webhooks_enabled) {
    return;
  }

  $suggestion->expand_foreign_keys($DB, 5);
  if ($suggestion->challenge_id !== null && $suggestion->is_accepted === true && $suggestion->suggested_difficulty_id !== null) {
    //Don't send a notification for a challenge placement suggestion if it was accepted, as it causes a changelog notification anyways
    return;
  }

  $webhook_url = constant('SUGGESTION_BOX_WEBHOOK_URL');

  $icon = $suggestion->is_accepted === true ? ":white_check_mark:" : ($suggestion->is_accepted === null ? ":question:" : ":x:");
  $url = $suggestion->get_url();
  $state = $suggestion->is_accepted === true ? "accepted" : ($suggestion->is_accepted === null ? "set to be undecided again" : "rejected");

  $message = "{$icon} The suggestion {$url} was {$state}";
  send_simple_webhook_message($webhook_url, $message);
}


function send_webhook_submission_verified($submission)
{
  global $DB;
  global $webhooks_enabled;
  if (!$webhooks_enabled) {
    return;
  }

  $account = $submission->player->get_account($DB);
  $player_name = "@`{$submission->player->get_name_escaped()}`";
  $webhook_url = constant('NOTIFICATIONS_WEBHOOK_URL');
  $allowed_mentions = ["users" => []];

  if ($account !== null && $account->discord_id !== null && $account->n_sub_verified) {
    $player_name = "<@{$account->discord_id}>";
    $allowed_mentions["users"][] = $account->discord_id;
  }

  $challenge_name = $submission->get_challenge_name_for_discord();
  $submission_url = $submission->get_url();
  $is_rejected = $submission->is_verified === false;
  $emote = $is_rejected ? ":x:" : ":white_check_mark:";
  $verified_str = $is_rejected ? "rejected" : "verified";
  $message = "$emote $player_name → Your [submission](<{$submission_url}>) for {$challenge_name} was $verified_str!";
  send_simple_webhook_message($webhook_url, $message, $allowed_mentions);
}
function send_webhook_multi_submission_verified($submissions)
{
  global $DB;
  global $webhooks_enabled;
  if (!$webhooks_enabled) {
    return;
  }

  $account = $submissions[0]->player->get_account($DB);
  $player_name = "@`{$submissions[0]->player->get_name_escaped()}`";
  $webhook_url = constant('NOTIFICATIONS_WEBHOOK_URL');
  $allowed_mentions = ["users" => []];

  if ($account !== null && $account->discord_id !== null && $account->n_sub_verified) {
    $player_name = "<@{$account->discord_id}>";
    $allowed_mentions["users"][] = $account->discord_id;
  }

  $count = count($submissions);

  $campaign = $submissions[0]->challenge->get_campaign();
  $campaign_name = $campaign->get_name_for_discord();

  $campaign_addition = "";
  //Check if all maps for the submission have the same major_sort
  //But first, check if all challenges even have maps
  $all_have_maps = true;
  foreach ($submissions as $submission) {
    if ($submission->challenge->map_id === null) {
      $all_have_maps = false;
      break;
    }
  }
  if ($all_have_maps) {
    $sort_major = $submissions[0]->challenge->map->sort_major;
    $all_same_sort_major = true;
    foreach ($submissions as $submission) {
      if ($submission->challenge->map->sort_major !== $sort_major) {
        $all_same_sort_major = false;
        break;
      }
    }
    if ($all_same_sort_major && $sort_major !== null) {
      $campaign_addition = " / `{$campaign->sort_major_labels[$sort_major]}`";
    }
  }

  $is_rejected = $submissions[0]->is_verified === false;
  $emote = $is_rejected ? ":x:" : ":white_check_mark:";
  $verified_str = $is_rejected ? "rejected" : "verified";
  $message = "$emote $player_name → **{$count}** of your submissions for {$campaign_name}{$campaign_addition} were $verified_str!";
  send_simple_webhook_message($webhook_url, $message, $allowed_mentions);
}

function send_webhook_challenge_marked_personal($challenge)
{
  global $DB;
  global $webhooks_enabled;
  if (!$webhooks_enabled) {
    return;
  }

  $challenge->expand_foreign_keys($DB, 5);
  $webhook_url = constant('CHANGELOG_WEBHOOK_URL');
  $challenge_name = $challenge->get_name_for_discord();

  $list_impacted = [];
  $allowed_mentions = ["users" => []];
  foreach ($challenge->submissions as $submission) {
    if ($submission->suggested_difficulty_id !== null && !$submission->is_personal) {
      $submission_url = $submission->get_url();
      $name = "[{$submission->player->name}]({$submission_url})";
      $account = $submission->player->get_account($DB);
      if ($account !== null && $account->discord_id !== null && $account->n_chall_personal) {
        $name .= " (<@{$account->discord_id}>)";
        $allowed_mentions["users"][] = $account->discord_id;
      }
      $list_impacted[] = $name;
    }
  }

  $impacted_str = implode(", ", $list_impacted);
  if (count($list_impacted) == 0) {
    $impacted_str = "No Submissions";
  }
  $impacted_count = count($list_impacted);
  $total_count = count($challenge->submissions);
  $message = ":bangbang: All difficulty suggestions for {$challenge_name} were marked as personal, as new strats have been discovered! Impacted submissions (**$impacted_count** out of **$total_count**): {$impacted_str}";
  send_simple_webhook_message($webhook_url, $message, $allowed_mentions);
}

function send_webhook_challenge_moved($challenge, $new_difficulty_id)
{
  global $DB;
  global $webhooks_enabled;
  if (!$webhooks_enabled) { //Disable webhooks for now
    return;
  }

  $challenge->expand_foreign_keys($DB, 5);
  if ($challenge->submissions === null) {
    $challenge->fetch_submissions($DB);
  }
  $webhook_url = constant('CHANGELOG_WEBHOOK_URL');
  $challenge_name = $challenge->get_name_for_discord();
  $old_difficulty = $challenge->difficulty->to_tier_name();
  $new_difficulty = Difficulty::get_by_id($DB, $new_difficulty_id)->to_tier_name();

  $ping_list = [];
  $allowed_mentions = ["users" => []];
  foreach ($challenge->submissions as $submission) {
    $account = $submission->player->get_account($DB);
    if ($account !== null && $account->discord_id !== null && $account->n_chall_moved) {
      $ping_list[] = "<@{$account->discord_id}>";
      $allowed_mentions["users"][] = $account->discord_id;
    }
  }
  $ping_addition = count($ping_list) > 0 ? "\n" . implode(" ", $ping_list) : "";

  $message = "{$challenge_name} **$old_difficulty** → **$new_difficulty**{$ping_addition}";
  send_simple_webhook_message($webhook_url, $message, $allowed_mentions);
}

function send_simple_webhook_message($url, $message, $allowed_mentions = null)
{
  $allowed_mentions = $allowed_mentions ?? ["parse" => []];
  $json_data = json_encode([
    "content" => $message,
    "allowed_mentions" => $allowed_mentions
  ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  send_webhook($url, $json_data);
}
function send_webhook($url, $data)
{
  if ($url === false) { //env variable for webhook url is not set
    return;
  }

  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: application/json'));
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  // curl_setopt($ch, CURLOPT_CONNECTTIMEOUT_MS, 100); //Doesnt wait for the request to have been received by the server

  $response = curl_exec($ch);
  curl_close($ch);
}