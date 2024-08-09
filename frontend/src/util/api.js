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

  return axios.get("/lists/golden-list", { params: data });
}

export function fetchTopGoldenList(type, id = null, filter) {
  const data = {
    archived: filter.archived,
    arbitrary: filter.arbitrary,
    hide_objectives: filter.hide_objectives,
  };

  let endpoint = "/lists/top-golden-list";
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
  return axios.get("/challenge", {
    params: {
      id: "all",
      is_full_game: isFullGame,
    },
  });
}

export function fetchAllCampaigns() {
  return axios.get("/campaign", { params: { id: "all", maps: true, challenges: true } });
}
export function fetchAllMapsInCampaign(campaignId) {
  return axios.get("/campaign", {
    params: {
      id: campaignId,
      maps: true,
      challenges: true,
    },
  });
}

export function fetchAllChallengesInMap(mapId) {
  return axios.get("/map", {
    params: {
      id: mapId,
      challenges: true,
    },
  });
}
export function fetchAllChallengesInCampaign(campaignId) {
  return axios.get("/campaign", {
    params: {
      id: campaignId,
      challenges: true,
    },
  });
}

export function fetchObjectiveSubmissionCount(type = null, id = null) {
  const params = {};
  if (type !== null) {
    params.type = type;
    params.id = id;
  }
  return axios.get("/objective/submission-count", { params: params });
}
export function fetchAllObjectives() {
  return axios.get("/objective", { params: { id: "all" } });
}
export function fetchAllDifficulties() {
  return axios.get("/difficulty", { params: { id: "all" } });
}

export function fetchAllPlayerClaims() {
  return axios.get("/account/claimed-players");
}
export function fetchAllAccounts() {
  return axios.get("/account", { params: { id: "all" } });
}
export function fetchAccount(id) {
  return axios.get("/account", { params: { id: id } });
}
export function fetchAllPlayers() {
  return axios.get("/player/all");
}
export function fetchPlayerList(group) {
  return axios.get("/player/group", { params: { group: group } });
}

export function fetchCampaign(id, maps = true, challenges = true, submission = true) {
  return axios.get("/campaign", {
    params: {
      id: id,
      maps: maps,
      challenges: challenges,
      submissions: submission,
    },
  });
}

export function fetchCampaignView(id) {
  return axios.get("/campaign/view", {
    params: {
      id: id,
    },
  });
}
export function fetchCampaignViewPlayer(id, playerId) {
  return axios.get("/campaign/view-player", {
    params: {
      id: id,
      player_id: playerId,
    },
  });
}

export function fetchMap(id, challenges = true, submission = true) {
  return axios.get("/map", {
    params: {
      id: id,
      challenges: challenges,
      submissions: submission,
    },
  });
}

export function fetchRejectedMapList() {
  return axios.get("/map/rejected");
}

export function fetchChallenge(id, submissions = true) {
  return axios.get("/challenge", {
    params: {
      id: id,
      depth: 3,
      submissions: submissions,
    },
  });
}

export function fetchSubmission(id) {
  return axios.get("/submission", {
    params: {
      id: id,
    },
  });
}

export function fetchSubmissionQueue() {
  return axios.get("/submission/queue");
}

export function fetchPlayer(id) {
  return axios.get("/player", {
    params: {
      id: id,
      customization: true,
    },
  });
}

export function fetchPlayerSubmissions(id, archived, arbitrary) {
  return axios.get("/player/submissions", {
    params: {
      player_id: id,
      archived: archived,
      arbitrary: arbitrary,
    },
  });
}

export function fetchChangelog(type, id) {
  return axios.get("/change", {
    params: {
      type: type,
      id: id,
    },
  });
}

export function fetchRecentSubmissions(verified, page, perPage, search = null, playerId = null) {
  const data = {
    page: page,
    per_page: perPage,
  };

  if (verified !== null) data.verified = verified;
  if (search) data.search = search;
  if (playerId) data.player = playerId;

  return axios.get("/submission/recent", {
    params: data,
  });
}

export function fetchShowcaseSubmissions(playerId) {
  return axios.get("/showcase", {
    params: {
      player_id: playerId,
    },
  });
}

export function fetchChallenges(page, perPage, search) {
  return axios.get("/challenge/paginated", {
    params: {
      page: page,
      per_page: perPage,
      search: search,
    },
  });
}

export function fetchStatsVerifierTools() {
  return axios.get("/stats/verifier-tools");
}

export function fetchPlayerStats(id) {
  return axios.get("/player/stats", {
    params: {
      id: id,
    },
  });
}

export function fetchSearch(search) {
  return axios.get("/search", {
    params: {
      q: search,
    },
  });
}

export function fetchLogs(page, perPage, level, topic, search, start_date, end_date) {
  return axios.get("/logging", {
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

export function fetchSuggestions(page, perPage, expired = null, challengeId = null, type = "all") {
  const params = {
    page: page,
    per_page: perPage,
    type: type,
  };
  if (expired !== null) params.expired = expired;
  if (challengeId !== null) params.challenge = challengeId;
  return axios.get("/suggestion/paginated", {
    params: params,
  });
}
export function fetchSuggestion(id) {
  return axios.get("/suggestion", {
    params: {
      id: id,
    },
  });
}

export function fetchStatsGlobal(month = null) {
  const params = {};
  if (month) params.month = month;
  return axios.get("/stats/global", {
    params: params,
  });
}
export function fetchStatsMonthlyRecap(month, allClearsTierSort = null, firstClearsTierSort = null) {
  const params = { month: month };
  if (allClearsTierSort) params.all_clears_tier_sort = allClearsTierSort;
  if (firstClearsTierSort) params.first_clears_tier_sort = firstClearsTierSort;
  return axios.get("/stats/monthly-recap", {
    params: params,
  });
}
export function fetchStatsMonthlyTierClears() {
  return axios.get("/stats/monthly-tier-clears");
}
export function fetchStatsPlayerTierClearCounts() {
  return axios.get("/stats/player-tier-clear-counts");
}

export function fetchModInfo(url) {
  const params = { url };
  return axios.get("/util/get-mod-info", {
    params: params,
  });
}
//#endregion

//#region == POST ==
export function postCampaign(data) {
  return axios.post("/campaign", formatDataForApi(data));
}

export function postMap(data) {
  return axios.post("/map", formatDataForApi(data));
}

export function postChallenge(data) {
  return axios.post("/challenge", formatDataForApi(data));
}
export function postChallengeSplit(data) {
  data.split = true;
  return axios.post("/challenge", formatDataForApi(data));
}
export function postChallengeMerge(data) {
  data.merge = true;
  return axios.post("/challenge", formatDataForApi(data));
}
export function postChallengeMarkPersonal(data) {
  data.mark_personal = true;
  return axios.post("/challenge", formatDataForApi(data));
}
export function postVerificationNotice(data) {
  return axios.post("/verification-notice", formatDataForApi(data));
}

export function postSubmission(data) {
  return axios.post("/submission", formatDataForApi(data));
}
export function massVerifySubmissions(data) {
  return axios.post("/submission/mass-verify", formatDataForApi(data));
}

export function claimPlayer(player) {
  return axios.post(
    "/account",
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
  return axios.post("/player", formatDataForApi(data));
}

export function postAccount(self, data) {
  return axios.post(
    "/account",
    formatDataForApi({
      ...data,
      self: self,
    })
  );
}

export function registerEmail(data) {
  return axios.get("/auth/register", {
    params: {
      email: data.email,
      password: data.password,
    },
  });
}
export function verifyEmail(token) {
  return axios.get("/auth/register", {
    params: {
      verify: token,
    },
  });
}
export function forgotPasswordRequest(email) {
  return axios.get("/auth/forgot_password", {
    params: {
      email: email,
    },
  });
}
export function forgotPasswordVerify(data) {
  return axios.get("/auth/forgot_password", {
    params: {
      token: data.token,
      password: data.password,
    },
  });
}

export function postSuggestion(data) {
  return axios.post("/suggestion", formatDataForApi(data));
}
export function postSuggestionVote(data) {
  return axios.post("/suggestion/vote", formatDataForApi(data));
}

export function postShowcase(submissions) {
  return axios.post("/showcase", formatDataForApi(submissions));
}
//#endregion

//#region == DELETE ==
export function deleteCampaign(id) {
  return axios.delete("/campaign", {
    params: {
      id: id,
    },
  });
}

export function deleteMap(id) {
  return axios.delete("/map", {
    params: {
      id: id,
    },
  });
}

export function deleteChallenge(id) {
  return axios.delete("/challenge", {
    params: {
      id: id,
    },
  });
}

export function deleteSubmission(id) {
  return axios.delete("/submission", {
    params: {
      id: id,
    },
  });
}

export function deletePlayer(id) {
  return axios.delete("/player", {
    params: {
      id: id,
    },
  });
}

export function deleteChangelogEntry(id) {
  return axios.delete("/change", {
    params: {
      id: id,
    },
  });
}

export function deleteOwnAccount() {
  return axios.delete("/account", {
    params: {
      self: true,
    },
  });
}
export function deleteAccount(id) {
  return axios.delete("/account", {
    params: {
      id: id,
    },
  });
}

export function deleteLogEntry(id) {
  return axios.delete("/logging", {
    params: {
      id: id,
    },
  });
}

export function deleteSuggestion(id) {
  return axios.delete("/suggestion", {
    params: {
      id: id,
    },
  });
}
export function deleteSuggestionVote(id) {
  return axios.delete("/suggestion/vote", {
    params: {
      id: id,
    },
  });
}

export function deleteVerificationNotice(id) {
  return axios.delete("/verification-notice", {
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
