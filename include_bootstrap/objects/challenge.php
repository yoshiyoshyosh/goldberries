<?php

class Challenge extends DbObject
{
  public static string $table_name = 'challenge';

  public ?string $description = null;
  public ?DateTime $date_created = null;
  public bool $requires_fc = false;
  public bool $has_fc = false;
  public ?bool $is_arbitrary = null;

  // Foreign Keys
  public ?int $campaign_id = null;
  public ?int $map_id = null;
  public int $objective_id;
  public int $difficulty_id;

  // Linked Objects
  public ?Campaign $campaign = null;
  public ?Map $map = null;
  public ?Objective $objective;
  public ?Difficulty $difficulty;

  // Associative Objects
  public ?array $submissions = null; /* Submission[] */


  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'description' => $this->description,
      'date_created' => $this->date_created,
      'requires_fc' => $this->requires_fc,
      'has_fc' => $this->has_fc,
      'campaign_id' => $this->campaign_id,
      'map_id' => $this->map_id,
      'objective_id' => $this->objective_id,
      'difficulty_id' => $this->difficulty_id,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->objective_id = intval($arr[$prefix . 'objective_id']);
    $this->difficulty_id = intval($arr[$prefix . 'difficulty_id']);
    $this->requires_fc = $arr[$prefix . 'requires_fc'] === 't';
    $this->has_fc = $arr[$prefix . 'has_fc'] === 't';

    if (isset($arr[$prefix . 'date_created']))
      $this->date_created = new DateTime($arr[$prefix . 'date_created']);
    if (isset($arr[$prefix . 'campaign_id']))
      $this->campaign_id = intval($arr[$prefix . 'campaign_id']);
    if (isset($arr[$prefix . 'map_id']))
      $this->map_id = intval($arr[$prefix . 'map_id']);
    if (isset($arr[$prefix . 'description']))
      $this->description = $arr[$prefix . 'description'];
    if (isset($arr[$prefix . 'is_arbitrary']))
      $this->is_arbitrary = $arr[$prefix . 'is_arbitrary'] === 't';
  }

  function expand_foreign_keys($DB, $depths = 2, $expand_structure = true)
  {
    $isFromSqlResult = is_array($DB);

    if ($expand_structure && isset($this->campaign_id)) {
      if ($isFromSqlResult) {
        $this->campaign = new Campaign();
        $this->campaign->apply_db_data($DB, "campaign_");
        $this->campaign->expand_foreign_keys($DB, $depths - 1);
      } else {
        $this->campaign = Campaign::get_by_id($DB, $this->campaign_id, $depths - 1);
      }
    }

    if ($expand_structure && isset($this->map_id)) {
      if ($isFromSqlResult) {
        $this->map = new Map();
        $this->map->apply_db_data($DB, "map_");
        $this->map->expand_foreign_keys($DB, $depths - 1);
      } else {
        $this->map = Map::get_by_id($DB, $this->map_id, $depths - 1);
      }
    }

    if ($isFromSqlResult) {
      $this->objective = new Objective();
      $this->objective->apply_db_data($DB, "objective_");
    } else {
      $this->objective = Objective::get_by_id($DB, $this->objective_id);
    }

    if ($isFromSqlResult) {
      $this->difficulty = new Difficulty();
      $this->difficulty->apply_db_data($DB, "difficulty_");
    } else {
      $this->difficulty = Difficulty::get_by_id($DB, $this->difficulty_id);
    }
  }

  // === Find Functions ===
  function fetch_submissions($DB): bool
  {
    $submissions = $this->fetch_list($DB, 'challenge_id', Submission::class, "is_verified = true");
    if ($submissions === false)
      return false;
    $this->submissions = $submissions;
    foreach ($this->submissions as $submission) {
      $submission->expand_foreign_keys($DB, 2, false);
    }
    return true;
  }

  // === Utility Functions ===
  function __toString()
  {
    return "(Challenge, id:{$this->id}, description:'{$this->description}')";
  }
}
