import axios from "axios";

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
