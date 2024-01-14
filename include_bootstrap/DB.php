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

function db_fetch_assoc($DB, string $table_noesc, string $col_noesc, $val, $object_skel)
{
  error_log("fetching associated objects for \"{$table_noesc}\" \"{$col_noesc}\" \"{$val}\"");
  $table = pg_escape_identifier(strtolower($table_noesc));
  $col = pg_escape_identifier(strtolower($col_noesc));
  $result = pg_query_params(
    $DB,
    "SELECT * FROM {$table} WHERE {$col} = $1;",
    array($val)
  );
  //Fetch all rows in the result set as an associative array

  $ret = array();
  foreach (pg_fetch_all($result) as $row) {
    $obj = clone $object_skel;
    $obj->apply_db_data($row);
    $ret[] = $obj;
  }
  return $ret;
}