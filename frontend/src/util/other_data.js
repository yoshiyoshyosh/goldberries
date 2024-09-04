export const NewRules = {
  goldens: {
    id: "submissions",
    rules: {
      id: "submissions-all",
      type: "ordered",
      count: 15,
    },
    full_game_additional: {
      id: "submissions-fullgame",
      explanation: true,
      type: "ordered",
      count: 8,
    },
  },
  general_recommendations: {
    id: "general-recs",
    section: {
      header: false,
      explanation: true,
      type: "unordered",
      size: "small",
      count: 3,
    },
  },
  allowed_mods: {
    id: "allowed-mods",
    section: {
      header: false,
      explanation: true,
      type: "unordered",
      size: "small",
      count: 6,
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
