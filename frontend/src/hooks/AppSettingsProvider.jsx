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
          1: "",
          2: "",
          3: "",
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
          18: "",
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

  useEffect(() => {
    const defaultSettings = getDefaultSettings();
    if (deepCompareSettings(defaultSettings, settings)) {
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
