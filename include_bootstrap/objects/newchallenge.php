<?php

class NewChallenge extends DbObject
{
  public static string $table_name = 'new_challenge';

  public string $url;
  public ?string $name = null;
  public ?string $description;
  public ?StringList $collectibles = null;
  public ?string $golden_changes = null;


  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'url' => $this->url,
      'name' => $this->name,
      'description' => $this->description,
      'collectibles' => $this->collectibles === null ? null : $this->collectibles->__toString(),
      'golden_changes' => $this->golden_changes,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->url = $arr[$prefix . 'url'];
    $this->description = $arr[$prefix . 'description'];

    if (isset($arr[$prefix . 'name']))
      $this->name = $arr[$prefix . 'name'];
    if (isset($arr[$prefix . 'collectibles'])) {
      $value = $arr[$prefix . 'collectibles'];
      if (is_array($value)) {
        if (count($value) > 0) {
          $this->collectibles = new StringList(4);
          $this->collectibles->arr = $value;
        } else {
          $this->collectibles = null;
        }
      } else {
        $this->collectibles = new StringList(4, $value);
      }
    }
    if (isset($arr[$prefix . 'golden_changes']))
      $this->golden_changes = $arr[$prefix . 'golden_changes'];
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
  }

  // === Find Functions ===

  // === Utility Functions ===
  function __toString()
  {
    return "(NewChallenge, id:{$this->id}, url:'{$this->url}', name:'{$this->name}', description:'{$this->description}')";
  }

  function get_name(): string
  {
    return "New Challenge: {$this->name}";
  }
  function get_name_for_discord(): string
  {
    $name = $this->get_name_escaped();
    return "`New Challenge: {$name}`";
  }

  function get_name_escaped()
  {
    //Regex remove backticks from the name, then return
    return preg_replace('/`/', '', $this->name);
  }
}