<?php

class SuggestionVote extends DbObject
{
  public static string $table_name = 'suggestion_vote';

  public int $suggestion_id;
  public int $player_id;
  public string $vote;
  public ?string $comment = null;

  // Linked Objects
  public ?Suggestion $suggestion = null;
  public ?Player $player = null;

  // Other Objects
  public ?Submission $submission = null;

  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'suggestion_id' => $this->suggestion_id,
      'player_id' => $this->player_id,
      'vote' => $this->vote,
      'comment' => $this->comment,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->vote = $arr[$prefix . 'vote'];

    if (isset($arr[$prefix . 'suggestion_id']))
      $this->suggestion_id = intval($arr[$prefix . 'suggestion_id']);
    if (isset($arr[$prefix . 'player_id']))
      $this->player_id = intval($arr[$prefix . 'player_id']);
    if (isset($arr[$prefix . 'comment']))
      $this->comment = $arr[$prefix . 'comment'];
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
    if ($depth <= 1)
      return;

    if ($expand_structure) {
      if ($this->suggestion_id !== null) {
        $this->suggestion = Suggestion::get_by_id($DB, $this->suggestion_id, $depth - 1, $expand_structure);
      }
    }
    if ($this->player_id !== null) {
      $this->player = Player::get_by_id($DB, $this->player_id, 3, false);
    }
  }

  // === Find Functions ===
  static function has_voted_on_suggestion($DB, $player_id, $suggestion_id)
  {
    $query = "SELECT * FROM suggestion_vote WHERE player_id = $1 AND suggestion_id = $2";
    $result = pg_query_params($DB, $query, array($player_id, $suggestion_id));
    return pg_num_rows($result) > 0;
  }

  // === Utility Functions ===
  function __toString()
  {
    return "(SuggestionVote, id:{$this->id}, player:{$this->player->name}, vote:{$this->vote}, comment:{$this->comment})";
  }

  // If the player has made a submission for the suggested challenge, fetches it
  function find_submission($DB, $suggestion)
  {
    if ($suggestion->challenge_id === null)
      return;

    $query = "SELECT * FROM submission WHERE player_id = $1 AND challenge_id = $2";
    $result = pg_query_params($DB, $query, array($this->player_id, $suggestion->challenge_id));
    if (pg_num_rows($result) === 0)
      return;

    $row = pg_fetch_assoc($result);
    $this->submission = new Submission();
    $this->submission->apply_db_data($row);
    $this->submission->expand_foreign_keys($DB, 2, false);
  }
}