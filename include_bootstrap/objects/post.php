<?php

class Post extends DbObject
{
  public static string $table_name = 'post';
  public static array $TYPES = ["news", "changelog"];

  public ?int $author_id = null;
  public JsonDateTime $date_created;
  public ?JsonDateTime $date_edited = null;
  public string $type;
  public ?string $image_url = null;
  public string $title;
  public string $content;

  // Linked Objects
  public ?Player $author = null;

  // === Abstract Functions ===
  function get_field_set()
  {
    return array(
      'author_id' => $this->author_id,
      'date_created' => $this->date_created,
      'date_edited' => $this->date_edited,
      'type' => $this->type,
      'image_url' => $this->image_url,
      'title' => $this->title,
      'content' => $this->content,
    );
  }

  function apply_db_data($arr, $prefix = '')
  {
    $this->id = intval($arr[$prefix . 'id']);
    $this->date_created = new JsonDateTime($arr[$prefix . 'date_created']);
    $this->type = $arr[$prefix . 'type'];
    $this->title = $arr[$prefix . 'title'];
    $this->content = $arr[$prefix . 'content'];

    if (isset($arr[$prefix . 'author_id']))
      $this->author_id = intval($arr[$prefix . 'author_id']);
    if (isset($arr[$prefix . 'date_edited']))
      $this->date_edited = new JsonDateTime($arr[$prefix . 'date_edited']);
    if (isset($arr[$prefix . 'image_url']))
      $this->image_url = $arr[$prefix . 'image_url'];
  }

  function expand_foreign_keys($DB, $depth = 2, $expand_structure = true)
  {
    if ($depth <= 1)
      return;

    if ($this->author_id !== null) {
      $this->author = Player::get_by_id($DB, $this->author_id, 3, false);
    }
  }

  // === Find Functions ===
  static function get_paginated($DB, $page, $per_page, $type, $search, $author_id)
  {
    $query = "SELECT * FROM post";

    $where = [];
    if (!in_array($type, self::$TYPES)) {
      die_json(400, "Invalid type");
    }
    $where[] = "type = '$type'";

    if ($search !== null) {
      $search = pg_escape_string($search);
      $where[] = "(content ILIKE '%$search%' OR title ILIKE '%$search%')";
    }
    if ($author_id !== null) {
      $where[] = "author_id = $author_id";
    }

    if (count($where) > 0) {
      $query .= " WHERE " . implode(" AND ", $where);
    }

    $query .= " ORDER BY post.date_created DESC";

    $query = "
    WITH query AS (
      " . $query . "
    )
    SELECT *, count(*) OVER () AS total_count
    FROM query";

    if ($per_page !== -1) {
      $query .= " LIMIT " . $per_page . " OFFSET " . ($page - 1) * $per_page;
    }

    $result = pg_query_params_or_die($DB, $query);

    $maxCount = 0;
    $posts = [];
    while ($row = pg_fetch_assoc($result)) {
      if ($maxCount === 0) {
        $maxCount = intval($row['total_count']);
      }

      $post = new Post();
      $post->apply_db_data($row);
      $post->expand_foreign_keys($DB, 5, true);
      $posts[] = $post;
    }

    return [
      'posts' => $posts,
      'max_count' => $maxCount,
      'max_page' => ceil($maxCount / $per_page),
      'page' => $page,
      'per_page' => $per_page,
    ];
  }

  // === Utility Functions ===
  function __toString()
  {
    $dateStr = date_to_long_string($this->date_created);
    $authorStr = $this->author_id !== null ? $this->author_id : "<unknown>";
    return "(Post, id:{$this->id}, author:{$authorStr}, date_created:{$dateStr})";
  }

  //This function assumes a fully expanded structure
  function get_url()
  {
    return constant("BASE_URL") . "/" . $this->type . "/" . $this->id;
  }
}