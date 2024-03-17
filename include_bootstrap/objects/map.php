<?php

class Map extends DbObject
{
  public static string $table_name = 'map';

  public string $name;
  public ?string $url = null;
  public ?JsonDateTime $date_added = null;
  public bool $has_fc = false;
  public bool $is_rejected = false;
  public ?string $rejection_reason = null;
  public bool $is_archived = false;
  public ?int $sort_major = null;
  public ?int $sort_minor = null;
  public ?int $sort_order = null;
  public ?int $author_gb_id = null;
  public ?string $author_gb_name = null;

  // Foreign Keys
  public ?int $campaign_id = null;

  // Linked Objects
  public Campaign $campaign;

  // Associative Objects
  public ?array $challenges = null; /* Challenge[] */



  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'name' => $this->name,
      'url' => $this->url,
      'date_added' => $this->date_added,
      'has_fc' => $this->has_fc,
      'is_rejected' => $this->is_rejected,
      'rejection_reason' => $this->rejection_reason,
      'is_archived' => $this->is_archived,
      'sort_major' => $this->sort_major,
      'sort_minor' => $this->sort_minor,
      'sort_order' => $this->sort_order,
      'author_gb_id' => $this->author_gb_id,
      'author_gb_name' => $this->author_gb_name,
      'campaign_id' => $this->campaign_id,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->name = $arr[$prefix . 'name'];
    $this->has_fc = $arr[$prefix . 'has_fc'] === 't';
    $this->is_rejected = $arr[$prefix . 'is_rejected'] === 't';
    $this->is_archived = $arr[$prefix . 'is_archived'] === 't';

    if (isset ($arr[$prefix . 'date_added']))
      $this->date_added = new JsonDateTime($arr[$prefix . 'date_added']);
    if (isset ($arr[$prefix . 'url']))
      $this->url = $arr[$prefix . 'url'];
    if (isset ($arr[$prefix . 'side']))
      $this->side = $arr[$prefix . 'side'];
    if (isset ($arr[$prefix . 'rejection_reason']))
      $this->rejection_reason = $arr[$prefix . 'rejection_reason'];
    if (isset ($arr[$prefix . 'sort_major']))
      $this->sort_major = intval($arr[$prefix . 'sort_major']);
    if (isset ($arr[$prefix . 'sort_minor']))
      $this->sort_minor = intval($arr[$prefix . 'sort_minor']);
    if (isset ($arr[$prefix . 'sort_order']))
      $this->sort_order = intval($arr[$prefix . 'sort_order']);
    if (isset ($arr[$prefix . 'author_gb_id']))
      $this->author_gb_id = intval($arr[$prefix . 'author_gb_id']);
    if (isset ($arr[$prefix . 'author_gb_name']))
      $this->author_gb_name = $arr[$prefix . 'author_gb_name'];
    if (isset ($arr[$prefix . 'campaign_id']))
      $this->campaign_id = intval($arr[$prefix . 'campaign_id']);
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
    if ($depth <= 1)
      return;

    $isFromSqlResult = is_array($DB);

    if ($expand_structure && isset ($this->campaign_id)) {
      if ($isFromSqlResult) {
        $this->campaign = new Campaign();
        $this->campaign->apply_db_data($DB, "campaign_");
        $this->campaign->expand_foreign_keys($DB, $depth - 1);
      } else {
        $this->campaign = Campaign::get_by_id($DB, $this->campaign_id, $depth - 1);
      }
    }
  }

  // === Find Functions ===
  function fetch_challenges($DB, $with_submissions = false, $include_arbitrary = true): bool
  {
    $whereAddition = $include_arbitrary ? null : "(is_arbitrary = false OR is_arbitrary IS NULL)";
    $challenges = $this->fetch_list($DB, 'map_id', Challenge::class, $whereAddition);
    if ($challenges === false)
      return false;
    $this->challenges = $challenges;
    foreach ($this->challenges as $challenge) {
      if ($with_submissions)
        $challenge->fetch_submissions($DB);
      $challenge->expand_foreign_keys($DB, 3, false);
    }
    return true;
  }

  static function search_by_name($DB, $name)
  {
    $query = "SELECT * FROM map WHERE map.name ILIKE '%" . $name . "%' ORDER BY name";
    $result = pg_query($DB, $query);
    if (!$result) {
      die_json(500, "Could not query database");
    }
    $maps = array();
    while ($row = pg_fetch_assoc($result)) {
      $map = new Map();
      $map->apply_db_data($row);
      $map->expand_foreign_keys($DB, 2);
      $maps[] = $map;
    }
    return $maps;
  }

  static function find_by_author($DB, $author)
  {
    $query = "SELECT * FROM map WHERE map.author_gb_name ILIKE '%" . $author . "%' ORDER BY name";
    $result = pg_query($DB, $query);
    if (!$result) {
      die_json(500, "Could not query database");
    }
    $maps = array();
    while ($row = pg_fetch_assoc($result)) {
      $map = new Map();
      $map->apply_db_data($row);
      $map->expand_foreign_keys($DB, 2);
      $maps[] = $map;
    }
    return $maps;
  }

  // === Utility Functions ===
  function __toString()
  {
    return "(Map, id:{$this->id}, name:'{$this->name}')";
  }

  static function generate_changelog($DB, $old, $new)
  {
    if ($old->id !== $new->id)
      return false;

    if ($old->name !== $new->name) {
      Change::create_change($DB, 'map', $new->id, "Renamed map from '{$old->name}' to '{$new->name}'");
    }
    if ($old->campaign_id !== $new->campaign_id) {
      $oldCampaign = Campaign::get_by_id($DB, $old->campaign_id);
      $newCampaign = Campaign::get_by_id($DB, $new->campaign_id);
      Change::create_change($DB, 'map', $new->id, "Moved map from campaign '{$oldCampaign->name}' to '{$newCampaign->name}'");
    }
    if ($old->url !== $new->url) {
      Change::create_change($DB, 'map', $new->id, "Changed url from '{$old->url}' to '{$new->url}'");
    }
    if ($old->is_archived !== $new->is_archived) {
      $stateNow = $new->is_archived ? "Archived the map" : "Unarchived the map";
      Change::create_change($DB, 'map', $new->id, $stateNow);
    }
    if ($old->is_rejected !== $new->is_rejected) {
      $stateNow = $new->is_rejected ? "Rejected the map" : "Cleared rejection status";
      Change::create_change($DB, 'map', $new->id, $stateNow);
    }

    return true;
  }
}
