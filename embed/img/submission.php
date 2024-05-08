<?php

require_once (dirname(__FILE__) . '/../../bootstrap.inc.php');
$font_path = dirname(__FILE__) . '/Renogare-Regular.otf';
$cache_folder = dirname(__FILE__) . '/cache';

function draw_string($img, $string, $size, $x, $y, $color)
{
  global $font_path;
  return imagefttext($img, $size, 0, $x, $y, $color, $font_path, $string);
}
function log_array($array)
{
  //Log box, so x & y being two elements in an array
  //for loop for 2 elements each
  for ($i = 0; $i < count($array) / 2; $i++) {
    error_log("x:" . $array[$i * 2 + 0] . ", y:" . $array[$i * 2 + 1]);
  }
}

//Box provides coordinates, we are interested in x, y, width, height
function box_to_bounds($box)
{
  if (!$box)
    return $box;
  return array(
    "x" => $box[0 * 2 + 0],
    "y" => $box[0 * 2 + 1],
    "width" => $box[2 * 2 + 0] - $box[0 * 2 + 0],
    "height" => $box[0 * 2 + 1] - $box[2 * 2 + 1]
  );
}
function font_box($string, $size, $angle = 0)
{
  global $font_path;
  return box_to_bounds(imagettfbbox($size, $angle, $font_path, $string));
}



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
if ($modId === null) {
  //Create blank white image with 1000x500
  $img = imagecreatetruecolor(1000, 500);
  $color = imagecolorallocate($img, 0, 0, 0);
  imagefill($img, 0, 0, $color);
} else {
  $cacheFile = $cache_folder . "/" . $modId . ".jpg";
  if (file_exists($cacheFile)) {
    $img = imagecreatefromjpeg($cacheFile);
  } else {
    //If not found, download the image from the internet
    $img = imagecreatefromjpeg("https://gamebanana.com/mods/embeddables/" . $modId . "?type=sd_image");
    //Save the image to the cache folder
    imagejpeg($img, $cacheFile);
  }
}

//If its not already at 1000x500, scale it to fit
$img = imagescale($img, 1000, 500);

//Crop the top 20 pixels
$cropTop = 62;
$img = imagecrop($img, ['x' => 0, 'y' => $cropTop, 'width' => imagesx($img), 'height' => imagesy($img) - $cropTop]);
//Main Color
// $color = imagecolorallocate($img, 220, 210, 60);
$color = imagecolorallocate($img, 255, 255, 255);
$red = imagecolorallocate($img, 255, 0, 0);
$yellow = imagecolorallocate($img, 255, 255, 0);
$green = imagecolorallocate($img, 0, 255, 0);
//Overlay 30% transparent black rectangle over the entire image
$black = imagecolorallocatealpha($img, 0, 0, 0, 40);
imagefilledrectangle($img, 0, 0, imagesx($img), imagesy($img), $black);


$startX = 20;
$startY = 60;
$rowPad = 10;

$string = $player->name;
$fontSize = 45;
$box = font_box($string, $fontSize);
//Center in X
$x = $startX + (imagesx($img) - $startX - $box["width"]) / 2;
//Set starting Y
$startY = $box[0 * 2 + 1] + $startY;
$coords = draw_string($img, $string, $fontSize, $x, $startY, $color);

if ($map !== null) {
  $string = $map->name;
  $box = font_box($string, $fontSize);
  $startY = $coords[0 * 2 + 1] + $box["height"] + $rowPad;
  $coords = draw_string($img, $string, $fontSize, $startX, $startY, $color);
}

$string = $campaign->name . " (by " . $campaign->author_gb_name . ")";
$fontSize = 25;
$box = font_box($string, $fontSize);
$startY = $coords[0 * 2 + 1] + $box["height"] + $rowPad;
$coords = draw_string($img, $string, $fontSize * 1, $startX, $startY, $color);

$string = $challenge->objective->name . ($challenge->description !== null ? " [" . $challenge->description . "]" : "");
$box = font_box($string, $fontSize);
$startY = $coords[0 * 2 + 1] + $box["height"] + $rowPad;
$coords = draw_string($img, $string, $fontSize, $startX, $startY, $color);

$string = "Difficulty: " . $challenge->difficulty->to_tier_name();
$box = font_box($string, $fontSize);
$startY = $coords[0 * 2 + 1] + $box["height"] + $rowPad * 4;
$coords = draw_string($img, $string, $fontSize, $startX, $startY, $color);

$string = "Status: ";
$box = font_box($string, $fontSize);
$startY = $coords[0 * 2 + 1] + $box["height"] + $rowPad;
$coords = draw_string($img, $string, $fontSize, $startX, $startY, $color);

$string = $submission->status_string();
$statusColor = $submission->is_verified === null ? $yellow : ($submission->is_verified ? $green : $red);
$startX = $box["width"] + $rowPad * 3;
$box = font_box($string, $fontSize);
$coords = draw_string($img, $string, $fontSize, $startX, $startY, $statusColor);



$objectiveIcon = "../.." . ($challenge->objective->icon_url ?? "/icons/goldenberry-8x.png");
$objectiveIcon = imagecreatefrompng($objectiveIcon);
$scaleDown = 1;
$objectiveIcon = imagescale($objectiveIcon, imagesx($objectiveIcon) / $scaleDown, imagesy($objectiveIcon) / $scaleDown);
//Have this image anchor in bottom right
$offset = 40;
$x = imagesx($img) - imagesx($objectiveIcon) - $offset;
$y = imagesy($img) - imagesy($objectiveIcon) - $offset;
imagecopy($img, $objectiveIcon, $x, $y, 0, 0, imagesx($objectiveIcon), imagesy($objectiveIcon));

header("Content-type: image/png");
imagepng($img);
imagedestroy($img);