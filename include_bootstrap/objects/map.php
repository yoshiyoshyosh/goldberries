<?php

class Map extends DbObject
{
  public static string $table_name = 'map';
  public static array $known_abbreviations = [
    [
      "abbreviation" => ["1d"],
      "id" => 1752,
    ],
    [
      "abbreviation" => ["a1d", "1d"],
      "id" => 113,
    ],
    [
      "abbreviation" => ["2d"],
      "id" => 1753,
    ],
    [
      "abbreviation" => ["a2d", "2d"],
      "id" => 114,
    ],
    [
      "abbreviation" => ["3d"],
      "id" => 1754,
    ],
    [
      "abbreviation" => ["a3d", "3d"],
      "id" => 2912,
    ],
    [
      "abbreviation" => ["4d"],
      "id" => 1755,
    ],
    [
      "abbreviation" => ["a4d", "4d"],
      "id" => 115,
    ],
    [
      "abbreviation" => ["5d"],
      "id" => 1756,
    ],
    [
      "abbreviation" => ["a5d", "5d"],
      "id" => 116,
    ],
    [
      "abbreviation" => ["6d"],
      "id" => 1757,
    ],
    [
      "abbreviation" => ["a6d", "6d"],
      "id" => 119,
    ],
    [
      "abbreviation" => ["7d"],
      "id" => 1758,
    ],
    [
      "abbreviation" => ["a7d", "7d"],
      "id" => 120,
    ],
    [
      "abbreviation" => ["8d"],
      "id" => 1759,
    ],
    [
      "abbreviation" => ["8d", "a8d"],
      "id" => 117,
    ],
    [
      "abbreviation" => ["9d"],
      "id" => 2508,
    ],
    [
      "abbreviation" => ["1dark"],
      "id" => 1760,
    ],
    [
      "abbreviation" => ["2dark"],
      "id" => 1761,
    ],
    [
      "abbreviation" => ["3dark"],
      "id" => 1762,
    ],
    [
      "abbreviation" => ["4dark"],
      "id" => 1763,
    ],
    [
      "abbreviation" => ["bhs", "bjs", "sjbhs"],
      "id" => 2270,
    ],
    [
      "abbreviation" => ["ihs", "sjihs"],
      "id" => 2289,
    ],
    [
      "abbreviation" => ["ahs", "sjahs"],
      "id" => 2315,
    ],
    [
      "abbreviation" => ["ehs", "sjehs"],
      "id" => 2345,
    ],
    [
      "abbreviation" => ["gmhs", "sjgmhs"],
      "id" => 2364,
    ],
    [
      "abbreviation" => ["bhs", "scbhs"],
      "id" => 2383,
    ],
    [
      "abbreviation" => ["ihs", "scihs"],
      "id" => 2406,
    ],
    [
      "abbreviation" => ["ahs", "scahs"],
      "id" => 2427,
    ],
    [
      "abbreviation" => ["ehs", "scehs"],
      "id" => 2443,
    ],
    [
      "abbreviation" => ["gmhs", "ngmhs", "scgmhs"],
      "id" => 2457,
    ],
    [
      "abbreviation" => ["ogmhs"],
      "id" => 2545,
    ],
    [
      "abbreviation" => ["7d1d", "n7d1d"],
      "id" => 2038,
    ],
    [
      "abbreviation" => ["7d1d", "o7d1d"],
      "id" => 2039,
    ],
    [
      "abbreviation" => ["dmr"],
      "id" => 2078,
    ],
    [
      "abbreviation" => ["sumber"],
      "id" => 2513,
    ],
    [
      "abbreviation" => ["wountain", "wm"],
      "id" => 2244,
    ],
    [
      "abbreviation" => ["3l"],
      "id" => 2066,
    ],
    [
      "abbreviation" => ["pumber"],
      "id" => 2361,
    ],
    [
      "abbreviation" => ["tbr"],
      "id" => 2217,
    ],
    [
      "abbreviation" => ["vabyss", "vbyss"],
      "id" => 2240,
    ],
    [
      "abbreviation" => ["cg"],
      "id" => 2075,
    ],
    [
      "abbreviation" => ["9bb"],
      "id" => 2095,
    ],
    [
      "abbreviation" => ["fw^9"],
      "id" => 2101,
    ],
    [
      "abbreviation" => ["strunter"],
      "id" => 2201,
    ],
    [
      "abbreviation" => ["sp"],
      "id" => 2205,
    ],
    [
      "abbreviation" => ["abm"],
      "id" => 2040,
    ],
    [
      "abbreviation" => ["aa"],
      "id" => 2056,
    ],
    [
      "abbreviation" => ["cotm"],
      "id" => 2147,
    ],
    [
      "abbreviation" => ["totm"],
      "id" => 2148,
    ],
    [
      "abbreviation" => ["rff"],
      "id" => 124,
    ],
    [
      "abbreviation" => ["sbww"],
      "id" => 2183,
    ],
    [
      "abbreviation" => ["sash"],
      "id" => 2185,
    ],
    [
      "abbreviation" => ["sbl"],
      "id" => 2210,
    ],
    [
      "abbreviation" => ["2kahc", "ahc"],
      "id" => 98,
    ],
    [
      "abbreviation" => ["d+"],
      "id" => 2505,
    ],
    [
      "abbreviation" => ["dreep"],
      "id" => 2354,
    ],
    [
      "abbreviation" => ["gchs"],
      "id" => 843,
    ],
    [
      "abbreviation" => ["7a1d"],
      "id" => 2037,
    ],
    [
      "abbreviation" => ["9b"],
      "id" => 2099,
    ],
    [
      "abbreviation" => ["frummit"],
      "id" => 2110,
    ],
    [
      "abbreviation" => ["afm"],
      "id" => 2050,
    ],
    [
      "abbreviation" => ["bfm"],
      "id" => 2051,
    ],
    [
      "abbreviation" => ["cfm"],
      "id" => 2052,
    ],
    [
      "abbreviation" => ["fs+"],
      "id" => 2102,
    ],
    [
      "abbreviation" => ["hots"],
      "id" => 2456,
    ],
    [
      "abbreviation" => ["pk"],
      "id" => 2340,
    ],
    [
      "abbreviation" => ["mawn"],
      "id" => 2151,
    ],
    [
      "abbreviation" => ["mbwn"],
      "id" => 2152,
    ],
    [
      "abbreviation" => ["wabyss"],
      "id" => 2355,
    ],
    [
      "abbreviation" => ["ff"],
      "id" => 1986,
    ],
    [
      "abbreviation" => ["kth"],
      "id" => 692,
    ],
    [
      "abbreviation" => ["shong"],
      "id" => 2358,
    ],
    [
      "abbreviation" => ["stodyssey"],
      "id" => 2356,
    ],
    [
      "abbreviation" => ["aip"],
      "id" => 2053,
    ],
    [
      "abbreviation" => ["botb"],
      "id" => 2351,
    ],
    [
      "abbreviation" => ["cm"],
      "id" => 2441,
    ],
    [
      "abbreviation" => ["cmb"],
      "id" => 2352,
    ],
    [
      "abbreviation" => ["danopy"],
      "id" => 2085,
    ],
    [
      "abbreviation" => ["floint"],
      "id" => 2328,
    ],
    [
      "abbreviation" => ["fota"],
      "id" => 2449,
    ],
    [
      "abbreviation" => ["gdd"],
      "id" => 834,
    ],
    [
      "abbreviation" => ["gloria submersi"],
      "id" => 2599,
    ],
    [
      "abbreviation" => ["ror"],
      "id" => 2303,
    ],
    [
      "abbreviation" => ["cotv"],
      "id" => 2314,
    ],
    [
      "abbreviation" => ["flattery"],
      "id" => 2316,
    ],
    [
      "abbreviation" => ["coblem"],
      "id" => 2317,
    ],
    [
      "abbreviation" => ["mubble", "mtb"],
      "id" => 2337,
    ],
    [
      "abbreviation" => ["chromplex"],
      "id" => 2338,
    ],
    [
      "abbreviation" => ["ffall"],
      "id" => 2339,
    ],
    [
      "abbreviation" => ["sds"],
      "id" => 2343,
    ],
    [
      "abbreviation" => ["fliffside", "fc"],
      "id" => 2346,
    ],
    [
      "abbreviation" => ["kts"],
      "id" => 2348,
    ],
    [
      "abbreviation" => ["fi"],
      "id" => 2349,
    ],
    [
      "abbreviation" => ["cotcs"],
      "id" => 2353,
    ],
    [
      "abbreviation" => ["ud"],
      "id" => 2455,
    ],
    [
      "abbreviation" => ["cnym", "nym", "cny"],
      "id" => 2070,
    ],
  ];

  public string $name;
  public ?StringList $url = null;
  public ?JsonDateTime $date_added = null;
  public bool $is_rejected = false;
  public ?string $rejection_reason = null;
  public bool $is_archived = false;
  public ?int $sort_major = null;
  public ?int $sort_minor = null;
  public ?int $sort_order = null;
  public ?int $author_gb_id = null;
  public ?string $author_gb_name = null;
  public ?string $note = null;
  public ?StringList $collectibles = null;
  public ?string $golden_changes = null;

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
      'url' => $this->url === null ? null : $this->url->__toString(),
      'date_added' => $this->date_added,
      'is_rejected' => $this->is_rejected,
      'rejection_reason' => $this->rejection_reason,
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
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->name = $arr[$prefix . 'name'];
    $this->is_rejected = $arr[$prefix . 'is_rejected'] === 't';
    $this->is_archived = $arr[$prefix . 'is_archived'] === 't';

    if (isset($arr[$prefix . 'date_added']))
      $this->date_added = new JsonDateTime($arr[$prefix . 'date_added']);
    if (isset($arr[$prefix . 'url'])) {
      $value = $arr[$prefix . 'url'];
      if (is_array($value)) {
        if (count($value) > 0) {
          $this->url = new StringList(2);
          $this->url->arr = $value;
        } else {
          $this->collectibles = null;
        }
      } else {
        $this->url = new StringList(2, $value);
      }
    }
    if (isset($arr[$prefix . 'side']))
      $this->side = $arr[$prefix . 'side'];
    if (isset($arr[$prefix . 'rejection_reason']))
      $this->rejection_reason = $arr[$prefix . 'rejection_reason'];
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
  }

  static function get_view_fields(): array
  {
    return [
      'map_id',
      'map_name',
      'map_url',
      'map_date_added',
      'map_is_rejected',
      'map_rejection_reason',
      'map_is_archived',
      'map_sort_major',
      'map_sort_minor',
      'map_sort_order',
      'map_author_gb_id',
      'map_author_gb_name',
      'map_campaign_id',
      'map_note',
      'map_collectibles',
    ];
  }

  // === Find Functions ===
  function fetch_challenges($DB, $with_submissions = false, $include_arbitrary = true, $filter_suspended = false): bool
  {
    $whereAddition = $include_arbitrary ? null : "(is_arbitrary = false OR is_arbitrary IS NULL)";
    $challenges = $this->fetch_list($DB, 'map_id', Challenge::class, $whereAddition, "ORDER BY sort ASC, id ASC");
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

  static function search_by_name($DB, $search, $raw_search)
  {
    $raw_search_lower = strtolower($raw_search);

    $query = "SELECT * FROM map WHERE map.name ILIKE '" . $search . "' ORDER BY name";
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
    foreach (self::$known_abbreviations as $abbreviation) {
      if (array_search($raw_search_lower, $abbreviation['abbreviation']) !== false) {
        $map_id = $abbreviation['id'];
        $map = Map::get_by_id($DB, $map_id, 2);
        if ($map !== false) {
          $abbreviation_matches[] = $map;
        }
      }
    }
    if (count($abbreviation_matches) > 0) {
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

  static function get_all_rejected($DB)
  {
    $query = "SELECT * FROM map WHERE is_rejected = true ORDER BY name";
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
    $rejected_prefix = $this->is_rejected ? "[Rejected] " : "";
    $is_side = is_side_name($this->name);

    if ($is_same) {
      return $campaign_name_with_author;
    } else {
      if ($no_campaign) {
        $map_name = $is_side ? $this->campaign->name . " [{$this->name}]" : $this->name;
        return "{$rejected_prefix}{$archived_prefix}{$map_name}";
      } else {
        return "{$campaign_name_with_author} / {$rejected_prefix}{$archived_prefix}{$this->name}";
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
