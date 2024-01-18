<?php

abstract class DbObject
{
  public static string $table_name;

  public int $id;

  // === Abstract Functions ===
  abstract function get_field_set();
  abstract function apply_db_data($arr, $prefix = '');
  abstract function expand_foreign_keys($DB, $depth = 2, $dont_expand = array());

  // === Update Functions ===
  function update($DB)
  {
    $arr = $this->get_field_set();
    return db_update($DB, static::$table_name, $this->id, $arr);
  }

  function insert($DB)
  {
    $arr = $this->get_field_set();
    $id = db_insert($DB, static::$table_name, $arr);
    if ($id === false)
      return false;
    $this->id = $id;
    return true;
  }

  function delete($DB)
  {
    return db_delete($DB, static::$table_name, $this->id);
  }

  // === Find Functions ===
  static function get_by_id($DB, int $id, int $depth = 2, $dont_expand = array())
  {
    $arr = db_fetch_id($DB, static::$table_name, $id);
    if ($arr === false)
      return false;

    $obj = new static;
    $obj->apply_db_data($arr);
    $obj->expand_foreign_keys($DB, $depth, $dont_expand);
    return $obj;
  }

  // $id can be an ID, an array of IDs, or "all"
  static function get_request($DB, $id, int $depth = 2, $dont_expand = array())
  {
    $json_arr = array();
    $table = static::$table_name;

    if ($id === "all") {
      $result = pg_query($DB, "SELECT * FROM {$table};");
      if ($result === false)
        die_json(500, "Failed to query database");

      while ($row = pg_fetch_assoc($result)) {
        $obj = new static;
        $obj->apply_db_data($row);
        if ($depth > 1)
          $obj->expand_foreign_keys($DB, $depth, $dont_expand);
        $json_arr[] = $obj;
      }
      return $json_arr;
    }
    if (!is_valid_id_query($id)) {
      die_json(400, 'invalid query: invalid or missing id');
    }

    if (is_array($id)) {
      foreach ($id as $val) {
        $obj = static::get_by_id($DB, intval($val), $depth, $dont_expand);
        if ($obj === false) {
          die_json(400, "invalid query: id {$val} does not exist");
        }
        $json_arr[] = $obj;
      }
      return $json_arr;
    } else {
      $obj = static::get_by_id($DB, $id, $depth, $dont_expand);
      if ($obj === false) {
        die_json(400, "invalid query: id {$id} does not exist");
      }
      return $obj;
    }
  }

  // === Utility Functions ===
  function __toString()
  {
    return "({$this->table_name}, id: {$this->id})";
  }
}