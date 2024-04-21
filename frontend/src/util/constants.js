import { darken } from "@mui/material";
import { lightTheme } from "../App";

export const APP_URL = process.env.REACT_APP_URL;
export const API_URL = process.env.REACT_APP_API_URL;
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
export function getDifficultyColors(id) {
  let colors = DIFFICULTY_COLORS[19];
  if (id !== null && id !== undefined) colors = DIFFICULTY_COLORS[id];
  // return {
  //   color: colors.color,
  //   group_color: colors.group_color,
  //   contrast_color: lightTheme.palette.getContrastText(colors.color),
  // };
  return colors;
}

export function getDifficultyColorsTheme(theme, id) {
  if (id === null || id === undefined) return theme.palette.difficulty[19];
  return theme.palette.difficulty[id];
}

function darkenDiffColor(color, amount) {
  return {
    color: darken(color.color, amount),
    group_color: darken(color.group_color, amount),
    contrast_color: lightTheme.palette.getContrastText(darken(color.color, amount)),
  };
}
export function getDifficultyColorsSettings(settings, id) {
  let entry = null;
  if (id === null || id === undefined) entry = DIFFICULTY_COLORS[19];
  else entry = DIFFICULTY_COLORS[id];

  if (settings.visual.darkmode) {
    return darkenDiffColor(entry, settings.visual.topGoldenList.darkenTierColors / 100);
  } else {
    return entry;
  }
}
