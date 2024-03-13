<?php

class Difficulty extends DbObject
{
  public static string $table_name = 'difficulty';

  public string $name;
  public ?string $subtier = null;
  public int $sort;

  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'name' => $this->name,
      'subtier' => $this->subtier,
      'sort' => $this->sort,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->name = $arr[$prefix . 'name'];
    $this->sort = intval($arr[$prefix . 'sort']);

    if (isset($arr[$prefix . 'subtier']))
      $this->subtier = $arr[$prefix . 'subtier'];
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
  }

  // === Find Functions ===

  // === Utility Functions ===
  function __toString()
  {
    $subtierStr = to_string_null_check($this->subtier);
    return "(Difficulty, id:{$this->id}, name:'{$this->name}', subtier:'{$subtierStr}')";
  }

  function to_tier_name()
  {
    if ($this->subtier) {
      //Uppercase the first letter of subtier
      return ucfirst($this->subtier) . " " . $this->name;
    } else {
      return $this->name;
    }
  }
}
