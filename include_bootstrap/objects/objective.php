<?php

class Objective
{
  public int $id;
  public string $name;
  public string $description;
  public bool $is_arbitrary;
  public $display_name_suffix = null; /* string */

  function pull_from_db($DB, int $id): bool
  {
    $arr = db_fetch_id($DB, 'Objective', $id);
    if ($arr === false)
      return false;

    $this->apply_db_data($arr);
    return true;
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->name = $arr[$prefix . 'name'];
    $this->description = $arr[$prefix . 'description'];
    $this->is_arbitrary = $arr[$prefix . 'is_arbitrary'] === 't';

    if (isset($arr[$prefix . 'display_name_suffix']))
      $this->display_name_suffix = $arr[$prefix . 'display_name_suffix'];
  }

  function clone_for_api($DB)
  {
    return clone $this;
  }

  function expand_foreign_keys($DB)
  {
  }
}

?>