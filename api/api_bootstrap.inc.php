<?php

require_once(dirname(__FILE__) . '/../bootstrap.inc.php');
require_once('api_functions.inc.php');

$DB = db_connect();

header('Content-Type: application/json; charset=UTF-8');
//CORS allow all header
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Credentials: true');

?>