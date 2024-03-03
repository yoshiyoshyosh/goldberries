<?php

class Campaign extends DbObject
{
  public static string $table_name = 'campaign';

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

  /* Associative objects */
  public ?array $maps = null;


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

    if (isset($arr['sort_minor_name'])) {
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
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
  }

  // === Find Functions ===
  function fetch_maps($DB, $with_challenges = false, $with_submissions = false): bool
  {
    $maps = $this->fetch_list($DB, 'campaign_id', Map::class, null, "ORDER BY sort_major, sort_minor, sort_order, name");
    if ($maps === false)
      return false;
    $this->maps = $maps;
    foreach ($this->maps as $map) {
      if ($with_challenges)
        $map->fetch_challenges($DB, $with_submissions);
      $map->expand_foreign_keys($DB, 2, false);
    }
    return true;
  }

  // === Utility Functions ===

}
