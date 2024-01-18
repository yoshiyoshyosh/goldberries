<?php

class Objective extends DbObject
{
  public static string $table_name = 'objective';

  public string $name;
  public string $description;
  public ?string $display_name_suffix = null;
  public bool $is_arbitrary;


  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'name' => $this->name,
      'description' => $this->description,
      'display_name_suffix' => $this->display_name_suffix,
      'is_arbitrary' => $this->is_arbitrary,
    );
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

  function expand_foreign_keys($DB, $depth = 2, $dont_expand = array())
  {
  }

  // === Find Functions ===

  // === Utility Functions ===
  function __toString()
  {
    $arbitraryStr = $this->is_arbitrary ? 'true' : 'false';
    return "(Objective, id:{$this->id}, name:'{$this->name}', is_arbitrary:{$arbitraryStr})";
  }
}