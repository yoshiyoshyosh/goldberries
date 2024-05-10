import { darken } from "@mui/material";
import { lightTheme } from "../App";
import Color from "color";

export const APP_URL = process.env.REACT_APP_URL;
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const API_URL = API_BASE_URL + "/api";
export const DISCORD_AUTH_URL = API_URL + "/auth/discord_auth.php";
export const APP_NAME_SHORT = "GBN";
export const APP_NAME_LONG = "Goldberries.net";

export const FormOptions = {
  PlayerName: {
    required: {
      value: true,
      message: "Player name can't be empty",
    },
    minLength: {
      value: 2,
      message: "Player name must be at least 2 characters long",
    },
    maxLength: {
      value: 32,
      message: "Player name can't be longer than 32 characters",
    },
  },
  PasswordOptional: {
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters long",
    },
    maxLength: {
      value: 128,
      message: "Password can't be longer than 128 characters",
    },
  },
  Password: {
    required: {
      value: true,
      message: "Password can't be empty",
    },
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters long",
    },
    maxLength: {
      value: 128,
      message: "Password can't be longer than 128 characters",
    },
  },
  EmailOptional: {
    pattern: {
      value: /^\S+@\S+\.\S+$/,
      message: "Invalid email address",
    },
  },
  Email: {
    required: {
      value: true,
      message: "Email can't be empty",
    },
    pattern: {
      value: /^\S+@\S+\.\S+$/,
      message: "Invalid email address",
    },
  },
  Name128: {
    maxLength: {
      value: 128,
      message: "Name can't be longer than 128 characters",
    },
  },
  Name128Required: {
    required: {
      value: true,
      message: "Name can't be empty",
    },
    maxLength: {
      value: 128,
      message: "Name can't be longer than 128 characters",
    },
  },
  UrlRequired: {
    required: {
      value: true,
      message: "URL can't be empty",
    },
  },
};

// export const DIFFICULTY_COLORS = {
//   //Tier 0
//   1: { color: "#ff4d70", group_color: "#ff00d4", contrast_color: "#000000" },
//   2: { color: "#ff4d4d", group_color: "#ff00d4", contrast_color: "#000000" },
//   3: { color: "#ff794d", group_color: "#ff00d4", contrast_color: "#000000" },

//   //Tier 1
//   4: { color: "#ffaf4d", group_color: "#ff0000", contrast_color: "#000000" },
//   5: { color: "#ffbe4d", group_color: "#ff0000", contrast_color: "#000000" },
//   6: { color: "#ffd24d", group_color: "#ff0000", contrast_color: "#000000" },

//   //Tier 2
//   7: { color: "#ffed4d", group_color: "#ffff00", contrast_color: "#000000" },
//   8: { color: "#f9ff4d", group_color: "#ffff00", contrast_color: "#000000" },
//   9: { color: "#e1ff4d", group_color: "#ffff00", contrast_color: "#000000" },

//   //Tier 3
//   10: { color: "#79ff4d", group_color: "#00ff00", contrast_color: "#000000" },
//   11: { color: "#4dff5b", group_color: "#00ff00", contrast_color: "#000000" },
//   12: { color: "#4dff85", group_color: "#00ff00", contrast_color: "#000000" },
//   13: { color: "#fff9e1", group_color: "#ffec87", contrast_color: "#000000" },

//   //Tier 4
//   14: { color: "#4dffc1", group_color: "#00ffff", contrast_color: "#000000" },

//   //Tier 5
//   15: { color: "#4dffff", group_color: "#00aaff", contrast_color: "#000000" },

//   //Tier 6
//   16: { color: "#4dc3ff", group_color: "#0051ff", contrast_color: "#000000" },

//   //Tier 7
//   17: { color: "#4d85ff", group_color: "#6f00ff", contrast_color: "#000000" },

//   //Standard
//   18: { color: "#ffffff", group_color: "#ffffff", contrast_color: "#000000" },

//   //Undetermined
//   19: { color: "#aaaaaa", group_color: "#ffffff", contrast_color: "#000000" },
// };
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
  13: { color: "#fff9e1", group_color: "#ffec87", contrast_color: "#000000" },

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
};
function getSettingsDifficultyColor(settings, id) {
  const groupId = getGroupId(id);

  let groupColor = settings.visual.difficultyColors[groupId];
  if (groupColor === "") {
    groupColor = DIFFICULTY_BASE_COLORS[groupId];
  }

  let color = settings.visual.difficultyColors[id];
  if (color === "") {
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
  13: 11,
  14: 14,
  15: 15,
  16: 16,
  17: 17,
  18: 18,
  19: 19,
};
function getGroupId(id) {
  return GROUP_ID_MAPPINGS[id];
}

const COLOR_MODIFY_FUNCTIONS = {
  high: (color) => color.saturationv(color.saturationv() + 13),
  mid: (color) => color,
  low: (color) => color.saturationv(color.saturationv() - 13),
  guard: (color) => color.saturationv(color.saturationv() - 20),
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
  13: "guard",
  14: "none",
  15: "none",
  16: "none",
  17: "none",
  18: "none",
  19: "none",
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
  13: 4,
  14: 1,
  15: 1,
  16: 1,
  17: 1,
  18: 1,
  19: 1,
};
export function getDifficultySubtierShares(id, ignoreGuard = false) {
  let shares = DIFFICULTY_ID_SUBTIER_SHARES[id];
  if (ignoreGuard && shares === 4) {
    shares = 3;
  }
  return shares;
}
