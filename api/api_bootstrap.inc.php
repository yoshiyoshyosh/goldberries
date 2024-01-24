<?php

require_once(dirname(__FILE__) . '/../bootstrap.inc.php');
require_once('api_functions.inc.php');

$DB = db_connect();

header('Content-Type: application/json; charset=UTF-8');
//CORS allow all header
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: content-type, authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}