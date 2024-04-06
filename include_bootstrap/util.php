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

  public function __toString()
  {
    return $this->format("c");
  }
}


// Top Golden List utils
function find_challenge_in_array($arr, $challenge_id)
{
  foreach ($arr as $challenge) {
    if ($challenge->id === $challenge_id) {
      return $challenge;
    }
  }
  return null;
}

function get_tier_index($difficulty)
{
  switch ($difficulty->name) {
    case "Tier 0":
      return 0;
    case "Tier 1":
      return 1;
    case "Tier 2":
      return 2;
    case "Tier 3":
      return 3;
    case "Tier 4":
      return 4;
    case "Tier 5":
      return 5;
    case "Tier 6":
      return 6;
    case "Tier 7":
      return 7;
    case "Undetermined":
      return 8;
  }
}

function get_subtier_index($difficulty)
{
  if (isset($difficulty->subtier)) {
    switch ($difficulty->subtier) {
      case "high":
        return 0;
      case "mid":
        return 1;
      case "low":
        return 2;
      case "guard":
        return 3;
    }
  }

  return 0;
}