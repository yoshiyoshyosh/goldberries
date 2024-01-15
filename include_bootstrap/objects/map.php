<?php

class Map
{
  public int $id;
  public string $name;
  public $url = null; /* string */
  public $side = null; /* string */
  public bool $is_rejected;
  public $rejection_reason = null; /* string */
  public bool $is_archived;
  public $campaign_id = null; /* int */
  public $sort_major = null; /* int */
  public $sort_minor = null; /* int */
  public $sort_order = null; /* int */
  public string $date_added;
  public $authors = null; /* array */

  // from ids
  public Campaign $campaign;

  /* Associative Objects */
  public $challenges = null; /* Challenge[] */

  function pull_from_db($DB, int $id): bool
  {
    $arr = db_fetch_id($DB, 'Map', $id);
    if ($arr === false)
      return false;

    $this->apply_db_data($arr);
    return true;
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->name = $arr[$prefix . 'name'];
    $this->is_rejected = $arr[$prefix . 'is_rejected'] === 't';
    $this->is_archived = $arr[$prefix . 'is_archived'] === 't';
    $this->date_added = $arr[$prefix . 'date_added'];

    if (isset($arr[$prefix . 'url']))
      $this->url = $arr[$prefix . 'url'];
    if (isset($arr[$prefix . 'side']))
      $this->side = $arr[$prefix . 'side'];
    if (isset($arr[$prefix . 'rejection_reason']))
      $this->rejection_reason = $arr[$prefix . 'rejection_reason'];
    if (isset($arr[$prefix . 'campaign_id']))
      $this->campaign_id = intval($arr[$prefix . 'campaign_id']);
    if (isset($arr[$prefix . 'sort_major']))
      $this->sort_major = intval($arr[$prefix . 'sort_major']);
    if (isset($arr[$prefix . 'sort_minor']))
      $this->sort_minor = intval($arr[$prefix . 'sort_minor']);
    if (isset($arr[$prefix . 'sort_order']))
      $this->sort_order = intval($arr[$prefix . 'sort_order']);
    if (isset($arr[$prefix . 'authors']))
      $this->authors = explode("\t", $arr[$prefix . 'authors']);
  }

  function clone_for_api($DB)
  {
    $obj = clone $this;
    $obj->expand_foreign_keys($DB);
    return $obj;
  }

  function expand_foreign_keys($DB, $dont_expand = [])
  {
    if (!in_array('campaign', $dont_expand) && isset($this->campaign_id)) {
      $this->campaign = new Campaign();
      $this->campaign->pull_from_db($DB, $this->campaign_id);
    }
  }

  function fetch_challenges($DB)
  {
    $this->challenges = db_fetch_assoc($DB, 'Challenge', 'map_id', $this->id, new Challenge());
  }
}
