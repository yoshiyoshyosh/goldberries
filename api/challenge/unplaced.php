<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$as_text = isset($_GET['as_text']) && $_GET['as_text'] === "true";

$query = "SELECT * FROM view_submissions WHERE submission_is_verified = TRUE AND (player_account_is_suspended = FALSE OR player_account_is_suspended IS NULL) AND challenge_is_placed = FALSE ORDER BY challenge_id ASC";
$result = pg_query($DB, $query);

if (!$result) {
  die_json(500, 'Internal Server Error');
}


$campaigns = parse_campaigns($result);
$challenges = [];
foreach ($campaigns as $campaign) {
  foreach ($campaign->challenges as $challenge) {
    $challenge->campaign = $campaign;
    $challenges[$challenge->id] = $challenge;
  }
  foreach ($campaign->maps as $map) {
    $map->campaign = $campaign;
    foreach ($map->challenges as $challenge) {
      $challenge->map = $map;
      $challenges[$challenge->id] = $challenge;
    }
  }
}

//Sort challenges by suggestion count DESC
usort($challenges, function ($a, $b) {
  $suggestion_count_a = get_suggestion_count($a);
  $suggestion_count_b = get_suggestion_count($b);
  if ($suggestion_count_a === $suggestion_count_b) {
    return 0;
  }
  return $suggestion_count_a < $suggestion_count_b ? 1 : -1;
});

// $challenges = array();
// while ($row = pg_fetch_assoc($result)) {
//   $challenge = new Challenge();
//   $challenge->apply_db_data($row, "challenge_");
//   $challenge->expand_foreign_keys($row, 5);
//   $challenge->fetch_submissions($DB);
//   $challenges[] = $challenge;
// }

if ($as_text) {
  $count_0_suggestions = 0;
  $players = [
    //id -> [ player -> player_object, count -> int ]
  ];
  $players_unique_goldens = [
    //id -> [ player -> player_object, count -> int, challenges -> [] ]
  ];
  foreach ($challenges as $challenge) {
    $suggestion_count = get_suggestion_count($challenge);
    if ($suggestion_count === 0) {
      $count_0_suggestions++;
      foreach ($challenge->submissions as $submission) {
        if (!array_key_exists($submission->player_id, $players)) {
          $players[$submission->player_id] = [
            "player" => $submission->player,
            "count" => 0
          ];
        }
        $players[$submission->player_id]["count"]++;
      }

      if (count($challenge->submissions) === 1) {
        $submission = $challenge->submissions[0];
        if (!array_key_exists($submission->player_id, $players_unique_goldens)) {
          $players_unique_goldens[$submission->player_id] = [
            "player" => $submission->player,
            "count" => 0,
            "challenges" => []
          ];
        }
        $players_unique_goldens[$submission->player_id]["count"]++;
        $players_unique_goldens[$submission->player_id]["challenges"][] = $challenge;
      }
    }
  }

  //Flatten players array
  $players = array_values($players);
  $players_unique_goldens = array_values($players_unique_goldens);
  //Sort by count DESC
  usort($players, function ($a, $b) {
    if ($a["count"] === $b["count"]) {
      return 0;
    }
    return $a["count"] < $b["count"] ? 1 : -1;
  });

  usort($players_unique_goldens, function ($a, $b) {
    if ($a["count"] === $b["count"]) {
      return 0;
    }
    return $a["count"] < $b["count"] ? 1 : -1;
  });

  // set content type to plain html
  header('Content-Type: text/html');
  echo "These challenges are registered as \"unplaced\":<br><br>";
  echo "Total challenges: " . count($challenges) . "<br>";
  echo "Total challenges without any suggestions: " . $count_0_suggestions . "<br><br>";

  echo "Players who have submitted to challenges without any suggestions:<br>";
  echo "<table>";
  echo "<tr><th>Player</th><th>Count</th></tr>";
  foreach ($players as $player) {
    echo "<tr><td><a href=\"" . BASE_URL . "/player/" . $player["player"]->id . "\">" . $player["player"]->name . "</></td><td>" . $player["count"] . "</td></tr>";
  }
  echo "</table><br><br>";

  echo "Players who are single-victors on an unplaced challenge without any suggestions:<br>";
  echo "<table>";
  echo "<tr><th>Player</th><th>Count</th></tr>";
  foreach ($players_unique_goldens as $player) {
    echo "<tr><td><a href=\"" . BASE_URL . "/player/" . $player["player"]->id . "\">" . $player["player"]->name . "</a></td><td>" . $player["count"] . "</td></tr>";
  }
  echo "</table><br><br>";

  echo "Follow-up: All single-victors challenges:<br>";
  echo "<table>";
  echo "<tr><th>Player</th><th>Challenge</th></tr>";
  foreach ($players_unique_goldens as $player) {
    foreach ($player["challenges"] as $challenge) {
      echo "<tr><td><a href=\"" . BASE_URL . "/player/" . $player["player"]->id . "\">" . $player["player"]->name . "</a></td><td><a href=\"" . $challenge->get_url() . "\">" . $challenge->get_name() . "</a></td></tr>";
    }
  }
  echo "</table><br><br>";


  //Make an html table with columns: ID, Suggestion/Submission count, Name, Link
  echo "<table>";
  echo "<tr><th>ID</th><th>Sugg./Total</th><th>Overlap</th><th align=\"left\">Name</th></tr>";
  foreach ($challenges as $challenge) {
    $suggestion_count = get_suggestion_count($challenge);
    $submission_count = count($challenge->submissions);
    $suggestion_overlap = challenge_get_overlap($challenge);
    echo "<tr>";
    echo "<td align=\"center\">" . $challenge->id . "</td>";
    echo "<td align=\"center\"><b>" . $suggestion_count . " / " . $submission_count . "</b></td>";
    echo "<td align=\"center\"><b>" . $suggestion_overlap . "%</b></td>";
    echo "<td><a href=\"" . $challenge->get_url() . "\">" . $challenge->get_name() . "</a></td>";
    echo "</tr>";
  }
} else {
  api_write($challenges);
}

function get_suggestion_count($challenge)
{
  $suggestion_count = 0;
  foreach ($challenge->submissions as $submission) {
    if ($submission->suggested_difficulty_id !== null && $submission->is_personal === false) {
      $suggestion_count++;
    }
  }
  return $suggestion_count;
}

function challenge_has_egg($challenge)
{
  //Loop through all submissions, and see if any of them were submitted by egg
  foreach ($challenge->submissions as $submission) {
    if ($submission->player_id === 20) {
      return true;
    }
  }

  return false;
}

function challenge_get_overlap($challenge)
{
  //Loop through all submissions and make a counter for all difficulties that were suggested
  $difficulties = [
    //difficulty_id -> count
  ];

  $count_suggestions = 0;
  foreach ($challenge->submissions as $submission) {
    if ($submission->suggested_difficulty_id !== null && $submission->is_personal === false) {
      $count_suggestions++;
      if (!array_key_exists($submission->suggested_difficulty_id, $difficulties)) {
        $difficulties[$submission->suggested_difficulty_id] = 0;
      }
      $difficulties[$submission->suggested_difficulty_id]++;
    }
  }

  //Sort the difficulties by count DESC
  arsort($difficulties);

  if ($count_suggestions === 0) {
    return 0;
  }

  //Flatten
  $difficulties = array_values($difficulties);

  //Return percentage with 1 decimal of the most suggested difficulty
  return round($difficulties[0] / $count_suggestions * 100, 0);
}