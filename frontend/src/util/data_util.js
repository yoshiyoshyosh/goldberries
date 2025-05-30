import { lightTheme } from "../App";
import { jsonDateToJsDate } from "./util";

export function getChallengeIsFullGame(challenge) {
  return challenge.map === null;
}
export function getChallengeCampaign(challenge) {
  if (challenge === null) return null;
  return challenge.map?.campaign ?? challenge.campaign;
}

export function getChallengeFcShort(challenge, noC = false) {
  if (challenge.requires_fc) return "[FC]";
  else if (challenge.has_fc) return "[C/FC]";
  else return noC ? "" : "[C]";
}
export function getChallengeFcLong(challenge) {
  if (challenge.requires_fc) return "Full Clear";
  else if (challenge.has_fc) return "Regular/Full Clear";
  else return "Regular Clear";
}

export function getChallengeObjectiveSuffix(challenge) {
  if (challenge.objective.display_name_suffix === null) return "";
  return " " + challenge.objective.display_name_suffix;
}

export function getChallengeName(challenge, includeFc = true) {
  const rejectedPrefix = challenge.is_rejected ? "[Rejected] " : "";
  const challengeFc = includeFc ? getChallengeFcLong(challenge) + ": " : "";
  const challengeSuffix =
    getChallengeSuffix(challenge) === null ? "" : " [" + getChallengeSuffix(challenge) + "]";
  return rejectedPrefix + challengeFc + challenge.objective.name + challengeSuffix;
}

export function getChallengeSuffix(challenge, checkDifferent = false) {
  // if (challenge.label !== null)
  if (challenge.label !== null && (!checkDifferent || challenge.label !== challenge.objective.name))
    return challenge.label;
  else if (
    challenge.objective.display_name_suffix !== null &&
    (!checkDifferent || challenge.objective.name !== challenge.objective.display_name_suffix)
  )
    return challenge.objective.display_name_suffix;
  return null;
}

export function getChallengeIcon(challenge) {
  if (challenge.icon_url !== null) {
    return challenge.icon_url;
  }
  return challenge.objective.icon_url;
}

export function getChallengeNameShort(
  challenge,
  withSuffix = false,
  includeFc = true,
  includeRejected = true
) {
  const rejectedPrefix = challenge.is_rejected && includeRejected ? "[Rejected] " : "";
  const challengeSuffix =
    withSuffix && getChallengeSuffix(challenge, true) !== null
      ? " [" + getChallengeSuffix(challenge, true) + "]"
      : "";
  const cfcSuffix = includeFc ? " " + getChallengeFcShort(challenge) : "";
  return rejectedPrefix + challenge.objective.name + cfcSuffix + challengeSuffix;
}

export function getChallengeIsArbitrary(challenge) {
  return challenge.is_arbitrary === null ? challenge.objective.is_arbitrary : challenge.is_arbitrary;
}

export function getDifficultyNameShort(difficulty) {
  if (difficulty.id === 20) return "Unt";
  if (difficulty.id === 19) return "Und";
  return "T" + difficulty.sort;
}
export function getDifficultyName(difficulty) {
  let subtierPrefix =
    difficulty.subtier === null || difficulty.subtier === undefined ? "" : difficulty.subtier + " ";
  //capitalize first letter
  subtierPrefix = subtierPrefix.charAt(0).toUpperCase() + subtierPrefix.slice(1);
  return subtierPrefix + difficulty.name;
}

export function getChallengeFlags(challenge) {
  const flags = [];
  if (challenge.requires_fc) flags.push("Full Clear");
  else if (challenge.has_fc) flags.push("Clear / Full Clear");
  else flags.push("Regular Clear");
  if (challenge.is_arbitrary !== null && (challenge.id_arbitrary || challenge.objective.is_arbitrary))
    flags.push("Arbitrary");
  return flags;
}

export function getChallengeInvertHierarchy(campaign, map, challenge) {
  const campaignCopy = { ...campaign, challenges: null, maps: null };
  const challengeCopy = { ...challenge };
  if (map) {
    const mapCopy = { ...map, challenges: null, campaign: campaignCopy };
    challengeCopy.map = mapCopy;
  } else {
    challengeCopy.campaign = campaignCopy;
  }
  return challengeCopy;
}

export function displayDate(dateObj, t) {
  if (dateObj === null || dateObj === undefined) return "<" + t("unknown_date") + ">";
  return jsonDateToJsDate(dateObj).toLocaleDateString(navigator.language);
}

export function getGamebananaEmbedUrl(url, size = "medium") {
  if (url === null) return null;

  //urls look like: https://gamebanana.com/mods/409812
  if (!url.startsWith("https://gamebanana.com/mods/")) {
    return null;
  }
  const split = url.split("/");
  if (split.length !== 5) {
    return null;
  }
  const id = split[4];

  //Make the embed url: https://gamebanana.com/mods/embeddables/<id>?type=medium
  return "https://gamebanana.com/mods/embeddables/" + id + "?type=" + size;
}

export function getMapAuthor(map) {
  if (map.author_gb_name === null) {
    return {
      name: map.campaign?.author_gb_name,
      id: map.campaign?.author_gb_id,
    };
  }
  return {
    name: map.author_gb_name,
    id: map.author_gb_id,
  };
}

export function getMapLobbyInfo(map, campaign = null) {
  if (map === null) return null;
  campaign = campaign || map.campaign;

  const hasMajor = campaign.sort_major_name !== null && map.sort_major !== null;
  const hasMinor = campaign.sort_minor_name !== null && map.sort_minor !== null;

  const lobbyInfo = {};

  if (hasMajor) {
    lobbyInfo.major = {
      name: campaign.sort_major_name,
      label: campaign.sort_major_labels[map.sort_major],
      color: campaign.sort_major_colors[map.sort_major],
    };
  }

  if (hasMinor) {
    lobbyInfo.minor = {
      name: campaign.sort_minor_name,
      label: campaign.sort_minor_labels[map.sort_minor],
      color: campaign.sort_minor_colors[map.sort_minor],
    };
  }

  return lobbyInfo;
}

export function getMapName(
  map,
  campaign,
  includeMapWithSide = true,
  includeOld = true,
  includeRejected = true
) {
  campaign = campaign || map.campaign;

  if (map === null || map === undefined) {
    //For full game runs
    return campaign.name;
  }

  const mapName =
    (map.name === "A-Side" || map.name === "B-Side" || map.name === "C-Side" || map.name === "D-Side") &&
    includeMapWithSide
      ? campaign.name + " " + map.name
      : map.name;

  const isOld = map.is_archived ?? false;
  const oldPrefix = isOld && includeOld ? "[Old] " : "";
  const rejectedPrefix = map.is_rejected && includeRejected ? "[Rejected] " : "";

  return rejectedPrefix + oldPrefix + mapName;
}

export function isMapSameNameAsCampaign(map, campaign, includeOld = true, includeRejected = true) {
  return getMapName(map, campaign, false, includeOld, includeRejected) === campaign.name;
}

export function getSubmissionVerifier(submission) {
  if (submission.is_verified === null) {
    return null;
  }
  if (submission.verifier) {
    return {
      name: submission.verifier.name,
      id: submission.verifier.id,
    };
  }
  return {
    name: "Molden Team",
    id: null,
  };
}

export function getObjectiveName(objective) {
  const arbitrarySuffix = objective.is_arbitrary ? " (A)" : "";
  return objective.name + arbitrarySuffix;
}

export function getChallengeNameClean(challenge, t) {
  const challengeSuffix =
    getChallengeSuffix(challenge) === null ? "" : " [" + getChallengeSuffix(challenge) + "]";
  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);
  return getMapNameClean(map, campaign, t) + challengeSuffix;
}
export function getMapNameClean(map, campaign, t, noAuthor = false) {
  const isFullGame = map === null;
  const authorName =
    campaign.author_gb_name === null ? "<" + t("unknown_author") + ">" : campaign.author_gb_name;
  if (isFullGame) {
    return campaign.name + (noAuthor ? "" : " (" + t("by") + " " + authorName + ")");
  }

  // const isSameName = map.name === campaign.name;
  const isSide = map.name.endsWith("-Side") && map.name.length <= 8;
  if (isSide) {
    return campaign.name + " [" + map.name + "]";
  }

  const oldPrefix = map.is_archived ? "[Old] " : "";
  const rejectedPrefix = map.is_rejected ? "[Rejected] " : "";

  return oldPrefix + rejectedPrefix + map.name + (noAuthor ? "" : " (" + t("by") + " " + authorName + ")");
}
export function getCampaignName(campaign, t, noAuthor = false) {
  if (noAuthor) return campaign.name;
  const authorName =
    campaign.author_gb_name === null ? "<" + t("unknown_author") + ">" : campaign.author_gb_name;
  return campaign.name + " (" + t("by") + " " + authorName + ")";
}

export function getAccountName(account) {
  let prefix = `(${account.id})`;

  if (account.is_suspended) {
    prefix += " [Banned]";
  }

  if (account.player !== null) {
    return `${prefix} ${account.player.name}`;
  } else if (account.claimed_player !== null) {
    return `${prefix} [Claim] ${account.claimed_player.name}`;
  }

  return `${prefix} <no player>`;
}

export function getPlayerNameColorStyle(player, settings = null) {
  if (
    player === null ||
    player === undefined ||
    (settings !== null && settings.visual.playerNames.showColors === false)
  ) {
    return {};
  }
  const hasColor = player.account.name_color_start !== null && player.account.name_color_start !== undefined;
  const nameColorStart = player.account.name_color_start ?? "#000000";
  let nameColorEnd = player.account.name_color_end ?? nameColorStart;
  if (settings !== null && settings.visual.playerNames.preferSingleOverGradientColor) {
    nameColorEnd = nameColorStart;
  }
  let contrastColorStart = lightTheme.palette.getContrastText(
    nameColorStart === "" ? "#000000" : nameColorStart
  );
  let contrastColorEnd = lightTheme.palette.getContrastText(nameColorEnd === "" ? "#000000" : nameColorEnd);
  const outlineColor = contrastColorStart === contrastColorEnd ? contrastColorStart : "rgba(0, 0, 0, 0.87)";
  // const outlineColor = contrastColorStart;
  const outline = settings?.visual.playerNames.showOutline
    ? "drop-shadow(" +
      outlineColor +
      " 0 0 0.5px) drop-shadow(" +
      outlineColor +
      " 0 0 0.5px) drop-shadow(" +
      outlineColor +
      " 0 0 0.5px) drop-shadow(" +
      outlineColor +
      " 0 0 0.5px) drop-shadow(" +
      outlineColor +
      " 0 0 0.5px)"
    : "";
  const style = hasColor
    ? {
        backgroundImage: "linear-gradient(90deg, " + nameColorStart + " 0%, " + nameColorEnd + " 100%)",
        backgroundOrigin: "padding-box",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
        fontWeight: "bold",
        filter: outline,
      }
    : {};

  return style;
}

export function getSortedSuggestedDifficulties(challenge) {
  let allSuggestedDiffs = challenge.submissions.filter(
    (submission) => submission.suggested_difficulty !== null && !submission.is_personal
  );
  allSuggestedDiffs = allSuggestedDiffs.map((submission) => submission.suggested_difficulty);

  const difficulties = {}; // count of each difficulty
  allSuggestedDiffs.forEach((diff) => {
    if (difficulties[diff.id] === undefined) {
      difficulties[diff.id] = {
        difficulty: diff,
        value: 1,
      };
    } else {
      difficulties[diff.id].value += 1;
    }
  });
  //Sort difficulties by count DESC
  const sortedDifficulties = Object.entries(difficulties).map(([id, value]) => {
    return {
      difficulty: value.difficulty,
      value: value.value,
    };
  });
  sortedDifficulties.sort((a, b) => b.value - a.value);
  return sortedDifficulties;
}

export function extractDifficultiesFromChangelog(entry, difficulties) {
  const description = entry.description;
  //Description will look like this: "Moved from 'Tier 7' to 'High Tier 3'
  //Find the two strings enclosed in single quotes
  const regex = /'([^']+)'/g;
  const matches = description.match(regex);

  if (matches.length !== 2) return false;

  const [from, to] = matches.map((match) => match.replace(/'/g, ""));

  //Then, find the associated difficulties
  const fromDiff = difficulties.find((diff) => getDifficultyName(diff) === from);
  const toDiff = difficulties.find((diff) => getDifficultyName(diff) === to);

  return [fromDiff, toDiff];
}

export function secondsToDuration(seconds) {
  if (isNaN(seconds) || seconds < 0 || seconds === null) {
    return "";
  }

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const hoursStr = String(hours).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");
  const secsStr = String(secs).padStart(2, "0");

  return `${hoursStr}:${minutesStr}:${secsStr}`;
}
export function durationToSeconds(duration) {
  const regex = /^(\d{1,5}:)?([0-5]?\d):([0-5]?\d)$/;
  const match = duration.match(regex);
  if (!match) {
    return null;
  }

  let hours = match[1] ? parseInt(match[1].slice(0, -1)) : 0;
  let minutes = parseInt(match[2]);
  let seconds = parseInt(match[3]);

  return hours * 3600 + minutes * 60 + seconds;
}
