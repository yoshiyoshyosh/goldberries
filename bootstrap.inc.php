<?php

define("GB_ROOT_LOCAL", dirname(__FILE__));

require_once (GB_ROOT_LOCAL . "/include_bootstrap/config.php");
require_once (GB_ROOT_LOCAL . "/include_bootstrap/DB.php");
require_once (GB_ROOT_LOCAL . "/include_bootstrap/functions.php");

$requireObjects = array(
  "dbobject",
  "campaign",
  "challenge",
  "difficulty",
  "map",
  "objective",
  "player",
  "submission",
  "account",
  "session",
  "logging",
  "change",
  "newchallenge"
);

foreach ($requireObjects as $obj) {
  require_once (GB_ROOT_LOCAL . "/include_bootstrap/objects/{$obj}.php");
}

require_once (GB_ROOT_LOCAL . "/include_bootstrap/util.php");
require_once (GB_ROOT_LOCAL . "/include_bootstrap/logging.php");
require_once (GB_ROOT_LOCAL . "/include_bootstrap/session.php");

?>