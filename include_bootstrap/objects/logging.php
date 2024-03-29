<?php

class Logging extends DbObject
{
  public static string $table_name = 'logging';

  public static array $LEVELS = array('debug', 'info', 'warn', 'error', 'critical');

  public string $message;
  public string $level;
  public $topic = null; /* string */
  public JsonDateTime $date;

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
    $this->date = new JsonDateTime($arr[$prefix . 'date']);

    if (isset($arr[$prefix . 'topic']))
      $this->topic = $arr[$prefix . 'topic'];
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
  }

  // === Find Functions ===
  static function get_all($DB, $time = "day", $level = null, $topic = null, $search = null)
  {
    $where = "date > date_trunc('day', NOW()) - interval '1 day'";
    if ($time == "week")
      $where = "date > date_trunc('week', NOW()) - interval '1 week'";
    else if ($time == "month")
      $where = "date > date_trunc('month', NOW()) - interval '1 month'";
    else if ($time == "year")
      $where = "date > date_trunc('year', NOW()) - interval '1 year'";
    else if ($time == "all")
      $where = "1 = 1";

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


  static function get_paginated($DB, $page, $per_page, $level, $topic, $search, $date_start, $date_end)
  {
    $query = "SELECT * FROM logging";

    $where = array();
    if ($level !== null) {
      //find index of level in LEVELS
      $level_index = array_search($level, self::$LEVELS);
      if ($level_index === false) {
        die_json(400, "Invalid level");
      }
      $levelsToInclude = array_slice(self::$LEVELS, $level_index);
      $where[] = "level IN ('" . implode("', '", $levelsToInclude) . "')";
    }
    if ($topic !== null) {
      $topic = pg_escape_string($topic);
      $where[] = "topic = '" . $topic . "'";
    }
    if ($search !== null) {
      $search = pg_escape_string($search);
      $where[] = "message ILIKE '%" . $search . "%'";
    }
    if ($date_start !== null) {
      $date_start = pg_escape_string($date_start);
      $where[] = "date >= '" . $date_start . "'";
    }
    if ($date_end !== null) {
      $date_end = pg_escape_string($date_end);
      $where[] = "date <= '" . $date_end . "'";
    }

    if (count($where) > 0) {
      $query .= " WHERE " . implode(" AND ", $where);
    }

    $query .= " ORDER BY date DESC";

    $query = "
    WITH logs AS (
      " . $query . "
    )
    SELECT *, count(*) OVER () AS total_count
    FROM logs";

    if ($per_page !== -1) {
      $query .= " LIMIT " . $per_page . " OFFSET " . ($page - 1) * $per_page;
    }

    $result = pg_query($DB, $query);
    if (!$result) {
      die_json(500, "Failed to query database");
    }

    $maxCount = 0;
    $logs = array();
    while ($row = pg_fetch_assoc($result)) {
      $log = new Logging();
      $log->apply_db_data($row);
      $logs[] = $log;

      if ($maxCount === 0) {
        $maxCount = intval($row['total_count']);
      }
    }

    return array(
      'logs' => $logs,
      'max_count' => $maxCount,
      'max_page' => ceil($maxCount / $per_page),
      'page' => $page,
      'per_page' => $per_page,
    );
  }

  // === Utility Functions ===
  function __toString()
  {
    $topicStr = to_string_null_check($this->topic);
    $dateStr = date_to_long_string($this->date);
    return "(Logging, id: {$this->id}, message: '{$this->message}', level: '{$this->level}', topic: '{$topicStr}', date: '{$dateStr}')";
  }
}
