<?php

class Logging extends DbObject
{
  public static string $table_name = 'logging';

  public string $message;
  public string $level;
  public $topic = null; /* string */
  public DateTime $date;

  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'message' => $this->message,
      'level' => $this->level,
      'topic' => $this->topic,
      'date' => $this->date,
    );
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

  function expand_foreign_keys($DB, $depth = 2, $dont_expand = array())
  {
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
      $where .= " AND level = \${$i}";
      $arr[] = $level;
      $i++;
    }
    if ($topic != null) {
      $where .= " AND topic = \${$i}";
      $arr[] = $topic;
      $i++;
    }

    if ($search != null) {
      $where .= " AND LOWER(message) LIKE LOWER('%'||\${$i}||'%')";
      $arr[] = $search;
      $i++;
    }

    $where .= " ORDER BY date DESC";

    $logs = find_in_db($DB, 'Logging', $where, $arr, new Logging());
    if ($logs === false)
      return false;

    return $logs;
  }

  // === Utility Functions ===
  function __toString()
  {
    $topicStr = to_string_null_check($this->topic);
    $dateStr = date_to_long_string($this->date);
    return "(Logging, id: {$this->id}, message: '{$this->message}', level: '{$this->level}', topic: '{$topicStr}', date: '{$dateStr}')";
  }
}
