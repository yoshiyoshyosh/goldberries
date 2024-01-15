<?php

class Challenge
{
  public int $id;
  public string $challenge_type;
  public $campaign_id = null; /* int */
  public $map_id = null; /* int */
  public int $objective_id;
  public $description = null; /* string */
  public int $difficulty_id;
  public string $difficulty_subtier;
  public string $date_created;
  public bool $requires_fc;
  public bool $requires_special;
  public bool $has_fc;
  public bool $has_special;

  /* for API */
  public $campaign = null; /* Campaign */
  public $map = null; /* Map */
  public Objective $objective;
  public Difficulty $difficulty;

  /* Associative objects */
  public $submissions = null; /* Submission[] */

  function pull_from_db($DB, int $id): bool
  {
    $arr = db_fetch_id($DB, 'Challenge', $id);
    if ($arr === false)
      return false;

    $this->apply_db_data($arr);
    return true;
  }
  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->challenge_type = $arr[$prefix . 'challenge_type'];
    $this->objective_id = intval($arr[$prefix . 'objective_id']);
    $this->difficulty_id = intval($arr[$prefix . 'difficulty_id']);
    $this->date_created = $arr[$prefix . 'date_created'];
    $this->requires_fc = $arr[$prefix . 'requires_fc'] === 't';
    $this->requires_special = $arr[$prefix . 'requires_special'] === 't';
    $this->has_fc = $arr[$prefix . 'has_fc'] === 't';
    $this->has_special = $arr[$prefix . 'has_special'] === 't';

    if (isset($arr[$prefix . 'campaign_id']))
      $this->campaign_id = intval($arr[$prefix . 'campaign_id']);
    if (isset($arr[$prefix . 'map_id']))
      $this->map_id = intval($arr[$prefix . 'map_id']);
    if (isset($arr[$prefix . 'description']))
      $this->description = $arr[$prefix . 'description'];
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

    if (!in_array('map', $dont_expand) && isset($this->map_id)) {
      $this->map = new Map();
      $this->map->pull_from_db($DB, $this->map_id);
    }

    if (!in_array('objective', $dont_expand)) {
      $this->objective = new Objective();
      $this->objective->pull_from_db($DB, $this->objective_id);
    }

    if (!in_array('difficulty', $dont_expand)) {
      $this->difficulty = new Difficulty();
      $this->difficulty->pull_from_db($DB, $this->difficulty_id);
    }
  }

  function fetch_submissions($DB)
  {
    $this->submissions = db_fetch_assoc($DB, 'Submission', 'challenge_id', $this->id, new Submission());
  }

  function expand_from_sql_result($arr, $dont_expand = [])
  {
    if (!in_array('campaign', $dont_expand) && isset($this->campaign_id)) {
      $this->campaign = new Campaign();
      $this->campaign->apply_db_data($arr, "campaign_");
    }

    if (!in_array('map', $dont_expand) && isset($this->map_id)) {
      $this->map = new Map();
      $this->map->apply_db_data($arr, "map_");
    }

    if (!in_array('objective', $dont_expand)) {
      $this->objective = new Objective();
      $this->objective->apply_db_data($arr, "objective_");
    }

    if (!in_array('difficulty', $dont_expand)) {
      $this->difficulty = new Difficulty();
      $this->difficulty->apply_db_data($arr, "difficulty_");
    }
  }

}
