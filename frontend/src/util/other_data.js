export const NewRules = {
  goldens: {
    rules: {
      type: "ordered",
      count: 4,
    },
    recommendations: {
      type: "unordered",
      size: "small",
      count: 10,
    },
    info: {
      type: "unordered",
      size: "small",
      count: 4,
    },
  },
  fullgame: {
    preface: {
      type: "unordered",
      explanation: true,
      size: "small",
      count: 5,
    },
    verification: {
      type: "ordered",
      explanation: true,
      count: 2,
    },
    rules: {
      type: "ordered",
      count: 7,
    },
    info: {
      type: "unordered",
      size: "small",
      count: 5,
    },
  },
  maps: {
    rules: {
      type: "ordered",
      count: 3,
    },
  },
};
