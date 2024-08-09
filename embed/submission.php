<?php

require_once (dirname(__FILE__) . '/../bootstrap.inc.php');

$DB = db_connect();

$regen = isset($_REQUEST['regen']) && $_REQUEST['regen'] === "true";
$id = intval($_REQUEST['id']);
if ($id <= 0) {
  http_response_code(400);
  die();
}

$submission = Submission::get_by_id($DB, $id);
if (!$submission) {
  http_response_code(404);
  die();
}

$submission->expand_foreign_keys($DB, 5);

//Objects
$player = $submission->player;
$challenge = $submission->challenge;
$for_str = "";
if ($challenge === null) {
  $new_challenge = $submission->new_challenge;
  $for_str = "New Challenge: " . $new_challenge->name;
} else {
  $map = $challenge->map;
  $campaign = $challenge->get_campaign();
  $for_str = $map === null ? $campaign->get_name() : $map->get_name();
}

$real_url = constant("BASE_URL") . "/submission/" . $submission->id;
$proof_url = $submission->proof_url;
$regen_param = $regen ? "&regen=true" : "";
$embed_image_url = "/embed/img/submission.php?id=" . $submission->id . $regen_param;

?>

<!DOCTYPE html>
<html>

<head>
  <title>Submission</title>

  <meta name="theme-color" content="#f3d16b" data-react-helmet="true" />

  <meta property="og:url" content="<?php echo $proof_url; ?>" />

  <meta name="twitter:title" content="Submission by '<?php echo $submission->player->name; ?>'" />
  <meta property="twitter:description" content="for <?php echo $for_str; ?>" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:image:src" content="<?php echo $embed_image_url; ?>" />

  <!-- <meta name="twitter:title" content="Hello World">
<meta name="twitter:description" content="Lorem ipsum sit dolor">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image:src" content="https://www.example.com/hello-world/thumbnail.png"> -->

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