<?php

class Suggestion extends DbObject
{
  public static int $expiration_days = 7;
  public static string $table_name = 'suggestion';

  public ?int $author_id = null;
  public ?int $challenge_id = null;
  public ?int $current_difficulty_id = null;
  public ?int $suggested_difficulty_id = null;
  public ?string $comment = null;
  public ?bool $is_verified = null;
  public JsonDateTime $date_created;
  public ?bool $is_accepted = null;

  // Linked Objects
  public ?Player $author = null;
  public ?Challenge $challenge = null;
  public ?Difficulty $current_difficulty = null;
  public ?Difficulty $suggested_difficulty = null;

  // Associative Objects
  public ?array $votes = null; /* SuggestionVote[] */

  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'author_id' => $this->author_id,
      'challenge_id' => $this->challenge_id,
      'current_difficulty_id' => $this->current_difficulty_id,
      'suggested_difficulty_id' => $this->suggested_difficulty_id,
      'comment' => $this->comment,
      'is_verified' => $this->is_verified,
      'date_created' => $this->date_created,
      'is_accepted' => $this->is_accepted,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->date_created = new JsonDateTime($arr[$prefix . 'date_created']);

    if (isset($arr[$prefix . 'author_id']))
      $this->author_id = intval($arr[$prefix . 'author_id']);
    if (isset($arr[$prefix . 'challenge_id']))
      $this->challenge_id = intval($arr[$prefix . 'challenge_id']);
    if (isset($arr[$prefix . 'current_difficulty_id']))
      $this->current_difficulty_id = intval($arr[$prefix . 'current_difficulty_id']);
    if (isset($arr[$prefix . 'suggested_difficulty_id']))
      $this->suggested_difficulty_id = intval($arr[$prefix . 'suggested_difficulty_id']);
    if (isset($arr[$prefix . 'comment']))
      $this->comment = $arr[$prefix . 'comment'];
    if (isset($arr[$prefix . 'is_verified']))
      $this->is_verified = $arr[$prefix . 'is_verified'] === 't';
    if (isset($arr[$prefix . 'is_accepted']))
      $this->is_accepted = $arr[$prefix . 'is_accepted'] === 't';
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
    if ($depth <= 1)
      return;

    if ($expand_structure) {
      if ($this->challenge_id !== null) {
        $this->challenge = Challenge::get_by_id($DB, $this->challenge_id, $depth - 1, $expand_structure);
      }
    }
    if ($this->author_id !== null) {
      $this->author = Player::get_by_id($DB, $this->author_id, 3, false);
    }
    if ($this->current_difficulty_id !== null) {
      $this->current_difficulty = Difficulty::get_by_id($DB, $this->current_difficulty_id);
    }
    if ($this->suggested_difficulty_id !== null) {
      $this->suggested_difficulty = Difficulty::get_by_id($DB, $this->suggested_difficulty_id);
    }
  }

  // === Find Functions ===
  function fetch_votes($DB): bool
  {
    $votes = $this->fetch_list($DB, 'suggestion_id', SuggestionVote::class);
    if ($votes === false) {
      $votes = array();
      return false;
    }
    $this->votes = $votes;
    foreach ($this->votes as $vote) {
      $vote->expand_foreign_keys($DB, 2, false);
      $vote->find_submission($DB, $this);
    }
    return true;
  }

  static function get_paginated($DB, $page, $per_page, $challenge = null, $expired = null, $account = null, $type = "all")
  {
    $query = "SELECT * FROM suggestion";

    $where = array();
    if ($challenge !== null) {
      $where[] = "challenge_id = " . $challenge;
    }
    if ($expired === true) {
      $where[] = "(suggestion.is_accepted IS NOT NULL OR suggestion.is_verified = false)";
    } else if ($expired === false) {
      $where[] = "suggestion.date_created >= NOW() - INTERVAL '" . self::$expiration_days . " days'";
      $where[] = "suggestion.is_accepted IS NULL";
      $where[] = "(suggestion.is_verified = true OR suggestion.is_verified IS NULL)";
    } else {
      //expired === null -> get expired but undecided suggestions
      $where[] = "suggestion.date_created < NOW() - INTERVAL '" . self::$expiration_days . " days'";
      $where[] = "suggestion.is_accepted IS NULL";
      $where[] = "(suggestion.is_verified = true OR suggestion.is_verified IS NULL)";
    }

    if ($account === null || (!is_verifier($account) && $account->player_id === null)) {
      $where[] = "suggestion.is_verified = true";
    } else {
      if (is_verifier($account)) {
        //$where[] = "is_verified IS NOT NULL";
      } else {
        $where[] = "(suggestion.is_verified = true OR suggestion.author_id = " . $account->player_id . ")";
      }
    }

    $player_id = $account !== null ? $account->player_id : null;

    if ($type === "general") {
      $where[] = "suggestion.challenge_id IS NULL";
    } else if ($type === "challenge") {
      $where[] = "suggestion.challenge_id IS NOT NULL";
    } else if ($type === "challenge_own" && $player_id !== null) {
      $where[] = "suggestion.challenge_id IS NOT NULL";
      $query = "SELECT 
          suggestion.*,
          BOOL_OR(player.id = $player_id) AS has_player
        FROM suggestion
        JOIN challenge ON suggestion.challenge_id = challenge.id
        JOIN submission ON challenge.id = submission.challenge_id
        JOIN player ON submission.player_id = player.id";
    }

    if (count($where) > 0) {
      $query .= " WHERE " . implode(" AND ", $where);
    }

    if ($type === "challenge_own" && $player_id !== null) {
      $query .= " GROUP BY suggestion.id HAVING BOOL_OR(player.id = $player_id)";
    }

    $query .= " ORDER BY suggestion.date_created DESC";

    $query = "
    WITH query AS (
      " . $query . "
    )
    SELECT *, count(*) OVER () AS total_count
    FROM query";

    if ($per_page !== -1) {
      $query .= " LIMIT " . $per_page . " OFFSET " . ($page - 1) * $per_page;
    }

    $result = pg_query($DB, $query);
    if (!$result) {
      die_json(500, "Failed to query database");
    }

    $maxCount = 0;
    $suggestions = array();
    while ($row = pg_fetch_assoc($result)) {
      if ($maxCount === 0) {
        $maxCount = intval($row['total_count']);
      }

      $suggestion = new Suggestion();
      $suggestion->apply_db_data($row);
      $suggestion->expand_foreign_keys($DB, 5, true);
      $suggestion->fetch_associated_content($DB);
      $suggestions[] = $suggestion;
    }

    return array(
      'suggestions' => $suggestions,
      'max_count' => $maxCount,
      'max_page' => ceil($maxCount / $per_page),
      'page' => $page,
      'per_page' => $per_page,
    );
  }

  // === Utility Functions ===
  function __toString()
  {
    $dateStr = date_to_long_string($this->date_created);

    $authorStr = $this->author_id !== null ? $this->author_id : "<unknown>";
    $challengeStr = $this->challenge_id !== null ? ", challenge_id:{$this->challenge_id}" : "";

    return "(Suggestion, id:{$this->id}{$challengeStr}, author:{$authorStr}, date:{$dateStr})";
  }

  //This function assumes a fully expanded structure
  function fetch_associated_content($DB)
  {
    if ($this->challenge_id !== null) {
      $this->challenge->fetch_submissions($DB);
      if ($this->challenge->map_id !== null) {
        $this->challenge->map->fetch_challenges($DB, true, false);
        //Remove the $this->challenge from the map's challenges
        $this->challenge->map->challenges = array_values(array_filter($this->challenge->map->challenges, function ($c) {
          return $c->id !== $this->challenge->id;
        }));
      }
    }
    $this->fetch_votes($DB);
  }

  function is_closed()
  {
    return $this->is_accepted !== null || $this->has_expired() || $this->is_verified === false;
  }

  function has_expired()
  {
    $now = new DateTime();
    $diff = $now->diff($this->date_created);
    return $diff->days > self::$expiration_days;
  }

  function get_url()
  {
    return constant("BASE_URL") . "/suggestions/" . $this->id;
  }
}