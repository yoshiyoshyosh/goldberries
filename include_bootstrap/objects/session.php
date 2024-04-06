<?php

$session_expire_days = 31;

class Session extends DbObject
{
  public static string $table_name = 'session';

  public string $token;
  public JsonDateTime $created;

  // Foreign Keys
  public int $account_id;

  // Linked Objects
  public ?Account $account = null;


  // === Abstract Functions ===
  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->token = $arr[$prefix . 'token'];
    $this->created = new JsonDateTime($arr[$prefix . 'created']);
    $this->account_id = intval($arr[$prefix . 'account_id']);
  }
  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
    if ($depth <= 1)
      return;

    if ($this->account_id !== null) {
      $this->account = Account::get_by_id($DB, $this->account_id, $depth - 1);
      $this->account->expand_foreign_keys($DB, $depth - 1, $expand_structure);
    } else {
      $this->account = null;
    }
  }

  function get_field_set()
  {
    return array(
      'token' => $this->token,
      'created' => $this->created,
      'account_id' => $this->account_id
    );
  }

  // === Find Functions ===
  static function find_by_token($DB, string $token)
  {
    global $session_expire_days;
    return find_in_db($DB, 'Session', "token = $1 AND created > NOW() - INTERVAL '$session_expire_days days'", array($token), new Session());
  }

  // === Utility Functions ===
  function __toString()
  {
    return "(Session, id: {$this->id}, account_id: {$this->account_id}, expires: {$this->created})";
  }
}
