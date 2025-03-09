<?php

require_once(dirname(__FILE__) . '/../../bootstrap.inc.php');
$cache_folder = dirname(__FILE__) . '/cache';


$DB = db_connect();

$id = intval($_REQUEST['id']);
if ($id <= 0) {
  http_response_code(400);
  die();
}

$campaign = Campaign::get_by_id($DB, $id);
if (!$campaign) {
  http_response_code(404);
  die();
}

//Url is in form of https://gamebanana.com/mods/123456
$modId = $campaign->get_gamebanana_mod_id();

if ($modId === null) {
  http_response_code(404);
  die();
}

//Check if the modId is found as jpg from the cache folder
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

// The output image will be named "{submission_id}.jpg" in the "./submission" directory
// Output the image
header("Content-type: image/jpg");
echo file_get_contents($cacheFile);
