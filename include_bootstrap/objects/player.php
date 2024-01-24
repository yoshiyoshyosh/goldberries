<?php

class Player extends DbObject
{
  public static string $table_name = 'player';

  public string $name;


  // === Player Bonus Objects ===
  public array $flags = array(); //is_verifier, is_admin, is_suspended

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
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
    if ($depth <= 1)
      return;

    $accounts = Account::find_by_player_id($DB, $this->id);
    if ($accounts === false || count($accounts) === 0) {
      return;
    }
    $account = $accounts[0];
    $this->flags['is_verifier'] = $account->is_verifier;
    $this->flags['is_admin'] = $account->is_admin;
    $this->flags['is_suspended'] = $account->is_suspended;
  }

  // === Find Functions ===


  // === Utility Functions ===
  function __toString()
  {
    return "(Player, id:{$this->id}, name:'{$this->name}')";
  }
}
