import axios from "axios";

// ===== GET =====

//type: "hard", "standard", "campaign", "map", "challenge", "player"
export function fetchGoldenList(type, id = null) {
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

  return axios.get("/golden-list.php", { params: data });
}

export function fetchTopGoldenList(type, id = null, archived = false) {
  const data = {
    archived: archived,
  };

  if (type === "all") {
  } else if (type === "campaign") {
    data.campaign = id;
  } else if (type === "map") {
    data.map = id;
  } else if (type === "player") {
    data.player = id;
  }

  return axios.get("/top-golden-list.php", {
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

export function fetchAllDifficulties() {
  return axios.get("/difficulty.php?id=all");
}

export function fetchAllPlayers() {
  return axios.get("/player.php", { params: { id: "all" } });
}
export function fetchPlayerList(group) {
  return axios.get("/player.php", { params: { group: group } });
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

// ===== POST =====
export function postSubmission(data) {
  return axios.post("/submission.php", formatDataForApi(data));
}

export function claimPlayer(userObj, player) {
  return axios.post(
    "/account.php",
    formatDataForApi({
      id: userObj.id,
      claimed_player_id: player.id,
    })
  );
}

export function postPlayer(data) {
  return axios.post("/player.php", formatDataForApi(data));
}

export function updateAccount(data) {
  return axios.post("/account.php", formatDataForApi(data));
}

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
