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

export function fetchAllChallenges(isFullGame = false) {
  const data = {
    id: "all",
    is_full_game: isFullGame,
  };
  return axios.get("/challenge.php", { params: data });
}

export function fetchAllCampaigns() {
  return axios.get("/campaign.php?id=all&maps=true&challenges=true");
}
export function fetchAllMapsInCampaign(campaignId) {
  const data = {
    id: campaignId,
    maps: true,
    challenges: true,
  };
  return axios.get("/campaign.php", { params: data });
}

export function fetchAllChallengesInMap(mapId) {
  const data = {
    id: mapId,
    challenges: true,
  };
  return axios.get("/map.php", { params: data });
}

export function fetchAllDifficulties() {
  return axios.get("/difficulty.php?id=all");
}

export function fetchChallenge(id, submissions = true) {
  const data = {
    id: id,
    depth: 3,
    submissions: submissions,
  };
  return axios.get("/challenge.php", { params: data });
}

export function fetchSubmission(id) {
  const data = {
    id: id,
    depth: 4,
  };
  return axios.get("/submission.php", { params: data });
}

// ===== POST =====
export function postSubmission(data) {
  return axios.post("/submission.php", formatDataForApi(data));
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
