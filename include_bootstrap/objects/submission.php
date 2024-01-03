<?php

class Submission
{
	public int $id;
	public int $challenge_id;
	public int $player_id;
	public string $date_created;
	public string $proof_url;
	public $player_notes; /* string */
	public bool $is_verified;
	public bool $is_rejected;
	public $verifier_id; /* int */
	public $date_verified; /* string */
	public $verifier_notes; /* string */
	public $new_map_submission_id; /* int */
	public $new_campaign_submission_id; /* int */
	public bool $is_fc;
	public bool $is_special;
	public $suggested_difficulty_id; /* int */

	/* for api */
	public $challenge = null; /* Challenge */
	public $player = null; /* Player */
	public $verifier = null; /* Player */
	public $new_map_submission = null; /* NewMapSubmission */
	public $new_campaign_submission = null; /* NewCampaignSubmission */
	public $suggested_difficulty = null; /* Difficulty */

	function pull_from_db($DB, int $id): bool
	{
		$arr = db_fetch_id($DB, 'Submission', $id);
		if ($arr === false)
			return false;

		$this->id = intval($arr['id']);
		$this->challenge_id = intval($arr['challenge_id']);
		$this->player_id = intval($arr['player_id']);
		$this->date_created = $arr['date_created'];
		$this->proof_url = $arr['proof_url'];
		$this->is_verified = $arr['is_verified'] === 't';
		$this->is_rejected = $arr['is_rejected'] === 't';
		$this->is_fc = $arr['is_fc'] === 't';
		$this->is_special = $arr['is_special'] === 't';

		if (isset($arr['verifier_id']))
			$this->verifier_id = intval($arr['verifier_id']);
		if (isset($arr['new_map_submission_id']))
			$this->new_map_submission_id = intval($arr['new_map_submission_id']);
		if (isset($arr['new_campaign_submission_id']))
			$this->new_campaign_submission_id = intval($arr['new_campaign_submission_id']);
		if (isset($arr['suggested_difficulty_id']))
			$this->suggested_difficulty_id = intval($arr['suggested_difficulty_id']);
		if (isset($arr['player_notes']))
			$this->player_notes = $arr['player_notes'];
		if (isset($arr['date_verified']))
			$this->date_verified = $arr['date_verified'];
		if (isset($arr['verifier_notes']))
			$this->verifier_notes = $arr['verifier_notes'];
	}

	function clone_for_api()
	{
		$obj = clone this;

		if (isset($this->challenge_id)) {
			$obj->challenge = new Challenge();
			$obj->challenge->pull_from_db($obj->challenge_id);
		}
		if (isset($this->player_id)) {
			$obj->player = new Player();
			$obj->player->pull_from_db($obj->player_id);
		}
		if (isset($this->verifier_id)) {
			$obj->verifier = new Player();
			$obj->verifier->pull_from_db($obj->verifier_id);
		}
	}
}
