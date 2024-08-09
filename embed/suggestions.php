<?php

require_once (dirname(__FILE__) . '/../bootstrap.inc.php');

$DB = db_connect();

$id = intval($_REQUEST['id']);


?>

<!DOCTYPE html>
<html>

<head>

  <?php
  if ($id <= 0) {
    $real_url = constant("BASE_URL") . "/suggestions";
    ?>
    <title>Suggestion Box</title>
    <meta name="theme-color" content="#f3d16b" data-react-helmet="true" />
    <meta property="og:url" content="<?php echo $real_url; ?>" />
    <meta property="og:title" content="Suggestion Box" />
    <meta property="og:description"
      content="See what other people have suggested for challenge placements or other website features" />

    <?php

  } else {

    $suggestion = Suggestion::get_by_id($DB, $id);
    if (!$suggestion || $suggestion->is_verified !== true) {
      http_response_code(404);
      die();
    }

    $suggestion->expand_foreign_keys($DB, 5);
    $suggestion->fetch_associated_content($DB);

    //Objects
    $author = $suggestion->author;
    $comment = $suggestion->comment;
    $comment_str = $comment === null ? "-" : $comment;
    $description_str = "";

    $challenge = $suggestion->challenge;
    if ($challenge !== null) {
      $campaign_str = $challenge->get_campaign()->get_name();
      $description_str .= "For Campaign: " . $campaign_str . "\n\n";
    }

    $description_str .= "{$author->name}: {$comment_str}\n\n";

    //Count votes
    $votes = $suggestion->votes;
    $votes_count = [
      "+" => 0,
      "-" => 0,
      "i" => 0
    ];
    foreach ($votes as $vote) {
      $votes_count[$vote->vote]++;
    }

    $for_str = "";
    if ($challenge !== null) {
      $for_str = "Suggestion: '" . $challenge->get_name(true) . "'";
      if ($suggestion->suggested_difficulty_id !== null) {
        $to_str = $suggestion->suggested_difficulty->to_tier_name();
        $from_str = $suggestion->current_difficulty->to_tier_name();
        $description_str .= "Placement: " . $from_str . " → " . $to_str . "\n";
      }
    } else {
      $for_str = "General Suggestion";
    }

    $description_str .= "Votes: +{$votes_count['+']}, -{$votes_count['-']}, ={$votes_count['i']}\n";
    $status_str = $suggestion->is_closed() ? "Closed" : "Open";
    if ($suggestion->is_accepted === true) {
      $status_str .= " (Accepted)";
    } else if ($suggestion->is_accepted === false) {
      $status_str .= " (Rejected)";
    }
    $description_str .= "Status: {$status_str}\n";

    $real_url = constant("BASE_URL") . "/suggestion/" . $submission->id;

    ?>
    <title>Suggestion</title>

    <meta name="theme-color" content="#f3d16b" data-react-helmet="true" />
    <meta property="og:url" content="<?php echo $real_url; ?>" />
    <meta property="og:title" content="<?php echo $for_str; ?>" />
    <meta property="og:description" content="<?php echo $description_str ?>" />

    <?php
  }
  ?>

  <script>
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(function () {
        window.location = "<?php echo $real_url; ?>";
      }, 50);
    });
  </script>
</head>

<body>

</body>

</html>