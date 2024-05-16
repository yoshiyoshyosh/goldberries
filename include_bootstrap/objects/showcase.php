<?php

//This is an internal class and should never be written through the API
class Showcase extends DbObject implements JsonSerializable
{
  public static string $table_name = 'showcase';

  public int $account_id;
  public int $index;
  public int $submission_id;

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
  }

  // === Find Functions ===
  static function find_all_for_account_id($DB, $account_id)
  {
    $query = "SELECT * FROM showcase WHERE account_id = $1 ORDER BY index ASC";
    $result = pg_query_params($DB, $query, array($account_id));

    $showcase_objs = array();
    while ($row = pg_fetch_assoc($result)) {
      $showcase_obj = new Showcase();
      $showcase_obj->apply_db_data($row);
      $showcase_obj->expand_foreign_keys($DB, 5);
      $showcase_objs[] = $showcase_obj;
    }

    return $showcase_objs;
  }

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