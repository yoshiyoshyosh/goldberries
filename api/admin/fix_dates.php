<?php

require_once ('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  die_json(405, 'Method Not Allowed');
}

$account = get_user_data();
check_access($account, false);
if (!$account->is_admin) {
  die_json(403, 'Not authorized');
}

//Set content type to plain text
header('Content-Type: text/plain');


// read in the 2 date files 'video-details.json' and 'bilibili-video-details.json'
$video_details = json_decode(file_get_contents('../../assets/data/video-details.json'), true);
$bilibili_video_details = json_decode(file_get_contents('../../assets/data/bilibili-video-details.json'), true);


// Get all submissions with a NULL date
$query = "SELECT * FROM submission WHERE date_created IS NULL";
$result = pg_query($DB, $query);
if (!$result) {
  die("Error in SQL query: " . pg_last_error());
}

$count = 0;
while ($row = pg_fetch_assoc($result)) {
  // $count++;
  // if ($count > 10) {
  //   break;
  // }

  $submission = new Submission();
  $submission->apply_db_data($row);

  $link = $submission->proof_url;
  // echo "\n";
  // echo "Processing submission (#$count): $submission\n";
  // echo "  Link: $link\n";

  // Check if the link is a youtube or bilibili link
  $youtube_id = youtube_id($link);
  $bilibili_id = bilibili_id($link);

  $publish_date = null;
  $check = [];
  $check[] = "youtube";
  $check[] = "bilibili";
  // $check[] = "known_other";
  // $check[] = "other";

  if ($youtube_id) {
    if (!in_array("youtube", $check))
      continue;
    $count++;
    echo "\n";
    echo "Processing submission (#$count): $submission\n";
    echo "  Link: $link\n";
    echo "  Link Type: YouTube\n";
    if (!in_array($youtube_id, array_keys($video_details))) {
      echo "  Video not found in video-details.json\n";
      continue;
    }
    $video = $video_details[$youtube_id];
    if ($video["error"]) {
      echo "  Video had an error: $video[error]\n";
      $submission->expand_foreign_keys($DB, 5, true);
      echo "  Submission details: map = " . $submission->challenge->get_name() . ", player = " . $submission->player->name . "\n";
      continue;
    }
    echo "  Video Details: title = $video[title], channelTitle = $video[channelTitle], duration = $video[duration]\n";
    echo "  Published At: $video[publishedAt]\n";
    $publish_date = $video['publishedAt']; //Format: 2021-07-01T00:00:00Z
    $submission->date_created = new JsonDateTime($publish_date);
    if ($submission->update($DB)) {
      echo "  Submission updated with date: $publish_date\n";
    } else {
      echo "  Error updating submission with date: $publish_date\n";
    }

  } else if ($bilibili_id) {
    if (!in_array("bilibili", $check))
      continue;
    $count++;
    echo "\n";
    echo "Processing submission (#$count): $submission\n";
    echo "  Link: $link\n";
    echo "  Link Type: BiliBili\n";
    if (!in_array($bilibili_id, array_keys($bilibili_video_details))) {
      echo "  Video not found in bilibili-video-details.json\n";
      continue;
    }
    $video = $bilibili_video_details[$bilibili_id];
    if ($video["error"]) {
      echo "  Video had an error: $video[error]\n";
      $submission->expand_foreign_keys($DB, 5, true);
      echo "  Submission details: map = " . $submission->challenge->get_name() . ", player = " . $submission->player->name . "\n";
      continue;
    }
    echo "  Video Details: title = $video[title], author = $video[author]\n";
    echo "  Published At: $video[publishDate]\n";
    $publish_date = $video['publishDate']; //Format: 1718347721 (UNIX timestamp)
    //UNIX timesamp to ISO 8601 (2021-07-01T00:00:00Z)
    $date = gmdate('c', $publish_date);

    //UNIX timestamp to date time object
    $submission->date_created = new JsonDateTime($date);

    if ($submission->update($DB)) {
      echo "  Submission updated with date: $date\n";
    } else {
      echo "  Error updating submission with date: $date\n";
    }

  } else {
    //If the link contains "twitch", skip it
    if (strpos($link, 'twitch') !== false || strpos($link, 'drive.google.com') !== false || strpos($link, 'nico.ms') !== false || strpos($link, 'nicovideo.jp') !== false || strpos($link, 'playlist') !== false || strpos($link, 'outplayed') !== false || strpos($link, 'twitter') !== false) {
      if (in_array("known_other", $check)) {
        $count++;
        echo "\n";
        echo "Processing submission (#$count): $submission\n";
        echo "  Link: $link\n";
        echo "  Link contains known other site\n";
      }
      continue;
    }

    if (in_array("other", $check)) {
      $count++;
      echo "\n";
      echo "Processing submission (#$count): $submission\n";
      echo "  Link: $link\n";
      echo "  Link is neither YouTube nor Bilibili\n";
      $submission->expand_foreign_keys($DB, 5, true);
      echo "  Submission details: map = " . $submission->challenge->get_name() . ", player = " . $submission->player->name . "\n";
    }
  }
}

// $count--;
echo "\n";
echo "Processing $count entries completed.\n";

function youtube_id($link)
{
  //Possible variations:
  //https://www.youtube.com/watch?v=VIDEO_ID&stuff
  //https://youtu.be/VIDEO_ID?stuff
  //https://youtu.be/VIDEO_ID&stuff
  //https://youtube.com/watch?v=VIDEO_ID&stuff

  $pattern = '/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/';
  preg_match($pattern, $link, $matches);
  if (!$matches)
    return false;
  return $matches[1];
}

function bilibili_id($link)
{
  //Possible variations:
  //https://www.bilibili.com/video/BV1Kb411W75t
  //http://www.bilibili.com/video/BV1Kb411W75t
  //the video ID could also be an AV ID: AV123456789

  $pattern = '/bilibili\.com\/video\/([bB][vV][a-zA-Z0-9_-]+|[aA][vV][0-9]+)/';
  preg_match($pattern, $link, $matches);
  if (!$matches) {
    //Also check the short link format
    //Example: https://b23.tv/BV1Qq4y1B7Q2/p64
    //Example: https://b23.tv/knlgMNv

    //The short link id is not related to the actual video id, so just extract the short link id
    //Ignore the page number if it exists
    $pattern = '/b23\.tv\/([a-zA-Z0-9_-]+)/';
    preg_match($pattern, $link, $matches);
    if (!$matches)
      return false;
    return $matches[1];
  }
  return $matches[1];
}