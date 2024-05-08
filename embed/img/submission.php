<?php

require_once (dirname(__FILE__) . '/../../bootstrap.inc.php');
$font_path = dirname(__FILE__) . '/Renogare-Regular.otf';

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
$campaign = $map->campaign;


$campaignUrl = $submission->challenge->map->campaign->url;
//Url is in form of https://gamebanana.com/mods/123456
//We need to extract the mod id
preg_match('/\/mods\/(\d+)/', $campaignUrl, $matches);
$modId = $matches[1];

//Format it to be in the form of https://gamebanana.com/maps/embeddables/123456?type=sd_image
$img = imagecreatefromjpeg("https://gamebanana.com/mods/embeddables/" . $modId . "?type=sd_image");
//Crop the top 20 pixels
$cropTop = 62;
$img = imagecrop($img, ['x' => 0, 'y' => $cropTop, 'width' => imagesx($img), 'height' => imagesy($img) - $cropTop]);
//Main Color
// $color = imagecolorallocate($img, 220, 210, 60);
$color = imagecolorallocate($img, 255, 255, 255);
//Overlay 30% transparent black rectangle over the entire image
$black = imagecolorallocatealpha($img, 0, 0, 0, 40);
imagefilledrectangle($img, 0, 0, imagesx($img), imagesy($img), $black);


$startX = 20;
$startY = 50;
$rowPad = 5;


$string = $player->name;
$fontSize = 40;
$box = font_box($string, $fontSize);
//Center in X
$x = $startX + (imagesx($img) - $startX - $box["width"]) / 2;
//Set starting Y
$startY = $box[0 * 2 + 1] + $startY;
$coords = draw_string($img, $string, $fontSize, $x, $startY, $color);

$string = $map->name;
$fontSize = 40;
$box = font_box($string, $fontSize);
$startY = $coords[0 * 2 + 1] + $box["height"] + $rowPad;
$coords = draw_string($img, $string, $fontSize, $startX, $startY, $color);

$string = $campaign->name . " (by " . $campaign->author_gb_name . ")";
$fontSize = 15;
$box = font_box($string, $fontSize);
$startY = $coords[0 * 2 + 1] + $box["height"] + $rowPad;
$coords = draw_string($img, $string, $fontSize * 1, $startX, $startY, $color);

header("Content-type: image/png");
imagepng($img);
imagedestroy($img);