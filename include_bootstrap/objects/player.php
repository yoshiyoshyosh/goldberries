<?php

class Player extends DbObject
{
  public static string $table_name = 'player';

  public string $name;


  // === Player Bonus Objects ===
  public array $account = array(); //role, is_suspended

  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'name' => $this->name,
    );
  }

  function apply_db_data($arr, $prefix = '', $customization = true)
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->name = $arr[$prefix . 'name'];

    if (isset($arr[$prefix . 'account_role']))
      $this->account['role'] = intval($arr[$prefix . 'account_role']);
    else
      $this->account['role'] = 0;
    if (isset($arr[$prefix . 'account_is_suspended']))
      $this->account['is_suspended'] = $arr[$prefix . 'account_is_suspended'] === 't';
    else
      $this->account['is_suspended'] = false;

    if (isset($arr[$prefix . 'account_suspension_reason']))
      $this->account['suspension_reason'] = $arr[$prefix . 'account_suspension_reason'];
    if (isset($arr[$prefix . 'account_name_color_start']))
      $this->account['name_color_start'] = $arr[$prefix . 'account_name_color_start'];
    if (isset($arr[$prefix . 'account_name_color_end']))
      $this->account['name_color_end'] = $arr[$prefix . 'account_name_color_end'];

    if ($customization) {
      //Controls if the customization should be set on this object from where ever the data originates
      if (isset($arr[$prefix . 'account_links']))
        $this->account['links'] = $arr[$prefix . 'account_links'];
      if (isset($arr[$prefix . 'account_input_method']))
        $this->account['input_method'] = $arr[$prefix . 'account_input_method'];
      if (isset($arr[$prefix . 'account_about_me']))
        $this->account['about_me'] = $arr[$prefix . 'account_about_me'];
      if (isset($arr[$prefix . 'account_country']))
        $this->account['country'] = $arr[$prefix . 'account_country'];
    }
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
    $this->account['role'] = $account->role;
    $this->account['is_suspended'] = $account->is_suspended;
    $this->account['suspension_reason'] = $account->suspension_reason;

    $this->account['name_color_start'] = $account->name_color_start;
    $this->account['name_color_end'] = $account->name_color_end;

    //For player, expand structure is for the profile customization that isn't needed for all pages
    //extract the fields: links, input_method, about_me, name_color_start, name_color_end
    if ($expand_structure === true) {
      $this->account['links'] = $account->links;
      $this->account['input_method'] = $account->input_method;
      $this->account['about_me'] = $account->about_me;
      $this->account['country'] = $account->country;
    }
  }

  // === Find Functions ===
  static function find_by_group($DB, string $group, $customization = false)
  {
    global $HELPER, $VERIFIER, $ADMIN;

    $where = [];
    if ($group === "user") {
      $where[] = "(player_account_id IS NULL OR (player_account_role < $HELPER AND player_account_is_suspended = false))";
    } else if ($group === "helper") {
      $where[] = "player_account_role >= $HELPER";
    } else if ($group === "verifier") {
      $where[] = "player_account_role >= $VERIFIER";
    } else if ($group === "admin") {
      $where[] = "player_account_role >= $ADMIN";
    } else if ($group === "suspended") {
      $where[] = "player_account_is_suspended = true";
    } else if ($group === "unclaimed") {
      $where[] = "player_account_id IS NULL";
    } else if ($group === "all") {
      $where[] = "1 = 1";
    } else {
      die_json(400, "invalid group");
    }

    $where_str = implode(" AND ", $where);

    $query = "SELECT * FROM view_players WHERE $where_str";
    $result = pg_query_params_or_die($DB, $query, []);

    $players = array();
    while ($row = pg_fetch_assoc($result)) {
      $player = new Player();
      $player->apply_db_data($row, "player_", $customization);
      $players[] = $player;
    }
    return $players;
  }

  static function name_exists($DB, string $name, int $ignore_id = 0): bool
  {
    $query = "SELECT id FROM player WHERE LOWER(name) = LOWER($1) AND id != $2";
    $result = pg_query_params_or_die($DB, $query, array($name, $ignore_id));
    return pg_num_rows($result) > 0;
  }

  static function search_by_name($DB, string $search, string $raw_search)
  {
    $query = "SELECT * FROM view_players WHERE player_name ILIKE '" . $search . "' ORDER BY player_name";
    $result = pg_query_params_or_die($DB, $query, []);

    $players = array();
    while ($row = pg_fetch_assoc($result)) {
      $player = new Player();
      $player->apply_db_data($row, 'player_', false);
      $players[] = $player;
    }

    //Sort by:
    // 1. Exact match
    // 2. Start of name
    // 3. Alphabetical
    usort($players, function ($a, $b) use ($raw_search) {
      $a_name = strtolower($a->name);
      $b_name = strtolower($b->name);
      $search = strtolower($raw_search);

      $a_exact = $a_name === $search;
      $b_exact = $b_name === $search;

      if ($a_exact && !$b_exact) {
        return -1;
      } else if (!$a_exact && $b_exact) {
        return 1;
      }

      $a_start = strpos($a_name, $search) === 0;
      $b_start = strpos($b_name, $search) === 0;

      if ($a_start && !$b_start) {
        return -1;
      } else if (!$a_start && $b_start) {
        return 1;
      }

      return strcmp($a_name, $b_name);
    });

    return $players;
  }

  function get_account($DB)
  {
    $accounts = Account::find_by_player_id($DB, $this->id);
    if ($accounts === false || count($accounts) === 0) {
      return null;
    }
    $account = $accounts[0];
    return $account;
  }


  // === Utility Functions ===
  function __toString()
  {
    return "(Player, id:{$this->id}, name:'{$this->name}')";
  }

  function get_url()
  {
    return constant('BASE_URL') . "/player/{$this->id}";
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

  function get_name_escaped()
  {
    //Regex remove backticks from the name, then return
    return preg_replace('/`/', '', $this->name);
  }
}
