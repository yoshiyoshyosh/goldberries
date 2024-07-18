export const NewRules = {
  goldens: {
    id: "submissions",
    rules: {
      id: "submissions-all",
      type: "ordered",
      count: 12,
    },
    full_game_additional: {
      id: "submissions-fullgame",
      explanation: true,
      type: "ordered",
      count: 9,
    },
  },
  general_recommendations: {
    id: "general-recs",
    section: {
      header: false,
      explanation: true,
      type: "unordered",
      size: "small",
      count: 4,
    },
  },
  allowed_mods: {
    id: "allowed-mods",
    section: {
      header: false,
      explanation: true,
      type: "unordered",
      size: "small",
      count: 5,
    },
  },
  maps: {
    id: "maps",
    rules: {
      header: false,
      type: "ordered",
      count: 6,
    },
  },
};
