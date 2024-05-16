<?php

//This is an internal class and should never be written through the API
class Showcase extends DbObject implements JsonSerializable
{
  public static string $table_name = 'showcase';

  public int $account_id = null;
  public int $index = null;
  public int $submission_id = null;

  // Linked Objects
  public ?Account $account = null;
  public ?Submission $submission = null;

  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'account_id' => $this->account_id,
      'index' => $this->index,
      'submission_id' => $this->submission_id,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->account_id = intval($arr[$prefix . 'account_id']);
    $this->index = intval($arr[$prefix . 'index']);
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
    if ($this->account_id !== null) {
      $this->account = Account::get_by_id($DB, $this->account_id, $depth - 1, $expand_structure);
    }
  }

  // === Find Functions ===

  // === Utility Functions ===
  function jsonSerialize()
  {
    //Throw an error to prevent serialization
    throw new Exception("Invalid operation");
  }

  function __toString()
  {
    return "(Showcase, id:{$this->id}, account_id:{$this->account_id}, index:{$this->index}, submission_id:{$this->submission_id})";
  }
}