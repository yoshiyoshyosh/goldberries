<?php

class BadgePlayer extends DbObject
{
  public static string $table_name = 'badge_player';

  public int $player_id;
  public int $badge_id;
  public JsonDateTime $date_awarded;

  // Linked Objects
  // none of these, because this is just a join table
  // public ?Player $player = null;
  // public ?Badge $badge = null;

  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'player_id' => $this->player_id,
      'badge_id' => $this->badge_id,
      'date_awarded' => $this->date_awarded,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->player_id = intval($arr[$prefix . 'player_id']);
    $this->badge_id = intval($arr[$prefix . 'badge_id']);
    $this->date_awarded = new JsonDateTime($arr[$prefix . 'date_awarded']);
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
    if ($depth <= 1)
      return;

    if ($this->player_id !== null) {
      $this->player = Player::get_by_id($DB, $this->player_id, $depth - 1, $expand_structure);
    }
    if ($this->badge_id !== null) {
      $this->badge = Badge::get_by_id($DB, $this->badge_id, $depth - 1, $expand_structure);
    }
  }

  // === Find Functions ===
  static function get_all_for_badge($DB, $badge_id)
  {
    $query = "SELECT * FROM badge_player WHERE badge_id = $1";
    $result = pg_query_params_or_die($DB, $query, [$badge_id]);

    $badgePlayers = [];
    while ($row = pg_fetch_assoc($result)) {
      $badgePlayer = new BadgePlayer();
      $badgePlayer->apply_db_data($row);
      $badgePlayer->expand_foreign_keys($DB, 3, false);
      $badgePlayers[] = $badgePlayer;
    }
    return $badgePlayers;
  }

  // === Utility Functions ===
  function __toString()
  {
    return "(BadgePlayer, id:{$this->id}, player:{$this->player_id}, badge:{$this->badge_id})";
  }
}