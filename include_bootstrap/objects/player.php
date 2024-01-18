<?php

class Player extends DbObject
{
  public static string $table_name = 'Player';

  public string $name;

  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'name' => $this->name,
    );
  }
  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->name = $arr[$prefix . 'name'];
    $this->password = $arr[$prefix . 'password'];
    $this->is_verifier = $arr[$prefix . 'is_verifier'] === 't';
    $this->is_admin = $arr[$prefix . 'is_admin'] === 't';
    $this->is_suspended = $arr[$prefix . 'is_suspended'] === 't';
    $this->date_created = $arr[$prefix . 'date_created'];

    if (isset($arr[$prefix . 'suspension_reason']))
      $this->suspension_reason = $arr[$prefix . 'suspension_reason'];
  }
  function expand_foreign_keys($DB, $depth = 2, $dont_expand = array())
  {
  }

  // === Find Functions ===


  // === Utility Functions ===
  function __toString()
  {
    return "(Player, id:{$this->id}, name:'{$this->name}')";
  }
}
