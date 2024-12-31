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

  public function diff(DateTimeInterface $other, bool $absolute = false)
  {
    return parent::diff($other, $absolute);
  }

  public function __toString()
  {
    return $this->format("c");
  }
}

class StringList implements \JsonSerializable
{
  static $ITEM_SEPERATOR = "\t";
  static $VALUE_SEPERATOR = "|";

  public $arr = [];
  public $value_count = 1;

  public function __construct($value_count, $str = '')
  {
    $this->value_count = $value_count;
    if ($str !== '')
      $this->parse($str);
  }

  function parse($str)
  {
    $this->arr = StringList::parse_list($str, $this->value_count);
  }

  static function parse_list($str, $value_count)
  {
    //Within 1 string there will be a list of items, seperated by a tab. the items iteself are a value and a description, seperated by a semi-colon
    //Trim and remove items with empty values
    $items = explode(StringList::$ITEM_SEPERATOR, $str);
    $output = array();
    foreach ($items as $item) {
      $item = trim($item);
      if ($item === '') {
        continue;
      }
      $parts = array_map('trim', explode(StringList::$VALUE_SEPERATOR, $item));

      //If too big, truncate
      if (count($parts) > $value_count)
        $parts = array_slice($parts, 0, $value_count);

      //If too small, pad with empty strings
      if (count($parts) < $value_count)
        $parts = array_pad($parts, $value_count, "");

      $output[] = $parts;
    }
    return $output;
  }

  function __toString(): string
  {
    $outputArr = [];
    foreach ($this->arr as $item) {
      //$item is an array of X elements
      //If too big, truncate
      if (count($item) > $this->value_count)
        $item = array_slice($item, 0, $this->value_count);

      //If too small, pad with empty strings
      if (count($item) < $this->value_count)
        $item = array_pad($item, $this->value_count, "");

      //Remove VALUE_SEPERATOR and ITEM_SEPERATOR from the values
      $item = array_map(function ($value) {
        return str_replace(StringList::$VALUE_SEPERATOR, "", str_replace(StringList::$ITEM_SEPERATOR, "", $value));
      }, $item);

      $outputArr[] = implode(StringList::$VALUE_SEPERATOR, $item);
    }
    return implode(StringList::$ITEM_SEPERATOR, $outputArr);
  }

  public function jsonSerialize()
  {
    return $this->arr;
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
    case "High Standard":
      return 8;
    case "Mid Standard":
      return 9;
    case "Low Standard":
      return 10;
    case "Undetermined":
      return 11;
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

function fetch_data($url)
{
  $ch = curl_init();
  $timeout = 5;
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
  $data = curl_exec($ch);
  curl_close($ch);
  return $data;
}

function input_method_to_string($input_method)
{
  switch ($input_method) {
    case "keyboard":
      return "Keyboard";
    case "dpad":
      return "Controller (D-Pad)";
    case "analog":
      return "Controller (Analog)";
    case "hybrid":
      return "Hybrid";
    case "other":
      return "Other";
    default:
      return "Unknown";
  }
}

function is_side_name($name)
{
  //If the name is in the pattern X-Side, with X being either 1 or 2 letters long, then it's a side name
  return preg_match("/^[a-zA-Z]{1,2}-Side$/", $name) === 1;
}