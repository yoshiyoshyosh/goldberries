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
export const CURRENT_VERSION = process.env.REACT_APP_VERSION;

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

export const DIFFICULTIES = {
  24: {
    color: "#f266ff",
    name: "Tier 20",
    sort: 20,
    old_name: "",
    old_name_label_color: "#ffffff",
    shares: 6,
  },
  //Tier 0
  2: {
    color: "#ff68d9",
    name: "Tier 19",
    sort: 19,
    old_name: "Mid Tier 0",
    old_name_label_color: "#ffffff",
    shares: 6,
  },
  3: {
    color: "#ff6daa",
    name: "Tier 18",
    sort: 18,
    old_name: "Low Tier 0",
    old_name_label_color: "#ffffff",
    shares: 4,
  },

  //Tier 0.5
  23: {
    color: "#ff6d79",
    name: "Tier 17",
    sort: 17,
    old_name: "Tier 0.5",
    old_name_label_color: "#ffffff",
    shares: 4,
  },

  //Tier 1
  4: {
    color: "#ff7c70",
    name: "Tier 16",
    sort: 16,
    old_name: "High Tier 1",
    old_name_label_color: "#ffffff",
    shares: 4,
  },
  5: {
    color: "#ff9572",
    name: "Tier 15",
    sort: 15,
    old_name: "Mid Tier 1",
    old_name_label_color: "#ffffff",
    shares: 4,
  },
  6: {
    color: "#ffae75",
    name: "Tier 14",
    sort: 14,
    old_name: "Low Tier 1",
    old_name_label_color: "#ffffff",
    shares: 4,
  },

  //Tier 2
  7: {
    color: "#ffc677",
    name: "Tier 13",
    sort: 13,
    old_name: "High Tier 2",
    old_name_label_color: "#777777",
    shares: 4,
  },
  8: {
    color: "#ffdd7a",
    name: "Tier 12",
    sort: 12,
    old_name: "Mid Tier 2",
    old_name_label_color: "#777777",
    shares: 4,
  },
  9: {
    color: "#fff47c",
    name: "Tier 11",
    sort: 11,
    old_name: "Low Tier 2",
    old_name_label_color: "#777777",
    shares: 4,
  },

  //Tier 3
  10: {
    color: "#f4ff7f",
    name: "Tier 10",
    sort: 10,
    old_name: "High Tier 3",
    old_name_label_color: "#777777",
    shares: 4,
  },
  11: {
    color: "#d5ff82",
    name: "Tier 9",
    sort: 9,
    old_name: "Mid Tier 3",
    old_name_label_color: "#777777",
    shares: 4,
  },
  12: {
    color: "#b7ff84",
    name: "Tier 8",
    sort: 8,
    old_name: "Low Tier 3",
    old_name_label_color: "#777777",
    shares: 4,
  },

  //Tier 4
  14: {
    color: "#9bff87",
    name: "Tier 7",
    sort: 7,
    old_name: "Tier 4",
    old_name_label_color: "#777777",
    shares: 4,
  },

  //Tier 5
  15: {
    color: "#89ffb0",
    name: "Tier 6",
    sort: 6,
    old_name: "Tier 5",
    old_name_label_color: "#777777",
    shares: 4,
  },

  //Tier 6
  16: {
    color: "#8cffe2",
    name: "Tier 5",
    sort: 5,
    old_name: "Tier 6",
    old_name_label_color: "#777777",
    shares: 4,
  },

  //Tier 7
  17: {
    color: "#8eecff",
    name: "Tier 4",
    sort: 4,
    old_name: "Tier 7",
    old_name_label_color: "#777777",
    shares: 4,
  },

  //High Standard
  22: {
    color: "#91c8ff",
    name: "Tier 3",
    sort: 3,
    old_name: "High Standard",
    old_name_label_color: "#777777",
    shares: 4,
  },

  //Mid Standard
  18: {
    color: "#93aeff",
    name: "Tier 2",
    sort: 2,
    old_name: "Mid Standard",
    old_name_label_color: "#ffffff",
    shares: 4,
  },

  //Low Standard
  21: {
    color: "#9696ff",
    name: "Tier 1",
    sort: 1,
    old_name: "Low Standard",
    old_name_label_color: "#ffffff",
    shares: 4,
  },

  //Trivial
  20: {
    color: "#ffffff",
    name: "Untiered",
    sort: 0,
    old_name: "Trivial",
    old_name_label_color: "#6f6f6f",
    shares: 6,
  },

  //Undetermined
  19: {
    color: "#aaaaaa",
    name: "Undetermined",
    sort: -1,
    old_name: "Undetermined",
    old_name_label_color: "#6f6f6f",
    shares: 6,
  },
};

export function getNewDifficultyColors(settings, id, useDarkening = false) {
  let color = settings.visual.difficultyColors[id];
  if (color === "" || color === undefined) {
    color = DIFFICULTIES[id].color;
  }

  if (useDarkening && settings.visual.darkmode) {
    const darkened = darken(color, settings.visual.topGoldenList.darkenTierColors / 100);
    color = new Color(darkened).hex();
  }

  const contrastColor = lightTheme.palette.getContrastText(color);
  const mutedContrastColor = new Color(contrastColor).fade(0.3).rgb().string();
  return {
    color: color,
    contrast_color: contrastColor,
    muted_contrast_color: mutedContrastColor,
  };
}

export function getDifficultySubtierShares(id) {
  return DIFFICULTIES[id].shares;
}

//Some difficulty details being used in the frontend
const DIFF_CONSTS_ = {
  //Difficulty ID constants
  HIGHEST_TIER_ID: 24,
  TRIVIAL_ID: 20,
  UNTIERED_ID: 19,
  STANDARD_IDS: [22, 18, 21], //high, mid, low
  TIER_7_ID: 17,

  //Difficulty sorting constants
  LOW_TIER_0_SORT: 17,
  LOW_TIER_3_SORT: 8,
  STANDARD_SORT_START: 1,
  STANDARD_SORT_END: 3,
  TIERED_SORT_START: 4,
  UNTIERED_SORT: 0,
  MAX_SORT: 20,
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

export function difficultyIdToSort(id) {
  if (DIFFICULTIES[id] === undefined) {
    return DIFF_CONSTS.TIERED_SORT_START;
  }
  return DIFFICULTIES[id].sort;
}
export function sortToDifficulty(sort) {
  for (const id in DIFFICULTIES) {
    if (DIFFICULTIES[id].sort === sort) {
      return DIFFICULTIES[id];
    }
  }
  return DIFFICULTIES[DIFF_CONSTS.UNTIERED_ID];
}
export function sortToDifficultyId(sort) {
  for (const id in DIFFICULTIES) {
    if (DIFFICULTIES[id].sort === sort) {
      return parseInt(id);
    }
  }
  return DIFF_CONSTS.UNTIERED_ID;
}

export function getOldDifficultyName(id) {
  return DIFFICULTIES[id].old_name;
}

export function getOldDifficultyLabelColor(id) {
  return DIFFICULTIES[id].old_name_label_color;
}

export function getDifficultiesSorted() {
  //Return an array of DIFFICULTIES sorted by sort value descending
  //Also put the ID into each difficulty object
  const difficulties = Object.keys(DIFFICULTIES).map((id) => {
    return {
      id: parseInt(id),
      ...DIFFICULTIES[id],
    };
  });
  return difficulties.sort((a, b) => b.sort - a.sort);
}

export const DIFFICULTY_STACKS = [
  [24, 2, 3, 23],
  [4, 5, 6],
  [7, 8, 9],
  [10, 11, 12],
  [14],
  [15],
  [16],
  [17],
  [22],
  [18],
  [21],
  [20],
  [19],
];
