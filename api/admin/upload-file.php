<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  die_json(405, 'Method Not Allowed');
}

$account = get_user_data();
check_access($account, false);
if (!is_news_writer($account)) {
  die_json(403, "Not authorized");
}

$destination_base = "../../";
$destinations = [
  "icon" => "icons",
  "campaign_icon" => "icons/campaigns",
  "post" => "img/post",
  "badge" => "badges",
];
$min_role = [
  "icon" => $HELPER,
  "campaign_icon" => $HELPER,
  "post" => $NEWS_WRITER,
  "badge" => $HELPER,
];
$allowed_extensions = ["png", "jpg", "jpeg", "gif", "svg"];

//The request has 2 parameters: file and destination
//The destination can be one of the values from above
//The file is the file to be uploaded
if (!isset($_FILES['file']) || !isset($_POST['destination'])) {
  die_json(400, "Missing one or more required parameters: file, destination");
}

$destination = $_POST['destination'];
if (!array_key_exists($destination, $destinations)) {
  die_json(400, "Destination must match one of the following: " . implode(", ", array_keys($destinations)));
}
if ($account->role < $min_role[$destination]) {
  die_json(403, "Not authorized to upload to this destination");
}

$target_destination = $destinations[$destination];
$path = $destination_base . $target_destination . "/";

//Path definitely exists
if (!file_exists($path)) {
  die_json(500, "Destination path does not exist");
}

$file_name = $_POST['file_name'] ?? pathinfo($_FILES['file']['name'], PATHINFO_FILENAME);
//Clean the file name to be only alphanumeric, periods, and hyphens
$file_name = preg_replace('/[^a-zA-Z0-9\.\-]/', '_', $file_name);

$ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
if (!in_array($ext, $allowed_extensions)) {
  die_json(400, "File extension not allowed");
}

$full_name = "$file_name.$ext";
$full_path = $path . $full_name;

//Does file already exist?
if (file_exists($full_path)) {
  die_json(400, "File already exists");
}

// $ext = pathinfo($file_name, PATHINFO_EXTENSION);
// $file_name = pathinfo($file_name, PATHINFO_FILENAME);
// $file_name = "$file_name.$ext";

if (move_uploaded_file($_FILES['file']['tmp_name'], $full_path)) {
  api_write([
    "file_name" => $full_name,
    "path" => "/$target_destination/$full_name"
  ]);
} else {
  die_json(500, "Failed to upload file '" . $_FILES['file']['tmp_name'] . "' to path: $full_path");
}