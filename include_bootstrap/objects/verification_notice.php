<?php

class VerificationNotice extends DbObject
{
  public static string $table_name = 'verification_notice';

  public int $verifier_id;
  public int $submission_id;

  // Linked Objects
  public ?Player $verifier = null;
  public ?Submission $submission = null;

  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'verifier_id' => $this->verifier_id,
      'submission_id' => $this->submission_id,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->verifier_id = intval($arr[$prefix . 'verifier_id']);
    $this->submission_id = intval($arr[$prefix . 'submission_id']);
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
    if ($depth <= 1)
      return;

    if ($expand_structure) {
      if ($this->submission_id !== null) {
        $this->submission = Submission::get_by_id($DB, $this->submission_id, $depth - 1, $expand_structure);
      }
    }
    if ($this->verifier_id !== null) {
      $this->verifier = Player::get_by_id($DB, $this->verifier_id, $depth - 1, $expand_structure);
    }
  }

  // === Find Functions ===
  static function get_all($DB)
  {
    $query = "SELECT * FROM " . static::$table_name;
    $result = pg_query($DB, $query);
    $notices = [];
    while ($row = pg_fetch_assoc($result)) {
      $notice = new VerificationNotice();
      $notice->apply_db_data($row);
      $notice->expand_foreign_keys($DB, 5, false);
      $notices[] = $notice;
    }
    return $notices;
  }

  // === Utility Functions ===
  static function delete_for_submission_id($DB, $submission_id)
  {
    $query = "DELETE FROM " . static::$table_name . " WHERE submission_id = $1";
    $result = pg_query_params($DB, $query, array($submission_id));
    return $result;
  }

  function __toString()
  {
    $verifierName = $this->verifier?->name ?? "null";
    return "(VerificationNotice, id:{$this->id}, verifier:{$verifierName}, submission_id:{$this->submission_id})";
  }
}