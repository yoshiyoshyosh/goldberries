<?php

class Campaign extends DbObject
{
  public static string $table_name = 'campaign';
  public static array $known_abbreviations = [
    [
      "abbreviation" => ["7d1d"],
      "id" => 1005,
    ],
    [
      "abbreviation" => ["d sides", "d-sides"],
      "id" => 51,
    ],
    [
      "abbreviation" => ["d sides", "d-sides"],
      "id" => 867,
    ],
    [
      "abbreviation" => ["itj"],
      "id" => 467,
    ],
    [
      "abbreviation" => ["sc"],
      "id" => 1200,
    ],
    [
      "abbreviation" => ["sj"],
      "id" => 1199,
    ],
    [
      "abbreviation" => ["cg"],
      "id" => 1037,
    ],
    [
      "abbreviation" => ["mte"],
      "id" => 582,
    ],
    [
      "abbreviation" => ["afm"],
      "id" => 1016,
    ],
    [
      "abbreviation" => ["mawn"],
      "id" => 1109,
    ],
    [
      "abbreviation" => ["nsssc"],
      "id" => 614,
    ],
    [
      "abbreviation" => ["ssc", "ssc1"],
      "id" => 1142,
    ],
    [
      "abbreviation" => ["ssc", "ssc2"],
      "id" => 1201,
    ],
    [
      "abbreviation" => ["ssc", "ssc3"],
      "id" => 1216,
    ],
    [
      "abbreviation" => ["flp"],
      "id" => 872,
    ],
    [
      "abbreviation" => ["cny"],
      "id" => 168,
    ],
    [
      "abbreviation" => ["zescent"],
      "id" => 992,
    ],
    [
      "abbreviation" => ["egc"],
      "id" => 310,
    ],
    [
      "abbreviation" => ["wc"],
      "id" => 977,
    ],
    [
      "abbreviation" => ["ec"],
      "id" => 332,
    ],
    [
      "abbreviation" => ["intest"],
      "id" => 1309,
    ],
    [
      "abbreviation" => ["gollab", "gc"],
      "id" => 387,
    ],
    [
      "abbreviation" => ["vontest", "vc"],
      "id" => 948,
    ],
    [
      "abbreviation" => ["shrontest"],
      "id" => 758,
    ],
    [
      "abbreviation" => ["sca"],
      "id" => 730,
    ],
    [
      "abbreviation" => ["luins"],
      "id" => 1106,
    ],
    [
      "abbreviation" => ["cc"],
      "id" => 1036,
    ],
    [
      "abbreviation" => ["froject"],
      "id" => 872,
    ],
    [
      "abbreviation" => ["socm"],
      "id" => 889,
    ],
    [
      "abbreviation" => ["sc2020"],
      "id" => 1200,
    ]
  ];

  public string $name;
  public string $url;
  public ?JsonDateTime $date_added = null;
  public ?string $icon_url = null;
  public ?string $sort_major_name = null;
  public ?array $sort_major_labels = null;
  public ?array $sort_major_colors = null;
  public ?string $sort_minor_name = null;
  public ?array $sort_minor_labels = null;
  public ?array $sort_minor_colors = null;
  public ?int $author_gb_id = null;
  public ?string $author_gb_name = null;
  public ?string $note = null;

  /* Associative objects */
  public ?array $maps = null;
  public ?array $challenges = null;


  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'name' => $this->name,
      'url' => $this->url,
      'date_added' => $this->date_added,
      'icon_url' => $this->icon_url,
      'sort_major_name' => $this->sort_major_name,
      'sort_major_labels' => $this->sort_major_labels ? implode("\t", $this->sort_major_labels) : null,
      'sort_major_colors' => $this->sort_major_colors ? implode("\t", $this->sort_major_colors) : null,
      'sort_minor_name' => $this->sort_minor_name,
      'sort_minor_labels' => $this->sort_minor_labels ? implode("\t", $this->sort_minor_labels) : null,
      'sort_minor_colors' => $this->sort_minor_colors ? implode("\t", $this->sort_minor_colors) : null,
      'author_gb_id' => $this->author_gb_id,
      'author_gb_name' => $this->author_gb_name,
      'note' => $this->note,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->name = $arr[$prefix . 'name'];
    $this->url = $arr[$prefix . 'url'];
    $this->date_added = new JsonDateTime($arr[$prefix . 'date_added']);

    if (isset($arr[$prefix . 'icon_url']))
      $this->icon_url = $arr[$prefix . 'icon_url'];

    if (isset($arr[$prefix . 'sort_major_name'])) {
      $this->sort_major_name = $arr[$prefix . 'sort_major_name'];
    }
    if (isset($arr[$prefix . 'sort_major_labels'])) {
      $sort_major_labels = $arr[$prefix . 'sort_major_labels'];
      $this->sort_major_labels = is_array($sort_major_labels) ? $sort_major_labels : explode("\t", $sort_major_labels);
    }
    if (isset($arr[$prefix . 'sort_major_colors'])) {
      $sort_major_colors = $arr[$prefix . 'sort_major_colors'];
      $this->sort_major_colors = is_array($sort_major_colors) ? $sort_major_colors : explode("\t", $sort_major_colors);
    }

    if (isset($arr[$prefix . 'sort_minor_name'])) {
      $this->sort_minor_name = $arr[$prefix . 'sort_minor_name'];
    }
    if (isset($arr[$prefix . 'sort_minor_labels'])) {
      $sort_minor_labels = $arr[$prefix . 'sort_minor_labels'];
      $this->sort_minor_labels = is_array($sort_minor_labels) ? $sort_minor_labels : explode("\t", $sort_minor_labels);
    }
    if (isset($arr[$prefix . 'sort_minor_colors'])) {
      $sort_minor_colors = $arr[$prefix . 'sort_minor_colors'];
      $this->sort_minor_colors = is_array($sort_minor_colors) ? $sort_minor_colors : explode("\t", $sort_minor_colors);
    }

    if (isset($arr[$prefix . 'author_gb_id']))
      $this->author_gb_id = intval($arr[$prefix . 'author_gb_id']);
    if (isset($arr[$prefix . 'author_gb_name']))
      $this->author_gb_name = $arr[$prefix . 'author_gb_name'];

    if (isset($arr[$prefix . 'note']))
      $this->note = $arr[$prefix . 'note'];
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
  }

  static function get_view_fields(): array
  {
    return [
      'campaign_id',
      'campaign_name',
      'campaign_url',
      'campaign_date_added',
      'campaign_icon_url',
      'campaign_sort_major_name',
      'campaign_sort_major_labels',
      'campaign_sort_major_colors',
      'campaign_sort_minor_name',
      'campaign_sort_minor_labels',
      'campaign_sort_minor_colors',
      'campaign_author_gb_id',
      'campaign_author_gb_name',
      'campaign_note',
    ];
  }

  // === Find Functions ===
  function fetch_maps($DB, $with_challenges = false, $with_submissions = false, $include_archived = true, $include_arbitrary = true): bool
  {
    $whereAddition = $include_archived ? null : "is_archived = false";
    $maps = $this->fetch_list($DB, 'campaign_id', Map::class, $whereAddition, "ORDER BY sort_major, sort_minor, sort_order, name");
    if ($maps === false)
      return false;
    $this->maps = $maps;
    foreach ($this->maps as $map) {
      if ($with_challenges)
        $map->fetch_challenges($DB, $with_submissions, $include_arbitrary);
      $map->expand_foreign_keys($DB, 2, false);
    }
    return true;
  }

  function fetch_challenges($DB, $with_submissions = false, $include_arbitrary = true): bool
  {
    $whereAddition = $include_arbitrary ? null : "(is_arbitrary = false OR is_arbitrary IS NULL)";
    $challenges = $this->fetch_list($DB, 'campaign_id', Challenge::class, $whereAddition, "ORDER BY sort ASC, id ASC");
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


  static function search_by_name($DB, $search, $raw_search)
  {
    $campaigns = array();
    $raw_search_lower = strtolower($raw_search);

    $query = "SELECT * FROM campaign WHERE campaign.name ILIKE '" . $search . "' ORDER BY name";
    $result = pg_query($DB, $query);
    if (!$result) {
      die_json(500, "Could not query database");
    }
    while ($row = pg_fetch_assoc($result)) {
      $campaign = new Campaign();
      $campaign->apply_db_data($row);
      $campaign->fetch_maps($DB);
      $campaigns[] = $campaign;
    }

    //Sort by:
    // 1. Exact match
    // 2. Start of name
    // 3. Alphabetical
    usort($campaigns, function ($a, $b) use ($raw_search_lower) {
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
        $campaign_id = $abbreviation['id'];
        $campaign = Campaign::get_by_id($DB, $campaign_id);
        if ($campaign !== false) {
          $campaign->fetch_maps($DB);
          $abbreviation_matches[] = $campaign;
        }
      }
    }
    if (count($abbreviation_matches) > 0) {
      $campaigns = array_merge($abbreviation_matches, $campaigns);
    }

    return $campaigns;
  }

  static function find_by_author($DB, $author)
  {
    $query = "SELECT * FROM campaign WHERE campaign.author_gb_name = '" . $author . "' ORDER BY name";
    $result = pg_query($DB, $query);
    if (!$result) {
      die_json(500, "Could not query database");
    }
    $campaigns = array();
    while ($row = pg_fetch_assoc($result)) {
      $campaign = new Campaign();
      $campaign->apply_db_data($row);
      $campaign->fetch_maps($DB);
      $campaigns[] = $campaign;
    }
    return $campaigns;
  }

  static function get_by_gamebanana_id($DB, int $gamebanana_id)
  {
    $url = "https://gamebanana.com/mods/$gamebanana_id";
    $query = "SELECT * FROM campaign WHERE url LIKE '$url' ORDER BY name";
    $result = pg_query($DB, $query);
    if (!$result) {
      die_json(500, "Could not query database");
    }

    if (pg_num_rows($result) === 0)
      return false;

    $row = pg_fetch_assoc($result);
    $campaign = new Campaign();
    $campaign->apply_db_data($row);
    return $campaign;
  }

  // === Utility Functions ===
  static function generate_changelog($DB, $old, $new)
  {
    if ($old->id !== $new->id)
      return false;

    if ($old->name !== $new->name) {
      Change::create_change($DB, 'campaign', $new->id, "Renamed campaign from '{$old->name}' to '{$new->name}'");
    }
    if ($old->url !== $new->url) {
      Change::create_change($DB, 'campaign', $new->id, "Changed url from '{$old->url}' to '{$new->url}'");
    }

    return true;
  }

  function get_gamebanana_mod_id()
  {
    //If url is not in the form of https://gamebanana.com/mods/123456, return null
    if (!preg_match('/\/mods\/(\d+)/', $this->url, $matches))
      return null;

    preg_match('/\/mods\/(\d+)/', $this->url, $matches);
    return $matches[1];
  }

  function get_url()
  {
    return constant('BASE_URL') . "/campaign/{$this->id}";
  }

  function get_name()
  {
    return $this->name . " (by " . $this->author_gb_name . ")";
  }
  function get_name_for_discord()
  {
    $url = $this->get_url();
    return "[{$this->name} (by {$this->author_gb_name})](<$url>)";
  }
}
