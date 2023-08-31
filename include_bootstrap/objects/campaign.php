<?php

class Campaign
{
	public int $id;
	public string $name;
	public string $url;
	public string $date_added;
	public $icon_url = null; /* string */
	public array $authors;
	public $sort_major_name = null; /* string */
	public $sort_major_labels = null; /* array */
	public $sort_major_colors = null; /* array */
	public $sort_minor_name = null; /* string */
	public $sort_minor_labels = null; /* array */
	public $sort_minor_colors = null; /* array */

	function pull_from_db($DB, int $id): bool
	{
		$arr = db_fetch_id($DB, 'Campaign'. $id);
		if ($arr === false)
			return false;

		$this->id = intval($arr['id']);
		$this->name = $arr['name'];
		$this->url = $arr['url'];
		$this->date_added = $arr['date_added'];
		$this->authors = explode("\t", $arr['authors']);

		if (isset($arr['icon_url']))
			$this->icon_url = $arr['icon_url'];
		if (isset($arr['sort_major_name'])) {
			$this->sort_major_name = $arr['sort_major_name'];
			$this->sort_major_labels = explode("\t", $arr['sort_major_labels']);
			$this->sort_major_colors = explode("\t", $arr['sort_major_colors']);
		}
		if (isset($arr['sort_minor_name'])) {
			$this->sort_minor_name = $arr['sort_minor_name'];
			$this->sort_minor_labels = explode("\t", $arr['sort_minor_labels']);
			$this->sort_minor_colors = explode("\t", $arr['sort_minor_colors']);
		}
		return true;
	}

	function clone_for_api()
	{
		return clone $this;
	}
}
