<?php

require_once('api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $submissions = isset($_REQUEST['submissions']) && $_REQUEST['submissions'] === 'true';
  $depth = isset($_REQUEST['depth']) ? intval($_REQUEST['depth']) : 3;

  if (isset($_REQUEST['id'])) {
    $id = $_REQUEST['id'];
    $challenges = Challenge::get_request($DB, $id);
    if ($submissions) {
      if (is_array($challenges)) {
        foreach ($challenges as $challenge) {
          $challenge->fetch_submissions($DB);
        }
      } else {
        $challenges->fetch_submissions($DB);
      }
    }

    if (is_array($challenges)) {
      foreach ($challenges as $challenge) {
        $challenge->expand_foreign_keys($DB, $depth);
      }
    } else {
      $challenges->expand_foreign_keys($DB, $depth);
    }

    api_write($challenges);

  } else if (isset($_REQUEST['page'])) {
    $page = intval($_REQUEST['page']) ?? 1;
    $per_page = intval($_REQUEST['per_page']) ?? 50;
    $search = isset($_REQUEST['search']) ? $_REQUEST['search'] : null;
    $sort = isset($_REQUEST['sort']) ? $_REQUEST['sort'] : null;
    $sort_dir = isset($_REQUEST['sort_dir']) ? $_REQUEST['sort_dir'] : null;

    $query = "SELECT * FROM view_challenges";

    if ($search !== null) {
      $search = pg_escape_string($search);
      $query .= " WHERE campaign_name ILIKE '%" . $search . "%' OR map_name ILIKE '%" . $search . "%'";
    }

    if ($sort !== null) {
      $sort = pg_escape_string($sort);
      $query .= " ORDER BY " . $sort;
      if ($sort_dir !== null) {
        $sort_dir = pg_escape_string($sort_dir);
        $query .= " " . $sort_dir;
      }
    }

    $query = "
    WITH challenges AS (
      " . $query . "
    )
    SELECT *, count(*) OVER () AS total_count
    FROM challenges";

    if ($per_page !== -1) {
      $query .= " LIMIT " . $per_page . " OFFSET " . ($page - 1) * $per_page;
    }

    $result = pg_query($DB, $query);
    if (!$result) {
      die_json(500, "Failed to query database");
    }

    $maxCount = 0;
    $challenges = array();
    while ($row = pg_fetch_assoc($result)) {
      $challenge = new Challenge();
      $challenge->apply_db_data($row, "challenge_");
      $challenge->expand_foreign_keys($row, $depth);
      $challenges[] = $challenge;

      if ($maxCount === 0) {
        $maxCount = intval($row['total_count']);
      }
    }

    api_write(
      array(
        'challenges' => $challenges,
        'max_count' => $maxCount,
        'max_page' => ceil($maxCount / $per_page),
        'page' => $page,
        'per_page' => $per_page,
      )
    );
  }
}
