<?php

$PROFILER_DATA = [];
$PROFILER_TIMER = null;
//Time for profiler as milliseconds
function profiler_start()
{
  global $PROFILER_DATA, $PROFILER_TIMER;
  $PROFILER_TIMER = get_current_time_ms();
  $PROFILER_DATA = [
    'start' => $PROFILER_TIMER,
    'steps' => []
  ];
}
function profiler_step($name = null, $depth = 0)
{
  global $PROFILER_DATA, $PROFILER_TIMER;
  if (!isset($PROFILER_DATA['start'])) {
    profiler_start();
    return;
  }

  //If a depth of 0 is specified, the step is added to the end of PROFILER_DATA['steps']
  //If a depth of 1 is specified, the step is attached to the most recent step of depth 0, as its own substep array
  //If a depth of 2 is specified, it does the same thing except further down
  //Additionally, if after adding a step of a certain level, the previous step of the same level had substeps, add a field 'end_substeps' to the previous step
  //If along the path to a certain level a step is missing, add it

  $start_time = $PROFILER_DATA['start'];
  $diff = get_time_diff();

  $level = &$PROFILER_DATA['steps'];
  for ($i = 0; $i < $depth; $i++) {
    $last_step = &$level[count($level) - 1];
    if (!isset($last_step['steps'])) {
      $last_step['steps'] = [];
    }
    $level = &$last_step['steps'];
  }

  //Close the substeps of the previous step if it had any
  if (count($level) > 0) {
    $last_step = &$level[count($level) - 1];
    if (isset($last_step['steps'])) {
      $sum = 0;
      foreach ($last_step['steps'] as $substep) {
        $sum += $substep['time'];
        //If substeps_total exists, also add that to the sum
        if (isset($substep['substeps_total'])) {
          $sum += $substep['substeps_total'];
        }
      }
      $last_step['substeps_total'] = $sum;
    }
  }

  //Insert the step into the currently selected level
  $num_steps = count($level);
  $value = $name ?? "Step $num_steps";
  $level[] = [
    'name' => $value,
    'time' => $diff
  ];

  // $num_steps = count($PROFILER_DATA['steps']);
  // $diff = get_current_time_ms() - $start_time;
  // $value = $name ?? "Step $num_steps";
  // $PROFILER_DATA['steps'][] = [
  //   'name' => $value,
  //   'time' => $diff
  // ];
}
function profiler_end(&$output = null)
{
  global $PROFILER_DATA;
  $PROFILER_DATA['time'] = get_current_time_ms() - $PROFILER_DATA['start'];
  if ($output !== null) {
    $output['profiler'] = $PROFILER_DATA;
  }
}
function profiler_get_data()
{
  global $PROFILER_DATA;
  return $PROFILER_DATA;
}

function get_current_time_ms()
{
  return floor(microtime(true) * 1000);
}
function get_time_diff()
{
  global $PROFILER_TIMER;
  $current_time_ms = get_current_time_ms();
  $diff = $current_time_ms - $PROFILER_TIMER;
  $PROFILER_TIMER = $current_time_ms;
  return $diff;
}