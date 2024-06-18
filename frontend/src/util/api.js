import axios from "axios";

//#region == GET ==

//type: "hard", "standard", "campaign", "map", "challenge", "player"
export function fetchGoldenList(
  type,
  id = null,
  options = { include_archived: false, include_arbitrary: false }
) {
  const data = {};

  if (type === "hard") {
    data.hard = true;
  } else if (type === "standard") {
    data.standard = true;
  } else if (type === "campaign") {
    data.campaign = id;
  } else if (type === "map") {
    data.map = id;
  } else if (type === "challenge") {
    data.challenge = id;
  } else if (type === "player") {
    data.player = id;
  }

  if (options.include_archived) data.archived = true;
  if (options.include_arbitrary) data.arbitrary = true;

  return axios.get("/golden-list.php", { params: data });
}

export function fetchTopGoldenList(type, id = null, archived = false, arbitrary = false) {
  const data = {
    archived: archived,
    arbitrary: arbitrary,
  };

  let endpoint = "/top-golden-list.php";
  if (type === "all") {
  } else if (type === "hitlist") {
    endpoint = "/top-golden-hitlist.php";
  } else if (type === "campaign") {
    data.campaign = id;
  } else if (type === "map") {
    data.map = id;
  } else if (type === "player") {
    data.player = id;
  }

  return axios.get(endpoint, {
    params: data,
  });
}

export function fetchAllChallenges(isFullGame = false) {
  return axios.get("/challenge.php", {
    params: {
      id: "all",
      is_full_game: isFullGame,
    },
  });
}

export function fetchAllCampaigns() {
  return axios.get("/campaign.php?id=all&maps=true&challenges=true");
}
export function fetchAllMapsInCampaign(campaignId) {
  return axios.get("/campaign.php", {
    params: {
      id: campaignId,
      maps: true,
      challenges: true,
    },
  });
}

export function fetchAllChallengesInMap(mapId) {
  return axios.get("/map.php", {
    params: {
      id: mapId,
      challenges: true,
    },
  });
}
export function fetchAllChallengesInCampaign(campaignId) {
  return axios.get("/campaign.php", {
    params: {
      id: campaignId,
      challenges: true,
    },
  });
}

export function fetchAllObjectives() {
  return axios.get("/objective.php?id=all");
}
export function fetchAllDifficulties() {
  return axios.get("/difficulty.php?id=all");
}

export function fetchAllPlayerClaims() {
  return axios.get("/account.php", { params: { claimed_players: true } });
}
export function fetchAllAccounts() {
  return axios.get("/account.php", { params: { id: "all" } });
}
export function fetchAccount(id) {
  return axios.get("/account.php", { params: { id: id } });
}
export function fetchAllPlayers() {
  return axios.get("/player.php", { params: { all: true } });
}
export function fetchPlayerList(group) {
  return axios.get("/player.php", { params: { group: group } });
}

export function fetchCampaign(id, maps = true, challenges = true, submission = true) {
  return axios.get("/campaign.php", {
    params: {
      id: id,
      maps: maps,
      challenges: challenges,
      submissions: submission,
    },
  });
}

export function fetchCampaignView(id, include_archived = false) {
  return axios.get("/campaign_view.php", {
    params: {
      id: id,
      archived: include_archived,
    },
  });
}

export function fetchMap(id, challenges = true, submission = true) {
  return axios.get("/map.php", {
    params: {
      id: id,
      challenges: challenges,
      submissions: submission,
    },
  });
}

export function fetchRejectedMapList() {
  return axios.get("/map.php", {
    params: {
      list_rejected: true,
    },
  });
}

export function fetchChallenge(id, submissions = true) {
  return axios.get("/challenge.php", {
    params: {
      id: id,
      depth: 3,
      submissions: submissions,
    },
  });
}

export function fetchSubmission(id) {
  return axios.get("/submission.php", {
    params: {
      id: id,
      depth: 4,
    },
  });
}

export function fetchSubmissionQueue() {
  return axios.get("/submission.php", {
    params: {
      queue: true,
    },
  });
}

export function fetchPlayer(id) {
  return axios.get("/player.php", {
    params: {
      id: id,
      customization: true,
    },
  });
}

export function fetchPlayerSubmissions(id, archived, arbitrary) {
  return axios.get("/player-submissions.php", {
    params: {
      player_id: id,
      archived: archived,
      arbitrary: arbitrary,
    },
  });
}

export function fetchChangelog(type, id) {
  return axios.get("/change.php", {
    params: {
      type: type,
      id: id,
    },
  });
}

export function fetchRecentSubmissions(verified, page, perPage, search = null, playerId = null) {
  const data = {
    recent: true,
    page: page,
    per_page: perPage,
  };

  if (verified !== null) data.verified = verified;
  if (search) data.search = search;
  if (playerId) data.player = playerId;

  return axios.get("/submission.php", {
    params: data,
  });
}

export function fetchShowcaseSubmissions(playerId) {
  return axios.get("/showcase.php", {
    params: {
      player_id: playerId,
    },
  });
}

export function fetchChallenges(page, perPage, search) {
  return axios.get("/challenge.php", {
    params: {
      page: page,
      per_page: perPage,
      search: search,
    },
  });
}

export function fetchOverallStats(verifier = false) {
  return axios.get("/overall-stats.php", {
    params: {
      verifier: verifier,
    },
  });
}

export function fetchPlayerStats(id) {
  return axios.get("/player-stats.php", {
    params: {
      id: id,
    },
  });
}

export function fetchSearch(search) {
  return axios.get("/search.php", {
    params: {
      q: search,
    },
  });
}

export function fetchLogs(page, perPage, level, topic, search, start_date, end_date) {
  return axios.get("/logging.php", {
    params: {
      page: page,
      per_page: perPage,
      level: level,
      topic: topic,
      search: search,
      start_date: start_date,
      end_date: end_date,
    },
  });
}

export function fetchSuggestions(page, perPage, expired = null, challengeId = null) {
  const params = {
    page: page,
    per_page: perPage,
  };
  if (expired !== null) params.expired = expired;
  if (challengeId !== null) params.challenge = challengeId;
  return axios.get("/suggestion.php", {
    params: params,
  });
}
export function fetchSuggestion(id) {
  return axios.get("/suggestion.php", {
    params: {
      id: id,
    },
  });
}

export function fetchStats(type, month = null, allClearsTierSort = null, firstClearsTierSort = null) {
  const params = { type: type };
  if (month) params.month = month;
  if (allClearsTierSort) params.all_clears_tier_sort = allClearsTierSort;
  if (firstClearsTierSort) params.first_clears_tier_sort = firstClearsTierSort;

  return axios.get("/stats.php", {
    params: params,
  });
}
//#endregion

//#region == POST ==
export function postCampaign(data) {
  return axios.post("/campaign.php", formatDataForApi(data));
}

export function postMap(data) {
  return axios.post("/map.php", formatDataForApi(data));
}

export function postChallenge(data) {
  return axios.post("/challenge.php", formatDataForApi(data));
}
export function postChallengeSplit(data) {
  data.split = true;
  return axios.post("/challenge.php", formatDataForApi(data));
}
export function postChallengeMerge(data) {
  data.merge = true;
  return axios.post("/challenge.php", formatDataForApi(data));
}
export function postChallengeMarkPersonal(data) {
  data.mark_personal = true;
  return axios.post("/challenge.php", formatDataForApi(data));
}

export function postSubmission(data) {
  return axios.post("/submission.php", formatDataForApi(data));
}

export function claimPlayer(player) {
  return axios.post(
    "/account.php",
    formatDataForApi({
      self: true,
      claimed_player_id: player.id,
    })
  );
}

export function postPlayer(data, self = false) {
  if (self) {
    data.self = true;
  }
  return axios.post("/player.php", formatDataForApi(data));
}

export function postAccount(self, data) {
  return axios.post(
    "/account.php",
    formatDataForApi({
      ...data,
      self: self,
    })
  );
}

export function registerEmail(data) {
  return axios.get("/auth/register.php", {
    params: {
      email: data.email,
      password: data.password,
    },
  });
}
export function verifyEmail(token) {
  return axios.get("/auth/register.php", {
    params: {
      verify: token,
    },
  });
}
export function forgotPasswordRequest(email) {
  return axios.get("/auth/forgot_password.php", {
    params: {
      email: email,
    },
  });
}
export function forgotPasswordVerify(data) {
  return axios.get("/auth/forgot_password.php", {
    params: {
      token: data.token,
      password: data.password,
    },
  });
}

export function postSuggestion(data) {
  return axios.post("/suggestion.php", formatDataForApi(data));
}
export function postSuggestionVote(data) {
  return axios.post("/suggestion-vote.php", formatDataForApi(data));
}

export function postShowcase(submissions) {
  return axios.post("/showcase.php", formatDataForApi(submissions));
}
//#endregion

//#region == DELETE ==
export function deleteCampaign(id) {
  return axios.delete("/campaign.php", {
    params: {
      id: id,
    },
  });
}

export function deleteMap(id) {
  return axios.delete("/map.php", {
    params: {
      id: id,
    },
  });
}

export function deleteChallenge(id) {
  return axios.delete("/challenge.php", {
    params: {
      id: id,
    },
  });
}

export function deleteSubmission(id) {
  return axios.delete("/submission.php", {
    params: {
      id: id,
    },
  });
}

export function deletePlayer(id) {
  return axios.delete("/player.php", {
    params: {
      id: id,
    },
  });
}

export function deleteChangelogEntry(id) {
  return axios.delete("/change.php", {
    params: {
      id: id,
    },
  });
}

export function deleteOwnAccount() {
  return axios.delete("/account.php", {
    params: {
      self: true,
    },
  });
}
export function deleteAccount(id) {
  return axios.delete("/account.php", {
    params: {
      id: id,
    },
  });
}

export function deleteLogEntry(id) {
  return axios.delete("/logging.php", {
    params: {
      id: id,
    },
  });
}

export function deleteSuggestion(id) {
  return axios.delete("/suggestion.php", {
    params: {
      id: id,
    },
  });
}
export function deleteSuggestionVote(id) {
  return axios.delete("/suggestion-vote.php", {
    params: {
      id: id,
    },
  });
}
//#endregion

//#region == Utility ==
export function formatDataForApi(data) {
  //Loop through all props in data
  //If prop is a string, trim it. if its empty, set it to null

  for (const prop in data) {
    if (typeof data[prop] === "string") {
      data[prop] = data[prop].trim();
      if (data[prop] === "") data[prop] = null;
    } else if (typeof data[prop] === "object") {
      data[prop] = formatDataForApi(data[prop]);
    }
  }
  return data;
}
//#endregion
