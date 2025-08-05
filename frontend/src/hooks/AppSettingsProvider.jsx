import { createContext, useContext, useEffect } from "react";
import { useLocalStorage, useMediaQuery } from "@uidotdev/usehooks";

const AppSettingsContext = createContext();

export function AppSettingsProvider({ children }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const getDefaultSettings = () => {
    return {
      general: {
        //language: "en",
        alwaysShowGoldenChanges: false,
        showOldTierNames: false,
        showFractionalTiers: true,
        settingsVersion: 1,
      },
      visual: {
        darkmode: prefersDarkMode ?? true,
        topGoldenList: {
          showCampaignIcons: true,
          useTextFcIcons: false,
          darkenTierColors: 55,
          switchMapAndChallenge: false,
          hideEmptyTiers: false,
          hideTimeTakenColumn: false,
          showFractionalTiers: false,
          unstackTiers: true,
        },
        background: {
          dark: "", //Indicates default, solid color background. Otherwise this is the image name
          darkCustom: "",
          light: "", //Same
          lightCustom: "",
          blur: 5,
        },
        playerNames: {
          showColors: true,
          preferSingleOverGradientColor: false,
          showOutline: true,
        },
        difficultyColors: {
          24: "",
          2: "",
          3: "",
          23: "",
          4: "",
          5: "",
          6: "",
          7: "",
          8: "",
          9: "",
          10: "",
          11: "",
          12: "",
          14: "",
          15: "",
          16: "",
          17: "",
          22: "",
          18: "",
          21: "",
          20: "",
          19: "",
        },
      },
    };
  };

  const [settings, setSettings] = useLocalStorage("app_settings", getDefaultSettings());

  const deepCompareSettings = (defaultSettings, settings) => {
    let hadChange = false;
    for (const key in defaultSettings) {
      if (typeof defaultSettings[key] === "object") {
        if (settings[key] === undefined) {
          settings[key] = defaultSettings[key];
          hadChange = true;
        }
        if (deepCompareSettings(defaultSettings[key], settings[key])) {
          hadChange = true;
        }
      } else if (settings[key] === undefined) {
        settings[key] = defaultSettings[key];
        hadChange = true;
      }
    }

    return hadChange;
  };

  const checkSettingsVersion = (defaultSettings, settings) => {
    let hadChange = false;
    if (
      settings.general.settingsVersion === undefined ||
      settings.general.settingsVersion < defaultSettings.general.settingsVersion
    ) {
      fixSettings(defaultSettings, settings);
      hadChange = true;
    }
    return hadChange;
  };

  useEffect(() => {
    const defaultSettings = getDefaultSettings();
    if (deepCompareSettings(defaultSettings, settings)) {
      setSettings({ ...settings });
    }
    if (checkSettingsVersion(defaultSettings, settings)) {
      setSettings({ ...settings });
    }
  }, []);

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        setSettings,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}

export const COLOR_PRESETS = [
  {
    name: "Default",
    disabled: false,
    colors: {
      24: "",
      2: "",
      3: "",
      23: "",
      4: "",
      5: "",
      6: "",
      7: "",
      8: "",
      9: "",
      10: "",
      11: "",
      12: "",
      14: "",
      15: "",
      16: "",
      17: "",
      22: "",
      18: "",
      21: "",
      20: "",
      19: "",
    },
  },
  {
    name: "Alternate Colors",
    disabled: false,
    colors: {
      24: "#ff76cc",
      2: "#ff97d8",
      3: "#fcb5e0",
      23: "#ff99b2",
      4: "#ff7b67",
      5: "#ff9989",
      6: "#fcb6ab",
      7: "#ffc874",
      8: "#ffd595",
      9: "#f8dcb2",
      10: "#ffec87",
      11: "#ffebb0",
      12: "#fbf3cf",
      14: "#b0ff78",
      15: "#85e191",
      16: "#8fdeff",
      17: "#96a6ff",
      22: "#ccd4ff",
      18: "#e5e9ff",
      21: "#ffffff",
      19: "#aaaaaa",
      20: "#c6c6c6",
    },
  },
  {
    name: "Protanopia",
    disabled: true,
    colors: {
      24: "",
      2: "",
      3: "",
      23: "",
      4: "",
      5: "",
      6: "",
      7: "",
      8: "",
      9: "",
      10: "",
      11: "",
      12: "",
      14: "",
      15: "",
      16: "",
      17: "",
      22: "",
      18: "",
      21: "",
      20: "",
      19: "",
    },
  },
  {
    name: "Deuteranopia",
    disabled: true,
    colors: {
      24: "",
      2: "",
      3: "",
      23: "",
      4: "",
      5: "",
      6: "",
      7: "",
      8: "",
      9: "",
      10: "",
      11: "",
      12: "",
      14: "",
      15: "",
      16: "",
      17: "",
      22: "",
      18: "",
      21: "",
      20: "",
      19: "",
    },
  },
  {
    name: "Triatanopia",
    disabled: true,
    colors: {
      24: "",
      2: "",
      3: "",
      23: "",
      4: "",
      5: "",
      6: "",
      7: "",
      8: "",
      9: "",
      10: "",
      11: "",
      12: "",
      14: "",
      15: "",
      16: "",
      17: "",
      22: "",
      18: "",
      21: "",
      20: "",
      19: "",
    },
  },
];

//Use this function to fix settings issues when a new version is released
function fixSettings(settings, defaultSettings) {
  const version = settings.general.settingsVersion;

  // // Initial Fix not necessary
  // if (version === undefined || version < 1) {

  // }

  // Update version to current
  settings.general.settingsVersion = defaultSettings.general.settingsVersion;
}
