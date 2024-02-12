<?php

require_once('api_bootstrap.inc.php');

if (isset($_REQUEST['verifier']) && $_REQUEST['verifier'] === "true") {
  $account = get_user_data();
  if ($account === null) {
    die_json(401, "Not logged in");
  } else if (!is_verifier($account)) {
    die_json(403, "Not authorized");
  }

  $query = "
  SELECT
    (SELECT COUNT(*) FROM submission WHERE is_verified = FALSE AND is_rejected = FALSE) AS submissions_in_queue,
    (SELECT COUNT(*) FROM account WHERE claimed_player_id IS NOT NULL) AS open_player_claims
  ";
  $result = pg_query($DB, $query);
  if (!$result) {
    die_json(500, "Could not query database");
  }

  $row = pg_fetch_assoc($result);
  api_write($row);

} else {

}