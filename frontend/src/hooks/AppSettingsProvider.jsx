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
          darkenTierColors: 45,
        },
        general: {
          backgroundDark: null, //Indicates default, solid color background. Otherwise this is the image name
          backgroundLight: null, //Same
          backgroundBlur: 15,
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
