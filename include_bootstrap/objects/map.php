<?php

class Map extends DbObject
{
  public static string $table_name = 'map';

  public string $name;
  public ?string $url = null;
  public ?DateTime $date_added = null;
  public bool $is_rejected = false;
  public ?string $rejection_reason = null;
  public bool $is_archived = false;
  public ?int $sort_major = null;
  public ?int $sort_minor = null;
  public ?int $sort_order = null;
  public ?int $author_gb_id = null;
  public ?string $author_gb_name = null;

  // Foreign Keys
  public ?int $campaign_id = null;

  // Linked Objects
  public Campaign $campaign;

  // Associative Objects
  public ?array $challenges = null; /* Challenge[] */



  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'name' => $this->name,
      'url' => $this->url,
      'date_added' => $this->date_added,
      'is_rejected' => $this->is_rejected,
      'rejection_reason' => $this->rejection_reason,
      'is_archived' => $this->is_archived,
      'sort_major' => $this->sort_major,
      'sort_minor' => $this->sort_minor,
      'sort_order' => $this->sort_order,
      'author_gb_id' => $this->author_gb_id,
      'author_gb_name' => $this->author_gb_name,
      'campaign_id' => $this->campaign_id,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->name = $arr[$prefix . 'name'];
    $this->is_rejected = $arr[$prefix . 'is_rejected'] === 't';
    $this->is_archived = $arr[$prefix . 'is_archived'] === 't';

    if (isset($arr[$prefix . 'date_added']))
      $this->date_added = new DateTime($arr[$prefix . 'date_added']);
    if (isset($arr[$prefix . 'url']))
      $this->url = $arr[$prefix . 'url'];
    if (isset($arr[$prefix . 'side']))
      $this->side = $arr[$prefix . 'side'];
    if (isset($arr[$prefix . 'rejection_reason']))
      $this->rejection_reason = $arr[$prefix . 'rejection_reason'];
    if (isset($arr[$prefix . 'sort_major']))
      $this->sort_major = intval($arr[$prefix . 'sort_major']);
    if (isset($arr[$prefix . 'sort_minor']))
      $this->sort_minor = intval($arr[$prefix . 'sort_minor']);
    if (isset($arr[$prefix . 'sort_order']))
      $this->sort_order = intval($arr[$prefix . 'sort_order']);
    if (isset($arr[$prefix . 'author_gb_id']))
      $this->author_gb_id = intval($arr[$prefix . 'author_gb_id']);
    if (isset($arr[$prefix . 'author_gb_name']))
      $this->author_gb_name = $arr[$prefix . 'author_gb_name'];
    if (isset($arr[$prefix . 'campaign_id']))
      $this->campaign_id = intval($arr[$prefix . 'campaign_id']);
  }

  function expand_foreign_keys($DB, $depth = 2, $dont_expand = array())
  {
    if ($depth <= 1)
      return;

    $isFromSqlResult = is_array($DB);

    if (!in_array('campaign', $dont_expand) && isset($this->campaign_id)) {
      if ($isFromSqlResult) {
        $this->campaign = new Campaign();
        $this->campaign->apply_db_data($DB, "campaign_");
        $this->campaign->expand_foreign_keys($DB, $depth - 1);
      } else {
        $this->campaign = Campaign::get_by_id($DB, $this->campaign_id, $depth - 1);
      }
    }
  }

  // === Find Functions ===
  function fetch_challenges($DB, $with_submissions = false): bool
  {
    $challenges = $this->fetch_list($DB, 'map_id', Challenge::class);
    if ($challenges === false)
      return false;
    $this->challenges = $challenges;
    foreach ($this->challenges as $challenge) {
      if ($with_submissions)
        $challenge->fetch_submissions($DB);
      $challenge->expand_foreign_keys($DB, 2, array('map'));
    }
    return true;
  }

  // === Utility Functions ===
  function __toString()
  {
    return "(Map, id:{$this->id}, name:'{$this->name}')";
  }
}
