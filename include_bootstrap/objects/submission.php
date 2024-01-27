<?php

class Submission extends DbObject
{
  public static string $table_name = 'submission';

  public ?JsonDateTime $date_created = null;
  public string $proof_url;
  public ?string $raw_session_url = null;
  public ?string $player_notes = null;
  public bool $is_verified = false;
  public bool $is_rejected = false;
  public ?JsonDateTime $date_verified = null;
  public ?string $verifier_notes = null;
  public bool $is_fc = false;


  // Foreign Keys
  public ?int $challenge_id = null;
  public int $player_id;
  public ?int $suggested_difficulty_id = null;
  public ?int $verifier_id = null;
  public ?int $new_challenge_id = null;

  // Linked Objects
  public ?Challenge $challenge = null;
  public ?Player $player = null;
  public ?Difficulty $suggested_difficulty = null;
  public ?Player $verifier = null;
  public ?NewChallenge $new_challenge = null;



  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'date_created' => $this->date_created,
      'proof_url' => $this->proof_url,
      'raw_session_url' => $this->raw_session_url,
      'player_notes' => $this->player_notes,
      'is_verified' => $this->is_verified,
      'is_rejected' => $this->is_rejected,
      'is_fc' => $this->is_fc,
      'challenge_id' => $this->challenge_id,
      'player_id' => $this->player_id,
      'suggested_difficulty_id' => $this->suggested_difficulty_id,
      'verifier_id' => $this->verifier_id,
      'new_challenge_id' => $this->new_challenge_id,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->player_id = intval($arr[$prefix . 'player_id']);
    $this->proof_url = $arr[$prefix . 'proof_url'];
    $this->is_verified = $arr[$prefix . 'is_verified'] === 't';
    $this->is_rejected = $arr[$prefix . 'is_rejected'] === 't';
    $this->is_fc = $arr[$prefix . 'is_fc'] === 't';

    if (isset($arr[$prefix . 'challenge_id']))
      $this->challenge_id = intval($arr[$prefix . 'challenge_id']);
    if (isset($arr[$prefix . 'date_created']))
      $this->date_created = new JsonDateTime($arr[$prefix . 'date_created']);
    if (isset($arr[$prefix . 'raw_session_url']))
      $this->raw_session_url = $arr[$prefix . 'raw_session_url'];
    if (isset($arr[$prefix . 'player_notes']))
      $this->player_notes = $arr[$prefix . 'player_notes'];
    if (isset($arr[$prefix . 'suggested_difficulty_id']))
      $this->suggested_difficulty_id = intval($arr[$prefix . 'suggested_difficulty_id']);

    if (isset($arr[$prefix . 'date_verified']))
      $this->date_verified = new JsonDateTime($arr[$prefix . 'date_verified']);
    if (isset($arr[$prefix . 'verifier_notes']))
      $this->verifier_notes = $arr[$prefix . 'verifier_notes'];
    if (isset($arr[$prefix . 'verifier_id']))
      $this->verifier_id = intval($arr[$prefix . 'verifier_id']);

    if (isset($arr[$prefix . 'new_challenge_id']))
      $this->new_challenge_id = intval($arr[$prefix . 'new_challenge_id']);
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
    if ($depth <= 1)
      return;

    $isFromSqlResult = is_array($DB);

    if ($expand_structure && isset($this->challenge_id)) {
      if ($isFromSqlResult) {
        $this->challenge = new Challenge();
        $this->challenge->apply_db_data($DB, "challenge_");
        $this->challenge->expand_foreign_keys($DB, $depth - 1);
      } else {
        $this->challenge = Challenge::get_by_id($DB, $this->challenge_id, $depth - 1);
      }
    }
    if (isset($this->player_id)) {
      if ($isFromSqlResult) {
        $this->player = new Player();
        $this->player->apply_db_data($DB, "player_");
      } else {
        $this->player = Player::get_by_id($DB, $this->player_id);
      }
    }
    if (isset($this->verifier_id)) {
      if ($isFromSqlResult) {
        $this->verifier = new Player();
        $this->verifier->apply_db_data($DB, "verifier_");
      } else {
        $this->verifier = Player::get_by_id($DB, $this->verifier_id);
      }
    }
    if (isset($this->suggested_difficulty_id)) {
      if ($isFromSqlResult) {
        $this->suggested_difficulty = new Difficulty();
        $this->suggested_difficulty->apply_db_data($DB, "suggested_difficulty_");
      } else {
        $this->suggested_difficulty = Difficulty::get_by_id($DB, $this->suggested_difficulty_id);
      }
    }
  }

  // === Find Functions ===

  // === Utility Functions ===
  function __toString()
  {
    return "(Submission, id:{$this->id}, player_id:{$this->player_id}, challenge_id:{$this->challenge_id})";
  }
}
