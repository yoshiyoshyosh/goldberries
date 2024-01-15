<?php

class Player
{
  public int $id;
  public string $name;
  public $password = null; // string
  public bool $is_verifier;
  public bool $is_admin;
  public bool $is_suspended;
  public string $suspension_reason;
  public string $date_created;

  function pull_from_db($DB, int $id): bool
  {
    $arr = db_fetch_id($DB, 'Player', $id);
    if ($arr === false)
      return false;

    $this->apply_db_data($arr);
    return true;
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

  function clone_for_api($DB)
  {
    $obj = clone $this;
    $obj->remove_sensitive_info();
    return $obj;
  }

  function remove_sensitive_info()
  {
    unset($this->password);
  }

  function expand_foreign_keys($DB)
  {
  }
}
