<?php

/* A script for various utility functions */

define("LONG_DATE_FORMAT", "Y-m-d H:i:s");
define("SHORT_DATE_FORMAT", "Y-m-d");

function date_to_long_string($date)
{
  if ($date === null)
    return "-";
  return $date->format(constant("LONG_DATE_FORMAT"));
}
function date_to_short_string($date)
{
  if ($date === null)
    return "-";
  return $date->format(constant("SHORT_DATE_FORMAT"));
}
function date_from_long_string($date_string)
{
  if ($date_string === null)
    return null;
  return DateTime::createFromFormat(constant("LONG_DATE_FORMAT"), $date_string);
}
function date_from_short_string($date_string)
{
  if ($date_string === null)
    return null;
  return DateTime::createFromFormat(constant("SHORT_DATE_FORMAT"), $date_string);
}

function date_to_string_difference($date)
{
  if ($date === null)
    return "-";

  //output something like "1 hour ago", "2 days ago", "3 months ago", "4 years ago"
  $now = new DateTime();
  $diff = $now->diff($date);

  if ($diff->y > 0) {
    return $diff->y . " year" . ($diff->y > 1 ? "s" : "") . " ago";
  } else if ($diff->m > 0) {
    return $diff->m . " month" . ($diff->m > 1 ? "s" : "") . " ago";
  } else if ($diff->d > 0) {
    return $diff->d . " day" . ($diff->d > 1 ? "s" : "") . " ago";
  } else if ($diff->h > 0) {
    return $diff->h . " hour" . ($diff->h > 1 ? "s" : "") . " ago";
  } else if ($diff->i > 0) {
    return $diff->i . " minute" . ($diff->i > 1 ? "s" : "") . " ago";
  } else if ($diff->s > 0) {
    return $diff->s . " second" . ($diff->s > 1 ? "s" : "") . " ago";
  } else {
    return "just now";
  }
}

function to_string_null_check($value)
{
  return $value === null ? "NULL" : $value . "";
}


class JsonDateTime extends \DateTime implements \JsonSerializable
{
  public function jsonSerialize()
  {
    return $this->format("c");
  }
}