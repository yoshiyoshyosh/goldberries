<?php

define("GB_ROOT_LOCAL", dirname(__FILE__));

require_once(GB_ROOT_LOCAL . "/include_bootstrap/config.php");
require_once(GB_ROOT_LOCAL . "/include_bootstrap/DB.php");
require_once(GB_ROOT_LOCAL . "/include_bootstrap/functions.php");

$requireObjects = array("campaign", "challenge", "difficulty", "map", "objective", "player", "submission");

foreach ($requireObjects as $obj) {
  require_once(GB_ROOT_LOCAL . "/include_bootstrap/objects/{$obj}.php");
}

?>