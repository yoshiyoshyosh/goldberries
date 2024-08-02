<?php
require_once (__DIR__ . '/../bootstrap.inc.php');
require_once ('api_functions.inc.php');

$DB = db_connect();

header('Content-Type: application/json; charset=UTF-8');

//CORS https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
//In the test environment, the frontend runs on localhost:3000 while the backend runs on localhost. This is a cross-origin request.
//In order to allow the test frontend to make credentialed requests, the access control allow origin header must have the correct value.
//Any other origin should not use the main domain's cookies, and thus will receive the wildcard value *, which does not allow credentials.
//Check if $_SERVER even has the HTTP_ORIGIN key, as it may not be set in some cases.
// $http_origin = $_SERVER['HTTP_ORIGIN'];
$http_origin = key_exists('HTTP_ORIGIN', $_SERVER) ? $_SERVER['HTTP_ORIGIN'] : null;
if ($http_origin === "http://localhost:3000") {
  header("Access-Control-Allow-Origin: http://localhost:3000");
  header('Access-Control-Allow-Credentials: true');
} else {
  header("Access-Control-Allow-Origin: *");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: content-type, authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}