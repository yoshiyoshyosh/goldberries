<?php

require_once('../api_bootstrap.inc.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $depth = 3;

  if (!isset($_REQUEST['id'])) {
    die_json(400, "Missing id");
  }

  $id = $_REQUEST['id'];
  $posts = Post::get_request($DB, $id);

  if (is_array($posts)) {
    foreach ($posts as $post) {
      $post->expand_foreign_keys($DB, $depth);
    }
  } else {
    $posts->expand_foreign_keys($DB, $depth);
  }

  api_write($posts);
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $account = get_user_data();
  if ($account === null) {
    die_json(401, "Not logged in");
  } else if (!is_news_writer($account)) {
    die_json(403, "Not authorized");
  }

  $data = format_assoc_array_bools(parse_post_body_as_json());
  $post = new Post();
  $post->apply_db_data($data);

  if (isset($data['id'])) {
    // Update
    $old_post = Post::get_by_id($DB, $data['id']);
    if ($old_post === false) {
      die_json(404, "Post not found");
    }
    $post->date_edited = new JsonDateTime();
    //These fields can't be updated
    $post->type = $old_post->type;
    $post->date_created = $old_post->date_created;
    $post->author_id = $old_post->author_id;
    if ($post->type === "changelog" && !is_admin($account)) {
      die_json(403, "Only admins can edit changelog posts");
    }

    if ($post->update($DB)) {
      log_info("'{$account->player->name}' updated {$post}", "Post");
      api_write($post);
    } else {
      die_json(500, "Failed to update post");
    }

  } else {
    // Insert
    if ($post->type === "changelog" && !is_admin($account)) {
      die_json(403, "Only admins can create changelog posts");
    }
    $post->date_created = new JsonDateTime();
    $post->author_id = $account->player->id;
    if ($post->insert($DB)) {
      log_info("'{$account->player->name}' created {$post}", "Post");
      $post->expand_foreign_keys($DB, 5);
      api_write($post);
    } else {
      die_json(500, "Failed to create post");
    }
  }
}


if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  $account = get_user_data();
  if ($account === null) {
    die_json(401, "Not logged in");
  } else if (!is_news_writer($account)) {
    die_json(403, "Not authorized");
  }

  if (!isset($_REQUEST['id'])) {
    die_json(400, "Missing id");
  }

  $id = intval($_REQUEST['id']);
  if ($id === 0 || $id < 0) {
    die_json(400, "Invalid id");
  }

  $post = Post::get_by_id($DB, $id);
  if ($post === false) {
    die_json(404, "Post not found");
  }

  //If the account is a helper, they can only delete objects that were created within the last 24 hours
  if (($account->role === $HELPER || $account->role === $NEWS_WRITER) && !helper_can_delete($post->date_created)) {
    die_json(403, "You can only delete posts that were created within the last 24 hours");
  }

  if ($post->type === "changelog" && !is_admin($account)) {
    die_json(403, "Only admins can delete changelog posts");
  }

  if ($post->delete($DB)) {
    log_info("'{$account->player->name}' deleted {$post}", "Post");
    api_write($post);
  } else {
    die_json(500, "Failed to delete post");
  }
}