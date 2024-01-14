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

  function apply_db_data($arr)
  {
    $this->id = intval($arr['id']);
    $this->name = $arr['name'];
    $this->password = $arr['password'];
    $this->is_verifier = $arr['is_verifier'] === 't';
    $this->is_admin = $arr['is_admin'] === 't';
    $this->is_suspended = $arr['is_suspended'] === 't';
    $this->date_created = $arr['date_created'];

    if (isset($arr['suspension_reason']))
      $this->suspension_reason = $arr['suspension_reason'];
  }

  function clone_for_api($DB)
  {
    $obj = clone $this;
    unset($obj->password);
    return $obj;
  }

  function expand_foreign_keys($DB)
  {
  }
}
