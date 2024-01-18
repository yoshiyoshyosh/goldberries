<?php

class Logging
{
  public int $id;
  public string $message;
  public string $level;
  public $topic = null; /* string */
  public DateTime $date;

  // === Core Functions ===
  function pull_from_db($DB, int $id): bool
  {
    $arr = db_fetch_id($DB, 'Logging', $id);
    if ($arr === false)
      return false;

    $this->apply_db_data($arr);
    return true;
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->message = $arr[$prefix . 'message'];
    $this->level = $arr[$prefix . 'level'];
    $this->date = new DateTime($arr[$prefix . 'date']);

    if (isset($arr[$prefix . 'topic']))
      $this->topic = $arr[$prefix . 'topic'];
  }

  function clone_for_api($DB)
  {
    return clone $this;
  }

  function expand_foreign_keys($DB)
  {
  }

  function get_field_set()
  {
    return array(
      'message' => $this->message,
      'level' => $this->level,
      'topic' => $this->topic,
      'date' => $this->date,
    );
  }

  // === Update Functions ===
  function update($DB)
  {
    $arr = $this->get_field_set();
    return db_update($DB, 'Logging', $this->id, $arr);
  }

  function insert($DB)
  {
    $arr = $this->get_field_set();
    $id = db_insert($DB, 'Logging', $arr);
    if ($id === false)
      return false;
    $this->id = $id;
    return true;
  }

  function delete($DB)
  {
    return db_delete($DB, 'Logging', $this->id);
  }


  // === Find Functions ===
  static function get_all($DB, $last = "day", $level = null, $topic = null, $search = null)
  {
    $where = "date > date_trunc('day', NOW()) - interval '1 day'";
    if ($last == "week")
      $where .= "date > date_trunc('week', NOW()) - interval '1 week'";
    else if ($last == "month")
      $where .= "date > date_trunc('month', NOW()) - interval '1 month'";
    else if ($last == "year")
      $where .= "date > date_trunc('year', NOW()) - interval '1 year'";
    else if ($last == "all")
      $where .= "1 = 1";

    $arr = array();
    $i = 1;
    if ($level != null) {
      $where .= " AND level = '\${$i}'";
      $arr[] = $level;
      $i++;
    }
    if ($topic != null) {
      $where .= " AND topic = '\${$i}'";
      $arr[] = $topic;
      $i++;
    }

    if ($search != null) {
      $where .= " AND LOWER(message) LIKE LOWER('%'||\${$i}||'%')";
      $arr[] = $search;
      $i++;
    }

    $where .= " ORDER BY date DESC";
    error_log("Where statement: $where");

    $logs = find_in_db($DB, 'Logging', $where, $arr, new Logging());
    if ($logs === false)
      return false;

    return $logs;
  }
}
