<?php

////// DIAGNOSTICS

function die_json(int $code, string $why): string
{
	http_response_code($code);
	echo json_encode(array('error' => $why));
	exit();
}

////// VALIDATING IDS

// preg_match returns 1 on match, 0 on no match, false on failure
// so this will only be true when there is a match
function is_id_string($str): bool
{
	return (bool)preg_match('/^[0-9]+$/', $str);
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

////// UNIFIED GET FUNCTION

function api_unified_get(string $table_noesc, $object_skel)
{
	$DB = db_connect();
	$json_arr = array();
	$table = pg_escape_identifier(strtolower($table_noesc));

	if (isset($_GET['all'])) {
		$result = pg_query($DB, "SELECT * FROM {$table};");
		while ($row = pg_fetch_row($result)) {
			$object_skel->pull_from_db($DB, $row[0]);
			array_push($json_arr, $object_skel->clone_for_api());
		}
		echo json_encode($json_arr,
			JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
		return;
	}
	if (!is_valid_id_query($_GET['id'])) {
		die_json(400, 'invalid query: invalid or missing id');
	}
	if (is_array($_GET['id'])) {
		foreach ($_GET['id'] as $val) {
			if ($object_skel->pull_from_db($DB, intval($val)) === false) {
				die_json(400, "invalid query: id {$val} does not exist");
			}
			array_push($json_arr, $object_skel->clone_for_api());
		}
		echo json_encode($json_arr,
			JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
	} else {
		if ($object_skel->pull_from_db($DB, intval($_GET['id'])) === false) {
			die_json(400, "invalid query: id {$_GET['id']} does not exist");
		}
		echo json_encode($object_skel->clone_for_api(),
			JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
	}
}
