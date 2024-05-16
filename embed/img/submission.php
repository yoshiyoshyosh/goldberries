<?php

require_once (dirname(__FILE__) . '/../../bootstrap.inc.php');
$font_path = dirname(__FILE__) . '/Renogare-Regular.otf';
$cache_folder = dirname(__FILE__) . '/cache';


$DB = db_connect();

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
$map = $challenge->map;
$campaign = $challenge->get_campaign();

//Url is in form of https://gamebanana.com/mods/123456
$modId = $campaign->get_gamebanana_mod_id();

//Check if the modId is found as jpeg from the cache folder
if ($modId !== null) {
  $cacheFile = $cache_folder . "/" . $modId . ".jpg";
  if (!file_exists($cacheFile)) {
    //If not found, download the image from the internet
    $img = imagecreatefromjpeg("https://gamebanana.com/mods/embeddables/" . $modId . "?type=sd_image");
    //Crop the top 20 pixels
    $cropTop = 62;
    $img = imagecrop($img, ['x' => 0, 'y' => $cropTop, 'width' => imagesx($img), 'height' => imagesy($img) - $cropTop]);
    //Save the image to the cache folder
    imagejpeg($img, $cacheFile);
  }
}

// Check if the embed has already been generated before
if (file_exists("submission/$id.jpg")) {
  // Output the image
  header("Content-type: image/jpg");
  echo file_get_contents("submission/$id.jpg");
  die();
}


// Launch python script to generate embed

$wkhtmltoimage_path = constant('WKHTMLTOIMAGE_PATH');

//pack data into an array
$data = array(
  "submission_id" => $id,
  "submission_is_verified" => $submission->is_verified,
  "submission_is_fc" => $submission->is_fc,
  "submission_date_created" => $submission->date_created->format('Y-m-d'),
  "mod_id" => $modId,
  "player_name" => $player->name,
  "player_name_color_start" => $player->account['name_color_start'],
  "player_name_color_end" => $player->account['name_color_end'],
  "campaign_name" => $campaign->name,
  "campaign_author" => $campaign->author_gb_name,
  "challenge_description" => $challenge->description,
  "objective_icon_url" => $challenge->objective->icon_url,
  "difficulty_id" => $challenge->difficulty_id,
  "wkhtmltoimage_path" => $wkhtmltoimage_path,
  "file_name" => $id . "",
  "folder_name" => "submission",
  "fields" => ["submission_id", "submission_is_verified", "submission_is_fc", "submission_date_created", "mod_id", "player_name", "player_name_color_start", "player_name_color_end", "campaign_name", "campaign_author", "challenge_description", "objective_icon_url", "difficulty_id"],
);
if ($map !== null) {
  $data["map_name"] = $map->name;
  $data["fields"][] = "map_name";
}

// Encode in base64
$encodedData = base64_encode(json_encode($data));
// error_log("Encoded data: " . $encodedData);

// Launch python script called "submission.py" in the same directory
$python_command = constant('PYTHON_COMMAND');
$command = "$python_command submission.py $encodedData 2>&1";
$output = shell_exec($command);

error_log("Python output: " . $output);

// The output image will be named "{submission_id}.jpg" in the "./submission" directory
// Output the image
header("Content-type: image/jpg");
echo file_get_contents("submission/$id.jpg");
