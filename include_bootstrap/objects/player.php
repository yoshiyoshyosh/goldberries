<?php

class Player extends DbObject
{
  public static string $table_name = 'player';

  public string $name;


  // === Player Bonus Objects ===
  public array $account = array(); //is_verifier, is_admin, is_suspended

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

    if (isset($arr[$prefix . 'account_is_verifier']))
      $this->account['is_verifier'] = $arr[$prefix . 'account_is_verifier'] === 't';
    else
      $this->account['is_verifier'] = false;
    if (isset($arr[$prefix . 'account_is_admin']))
      $this->account['is_admin'] = $arr[$prefix . 'account_is_admin'] === 't';
    else
      $this->account['is_admin'] = false;
    if (isset($arr[$prefix . 'account_is_suspended']))
      $this->account['is_suspended'] = $arr[$prefix . 'account_is_suspended'] === 't';
    else
      $this->account['is_suspended'] = false;

    if (isset($arr[$prefix . 'suspension_reason']))
      $this->account['suspension_reason'] = $arr[$prefix . 'suspension_reason'];

    if (isset($arr[$prefix . 'links']))
      $this->account['links'] = $arr[$prefix . 'links'];
    else
      $this->account['links'] = null;
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
    global $DB;
    if ($depth <= 1)
      return;

    $accounts = Account::find_by_player_id($DB, $this->id);
    if ($accounts === false || count($accounts) === 0) {
      return;
    }
    $account = $accounts[0];
    $this->account['is_verifier'] = $account->is_verifier;
    $this->account['is_admin'] = $account->is_admin;
    $this->account['is_suspended'] = $account->is_suspended;
    $this->account['suspension_reason'] = $account->suspension_reason;
    $this->account['links'] = $account->links;
  }

  // === Find Functions ===
  static function find_by_group($DB, string $group)
  {
    $where = "";
    if ($group === "user") {
      $where = "account.id IS NULL OR (account.is_verifier = false AND account.is_admin = false AND account.is_suspended = false)";
    } else if ($group === "verifier") {
      $where = "is_verifier = true";
    } else if ($group === "admin") {
      $where = "is_admin = true";
    } else if ($group === "suspended") {
      $where = "is_suspended = true";
    } else if ($group === "unclaimed") {
      $where = "account.id IS NULL";
    } else {
      die_json(400, "invalid group");
    }

    $join = "account ON account.player_id = player.id";
    if ($group === "unclaimed") {
      $join = "account ON account.claimed_player_id = player.id";
    }

    $query = "SELECT 
      player.*, 
      account.is_verifier AS account_is_verifier,
      account.is_admin AS account_is_admin,
      account.is_suspended AS account_is_suspended 
    FROM player 
    LEFT JOIN {$join}
    WHERE {$where} ORDER BY player.id
    ";
    $result = pg_query($DB, $query);
    if ($result === false) {
      return false;
    }

    $players = array();
    while ($row = pg_fetch_assoc($result)) {
      $player = new Player();
      $player->apply_db_data($row);
      $players[] = $player;
    }
    return $players;
  }

  static function find_unclaimed_players($DB)
  {
    $query = "SELECT 
      player.* 
    FROM player 
    LEFT JOIN account a ON a.player_id = player.id
    WHERE a.id IS NULL ORDER BY player.id
    ";
    $result = pg_query($DB, $query);
    if ($result === false) {
      return false;
    }

    $players = array();
    while ($row = pg_fetch_assoc($result)) {
      $player = new Player();
      $player->apply_db_data($row);
      $players[] = $player;
    }
    return $players;
  }

  static function name_exists($DB, string $name): bool
  {
    $query = "SELECT id FROM player WHERE LOWER(name) = LOWER($1)";
    $result = pg_query_params($DB, $query, array($name)) or die('Query failed: ' . pg_last_error());
    return pg_num_rows($result) > 0;
  }


  // === Utility Functions ===
  function __toString()
  {
    return "(Player, id:{$this->id}, name:'{$this->name}')";
  }

  static function generate_changelog($DB, $old, $new)
  {
    if ($old->id !== $new->id)
      return false;

    if ($old->name !== $new->name) {
      Change::create_change($DB, 'player', $new->id, "Renamed from '{$old->name}' to '{$new->name}'");
    }

    return true;
  }
}
