import { darken } from "@mui/material";
import { lightTheme } from "../App";
import Color from "color";

export const APP_URL = process.env.REACT_APP_URL;
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const TWITCH_EMBED_PARENT = process.env.REACT_APP_TWITCH_EMBED_PARENT;
export const API_URL = API_BASE_URL + "/api";
export const DISCORD_AUTH_URL = API_URL + "/auth/discord_auth";
export const APP_NAME_SHORT = "GBN";
export const APP_NAME_LONG = "Goldberries.net";
export const DISCORD_INVITE = "https://discord.gg/GeJvmMycaC";
export const IS_DEBUG = process.env.NODE_ENV === "development";

export const FormOptions = {
  PlayerName: (t) => ({
    required: {
      value: true,
      message: t("player_name.required"),
    },
    minLength: {
      value: 2,
      message: t("player_name.min_length"),
    },
    maxLength: {
      value: 32,
      message: t("player_name.max_length"),
    },
  }),
  PasswordOptional: (t) => ({
    minLength: {
      value: 8,
      message: t("password.min_length"),
    },
    maxLength: {
      value: 128,
      message: t("password.max_length"),
    },
  }),
  Password: (t) => ({
    required: {
      value: true,
      message: t("password.required"),
    },
    minLength: {
      value: 8,
      message: t("password.min_length"),
    },
    maxLength: {
      value: 128,
      message: t("password.max_length"),
    },
  }),
  EmailOptional: (t) => ({
    pattern: {
      value: /^\S+@\S+\.\S+$/,
      message: "Invalid email address",
    },
  }),
  Email: (t) => ({
    required: {
      value: true,
      message: t("email.required"),
    },
    pattern: {
      value: /^\S+@\S+\.\S+$/,
      message: t("email.invalid"),
    },
  }),
  Name128: (t) => ({
    maxLength: {
      value: 128,
      message: t("name.max_length", { count: 128 }),
    },
  }),
  Name128Required: (t) => ({
    required: {
      value: true,
      message: t("name.required"),
    },
    maxLength: {
      value: 128,
      message: t("name.max_length", { count: 128 }),
    },
  }),
  UrlRequired: (t) => ({
    required: {
      value: true,
      message: t("url.required"),
    },
  }),
  TimeTaken: (t) => ({
    pattern: {
      value: /^(\d{1,5}:)?[0-5]?\d:[0-5]?\d$/,
      message: t("time_taken.invalid"),
    },
  }),
};

export const DIFFICULTY_COLORS = {
  //Tier 0
  1: { color: "#f874c6", group_color: "#f874c6", contrast_color: "#000000" },
  2: { color: "#ff97d8", group_color: "#f874c6", contrast_color: "#000000" },
  3: { color: "#fcb5e0", group_color: "#f874c6", contrast_color: "#000000" },

  //Tier 1
  4: { color: "#ff7b67", group_color: "#ff7b67", contrast_color: "#000000" },
  5: { color: "#ff9989", group_color: "#ff7b67", contrast_color: "#000000" },
  6: { color: "#fcb6ab", group_color: "#ff7b67", contrast_color: "#000000" },

  //Tier 2
  7: { color: "#ffc874", group_color: "#ffc874", contrast_color: "#000000" },
  8: { color: "#ffd595", group_color: "#ffc874", contrast_color: "#000000" },
  9: { color: "#f8dcb2", group_color: "#ffc874", contrast_color: "#000000" },

  //Tier 3
  10: { color: "#ffec87", group_color: "#ffec87", contrast_color: "#000000" },
  11: { color: "#ffebb0", group_color: "#ffec87", contrast_color: "#000000" },
  12: { color: "#fbf3cf", group_color: "#ffec87", contrast_color: "#000000" },

  //Tier 4
  14: { color: "#b0ff78", group_color: "#b0ff78", contrast_color: "#000000" },

  //Tier 5
  15: { color: "#85e191", group_color: "#85e191", contrast_color: "#000000" },

  //Tier 6
  16: { color: "#8fdeff", group_color: "#8fdeff", contrast_color: "#000000" },

  //Tier 7
  17: { color: "#96a6ff", group_color: "#96a6ff", contrast_color: "#000000" },

  //Standard
  18: { color: "#ffffff", group_color: "#ffffff", contrast_color: "#000000" },

  //Undetermined
  19: { color: "#aaaaaa", group_color: "#ffffff", contrast_color: "#000000" },

  //Trivial
  20: { color: "#c6c6c6", group_color: "#c6c6c6", contrast_color: "#000000" },

  //Low Standard
  21: { color: "#ffffff", group_color: "#ffffff", contrast_color: "#000000" },
  //High Standard
  22: { color: "#ffffff", group_color: "#ffffff", contrast_color: "#000000" },
};

function darkenDiffColor(color, amount) {
  return {
    color: new Color(darken(color.color, amount)).hex(),
    group_color: new Color(darken(color.group_color, amount)).hex(),
    contrast_color: new Color(lightTheme.palette.getContrastText(darken(color.color, amount))).hex(),
  };
}

export function getNewDifficultyColors(settings, id, useDarkening = false) {
  const colors = getSettingsDifficultyColor(settings, id);
  if (useDarkening && settings.visual.darkmode) {
    return darkenDiffColor(colors, settings.visual.topGoldenList.darkenTierColors / 100);
  } else {
    return darkenDiffColor(colors, 0);
  }
}

const DIFFICULTY_BASE_COLORS = {
  2: "#ff97d8",
  5: "#ff9989",
  8: "#ffd595",
  11: "#ffebb0",
  14: "#b0ff78",
  15: "#85e191",
  16: "#8fdeff",
  17: "#96a6ff",
  18: "#ffffff",
  19: "#aaaaaa",
  20: "#c6c6c6",
  21: "#ffffff",
  22: "#ffffff",
};
function getSettingsDifficultyColor(settings, id) {
  const groupId = getGroupId(id);

  let groupColor = settings.visual.difficultyColors[groupId];
  if (groupColor === "" || groupColor === undefined) {
    groupColor = DIFFICULTY_BASE_COLORS[groupId];
  }

  let color = settings.visual.difficultyColors[id];
  if (color === "" || color === undefined) {
    color = modifyBaseColor(groupColor, id);
  }

  return { color: color, group_color: groupColor };
}

const GROUP_ID_MAPPINGS = {
  1: 2,
  2: 2,
  3: 2,
  4: 5,
  5: 5,
  6: 5,
  7: 8,
  8: 8,
  9: 8,
  10: 11,
  11: 11,
  12: 11,
  14: 14,
  15: 15,
  16: 16,
  17: 17,
  18: 18,
  19: 19,
  20: 20,
  21: 21,
  22: 22,
};
export function getGroupId(id) {
  return GROUP_ID_MAPPINGS[id];
}

const COLOR_MODIFY_FUNCTIONS = {
  high: (color) => color.saturationv(color.saturationv() + 13),
  mid: (color) => color,
  low: (color) => color.saturationv(color.saturationv() - 13),
  none: (color) => color,
};
const DIFFICULTY_ID_SUBTIERS = {
  1: "high",
  2: "mid",
  3: "low",
  4: "high",
  5: "mid",
  6: "low",
  7: "high",
  8: "mid",
  9: "low",
  10: "high",
  11: "mid",
  12: "low",
  14: "none",
  15: "none",
  16: "none",
  17: "none",
  18: "none",
  19: "none",
  20: "none",
  21: "none",
  22: "none",
};
function getDifficultySubtier(id) {
  return DIFFICULTY_ID_SUBTIERS[id];
}
function modifyBaseColor(color, id) {
  const subTier = getDifficultySubtier(id);
  let newColor = new Color(color);
  newColor = COLOR_MODIFY_FUNCTIONS[subTier](newColor);
  return newColor.hex();
}

const DIFFICULTY_ID_SUBTIER_SHARES = {
  1: 3,
  2: 3,
  3: 3,
  4: 3,
  5: 3,
  6: 3,
  7: 3,
  8: 3,
  9: 3,
  10: 4,
  11: 4,
  12: 4,
  14: 1,
  15: 1,
  16: 1,
  17: 1,
  18: 1,
  19: 1,
  20: 1,
  21: 1,
  22: 1,
};
export function getDifficultySubtierShares(id, ignoreGuard = false) {
  let shares = DIFFICULTY_ID_SUBTIER_SHARES[id];
  if (ignoreGuard && shares === 4) {
    shares = 3;
  }
  return shares;
}

//Some difficulty details being used in the frontend
const DIFF_CONSTS_ = {
  //Difficulty ID constants
  TRIVIAL_ID: 20,
  UNDETERMINED_ID: 19,
  STANDARD_IDS: [22, 18, 21], //high, mid, low
  TIER_7_ID: 17,

  //Difficulty sorting constants
  LOW_TIER_0_SORT: 17,
  LOW_TIER_3_SORT: 8,
  STANDARD_SORT_START: 1,
  STANDARD_SORT_END: 3,
  TIERED_SORT_START: 4,
  TRIVIAL_SORT: 0,
  MAX_SORT: 19,
  MIN_SORT: -1,

  //References, added here for intellisense
  RAW_SESSION_REQUIRED_SORT: -1,
  RECAP_CLEAR_MIN_SORT: -1,
  RECAP_FIRST_CLEAR_MIN_SORT: -1,
};
DIFF_CONSTS_.RAW_SESSION_REQUIRED_SORT = DIFF_CONSTS_.LOW_TIER_3_SORT;
DIFF_CONSTS_.RECAP_CLEAR_MIN_SORT = DIFF_CONSTS_.RAW_SESSION_REQUIRED_SORT;
DIFF_CONSTS_.RECAP_FIRST_CLEAR_MIN_SORT = DIFF_CONSTS_.STANDARD_SORT_START;
export const DIFF_CONSTS = DIFF_CONSTS_;
//=================================================

const DIFFICULTY_SORTS = {
  1: 19,
  2: 18,
  3: 17,
  4: 16,
  5: 15,
  6: 14,
  7: 13,
  8: 12,
  9: 11,
  10: 10,
  11: 9,
  12: 8,
  14: 7,
  15: 6,
  16: 5,
  17: 4,
  22: 3,
  18: 2,
  21: 1,
  20: 0,
  19: -1,
};
export function difficultyToSort(id) {
  return DIFFICULTY_SORTS[id];
}

const OLD_DIFFICULTY_NAMES = {
  1: "High Tier 0",
  2: "Mid Tier 0",
  3: "Low Tier 0",
  4: "High Tier 1",
  5: "Mid Tier 1",
  6: "Low Tier 1",
  7: "High Tier 2",
  8: "Mid Tier 2",
  9: "Low Tier 2",
  10: "High Tier 3",
  11: "Mid Tier 3",
  12: "Low Tier 3",
  14: "Tier 4",
  15: "Tier 5",
  16: "Tier 6",
  17: "Tier 7",
  22: "High Standard",
  18: "Mid Standard",
  21: "Low Standard",
  20: "Trivial",
  19: "Undetermined",
};
export function getOldDifficultyName(id) {
  return OLD_DIFFICULTY_NAMES[id];
}

//A color that is used to show a subtle label on the difficulty chip. Use a subtle grey for all difficulty where that would be visible.
const OLD_DIFFICULTY_LABEL_COLORS = {
  1: "#ffffff",
  2: "#ffffff",
  3: "#ffffff",
  4: "#ffffff",
  5: "#ffffff",
  6: "#ffffff",
  7: "#777777",
  8: "#777777",
  9: "#777777",
  10: "#777777",
  11: "#777777",
  12: "#777777",
  14: "#777777",
  15: "#777777",
  16: "#ffffff",
  17: "#ffffff",
  22: "#6f6f6f",
  18: "#6f6f6f",
  21: "#6f6f6f",
  20: "#6f6f6f",
  19: "#6f6f6f",
};
export function getOldDifficultyLabelColor(id) {
  return OLD_DIFFICULTY_LABEL_COLORS[id];
}
