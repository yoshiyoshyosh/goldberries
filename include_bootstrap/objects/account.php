<?php

$session_expire_days = 7;

class Account extends DbObject
{
  public static string $table_name = 'account';

  public ?string $email = null;
  public ?string $password = null;
  public ?string $discord_id = null;
  public ?string $session_token = null;
  public ?JsonDateTime $session_created = null;
  public ?JsonDateTime $date_created;
  public bool $is_verifier = false;
  public bool $is_admin = false;
  public bool $is_suspended = false;
  public ?string $suspension_reason = null;
  public bool $email_verified = false;
  public ?string $email_verify_code = null;

  // Profile Customization
  public ?array $links = null; // array of links, in DB: TSV of links
  public ?string $input_method = null;
  public ?string $about_me = null;
  public ?string $name_color_start = null;
  public ?string $name_color_end = null;

  // Other
  public ?JsonDateTime $last_player_rename = null;

  // Foreign Keys
  public ?int $player_id = null;
  public ?int $claimed_player_id = null;

  // Linked Objects
  public ?Player $player = null;
  public ?Player $claimed_player = null;


  // === Abstract Functions ===
  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->date_created = new JsonDateTime($arr[$prefix . 'date_created']);
    $this->is_verifier = $arr[$prefix . 'is_verifier'] === 't';
    $this->is_admin = $arr[$prefix . 'is_admin'] === 't';
    $this->is_suspended = $arr[$prefix . 'is_suspended'] === 't';

    if (isset($arr[$prefix . 'player_id']))
      $this->player_id = intval($arr[$prefix . 'player_id']);
    if (isset($arr[$prefix . 'claimed_player_id']))
      $this->claimed_player_id = intval($arr[$prefix . 'claimed_player_id']);
    if (isset($arr[$prefix . 'email']))
      $this->email = $arr[$prefix . 'email'];
    if (isset($arr[$prefix . 'password']))
      $this->password = $arr[$prefix . 'password'];
    if (isset($arr[$prefix . 'discord_id']))
      $this->discord_id = $arr[$prefix . 'discord_id'];
    if (isset($arr[$prefix . 'session_token']))
      $this->session_token = $arr[$prefix . 'session_token'];
    if (isset($arr[$prefix . 'session_created']))
      $this->session_created = new JsonDateTime($arr[$prefix . 'session_created']);
    if (isset($arr[$prefix . 'suspension_reason']))
      $this->suspension_reason = $arr[$prefix . 'suspension_reason'];
    if (isset($arr[$prefix . 'email_verified']))
      $this->email_verified = $arr[$prefix . 'email_verified'] === 't';
    if (isset($arr[$prefix . 'email_verify_code']))
      $this->email_verify_code = $arr[$prefix . 'email_verify_code'];
    if (isset($arr[$prefix . 'links'])) {
      $value = $arr[$prefix . 'links'];
      if (is_array($value)) {
        $this->links = $value;
      } else {
        $this->links = explode("\t", $value);
        //Trim all strings
        $this->links = array_map('trim', $this->links);
        //Remove empty strings
        $this->links = array_filter($this->links, function ($link) {
          return $link !== '';
        });
      }
      //Set to null if empty
      if (count($this->links) === 0)
        $this->links = null;
    }
    if (isset($arr[$prefix . 'input_method']))
      $this->input_method = $arr[$prefix . 'input_method'];
    if (isset($arr[$prefix . 'about_me']))
      $this->about_me = $arr[$prefix . 'about_me'];
    if (isset($arr[$prefix . 'name_color_start']))
      $this->name_color_start = $arr[$prefix . 'name_color_start'];
    if (isset($arr[$prefix . 'name_color_end']))
      $this->name_color_end = $arr[$prefix . 'name_color_end'];

    if (isset($arr[$prefix . 'last_player_rename'])) {
      $this->last_player_rename = new JsonDateTime($arr[$prefix . 'last_player_rename']);
    }
  }
  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
    if ($depth <= 1)
      return;

    if ($this->player_id !== null) {
      $this->player = Player::get_by_id($DB, $this->player_id, $depth - 1);
    } else {
      $this->player = null;
    }

    if ($this->claimed_player_id !== null) {
      $this->claimed_player = Player::get_by_id($DB, $this->claimed_player_id, $depth - 1);
    } else {
      $this->claimed_player = null;
    }
  }

  function get_field_set()
  {
    return array(
      'player_id' => $this->player_id,
      'claimed_player_id' => $this->claimed_player_id,
      'email' => $this->email,
      'password' => $this->password,
      'discord_id' => $this->discord_id,
      'session_token' => $this->session_token,
      'session_created' => $this->session_created,
      'suspension_reason' => $this->suspension_reason,
      'email_verified' => $this->email_verified,
      'email_verify_code' => $this->email_verify_code,
      'is_verifier' => $this->is_verifier,
      'is_admin' => $this->is_admin,
      'is_suspended' => $this->is_suspended,
      'links' => $this->links !== null && count($this->links) > 0 ? implode("\t", $this->links) : null,
      'input_method' => $this->input_method,
      'about_me' => $this->about_me,
      'name_color_start' => $this->name_color_start,
      'name_color_end' => $this->name_color_end,
      'last_player_rename' => $this->last_player_rename,
    );
  }

  // === Find Functions ===
  static function find_by_discord_id($DB, string $discord_id)
  {
    return find_in_db($DB, 'Account', "discord_id = $1", array($discord_id), new Account());
  }

  static function find_by_email($DB, string $email)
  {
    return find_in_db($DB, 'Account', "email = $1", array($email), new Account());
  }

  static function find_by_session_token($DB, string $session_token)
  {
    global $session_expire_days;
    return find_in_db($DB, 'Account', "session_token = $1 AND session_created > NOW() - INTERVAL '$session_expire_days days'", array($session_token), new Account());
  }

  static function find_by_email_verify_code($DB, string $email_verify_code)
  {
    return find_in_db($DB, 'Account', "email_verify_code = $1", array($email_verify_code), new Account());
  }

  static function find_by_claimed_player_id($DB, int $player_id)
  {
    return find_in_db($DB, 'Account', "claimed_player_id = $1", array($player_id), new Account());
  }

  static function find_by_player_id($DB, int $player_id)
  {
    return find_in_db($DB, 'Account', "player_id = $1", array($player_id), new Account());
  }

  static function get_all_player_claims($DB)
  {
    return find_in_db($DB, 'Account', "claimed_player_id IS NOT NULL", array(), new Account());
  }

  // === Utility Functions ===
  function __toString()
  {
    $player_name = $this->player !== null ? "'{$this->player->name}'" : "<No Player>";
    return "(Account, id: {$this->id}, name: {$player_name})";
  }

  function remove_sensitive_info()
  {
    $this->password = null;
    // $this->discord_id = null;
    $this->session_token = null;
    $this->session_created = null;
    $this->email_verify_code = null;
  }
}
