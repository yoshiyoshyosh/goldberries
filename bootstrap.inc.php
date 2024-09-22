<?php

define("GB_ROOT_LOCAL", dirname(__FILE__));

require_once(GB_ROOT_LOCAL . "/include_bootstrap/config.php");
require_once(GB_ROOT_LOCAL . "/include_bootstrap/DB.php");

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
  "newchallenge",
  "suggestion",
  "suggestion_vote",
  "showcase",
  "verification_notice",
  "server_settings",
);

foreach ($requireObjects as $obj) {
  require_once(GB_ROOT_LOCAL . "/include_bootstrap/objects/{$obj}.php");
}

require_once(GB_ROOT_LOCAL . "/include_bootstrap/util.php");
require_once(GB_ROOT_LOCAL . "/include_bootstrap/logging.php");
require_once(GB_ROOT_LOCAL . "/include_bootstrap/session.php");
require_once(GB_ROOT_LOCAL . "/include_bootstrap/discord_webhook.php");
require_once(GB_ROOT_LOCAL . "/include_bootstrap/embed_manage.php");




// /**
//  * Error handler, passes flow over the exception logger with new ErrorException.
//  */
// function log_error_state($num, $str, $file, $line, $context = null)
// {
//   log_exception(new ErrorException($str, 0, $num, $file, $line));
// }

/**
 * Uncaught exception handler.
 */
function log_exception($e)
{
  //$e is some kind of Exception or Error
  $message = "";

  if ($e instanceof Error) {
    $message = "Type: " . get_class($e) . "; Message: {$e->getMessage()}; File: {$e->getFile()}; Line: {$e->getLine()};";
    log_error("[Error] " . $message, "Server Error");
    http_response_code(500);
    exit();
  } else if ($e instanceof Exception) {
    $message = "Type: " . get_class($e) . "; Message: {$e->getMessage()}; File: {$e->getFile()}; Line: {$e->getLine()};";
    log_error("[Exception] " . $message, "Server Error");
    http_response_code(500);
    exit();
  }
}

// /**
//  * Checks for a fatal error, work around for set_error_handler not working on fatal errors.
//  */
// // function check_for_fatal()
// // {
// //   $error = error_get_last();
// //   if ($error["type"] == E_ERROR)
// //     log_error($error["type"], $error["message"], $error["file"], $error["line"]);
// // }

// // register_shutdown_function( "check_for_fatal" );
// set_error_handler("log_error_state");
set_exception_handler("log_exception");