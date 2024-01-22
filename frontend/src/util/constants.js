export const APP_URL = process.env.REACT_APP_URL;
export const API_URL = process.env.REACT_APP_API_URL;
export const DISCORD_AUTH_URL = API_URL + "/auth/discord_auth.php";

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
};
