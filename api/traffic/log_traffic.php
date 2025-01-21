<?php

require_once('../api_bootstrap.inc.php');


//This file in run in the command line, so no _SERVER variable checks are possible
//Instead, check if the script is being run from the command line

$is_debug = getenv('DEBUG') === 'true';

if (!$is_debug) {
  if (php_sapi_name() !== 'cli') {
    die_json(405, 'Method Not Allowed');
  }
}

//Constants
$SKIP_EXTENSIONS = ["png", "jpg", "js", "css", "woff2", "otf", "xml"];
$USER_AGENTS = [
  "firefox" => [
    "must_contain" => ["Firefox/"],
    "must_not_contain" => ["Seamonkey/"],
  ],
  "seamonkey" => [
    "must_contain" => ["Seamonkey/"],
    "must_not_contain" => [],
  ],
  "chrome" => [
    "must_contain" => ["Chrome/"],
    "must_not_contain" => ["Chromium/", "Edg.", "OPR/"],
  ],
  "chromium" => [
    "must_contain" => ["Chromium/"],
    "must_not_contain" => [],
  ],
  "safari" => [
    "must_contain" => ["Safari/"],
    "must_not_contain" => ["Chrome/", "Chromium"],
  ],
  "opera" => [
    "must_contain" => ["OPR/"],
    "must_not_contain" => [],
  ],
  "opera_old" => [
    "must_contain" => ["Opera/"],
    "must_not_contain" => ["OPR/"],
  ],
  "bot_node" => [
    "must_contain" => ["node"],
    "must_not_contain" => [],
  ],
];
$SKIP_AGENTS = [
  "bingbot",
  "googlebot",
  "petalbot",
  "yandexbot",
  "ahrefsbot",
  "discordbot",
  "archive.org_bot",
];
$SKIP_PAGE_PREFIX = [
  "/.well-known"
];


//Set content type to plain text
header('Content-Type: text/plain');

//Traffic file URL is passed as environment variable called 'TRAFFIC_FILE'
$traffic_file = getenv('TRAFFIC_FILE');
if ($traffic_file === false) {
  die("Environment variable 'TRAFFIC_FILE' not set\n");
}
//Load file contents
$traffic_data = file_get_contents($traffic_file);
if ($traffic_data === false) {
  die("Failed to read traffic file\n");
}

echo_if_debug("Loaded traffic data\n");

//Get the most recent traffic entry from the db
$query = "SELECT * FROM traffic ORDER BY id DESC LIMIT 1";
$result = pg_query($DB, $query);
if ($result === false) {
  die("Failed to query traffic table\n");
}
$row = pg_fetch_assoc($result);
$most_recent_timestamp = null;
if ($row !== false) {
  echo_if_debug("Row data: " . json_encode($row) . "\n");
  //parse timestamptz to DateTime
  $most_recent_timestamp = new DateTime($row['date']);
  echo_if_debug("Parsed initial timestamp\n");
}

echo "Most recent timestamp: " . ($most_recent_timestamp !== null ? json_encode($most_recent_timestamp) : 'null') . "\n";


//Split the data into lines
$lines = explode("\n", $traffic_data);
$i = 0;

//Processs each entry
foreach ($lines as $line) {
  $i++;
  echo_if_debug("Checking line #$i\n");

  //Each line is a tab separated list of values
  $values = explode("\t", $line);

  //Check if the line is valid. Expecting 6 values
  if (count($values) !== 8) {
    echo_if_debug("Invalid line: $line\n");
    continue;
  }

  //Extract values: Timestamp, Method, Requested Page, Status Code, Query String, Referer Header
  //Example line: [15/Jan/2025:16:17:50 +0100]    GET     /api/suggestion/paginated       200     ?page=1&per_page=30&type=all&expired=false      https://goldberries.net/suggestions/405
  //Example with empty query string: [15/Jan/2025:16:18:35 +0100]    GET  /challenge/2736 200             -
  //Query string can be an empty string, all others are required to be non-empty
  //Referer header can be a hyphen if no referrer is present

  $timestamp = $values[0];
  $method = $values[1];
  $page = $values[2];
  $status = $values[3];
  $query = $values[4];
  $referer = $values[5];
  $user_agent = $values[6];
  $serve_time_ms = $values[7];

  //Check if the timestamp is in the correct format
  if (!preg_match('/^\[\d{2}\/[A-Za-z]{3}\/\d{4}:\d{2}:\d{2}:\d{2} \+\d{4}\]$/', $timestamp)) {
    echo_if_debug("Invalid timestamp: $timestamp\n");
    continue;
  }
  //===== TIMESTAMP =====
  $timestamp = substr($timestamp, 1, -1);
  $timestamp = DateTime::createFromFormat('d/M/Y:H:i:s O', $timestamp);
  if ($timestamp === false) {
    echo_if_debug("Failed to parse timestamp: $timestamp\n");
    continue;
  }

  echo_if_debug("Comparing timestamps: " . json_encode($timestamp) . " vs " . json_encode($most_recent_timestamp) . "\n");
  //Check if the timestamp is before the most recent entry in the db
  if ($most_recent_timestamp !== null && $timestamp <= $most_recent_timestamp) {
    echo_if_debug("Skipping old line #$i\n");
    continue;
  }

  //===== METHOD =====
  if (!in_array($method, ['GET', 'POST', 'PUT', 'DELETE'])) {
    echo_if_debug("Invalid method: $method\n");
    continue;
  }

  //===== PAGE =====
  if (!preg_match('/^\/[a-zA-Z0-9_\/\.\-\+ ]*$/', $page)) {
    echo_if_debug("Invalid page: $page\n");
    continue;
  }
  //Check if page ends with a known extension to skip
  $skip_page = false;
  foreach ($SKIP_EXTENSIONS as $skip_extension) {
    if (substr($page, -strlen($skip_extension)) === $skip_extension) {
      $skip_page = true;
      break;
    }
  }
  foreach ($SKIP_PAGE_PREFIX as $skip_prefix) {
    if ($skip_page || strpos($page, $skip_prefix) === 0) {
      $skip_page = true;
      break;
    }
  }
  if ($skip_page) {
    echo_if_debug("Skipping page request: $page\n");
    continue;
  }
  //If the page is exactly equal to "/index.html" replace it with "/"
  if ($page === "/index.html") {
    $page = "/";
  }


  //===== STATUS =====
  $status = intval($status);
  if ($status < 100 || $status > 599) {
    echo_if_debug("Invalid status code: $status\n");
    continue;
  }

  //===== QUERY =====
  if ($query === "") {
    $query = null;
  }
  //If the page is /api/auth/discord_auth.php, remove the query string as it contains the oauth code
  if ($page === "/api/auth/discord_auth.php") {
    $query = null;
  }

  //===== REFERER =====
  if ($referer === "-" || $referer === "") {
    $referer = null;
  }
  if ($referer !== null) {
    //Remove trailing slashes
    $referer = rtrim($referer, '/');
    //if theres still 3 or more slashes, remove everything after the third slash (including the third slash)
    $slashes = substr_count($referer, '/');
    if ($slashes >= 3) {
      $referer = substr($referer, 0, strpos($referer, '/', strpos($referer, '/', strpos($referer, '/') + 1) + 1));
    } else if ($slashes === 0) {
      //If there are no slashes in the referrer, prepend "https://" to it
      $referer = "https://" . $referer;
    }

    //If the referrer is coming from localhost 'http://127.0.0.1', ignore the request
    if (strpos($referer, 'http://127.0.0.1') === 0) {
      echo_if_debug("Skipping localhost request #$i: $referer\n");
      continue;
    }

    //Replace the leading https://goldberries.net with an empty string
    $referer = str_replace('https://goldberries.net', '', $referer);
    $referer = str_replace('https://www.goldberries.net', '', $referer);
    $referer = str_replace('http://goldberries.net', '', $referer);
    $referer = str_replace('http://www.goldberries.net', '', $referer);
    if ($referer === '') {
      $referer = "/"; //If after removing the domain the referer is empty, set it to '/'
    }
  }

  //If its longer than 100 characters, truncate it
  if (strlen($referer) > 100) {
    $referer = substr($referer, 0, 100) . '...';
  }


  //===== USER AGENT =====
  $user_agent = strtolower($user_agent);

  //First, check if its supposed to be skipped
  $skip = false;
  foreach ($SKIP_AGENTS as $skip_agent) {
    if (strpos($user_agent, $skip_agent) !== false) {
      $skip = true;
      break;
    }
  }
  if ($skip) {
    echo_if_debug("Skipping bot request #$i: $skip_agent\n");
    continue;
  }

  //Then, parse the actual user agent
  $user_agent_parsed = null;
  foreach ($USER_AGENTS as $agent => $rules) {
    $contains_all = true;
    $contains_none = true;
    foreach ($rules['must_contain'] as $must_contain) {
      if (strpos($user_agent, strtolower($must_contain)) === false) {
        $contains_all = false;
        break;
      }
    }
    foreach ($rules['must_not_contain'] as $must_not_contain) {
      if (strpos($user_agent, strtolower($must_not_contain)) !== false) {
        $contains_none = false;
        break;
      }
    }
    if ($contains_all && $contains_none) {
      $user_agent_parsed = $agent;
      break;
    }
  }
  $user_agent_mobile = strpos($user_agent, 'mobile') !== false;
  $combined_agent = null;
  if ($user_agent_parsed !== null) {
    $combined_agent = $user_agent_parsed . ($user_agent_mobile ? '_mobile' : '');
  }

  //===== REFERRER PT.2 =====
  //If the user agent is a node bot and the referrer is NULL at this point,
  //set the referrer to "node" as to not include the bot requests with human requests
  if ($combined_agent === 'bot_node' && $referer === null) {
    $referer = "node";
  }


  //===== SERVE TIME =====
  $serve_time_ms = intval($serve_time_ms);
  if ($serve_time_ms < 0) {
    $serve_time_ms = 0;
  }


  //===== INSERT INTO DB =====
  echo_if_debug("Inserting line #$i\n");
  //Insert the entry into the db
  $insert_query = "INSERT INTO traffic (\"date\", method, page, status, query, referrer, user_agent, serve_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
  $result = pg_query_params($DB, $insert_query, [$timestamp->format('Y-m-d H:i:s.uO'), $method, $page, $status, $query, $referer, $combined_agent, $serve_time_ms]);
  if ($result === false) {
    echo_if_debug("Failed to insert line #$i: " . pg_last_error($DB) . "\n");
  } else {
    echo_if_debug("Inserted line #$i\n");
  }
}

echo "Done processing '$i' entries \n";


function echo_if_debug($message)
{
  global $is_debug;
  if ($is_debug)
    echo $message;
}