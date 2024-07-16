<?php

$webhooks_enabled = true;

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
  $suggestion_url = constant("BASE_URL") . "/suggestions/" . $suggestion->id;

  $objective = "";

  $fields = [];

  $fields[] = [
    "name" => "Author: " . $suggestion->author->name,
    "value" => "Comment: " . $suggestion->comment,
    "inline" => false,
  ];

  if ($challenge) {
    $objective = $challenge->objective->name;
    if ($challenge->get_suffix() !== null) {
      $objective += " [" . $challenge->get_suffix() . "]";
    }

    $current_diff_name = $challenge->difficulty->to_tier_name();
    $suggested_diff_name = $suggestion->suggested_difficulty->to_tier_name();

    $fields[] = [
      "name" => "Placement",
      "value" => $current_diff_name . " -> " . $suggested_diff_name,
      "inline" => false
    ];

    $submission_index = 0;
    foreach ($challenge->submissions as $submission) {
      $diff_suggestion = $submission->suggested_difficulty;
      //Not sure if this is the best way to handle personal suggestions in the embed
      if ($submission->is_personal)
        $diff_suggestion = null;
      $as_text = $diff_suggestion !== null ? "{$diff_suggestion->to_tier_name()}" : "<none>";
      $fields[] = [
        "name" => "`" . $submission->player->get_name_escaped() . "`",
        "value" => $as_text,
        "inline" => true
      ];
      $submission_index++;

      //If there are 24 submissions at this point, break
      if (count($fields) >= 24) {
        $count = count($challenge->submissions) - 24;
        $fields[] = [
          "name" => "And more...",
          "value" => "There are $count more submissions for this challenge",
          "inline" => false
        ];
        break;
      }
    }
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
        "title" => "Suggestion for '$name' by {$suggestion->author->name}",
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
  foreach ($challenge->submissions as $submission) {
    $account = $submission->player->get_account($DB);
    if ($account !== null && $account->discord_id !== null && $account->n_suggestion) {
      $ping_list[] = "<@{$account->discord_id}>";
    }
  }
  $ping_addition = count($ping_list) > 0 ? " " . implode(" ", $ping_list) : "";
  $message = ":memo: A new suggestion was made for {$challenge_name}!{$ping_addition}";
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
  $webhook_url = constant('SUGGESTION_BOX_WEBHOOK_URL');
  $allowed_mentions = ["users" => []];

  if ($account !== null && $account->discord_id !== null && $account->n_sub_verified) {
    $player_name = "<@{$account->discord_id}>";
    $allowed_mentions["users"][] = $account->discord_id;
  }

  $challenge_name = $submission->challenge->get_name_for_discord();
  $submission_url = $submission->get_url();
  $is_rejected = $submission->is_verified === false;
  $emote = $is_rejected ? ":x:" : ":white_check_mark:";
  $verified_str = $is_rejected ? "rejected" : "verified";
  $message = "$emote $player_name → Your [submission](<{$submission_url}>) for {$challenge_name} was $verified_str!";
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
  $webhook_url = constant('SUGGESTION_BOX_WEBHOOK_URL');
  $challenge_name = $challenge->get_name_for_discord();

  $list_impacted = [];

  foreach ($challenge->submissions as $submission) {
    if ($submission->suggested_difficulty_id !== null && !$submission->is_personal) {
      $submission_url = $submission->get_url();
      $name = "[{$submission->player->name}]({$submission_url})";
      $account = $submission->player->get_account($DB);
      if ($account !== null && $account->discord_id !== null && $account->n_chall_personal) {
        $name .= " (<@{$account->discord_id}>)";
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
  send_simple_webhook_message($webhook_url, $message);
}

function send_webhook_challenge_moved($challenge, $new_difficulty_id)
{
  global $DB;
  global $webhooks_enabled;
  if (!$webhooks_enabled) {
    return;
  }

  $challenge->expand_foreign_keys($DB, 5);
  if ($challenge->submissions === null) {
    $challenge->fetch_submissions($DB);
  }
  $webhook_url = constant('SUGGESTION_BOX_WEBHOOK_URL');
  $challenge_name = $challenge->get_name_for_discord();
  $old_difficulty = $challenge->difficulty->to_tier_name();
  $new_difficulty = Difficulty::get_by_id($DB, $new_difficulty_id)->to_tier_name();

  $ping_list = [];
  foreach ($challenge->submissions as $submission) {
    $account = $submission->player->get_account($DB);
    if ($account !== null && $account->discord_id !== null && $account->n_chall_moved) {
      $ping_list[] = "<@{$account->discord_id}>";
    }
  }
  $ping_addition = count($ping_list) > 0 ? " " . implode(" ", $ping_list) : "";

  $message = ":arrows_counterclockwise: Difficulty for {$challenge_name} was changed from **$old_difficulty** to **$new_difficulty**!{$ping_addition}";
  send_simple_webhook_message($webhook_url, $message);
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