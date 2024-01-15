<?php

class Difficulty
{
  public int $id;
  public string $name;
  public $subtier = null; /* string */
  public int $sort;
  public string $color;
  public string $color_group;

  function pull_from_db($DB, int $id): bool
  {
    $arr = db_fetch_id($DB, 'Difficulty', $id);
    if ($arr === false)
      return false;

    $this->apply_db_data($arr);
    return true;
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->name = $arr[$prefix . 'name'];
    $this->sort = intval($arr[$prefix . 'sort']);
    $this->color = $arr[$prefix . 'color'];
    $this->color_group = $arr[$prefix . 'color_group'];

    if (isset($arr[$prefix . 'subtier']))
      $this->subtier = $arr[$prefix . 'subtier'];
  }

  function clone_for_api($DB)
  {
    return clone $this;
  }

  function expand_foreign_keys($DB)
  {
  }
}
