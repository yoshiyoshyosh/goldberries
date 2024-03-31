<?php

class Change extends DbObject
{
  public static string $table_name = 'change';

  public ?int $campaign_id = null;
  public ?int $map_id = null;
  public ?int $challenge_id = null;
  public ?int $player_id = null;
  public ?int $author_id = null;
  public string $description;
  public JsonDateTime $date;

  // Linked Objects
  public ?Campaign $campaign = null;
  public ?Map $map = null;
  public ?Challenge $challenge = null;
  public ?Player $player = null;
  public ?Player $author = null;

  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'campaign_id' => $this->campaign_id,
      'map_id' => $this->map_id,
      'challenge_id' => $this->challenge_id,
      'player_id' => $this->player_id,
      'author_id' => $this->author_id,
      'description' => $this->description,
      'date' => $this->date,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->description = $arr[$prefix . 'description'];
    $this->date = new JsonDateTime($arr[$prefix . 'date']);

    if (isset($arr[$prefix . 'campaign_id']))
      $this->campaign_id = intval($arr[$prefix . 'campaign_id']);
    if (isset($arr[$prefix . 'map_id']))
      $this->map_id = intval($arr[$prefix . 'map_id']);
    if (isset($arr[$prefix . 'challenge_id']))
      $this->challenge_id = intval($arr[$prefix . 'challenge_id']);
    if (isset($arr[$prefix . 'player_id']))
      $this->player_id = intval($arr[$prefix . 'player_id']);
    if (isset($arr[$prefix . 'author_id']))
      $this->author_id = intval($arr[$prefix . 'author_id']);
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
    if ($depth <= 1)
      return;

    if ($expand_structure) {
      if ($this->campaign_id !== null) {
        $this->campaign = Campaign::get_by_id($DB, $this->campaign_id);
        $this->campaign->expand_foreign_keys($DB, $depth - 1, $expand_structure);
      }
      if ($this->map_id !== null) {
        $this->map = Map::get_by_id($DB, $this->map_id);
        $this->map->expand_foreign_keys($DB, $depth - 1, $expand_structure);
      }
      if ($this->challenge_id !== null) {
        $this->challenge = Challenge::get_by_id($DB, $this->challenge_id);
        $this->challenge->expand_foreign_keys($DB, $depth - 1, $expand_structure);
      }
      if ($this->player_id !== null) {
        $this->player = Player::get_by_id($DB, $this->player_id, 2, false);
        $this->player->expand_foreign_keys($DB, $depth - 1, false);
      }
    }

    if ($this->author_id !== null) {
      $this->author = Player::get_by_id($DB, $this->author_id, 2, false);
      $this->author->expand_foreign_keys($DB, $depth - 1, false);
    }
  }

  // === Find Functions ===
  static function get_all_for_object($DB, $type, $id)
  {
    $where = "{$type}_id = $1";
    $arr = array($id);
    $logs = find_in_db($DB, Change::$table_name, $where, $arr, new Change());
    if ($logs === false)
      return false;

    foreach ($logs as $log) {
      $log->expand_foreign_keys($DB, 2, false);
    }

    return $logs;
  }

  static function get_paginated($DB, $page, $per_page, $type = "all")
  {
    $query = "SELECT * FROM change";

    $where = array();
    if ($type === "campaign") {
      $where[] = "campaign_id IS NOT NULL";
    } else if ($type === "map") {
      $where[] = "map_id IS NOT NULL";
    } else if ($type === "challenge") {
      $where[] = "challenge_id IS NOT NULL";
    } else if ($type === "player") {
      $where[] = "player_id IS NOT NULL";
    } else if ($type !== "all") {
      return false;
    }

    if (count($where) > 0) {
      $query .= " WHERE " . implode(" AND ", $where);
    }

    $query .= " ORDER BY date DESC";

    $query = "
    WITH changes AS (
      " . $query . "
    )
    SELECT *, count(*) OVER () AS total_count
    FROM changes";

    if ($per_page !== -1) {
      $query .= " LIMIT " . $per_page . " OFFSET " . ($page - 1) * $per_page;
    }

    $result = pg_query($DB, $query);
    if (!$result) {
      die_json(500, "Failed to query database");
    }

    $maxCount = 0;
    $changes = array();
    while ($row = pg_fetch_assoc($result)) {
      $change = new Change();
      $change->apply_db_data($row);
      $change->expand_foreign_keys($DB, 4, true);
      $changes[] = $change;

      if ($maxCount === 0) {
        $maxCount = intval($row['total_count']);
      }
    }

    return array(
      'changes' => $changes,
      'max_count' => $maxCount,
      'max_page' => ceil($maxCount / $per_page),
      'page' => $page,
      'per_page' => $per_page,
    );
  }

  // === Utility Functions ===
  function __toString()
  {
    $dateStr = date_to_long_string($this->date);

    $linkedObjectType = null;
    $linkedObjectId = null;

    if ($this->campaign_id !== null) {
      $linkedObjectType = 'campaign';
      $linkedObjectId = $this->campaign_id;
    } else if ($this->map_id !== null) {
      $linkedObjectType = 'map';
      $linkedObjectId = $this->map_id;
    } else if ($this->challenge_id !== null) {
      $linkedObjectType = 'challenge';
      $linkedObjectId = $this->challenge_id;
    } else if ($this->player_id !== null) {
      $linkedObjectType = 'player';
      $linkedObjectId = $this->player_id;
    }

    return "(Change, id:{$this->id}, description:'{$this->description}', date:{$dateStr}, objType:{$linkedObjectType}, objId:{$linkedObjectId})";
  }

  static function create_change($DB, string $type, int $id, string $description)
  {
    $account = get_user_data();
    if ($account === null)
      return false;
    else if ($account->player === null)
      return false;

    $change = new Change();
    $change->description = $description;
    $change->date = new JsonDateTime();
    $change->author_id = $account->player->id;

    switch ($type) {
      case 'campaign':
        $change->campaign_id = $id;
        break;
      case 'map':
        $change->map_id = $id;
        break;
      case 'challenge':
        $change->challenge_id = $id;
        break;
      case 'player':
        $change->player_id = $id;
        break;
      default:
        return false;
    }

    if ($change->insert($DB)) {
      return $change;
    } else {
      return false;
    }
  }
}
