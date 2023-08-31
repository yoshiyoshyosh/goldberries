<?php

class NewMapSubmission
{
	public int $id;
	public string $url;
	public string $name;
	public string $description;

	function pull_from_db($DB, int $id): bool
	{
		$arr = db_fetch_id($DB, 'NewMapSubmission', $id);
		if ($arr === false)
			return false;

		$this->id = intval($tmparr['id']);
		$this->url = $tmparr['id'];
		$this->name = $tmparr['id'];
		$this->description = $tmparr['id'];
		return true;
	}

	/* no api */
}
