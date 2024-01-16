<?php

require_once('../api_bootstrap.inc.php');

header('Content-Type: text/html; charset=UTF-8');

$account = get_user_data();

?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Test session</title>
</head>

<body>
  <?php

  if ($account == null) {
    echo "Not logged in<br>";
    echo "<a href=\"discord_auth.php\">Register with Discord</a><br>";
    echo "<a href=\"discord_auth.php?login\">Login with Discord</a><br>";
    echo "-----<br>";
    echo "<a href=\"register.php\">Register with Email</a><br>";
    echo "<a href=\"login.php\">Login with Email</a><br>";
    exit();
  }

  echo "Logged in as {$account['name']}<br>";
  echo "Session token: {$_SESSION['token']}<br>";
  echo "Sesion created: {$account['session_created']}<br>";
  echo "Discord ID: {$account['discord_id']}<br>";
  echo "Discord user: <code><pre>" . json_encode($_SESSION['discord_user']) . "</pre></code><br>";
  echo "<a href=\"logout.php\">Logout</a><br>";

  ?>
</body>

</html>