<?php
require_once(__DIR__ . '/../../assets/data/map-abbreviations.php');

class Map extends DbObject
{
  public static string $table_name = 'map';

  public string $name;
  public ?StringList $url = null;
  public ?JsonDateTime $date_added = null;
  public bool $is_archived = false;
  public ?int $sort_major = null;
  public ?int $sort_minor = null;
  public ?int $sort_order = null;
  public ?int $author_gb_id = null;
  public ?string $author_gb_name = null;
  public ?string $note = null;
  public ?StringList $collectibles = null;
  public ?string $golden_changes = null;
  public bool $is_progress = true;

  // Foreign Keys
  public ?int $campaign_id = null;
  public ?int $counts_for_id = null;

  // Linked Objects
  public Campaign $campaign;
  public ?Map $counts_for = null;

  // Associative Objects
  public ?array $challenges = null; /* Challenge[] */



  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'name' => $this->name,
      'url' => $this->url === null ? null : $this->url->__toString(),
      'date_added' => $this->date_added,
      'is_archived' => $this->is_archived,
      'sort_major' => $this->sort_major,
      'sort_minor' => $this->sort_minor,
      'sort_order' => $this->sort_order,
      'author_gb_id' => $this->author_gb_id,
      'author_gb_name' => $this->author_gb_name,
      'campaign_id' => $this->campaign_id,
      'note' => $this->note,
      'collectibles' => $this->collectibles === null ? null : $this->collectibles->__toString(),
      'golden_changes' => $this->golden_changes,
      'counts_for_id' => $this->counts_for_id,
      'is_progress' => $this->is_progress,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->name = $arr[$prefix . 'name'];
    $this->is_archived = $arr[$prefix . 'is_archived'] === 't';
    $this->is_progress = $arr[$prefix . 'is_progress'] === 't';

    if (isset($arr[$prefix . 'date_added']))
      $this->date_added = new JsonDateTime($arr[$prefix . 'date_added']);
    if (isset($arr[$prefix . 'url'])) {
      $value = $arr[$prefix . 'url'];
      if (is_array($value)) {
        if (count($value) > 0) {
          $this->url = new StringList(2);
          $this->url->arr = $value;
        } else {
          $this->url = null;
        }
      } else {
        $this->url = new StringList(2, $value);
      }
    }
    if (isset($arr[$prefix . 'side']))
      $this->side = $arr[$prefix . 'side'];
    if (isset($arr[$prefix . 'sort_major']))
      $this->sort_major = intval($arr[$prefix . 'sort_major']);
    if (isset($arr[$prefix . 'sort_minor']))
      $this->sort_minor = intval($arr[$prefix . 'sort_minor']);
    if (isset($arr[$prefix . 'sort_order']))
      $this->sort_order = intval($arr[$prefix . 'sort_order']);
    if (isset($arr[$prefix . 'author_gb_id']))
      $this->author_gb_id = intval($arr[$prefix . 'author_gb_id']);
    if (isset($arr[$prefix . 'author_gb_name']))
      $this->author_gb_name = $arr[$prefix . 'author_gb_name'];
    if (isset($arr[$prefix . 'campaign_id']))
      $this->campaign_id = intval($arr[$prefix . 'campaign_id']);
    if (isset($arr[$prefix . 'note']))
      $this->note = $arr[$prefix . 'note'];

    if (isset($arr[$prefix . 'collectibles'])) {
      $value = $arr[$prefix . 'collectibles'];
      if (is_array($value)) {
        if (count($value) > 0) {
          $this->collectibles = new StringList(4);
          $this->collectibles->arr = $value;
        } else {
          $this->collectibles = null;
        }
      } else {
        $this->collectibles = new StringList(4, $value);
      }
    }
    if (isset($arr[$prefix . 'golden_changes']))
      $this->golden_changes = $arr[$prefix . 'golden_changes'];

    if (isset($arr[$prefix . 'counts_for_id']))
      $this->counts_for_id = intval($arr[$prefix . 'counts_for_id']);
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
    if ($depth <= 1)
      return;

    $isFromSqlResult = is_array($DB);

    if ($expand_structure && isset($this->campaign_id)) {
      if ($isFromSqlResult) {
        $this->campaign = new Campaign();
        $this->campaign->apply_db_data($DB, "campaign_");
        $this->campaign->expand_foreign_keys($DB, $depth - 1);
      } else {
        $this->campaign = Campaign::get_by_id($DB, $this->campaign_id, $depth - 1);
      }
    }

    if (isset($this->counts_for_id)) {
      if ($isFromSqlResult) {
        $this->counts_for = new Map();
        $this->counts_for->apply_db_data($DB, "for_map_");
        $this->counts_for->expand_foreign_keys($DB, $depth - 1);
      } else {
        $this->counts_for = Map::get_by_id($DB, $this->counts_for_id, $depth - 1);
      }
    }
  }

  static function get_view_fields(): array
  {
    return [
      'map_id',
      'map_name',
      'map_url',
      'map_date_added',
      'map_is_archived',
      'map_sort_major',
      'map_sort_minor',
      'map_sort_order',
      'map_author_gb_id',
      'map_author_gb_name',
      'map_campaign_id',
      'map_note',
      'map_collectibles',
      'map_golden_changes',
      'map_counts_for_id',
      'map_is_progress',
    ];
  }

  // === Find Functions ===
  function fetch_challenges($DB, $with_submissions = false, $include_arbitrary = true, $filter_suspended = false, $hide_rejected = false): bool
  {
    $whereAddition = $include_arbitrary ? null : "(is_arbitrary = false OR is_arbitrary IS NULL)";
    $whereAddition = $hide_rejected ? ($whereAddition === null ? "is_rejected = false" : "$whereAddition AND is_rejected = false") : $whereAddition;
    $challenges = $this->fetch_list($DB, 'map_id', Challenge::class, $whereAddition, "ORDER BY sort ASC, requires_fc ASC, label ASC NULLS FIRST, id ASC");
    if ($challenges === false)
      return false;
    $this->challenges = $challenges;
    foreach ($this->challenges as $challenge) {
      if ($with_submissions)
        $challenge->fetch_submissions($DB, $filter_suspended);
      $challenge->expand_foreign_keys($DB, 3, false);
    }
    return true;
  }

  function fetch_other_maps($DB)
  {
    $this->campaign->fetch_maps($DB, false, false, false, false, true);
    $this->campaign->maps = array_values(array_filter(
      $this->campaign->maps,
      fn($map) => $map->id !== $this->id // Exclude the current map
    ));
  }


  static function search_by_name($DB, string $search, string $raw_search, bool $is_exact_search)
  {
    global $MAP_ABBREVIATIONS;
    $raw_search_lower = strtolower($raw_search);
    $similar = $is_exact_search ? "" : " OR SIMILARITY(map.name, '$raw_search_lower') > 0.4";

    $query = "SELECT * FROM map WHERE map.name ILIKE '$search' $similar ORDER BY name";
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

    //Sort by:
    // 1. Exact match
    // 2. Start of name
    // 3. Alphabetical
    usort($maps, function ($a, $b) use ($raw_search_lower) {
      $a_name = strtolower($a->name);
      $b_name = strtolower($b->name);
      $search = $raw_search_lower;

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

    //Check if the raw_search matches a known abbreviation. If yes, fetch the map and add it to the front of the list
    $abbreviation_matches = [];
    foreach ($MAP_ABBREVIATIONS as $abbreviation) {
      if (array_search($raw_search_lower, $abbreviation['abbreviation']) !== false) {
        $map_id = $abbreviation['id'];
        $map = Map::get_by_id($DB, $map_id, 2);
        if ($map !== false) {
          $abbreviation_matches[] = $map;
        }
      }
    }
    if (count($abbreviation_matches) > 0) {
      //First, check to see if the abbreviation match result is already in the regular result set $maps, and if yes, remove it from $maps
      //A simple in_array check is not enough. Compare the map IDs
      $maps = array_filter($maps, function ($map) use ($abbreviation_matches) {
        foreach ($abbreviation_matches as $abbreviation_match) {
          if ($map->id === $abbreviation_match->id) {
            return false;
          }
        }
        return true;
      });

      //Then, add the abbreviation match result to the front of the list      
      $maps = array_merge($abbreviation_matches, $maps);
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

  function generate_create_changelog($DB)
  {
    Change::create_change($DB, 'map', $this->id, "Created map");
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
    if ($old->is_archived !== $new->is_archived) {
      $stateNow = $new->is_archived ? "Archived the map" : "Unarchived the map";
      Change::create_change($DB, 'map', $new->id, $stateNow);
    }
    if ($old->counts_for_id !== $new->counts_for_id) {
      Change::create_change($DB, 'map', $new->id, "Changed this map counting for a different map in the campaign view from ID '{$old->counts_for_id}' to ID '{$new->counts_for_id}'");
    }
    if ($old->is_progress !== $new->is_progress) {
      $stateNow = $new->is_progress ? "Set this map as providing campaign progress" : "Set this map as not providing campaign progress";
      Change::create_change($DB, 'map', $new->id, $stateNow);
    }

    return true;
  }

  function get_url()
  {
    return constant('BASE_URL') . "/map/{$this->id}";
  }

  function get_name($no_campaign = false)
  {
    $campaign_name = $this->campaign->name;
    $campaign_name_with_author = $this->campaign->get_name();
    $is_same = $campaign_name === $this->name;
    $archived_prefix = $this->is_archived ? "[Old] " : "";
    $is_side = is_side_name($this->name);

    if ($is_same) {
      return $campaign_name_with_author;
    } else {
      if ($no_campaign) {
        $map_name = $is_side ? $this->campaign->name . " [{$this->name}]" : $this->name;
        return "{$archived_prefix}{$map_name}";
      } else {
        return "{$campaign_name_with_author} / {$archived_prefix}{$this->name}";
      }
    }
  }

  function get_name_for_discord()
  {
    $campaign_name = $this->campaign->name;
    $campaign_name_with_author = $this->campaign->get_name();
    $is_same = $campaign_name === $this->name;
    $campaign_url = $this->campaign->get_url();
    $map_url = $this->get_url();
    $archived_prefix = $this->is_archived ? "[Old] " : "";

    if ($is_same)
      return "[$campaign_name_with_author](<$campaign_url>)";
    else
      return "[{$campaign_name_with_author}](<$campaign_url>) / [{$archived_prefix}{$this->name}](<$map_url>)";
  }
}
