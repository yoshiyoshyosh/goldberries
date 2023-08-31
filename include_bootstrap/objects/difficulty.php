<?php

class Difficulty
{
	public int $id;
	public string $name;
	public $subtier = null; /* string */
	public int $sort;
	public string $color;
	public string $color_group;

	function pull_from_db($DB, int $id): bool
	{
		$arr = db_fetch_id($DB, 'Difficulty', $id);
		if ($arr === false)
			return false;

		$this->id = intval($arr['id']);
		$this->name = $arr['name'];
		$this->sort = intval($arr['sort']);
		$this->color = $arr['color'];
		$this->color_group = $arr['color_group'];

		if (isset($arr['subtier']))
			$this->subtier = $arr['subtier'];
		return true;
	}

	function clone_for_api()
	{
		return clone $this;
	}
}
