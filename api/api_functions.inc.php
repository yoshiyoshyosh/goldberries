<?php

////// DIAGNOSTICS

function die_json(int $code, string $why): string
{
  http_response_code($code);
  echo json_encode(array('error' => $why));

  //If its an artificial 500 error
  if ($code >= 500) {
    log_error($code . ": " . $why, "Server Error");
  }

  exit();
}

////// VALIDATION

// preg_match returns 1 on match, 0 on no match, false on failure
// so this will only be true when there is a match
function is_id_string($str): bool
{
  return (bool) preg_match('/^[0-9]+$/', $str);
}

function is_id_strings(array $strs): bool
{
  foreach ($strs as $val) {
    if (!is_id_string($val)) {
      return false;
    }
  }
  return true;
}

function is_valid_id_query($arg): bool
{
  if (is_array($arg)) {
    return is_id_strings($arg);
  }
  return is_id_string($arg);
}

function is_valid_url($url): bool
{
  return (bool) preg_match('/^https?:\/\/[^\s\/$.?#].[^\s]*$/i', $url);
}

function is_valid_name($name): bool
{
  //If starts or ends with a space, or has two spaces in a row, its invalid
  if (preg_match('/^ | $|  /', $name)) {
    return false;
  }

  return (bool) preg_match('/^[\x{0020}-\x{007E}\x{00A1}-\x{00FF}\p{Han}\p{Katakana}\p{Hiragana}\p{Hangul}]+$/u', $name);
}

////// CHECKS

function check_url($url, $field_name = null)
{
  if (!is_valid_url($url)) {
    die_json(400, $field_name === null ? "invalid url" : "{$field_name} is not a valid url");
  }
}

////// UNIFIED GET FUNCTION

function api_unified_output($DB, string $table_noesc, $object_skel)
{
  $output = api_unified_get($DB, $table_noesc, $object_skel);
  api_write($output);
}
function api_write($output, $check_numbers = false, $run_profiler = false)
{
  $flags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
  if ($check_numbers) {
    $flags |= JSON_NUMERIC_CHECK;
  }
  if ($run_profiler) {
    api_write_for_profiler($output, $flags);
    return;
  }
  echo json_encode($output, $flags);
}

function api_write_for_profiler($output, $flags)
{
  $json = json_encode($output, $flags);
  //Parse json again
  $obj = json_decode($json, true);
  $obj['profiler'] = profiler_get_data();
  echo json_encode($obj, $flags);
}

function api_unified_get($DB, string $table_noesc, $object_skel)
{
  $json_arr = [];
  $table = pg_escape_identifier(strtolower($table_noesc));

  if (isset($_GET['all'])) {
    $result = pg_query($DB, "SELECT * FROM {$table};");
    while ($row = pg_fetch_row($result)) {
      $object_skel->pull_from_db($DB, $row[0]);
      array_push($json_arr, $object_skel->clone_for_api($DB));
    }
    return $json_arr;
  }
  if (!is_valid_id_query($_GET['id'])) {
    die_json(400, 'invalid query: invalid or missing id');
  }

  $id = intval($_GET['id']);
  if (is_array($id)) {
    foreach ($id as $val) {
      if ($object_skel->pull_from_db($DB, intval($val)) === false) {
        die_json(400, "invalid query: id {$val} does not exist");
      }
      array_push($json_arr, $object_skel->clone_for_api($DB));
    }
    return $json_arr;
  } else {
    if ($object_skel->pull_from_db($DB, intval($id)) === false) {
      die_json(400, "invalid query: id {$id} does not exist");
    }
    return $object_skel->clone_for_api($DB);
  }
}


////// PARSE FUNCTIONS

function parse_post_body_as_json()
{
  $json = file_get_contents('php://input');
  if ($json === false) {
    die_json(400, 'invalid request: no body');
  }
  $data = json_decode($json, true);
  if ($data === null) {
    die_json(400, 'invalid request: malformed json');
  }
  return $data;
}

function format_assoc_array_bools($arr)
{
  foreach ($arr as $key => $val) {
    if (is_bool($val)) {
      $arr[$key] = $val ? 't' : 'f';
    } else if (is_array($val)) {
      $arr[$key] = format_assoc_array_bools($val);
    }
  }
  return $arr;
}

////// Hierarchy Parse Functions

function parse_campaigns($result): array
{
  $campaigns = []; //dictionary id -> campaign

  //loop through result rows
  while ($row = pg_fetch_assoc($result)) {
    $campaign_id = intval($row['campaign_id']);
    if (!array_key_exists($campaign_id, $campaigns)) {
      $campaign = new Campaign();
      $campaign->apply_db_data($row, "campaign_");
      $campaign->maps = [];
      $campaign->challenges = [];
      $campaigns[$campaign_id] = $campaign;
    }
    $campaign = $campaigns[$campaign_id];

    $map = null;
    if (isset($row['map_id'])) {
      $map_id = intval($row['map_id']);
      if (!array_key_exists($map_id, $campaign->maps)) {
        $map = new Map();
        $map->apply_db_data($row, "map_");
        $map->challenges = [];
        $campaign->maps[$map_id] = $map;
      }
      $map = $campaign->maps[$map_id];
    }

    $challenge_id = intval($row['challenge_id']);
    $challenge = null;
    if (($map === null || !array_key_exists($challenge_id, $map->challenges)) && !array_key_exists($challenge_id, $campaign->challenges)) {
      $challenge = new Challenge();
      $challenge->apply_db_data($row, "challenge_");
      $challenge->submissions = [];
      $challenge->expand_foreign_keys($row, 1, false);
      if ($challenge->map_id === null) {
        $campaign->challenges[$challenge_id] = $challenge;
      } else {
        $map->challenges[$challenge_id] = $challenge;
      }
    } else {
      if ($map !== null) {
        $challenge = $map->challenges[$challenge_id];
      } else {
        $challenge = $campaign->challenges[$challenge_id];
      }
    }

    $submission = new Submission();
    $submission->apply_db_data($row, "submission_");
    $submission->expand_foreign_keys($row, 2, false);
    $challenge->submissions[$submission->id] = $submission;
  }

  foreach ($campaigns as $campaign) {
    foreach ($campaign->maps as $map) {
      foreach ($map->challenges as $challenge) {
        $challenge->submissions = array_values($challenge->submissions);
      }
      $map->challenges = array_values($map->challenges);
    }
    $campaign->maps = array_values($campaign->maps);
    $campaign->challenges = array_values($campaign->challenges);
  }
  $campaigns = array_values($campaigns);

  return $campaigns;
}

function parse_campaigns_no_submissions($result): array
{
  $campaigns = []; //dictionary id -> campaign

  //loop through result rows
  while ($row = pg_fetch_assoc($result)) {
    $campaign_id = intval($row['campaign_id']);
    if (!array_key_exists($campaign_id, $campaigns)) {
      $campaign = new Campaign();
      $campaign->apply_db_data($row, "campaign_");
      $campaign->maps = [];
      $campaign->challenges = [];
      $campaigns[$campaign_id] = $campaign;
    }
    $campaign = $campaigns[$campaign_id];

    $map = null;
    if (isset($row['map_id'])) {
      $map_id = intval($row['map_id']);
      if (!array_key_exists($map_id, $campaign->maps)) {
        $map = new Map();
        $map->apply_db_data($row, "map_");
        $map->challenges = [];
        $campaign->maps[$map_id] = $map;
      }
      $map = $campaign->maps[$map_id];
    }

    $challenge_id = intval($row['challenge_id']);
    $challenge = null;
    if ($challenge_id !== 0 && ($map === null || !array_key_exists($challenge_id, $map->challenges)) && !array_key_exists($challenge_id, $campaign->challenges)) {
      $challenge = new Challenge();
      $challenge->apply_db_data($row, "challenge_");
      $challenge->submissions = null;
      //When using view_campaigns, count_submissions is no longer available.
      // $challenge->data['count_submissions'] = intval($row['count_submissions']);
      $challenge->expand_foreign_keys($row, 1, false);
      if ($challenge->map_id === null) {
        $campaign->challenges[$challenge_id] = $challenge;
      } else {
        $map->challenges[$challenge_id] = $challenge;
      }
    } else {
      if ($map !== null) {
        $challenge = $map->challenges[$challenge_id];
      } else {
        $challenge = $campaign->challenges[$challenge_id];
      }
    }
  }

  foreach ($campaigns as $campaign) {
    foreach ($campaign->maps as $map) {
      $map->challenges = array_values($map->challenges);
    }
    $campaign->maps = array_values($campaign->maps);
    $campaign->challenges = array_values($campaign->challenges);
  }
  //TODO: Removing maps/challenges saves ~87% of the data size
  // foreach ($campaigns as $campaign) {
  //   $campaign->maps = null;
  //   $campaign->challenges = null;
  // }
  $campaigns = array_values($campaigns);

  return $campaigns;
}

//This function parses the view_campaigns response into a flat array of campaigns, instead of
//reconstructing the normal hierarchy. This is useful for paginated results.
function parse_campaigns_flat($result): array
{
  $campaigns = []; //dictionary array of campaigns (can contain duplicate campaigns)

  //loop through result rows
  while ($row = pg_fetch_assoc($result)) {
    $campaign_id = intval($row['campaign_id']);
    $campaign = new Campaign();
    $campaign->apply_db_data($row, "campaign_");
    $campaign->maps = [];
    $campaign->challenges = [];
    $campaigns[] = $campaign;

    $map = null;
    if (isset($row['map_id'])) {
      $map_id = intval($row['map_id']);
      if (!array_key_exists($map_id, $campaign->maps)) {
        $map = new Map();
        $map->apply_db_data($row, "map_");
        $map->challenges = [];
        $campaign->maps[] = $map;
      }
    }

    $challenge_id = intval($row['challenge_id']);
    $challenge = null;
    if ($challenge_id !== 0 && ($map === null || !array_key_exists($challenge_id, $map->challenges)) && !array_key_exists($challenge_id, $campaign->challenges)) {
      $challenge = new Challenge();
      $challenge->apply_db_data($row, "challenge_");
      $challenge->submissions = null;
      //When using view_campaigns, count_submissions is no longer available.
      // $challenge->data['count_submissions'] = intval($row['count_submissions']);
      $challenge->expand_foreign_keys($row, 1, false);
      if ($challenge->map_id === null) {
        $campaign->challenges[] = $challenge;
      } else {
        $map->challenges[] = $challenge;
      }
    }
  }

  return $campaigns;
}