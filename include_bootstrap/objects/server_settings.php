<?php

class ServerSettings extends DbObject
{
  public static string $table_name = 'server_settings';

  public bool $registrations_enabled = true;
  public bool $submissions_enabled = true;
  public ?StringList $global_notices = null;
  public bool $maintenance_mode = false;

  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'registrations_enabled' => $this->registrations_enabled,
      'submissions_enabled' => $this->submissions_enabled,
      'global_notices' => $this->global_notices === null ? null : $this->global_notices->__toString(),
      'maintenance_mode' => $this->maintenance_mode,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->registrations_enabled = $arr[$prefix . 'registrations_enabled'] === 't';
    $this->submissions_enabled = $arr[$prefix . 'submissions_enabled'] === 't';
    $this->maintenance_mode = $arr[$prefix . 'maintenance_mode'] === 't';

    if (isset($arr[$prefix . 'global_notices'])) {
      $value = $arr[$prefix . 'global_notices'];
      if (is_array($value)) {
        if (count($value) > 0) {
          $this->global_notices = new StringList(2);
          $this->global_notices->arr = $value;
        } else {
          $this->global_notices = null;
        }
      } else {
        $this->global_notices = new StringList(2, $value);
      }
    }
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
  }

  // === Find Functions ===
  static function get_settings($DB)
  {
    $query = "SELECT * FROM " . static::$table_name . " WHERE id = 1";
    $result = pg_query($DB, $query);
    $settings = null;
    while ($row = pg_fetch_assoc($result)) {
      $settings = new ServerSettings();
      $settings->apply_db_data($row);
    }

    if ($settings === null) {
      $settings = new ServerSettings();
      $settings->id = 1;
      if ($settings->insert($DB) === false) {
        log_error("Failed to insert new server settings", "Server Error");
      }
    }

    return $settings;
  }

  // === Utility Functions ===

  function __toString()
  {
    return "(ServerSettings, id:{$this->id}, registrations_enabled:{$this->registrations_enabled}, submissions_enabled:{$this->submissions_enabled}, maintenance_mode:{$this->maintenance_mode}, global_notices:{$this->global_notices})";
  }
}