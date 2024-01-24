<?php

class NewChallenge extends DbObject
{
  public static string $table_name = 'new_challenge';

  public string $url;
  public ?string $name = null;
  public string $description;


  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'url' => $this->url,
      'name' => $this->name,
      'description' => $this->description,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->url = $arr[$prefix . 'url'];
    $this->description = $arr[$prefix . 'description'];

    if (isset($arr[$prefix . 'name']))
      $this->name = $arr[$prefix . 'name'];
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
  }

  // === Find Functions ===

  // === Utility Functions ===
  function __toString()
  {
    return "(NewChallenge, id:{$this->id}, url:'{$this->url}', name:'{$this->name}', description:'{$this->description}')";
  }
}