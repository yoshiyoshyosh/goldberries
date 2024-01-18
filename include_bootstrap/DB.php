<?php

function db_connect()
{
  $db_conn = pg_pconnect(constant("DB_STRING"))
    or die('Could not connect: ' . pg_last_error());
  return $db_conn;
}

/* fetch and verify if an id exists in the specified table
 * returns the associated assoc array if it does, false if not */
function db_fetch_id($DB, string $table_noesc, int $id)
{
  $table = pg_escape_identifier(strtolower($table_noesc));
  $result = pg_query_params(
    $DB,
    "SELECT * FROM {$table} WHERE id = $1;",
    array($id)
  );
  /* false is returned if row exceeds the number of rows in the set, there are
   * no more rows, or on any other error. anything else typejuggles to true */
  return pg_fetch_assoc($result);
}

// Same as above, but with a where clause instead of an id
function db_fetch_where($DB, string $table_noesc, string $where, $params = array())
{
  $table = pg_escape_identifier(strtolower($table_noesc));
  $result = pg_query_params(
    $DB,
    "SELECT * FROM {$table} WHERE {$where};",
    $params
  );
  if ($result === false)
    return false;

  return $result;

}

// Finds one or multiple objects. Does not override $object_skel's values
function find_in_db($DB, string $table_noesc, string $where, $params = array(), $object_skel)
{
  $result = db_fetch_where($DB, $table_noesc, $where, $params);
  if ($result === false)
    return false;

  $toReturn = [];
  while ($arr = pg_fetch_assoc($result)) {
    $obj = clone $object_skel;
    $obj->apply_db_data($arr);
    $toReturn[] = $obj;
  }

  return $toReturn;
}


function db_fetch_assoc($DB, string $table_noesc, string $col_noesc, $val, $class)
{
  error_log("fetching associated objects for \"{$table_noesc}\" \"{$col_noesc}\" \"{$val}\"");
  $table = pg_escape_identifier(strtolower($table_noesc));
  $col = pg_escape_identifier(strtolower($col_noesc));
  $result = pg_query_params(
    $DB,
    "SELECT * FROM {$table} WHERE {$col} = $1;",
    array($val)
  );
  if ($result === false)
    return false;

  //Fetch all rows in the result set as an associative array
  $ret = array();
  foreach (pg_fetch_all($result) as $row) {
    $obj = new $class();
    $obj->apply_db_data($row);
    $ret[] = $obj;
  }
  return $ret;
}
function pg_query_params_or_die($DB, string $query, array $params, $errorMsg = "Failed to query database")
{
  $result = pg_query_params($DB, $query, $params);
  if ($result == false) {
    die_json(500, $errorMsg);
  }
  return $result;
}


function db_update($DB, string $table_noesc, int $id, $arr)
{
  $table = pg_escape_identifier(strtolower($table_noesc));
  $query = "UPDATE {$table} SET ";
  $params = array();
  $i = 1;
  foreach ($arr as $key => $value) {
    $key = pg_escape_identifier(strtolower($key));
    $query .= "{$key} = \${$i}, ";
    $params[] = fix_pg_variable_value($value);
    $i++;
  }
  $query = substr($query, 0, -2);
  $query .= " WHERE id = \${$i};";
  $params[] = $id;

  $result = pg_query_params($DB, $query, $params);
  if ($result == false) {
    return false;
  }
  return true;
}

function db_insert($DB, string $table_noesc, $arr)
{
  $table = pg_escape_identifier(strtolower($table_noesc));
  $query = "INSERT INTO {$table} (";
  $params = array();
  $i = 1;
  foreach ($arr as $key => $value) {
    $key = pg_escape_identifier(strtolower($key));
    $query .= "{$key}, ";
    $params[] = fix_pg_variable_value($value);
    $i++;
  }
  $query = substr($query, 0, -2);
  $query .= ") VALUES (";
  for ($j = 1; $j < $i; $j++) {
    $query .= "\${$j}, ";
  }
  $query = substr($query, 0, -2);
  $query .= ") RETURNING id;";

  $result = pg_query_params($DB, $query, $params);
  if ($result == false) {
    return false;
  }

  //Gets the value of the first column of the first row
  return pg_fetch_result($result, 0, 0);
}

function fix_pg_variable_value($value)
{
  if ($value === true)
    return '1';
  if ($value === false)
    return '0';
  if (gettype($value) === 'object' && get_class($value) === 'DateTime')
    return $value->format('Y-m-d H:i:s');
  return $value;
}

function db_delete($DB, string $table_noesc, int $id)
{
  $table = pg_escape_identifier(strtolower($table_noesc));
  $result = pg_query_params(
    $DB,
    "DELETE FROM {$table} WHERE id = $1;",
    array($id)
  );
  if ($result == false) {
    return false;
  }
  return true;
}