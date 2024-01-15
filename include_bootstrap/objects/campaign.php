<?php

class Campaign
{
  public int $id;
  public string $name;
  public string $url;
  public string $date_added;
  public $icon_url = null; /* string */
  public array $authors;
  public $sort_major_name = null; /* string */
  public $sort_major_labels = null; /* array */
  public $sort_major_colors = null; /* array */
  public $sort_minor_name = null; /* string */
  public $sort_minor_labels = null; /* array */
  public $sort_minor_colors = null; /* array */

  /* Associative objects */
  public $maps = null; /* Map[] */

  function pull_from_db($DB, int $id): bool
  {
    $arr = db_fetch_id($DB, 'Campaign', $id);
    if ($arr === false)
      return false;

    $this->apply_db_data($arr);
    return true;
  }

  //$prefix is used to load just the campaign data from a row that contains all bunch of data
  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->name = $arr[$prefix . 'name'];
    $this->url = $arr[$prefix . 'url'];
    $this->date_added = $arr[$prefix . 'date_added'];
    $this->authors = explode("\t", $arr[$prefix . 'authors']);

    if (isset($arr[$prefix . 'icon_url']))
      $this->icon_url = $arr[$prefix . 'icon_url'];
    if (isset($arr[$prefix . 'sort_major_name'])) {
      $this->sort_major_name = $arr[$prefix . 'sort_major_name'];
      $this->sort_major_labels = explode("\t", $arr[$prefix . 'sort_major_labels']);
      $this->sort_major_colors = explode("\t", $arr[$prefix . 'sort_major_colors']);
    }
    if (isset($arr['sort_minor_name'])) {
      $this->sort_minor_name = $arr[$prefix . 'sort_minor_name'];
      $this->sort_minor_labels = explode("\t", $arr[$prefix . 'sort_minor_labels']);
      $this->sort_minor_colors = explode("\t", $arr[$prefix . 'sort_minor_colors']);
    }
  }

  function clone_for_api($DB)
  {
    return clone $this;
  }

  function expand_foreign_keys($DB)
  {
  }

  function fetch_maps($DB)
  {
    $this->maps = db_fetch_assoc($DB, 'Map', 'campaign_id', $this->id, new Map());
  }
}
