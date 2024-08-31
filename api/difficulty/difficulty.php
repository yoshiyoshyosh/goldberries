<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $id = $_REQUEST['id'];
  $difficulties = Difficulty::get_request($DB, $id);
  //Sort by Difficulty->sort DESC
  usort($difficulties, function ($a, $b) {
    return $b->sort - $a->sort;
  });
  api_write($difficulties);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}
