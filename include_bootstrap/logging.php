<?php


function log_msg($level, $message, $topic = null)
{
  global $DB;

  $log = new Logging();
  $log->level = $level;
  $log->message = $message;
  $log->topic = $topic;
  $log->date = new JsonDateTime();

  $log->insert($DB);
}

function log_debug($message, $topic = null)
{
  log_msg('debug', $message, $topic);
}
function log_info($message, $topic = null)
{
  log_msg('info', $message, $topic);
}
function log_warn($message, $topic = null)
{
  log_msg('warn', $message, $topic);
}
function log_error($message, $topic = null)
{
  log_msg('error', $message, $topic);
}
function log_critical($message, $topic = null)
{
  log_msg('critical', $message, $topic);
}