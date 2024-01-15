<?php

class Submission
{
  public int $id;
  public int $challenge_id;
  public int $player_id;
  public string $date_created;
  public string $proof_url;
  public $player_notes; /* string */
  public bool $is_verified;
  public bool $is_rejected;
  public $verifier_id; /* int */
  public $date_verified; /* string */
  public $verifier_notes; /* string */
  public $new_map_submission_id; /* int */
  public $new_campaign_submission_id; /* int */
  public bool $is_fc;
  public bool $is_special;
  public $suggested_difficulty_id; /* int */

  /* for api */
  public $challenge = null; /* Challenge */
  public $player = null; /* Player */
  public $verifier = null; /* Player */
  public $new_map_submission = null; /* NewMapSubmission */
  public $new_campaign_submission = null; /* NewCampaignSubmission */
  public $suggested_difficulty = null; /* Difficulty */

  function pull_from_db($DB, int $id): bool
  {
    $arr = db_fetch_id($DB, 'Submission', $id);
    if ($arr === false)
      return false;

    $this->apply_db_data($arr);
    return true;
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->challenge_id = intval($arr[$prefix . 'challenge_id']);
    $this->player_id = intval($arr[$prefix . 'player_id']);
    $this->date_created = $arr[$prefix . 'date_created'];
    $this->proof_url = $arr[$prefix . 'proof_url'];
    $this->is_verified = $arr[$prefix . 'is_verified'] === 't';
    //$this->is_rejected = $arr[$prefix . 'is_rejected'] === 't';
    $this->is_fc = $arr[$prefix . 'is_fc'] === 't';
    $this->is_special = $arr[$prefix . 'is_special'] === 't';

    if (isset($arr[$prefix . 'verifier_id']))
      $this->verifier_id = intval($arr[$prefix . 'verifier_id']);
    if (isset($arr[$prefix . 'new_map_submission_id']))
      $this->new_map_submission_id = intval($arr[$prefix . 'new_map_submission_id']);
    if (isset($arr[$prefix . 'new_campaign_submission_id']))
      $this->new_campaign_submission_id = intval($arr[$prefix . 'new_campaign_submission_id']);
    if (isset($arr[$prefix . 'suggested_difficulty_id']))
      $this->suggested_difficulty_id = intval($arr[$prefix . 'suggested_difficulty_id']);
    if (isset($arr[$prefix . 'player_notes']))
      $this->player_notes = $arr[$prefix . 'player_notes'];
    if (isset($arr[$prefix . 'date_verified']))
      $this->date_verified = $arr[$prefix . 'date_verified'];
    if (isset($arr[$prefix . 'verifier_notes']))
      $this->verifier_notes = $arr[$prefix . 'verifier_notes'];
  }

  function clone_for_api($DB)
  {
    $obj = clone $this;
    $obj->expand_foreign_keys($DB);
    return $obj;
  }

  function expand_foreign_keys($DB, $dont_expand = [])
  {
    if (!in_array('challenge', $dont_expand) && isset($this->challenge_id)) {
      $this->challenge = new Challenge();
      $this->challenge->pull_from_db($DB, $this->challenge_id);
    }
    if (!in_array('player', $dont_expand) && isset($this->player_id)) {
      $this->player = new Player();
      $this->player->pull_from_db($DB, $this->player_id);
      $this->player->remove_sensitive_info();
    }
    if (!in_array('verifier', $dont_expand) && isset($this->verifier_id)) {
      $this->verifier = new Player();
      $this->verifier->pull_from_db($DB, $this->verifier_id);
      $this->verifier->remove_sensitive_info();
    }
    if (!in_array('suggested_difficulty', $dont_expand) && isset($this->suggested_difficulty_id)) {
      $this->suggested_difficulty = new Difficulty();
      $this->suggested_difficulty->pull_from_db($DB, $this->suggested_difficulty_id);
    }
  }

  function expand_from_sql_result($arr, $dont_expand = [])
  {
    if (!in_array('challenge', $dont_expand) && isset($this->challenge_id)) {
      $this->challenge = new Challenge();
      $this->challenge->apply_db_data($arr, 'challenge_');
    }
    if (!in_array('player', $dont_expand) && isset($this->player_id)) {
      $this->player = new Player();
      $this->player->apply_db_data($arr, 'player_');
      $this->player->remove_sensitive_info();
    }
    if (!in_array('verifier', $dont_expand) && isset($this->verifier_id)) {
      $this->verifier = new Player();
      $this->verifier->apply_db_data($arr, 'verifier_');
      $this->verifier->remove_sensitive_info();
    }
    if (!in_array('suggested_difficulty', $dont_expand) && isset($this->suggested_difficulty_id)) {
      $this->suggested_difficulty = new Difficulty();
      $this->suggested_difficulty->apply_db_data($arr, 'suggested_difficulty_');
    }
  }
}
