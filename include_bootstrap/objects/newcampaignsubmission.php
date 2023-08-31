<?php

class NewCampaignSubmission
{
	public int $id;
	public string $url;
	public string $description;

	function pull_from_db($DB, int $id): bool
	{
		$arr = db_fetch_id($DB, 'NewCampaignSubmission', $id);
		if ($arr === false)
			return false;

		$this->id = intval($tmparr['id']);
		$this->url = $tmparr['id'];
		$this->name = $tmparr['id'];
		return true;
	}

	/* no api */
}
