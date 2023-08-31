<?php

class Challenge
{
	public int $id;
	public string $challenge_type;
	public $campaign_id = null; /* int */
	public $map_id = null; /* int */
	public int $objective_id;
	public $description = null; /* string */
	public string $difficulty_id;
	public string $difficulty_subtier;
	public string $date_created;
	public bool $requires_fc;
	public bool $requires_special;
	public bool $has_fc;
	public bool $has_special;

	/* for API */
	public $campaign = null; /* Campaign */
	public $map = null; /* Map */
	public Objective $objective;
	public Difficulty $difficulty;

	function pull_from_db($DB, int $id): bool
	{
		$arr = db_fetch_id($DB, 'Challenge', $id);
		if ($arr === false)
			return false;

		$this->id = intval($arr['id']);
		$this->challenge_type = $arr['challenge_type'];
		$this->objective_id = intval($arr['objective_id']);
		$this->difficulty_id = intval($arr['difficulty_id']);
		$this->date_created = $arr['date_created'];
		$this->requires_fc = $arr['requires_fc'] === 't';
		$this->requires_special = $arr['requires_special'] === 't';
		$this->has_fc = $arr['has_fc'] === 't';
		$this->has_special = $arr['has_special'] === 't';

		if (isset($arr['campaign_id']))
			$this->campaign_id = intval($arr['campaign_id']);
		if (isset($arr['map_id']))
			$this->map_id = intval($arr['map_id']);
		if (isset($arr['description']))
			$this->description = $arr['description'];
		return true;
	}

	function clone_for_api()
	{
		$obj = clone $this;

		if (isset($this->campaign_id)) {
			$obj->campaign = new Campaign();
			$obj->campaign->pull_from_db($obj->campaign_id);
		}
		if (isset($this->map_id)) {
			$obj->map = new Map();
			$obj->map->pull_from_db($obj->map_id);
		}
		$obj->objective = new Objective();
		$obj->objective->pull_from_db($obj->objective_id);
		$obj->difficulty = new Difficulty();
		$obj->difficulty->pull_from_db($obj->difficulty_id);

		return $obj;
	}
}
