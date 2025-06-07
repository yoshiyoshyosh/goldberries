<?php

class Badge extends DbObject
{
  public static string $table_name = 'badge';

  public static int $BADGE_SHINY = 1;
  public static int $BADGE_GLOW = 2;
  public static int $BADGE_LEVEL_1 = 4;
  public static int $BADGE_LEVEL_2 = 8;
  public static int $BADGE_LEVEL_3 = 16;

  public string $icon_url;
  public string $title;
  public string $description;
  public string $color = "#ffffff";
  public JsonDateTime $date_created;
  public int $flags = 0; // flags for special badges, e.g. shiny badge

  // Associative Objects
  public ?array $data = []; // arbitrary data like badge_player.date_awarded field when fetching 1 specific players' badges

  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'icon_url' => $this->icon_url,
      'title' => $this->title,
      'description' => $this->description,
      'color' => $this->color,
      'date_created' => $this->date_created,
      'flags' => $this->flags,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->date_created = new JsonDateTime($arr[$prefix . 'date_created']);
    $this->icon_url = $arr[$prefix . 'icon_url'] ?? '';
    $this->title = $arr[$prefix . 'title'] ?? '';
    $this->description = $arr[$prefix . 'description'] ?? '';
    $this->color = $arr[$prefix . 'color'];
    $this->flags = intval($arr[$prefix . 'flags']);
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
    if ($depth <= 1)
      return;
  }

  // === Find Functions ===
  static function get_all_for_player($DB, $player_id)
  {
    $query = "SELECT 
        badge.*,
        badge_player.date_awarded AS date_awarded
      FROM badge_player JOIN badge ON badge_player.badge_id = badge.id
      WHERE badge_player.player_id = $1";
    $result = pg_query_params_or_die($DB, $query, [$player_id]);

    $badges = [];
    while ($row = pg_fetch_assoc($result)) {
      $badge = new Badge();
      $badge->apply_db_data($row);
      $badge->data['date_awarded'] = new JsonDateTime($row['date_awarded']);
      $badges[] = $badge;
    }
    return $badges;
  }

  // === Utility Functions ===
  function __toString()
  {
    return "(Badge, id:{$this->id}, title:{$this->title}";
  }

  function is_shiny()
  {
    return has_flag($this->flags, self::$BADGE_SHINY);
  }
}