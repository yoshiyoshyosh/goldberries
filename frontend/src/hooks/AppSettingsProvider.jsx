import { createContext, useContext, useEffect } from "react";
import { useLocalStorage, useMediaQuery } from "@uidotdev/usehooks";

const AppSettingsContext = createContext();

export function AppSettingsProvider({ children }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const getDefaultSettings = () => {
    return {
      visual: {
        darkmode: prefersDarkMode ?? true,
        topGoldenList: {
          showCampaignIcons: true,
          useTextFcIcons: false,
          darkenTierColors: 45,
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
