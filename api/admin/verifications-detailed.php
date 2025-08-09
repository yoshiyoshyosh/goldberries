<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$account = get_user_data();
check_access($account, false);
if (!is_helper($account)) {
  die_json(403, "Not authorized");
}

// Set content type to plain text
header('Content-Type: text/html');

$query = "SELECT
  DATE_TRUNC('month', submission_date_created) AS month,
  verifier_name,
  COUNT(*) AS verified_count
FROM view_submissions
WHERE verifier_name IS NOT NULL AND submission_date_created > '2024-08-01' AND verifier_account_role IN (20, 30, 40)
GROUP BY verifier_name, DATE_TRUNC('month', submission_date_created), verifier_account_role
ORDER BY month ASC, verified_count DESC";

$result = pg_query_params_or_die($DB, $query);

$months = [];
$verifiers = [];

while ($row = pg_fetch_assoc($result)) {
  $month = $row['month'];
  $verifier_name = $row['verifier_name'];
  $verified_count = $row['verified_count'];

  if (!isset($months[$month])) {
    $months[$month] = [];
  }
  $months[$month][] = [
    'verifier_name' => $verifier_name,
    'verified_count' => $verified_count
  ];
  if (!isset($verifiers[$verifier_name])) {
    $verifiers[$verifier_name] = [];
  }
  $verifiers[$verifier_name][] = [
    'month' => $month,
    'verified_count' => $verified_count
  ];
}

// echo data verifier-wise
echo "<h1>Verifications by Verifier</h1>";
foreach ($verifiers as $verifier_name => $tmp_months) {
  echo "<b>" . $verifier_name . "</b><br>";
  foreach ($tmp_months as $month_data) {
    echo "- " . date('F Y', strtotime($month_data['month'])) . ": " . $month_data['verified_count'] . "<br>";
  }
  echo "<br>";
}

// echo data month-wise
echo "<h1>Verifications by Month</h1>";
foreach ($months as $month => $tmp_verifiers) {
  echo "<b>" . date('F Y', strtotime($month)) . "</b><br>";
  foreach ($tmp_verifiers as $verifier) {
    echo "- " . $verifier['verifier_name'] . ": " . $verifier['verified_count'] . "<br>";
  }
  echo "<br>";
}
