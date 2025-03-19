<?php

class Submission extends DbObject
{
  public static string $table_name = 'submission';

  public ?JsonDateTime $date_created = null;
  public string $proof_url;
  public ?string $raw_session_url = null;
  public ?string $player_notes = null;
  public bool $is_personal = false;
  public ?bool $is_verified = null;
  public ?JsonDateTime $date_verified = null;
  public ?string $verifier_notes = null;
  public bool $is_fc = false;
  public bool $is_obsolete = false;
  public ?int $time_taken = null; //In seconds
  public ?JsonDateTime $date_achieved = null;
  public ?int $frac = null;

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
      'is_personal' => $this->is_personal,
      'is_verified' => $this->is_verified,
      'date_verified' => $this->date_verified,
      'verifier_notes' => $this->verifier_notes,
      'is_fc' => $this->is_fc,
      'challenge_id' => $this->challenge_id,
      'player_id' => $this->player_id,
      'suggested_difficulty_id' => $this->suggested_difficulty_id,
      'verifier_id' => $this->verifier_id,
      'new_challenge_id' => $this->new_challenge_id,
      'is_obsolete' => $this->is_obsolete,
      'time_taken' => $this->time_taken,
      'date_achieved' => $this->date_achieved,
      'frac' => $this->frac,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->player_id = intval($arr[$prefix . 'player_id']);
    $this->is_personal = $arr[$prefix . 'is_personal'] === 't';
    $this->proof_url = $arr[$prefix . 'proof_url'];
    $this->is_fc = $arr[$prefix . 'is_fc'] === 't';
    $this->is_obsolete = $arr[$prefix . 'is_obsolete'] === 't';

    if (isset($arr[$prefix . 'is_verified']))
      $this->is_verified = $arr[$prefix . 'is_verified'] === 't';
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
    if (isset($arr[$prefix . 'time_taken']))
      $this->time_taken = intval($arr[$prefix . 'time_taken']);
    if (isset($arr[$prefix . 'date_achieved']))
      $this->date_achieved = new JsonDateTime($arr[$prefix . 'date_achieved']);
    if (isset($arr[$prefix . 'frac']))
      $this->frac = intval($arr[$prefix . 'frac']);

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
        $this->player->apply_db_data($DB, "player_", false);
      } else {
        $this->player = Player::get_by_id($DB, $this->player_id, 2, $expand_structure);
      }
    }
    if (isset($this->verifier_id)) {
      if ($isFromSqlResult) {
        $this->verifier = new Player();
        $this->verifier->apply_db_data($DB, "verifier_", false);
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
    if (isset($this->new_challenge_id)) {
      if ($isFromSqlResult) {
        $this->new_challenge = new NewChallenge();
        $this->new_challenge->apply_db_data($DB, "new_challenge_");
      } else {
        $this->new_challenge = NewChallenge::get_by_id($DB, $this->new_challenge_id);
      }
    }
  }

  // === Find Functions ===
  static function get_submission_queue($DB)
  {
    //Actually use date_created here, so that the oldest submissions are shown first, independent of when they were achieved
    $query = "SELECT * FROM view_submissions WHERE submission_is_verified IS NULL ORDER BY submission_date_created ASC, submission_id ASC;";
    $result = pg_query_params_or_die($DB, $query);

    $submissions = array();
    while ($row = pg_fetch_assoc($result)) {
      $submission = new Submission();
      $submission->apply_db_data($row, "submission_");
      $submission->expand_foreign_keys($row, 4);
      $submissions[] = $submission;
    }
    return $submissions;
  }

  static function get_recent_submissions($DB, $verified, $page, $per_page, $player = null)
  {
    $where = [];
    if ($verified === null) {
      $where[] = "is_verified IS NULL";
    } else if ($verified === true) {
      $where[] = "is_verified = true";
    } else if ($verified === false) {
      $where[] = "is_verified = false";
    }
    if ($player !== null) {
      $where[] = "player_id = " . $player;
    }

    $where_str = implode(" AND ", $where);

    $order_by = null;
    if ($player !== null) {
      $order_by = "date_achieved";
    } else if ($verified === null) {
      $order_by = "date_created";
    } else {
      $order_by = "date_verified";
    }

    $order_by = "$order_by DESC";

    $count_query = "SELECT count(*) as total_count FROM submission WHERE $where_str";
    $count_result = pg_query_params_or_die($DB, $count_query);
    $assoc = pg_fetch_assoc($count_result);
    $total_count = intval($assoc['total_count']);

    $id_query = "SELECT id FROM submission WHERE $where_str ORDER BY $order_by LIMIT $per_page OFFSET " . ($page - 1) * $per_page;
    $id_result = pg_query_params_or_die($DB, $id_query);
    $ids = [];
    while ($row = pg_fetch_assoc($id_result)) {
      $ids[] = $row['id'];
    }

    $submissions = [];
    if (count($ids) !== 0) {
      $query = "SELECT * FROM view_submissions WHERE submission_id IN (" . implode(",", $ids) . ") ORDER BY submission_$order_by, submission_date_created DESC";
      $result = pg_query_params_or_die($DB, $query);
      while ($row = pg_fetch_assoc($result)) {
        $submission = new Submission();
        $submission->apply_db_data($row, "submission_");
        $submission->expand_foreign_keys($row, 4);
        $submissions[] = $submission;
      }
    }

    return [
      'submissions' => $submissions,
      'max_count' => $total_count,
      'max_page' => ceil($total_count / $per_page),
      'page' => $page,
      'per_page' => $per_page,
    ];
  }

  // === Utility Functions ===
  function __toString()
  {
    return "(Submission, id:{$this->id}, player_id:{$this->player_id}, challenge_id:{$this->challenge_id})";
  }

  function status_string()
  {
    if ($this->is_verified === null) {
      return "Pending";
    } else if ($this->is_verified === true) {
      return "Verified";
    } else {
      return "Rejected";
    }
  }

  function get_challenge_name()
  {
    if ($this->challenge !== null) {
      return $this->challenge->get_name();
    }
    return $this->new_challenge->get_name();
  }
  function get_challenge_name_for_discord()
  {
    if ($this->challenge !== null) {
      return $this->challenge->get_name_for_discord();
    }
    return $this->new_challenge->get_name_for_discord();
  }

  function get_url()
  {
    return constant("BASE_URL") . "/submission/" . $this->id;
  }
}
