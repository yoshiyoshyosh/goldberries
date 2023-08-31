<?php

Class Objective
{
	public int $id;
	public string $name;
	public string $description;
	public bool $is_arbitrary;
	public $display_name_suffix = null; /* string */

	function pull_from_db($DB, int $id): bool
	{
		$arr = db_fetch_id($DB, 'Objective', $id);
		if ($arr === false)
			return false;

		$this->id = intval($arr['id']);
		$this->name = $arr['name'];
		$this->description = $arr['description'];
		$this->is_arbitrary = $arr['is_arbitrary'] === 't';

		if (isset($arr['display_name_suffix']))
			$this->display_name_suffix = $arr['display_name_suffix'];
		return true;
	}

	function clone_for_api()
	{
		return clone $this;
	}
}

?>
