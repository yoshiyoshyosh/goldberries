import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Slider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { BasicContainerBox, HeadTitle, LanguageFlag, LoadingSpinner } from "../components/BasicComponents";
import { Controller, set, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { useLocalStorage } from "@uidotdev/usehooks";
import { MuiColorInput } from "mui-color-input";
import { getNewDifficultyColors } from "../util/constants";
import i18n, { LANGUAGES } from "../i18n/config";
import { useTranslation } from "react-i18next";

export function PageAppSettings({ isModal = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "app_settings" });
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useLocalStorage("settings_tab", "general");

  const setTab = (tab) => {
    setSelectedTab(tab);
    if (isModal) return;

    if (tab === "visual") {
      navigate("/settings", { replace: true });
    } else {
      navigate(`/settings/${tab}`, { replace: true });
    }
  };

  const containerSx = { mt: 0 };
  if (isModal) {
    containerSx.border = "unset";
    containerSx.borderRadius = "unset";
  }

  return (
    <BasicContainerBox maxWidth="md" sx={containerSx} containerSx={containerSx} ignoreNewMargins={isModal}>
      <HeadTitle title={t("title")} />
      <Typography variant="h4" gutterBottom>
        {t("title")}
      </Typography>
      <Tabs
        value={selectedTab}
        onChange={(event, newValue) => setTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label={t("tabs.general.label")} value="general" />
        <Tab label={t("tabs.visual.label")} value="visual" />
        <Tab label={t("tabs.top_golden_list.label")} value="top-golden-list" />
        <Tab label={t("tabs.difficulty_colors.label")} value="difficulty-colors" />
      </Tabs>
      {selectedTab === "general" && <AppSettingsGeneralForm />}
      {selectedTab === "visual" && <AppSettingsVisualForm />}
      {selectedTab === "top-golden-list" && <AppSettingsTopGoldenListForm />}
      {selectedTab === "difficulty-colors" && <AppSettingsDifficultyColorsForm />}
    </BasicContainerBox>
  );
}

export function AppSettingsGeneralForm() {
  const { t } = useTranslation(undefined, { keyPrefix: "app_settings.tabs.general" });
  const { settings, setSettings } = useAppSettings();

  const form = useForm({
    defaultValues: settings.general,
  });
  const doSubmit = (data) => {
    setSettings({
      ...settings,
      general: {
        ...data,
      },
    });
  };

  useEffect(() => {
    const subscription = form.watch(form.handleSubmit(doSubmit));
    return () => subscription.unsubscribe();
  }, [form.handleSubmit, form.watch]);

  //April fools is the first of April
  const isAprilFools = new Date().getMonth() === 3 && new Date().getDate() === 1;

  return (
    <form>
      <SettingsEntry title={t("language")}>
        {/* We dont set the language to the regular app settings */}
        <Select fullWidth value={i18n.resolvedLanguage} onChange={(e) => i18n.changeLanguage(e.target.value)}>
          {LANGUAGES.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    minWidth: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                  }}
                >
                  <LanguageFlag code={lang.code} />
                </Box>
                {lang.name}
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </SettingsEntry>

      {(true || isAprilFools) && (
        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            document.body.style.animation = "spin 3s ease-in-out infinite";
            setTimeout(() => {
              document.body.style.animation = "";
            }, 3000);
          }}
        >
          Rotate Site
        </Button>
      )}
      <Footnote />
    </form>
  );
}

const testBackgrounds = [
  {
    name: "9D Cloud Room",
    file: "9d-cloom.png",
  },
  {
    name: "9D FGFG",
    file: "9d-fgfg.png",
  },
  {
    name: "9D Moonberry",
    file: "9d-mb.png",
  },
  {
    name: "Frank",
    file: "frank.png",
  },
  {
    name: "Frank 2",
    file: "frank-2.png",
  },
  {
    name: "Frank Wide",
    file: "frank-3.png",
  },
  {
    name: "Terry",
    file: "terry.png",
  },
  {
    name: "Banana Mountain",
    file: "banana.jpg",
  },
];
const backgroundsDark = [
  {
    name: "DMR",
    file: "dmr.jpg",
  },
  {
    name: "Void B-Side",
    file: "void-b.jpg",
  },
  {
    name: "Venus",
    file: "venus.jpg",
  },
  {
    name: "3L",
    file: "3l.jpg",
  },
  {
    name: "Glyph",
    file: "glyph.jpg",
  },
  {
    name: "Pumber",
    file: "pumber.jpg",
  },
  {
    name: "7D",
    file: "7d.jpg",
  },
  {
    name: "EHS-1",
    file: "ehs.jpg",
  },
  {
    name: "EHS-2",
    file: "ehs-2.jpg",
  },
  {
    name: "9BB",
    file: "9d.jpg",
  },
  {
    name: "Waterbear Mountain",
    file: "wountain.jpg",
  },
  {
    name: "SJ AHS",
    file: "ahs.png",
  },
  {
    name: "CG Dark",
    file: "cg-dark.png",
  },
];
const backgroundsLight = [
  {
    name: "Crystal Garden",
    file: "cg.png",
  },
  {
    name: "Farewell Golden",
    file: "fwg.jpg",
  },
  {
    name: "9D-2",
    file: "9d-2.png",
  },
  {
    name: "EHS-1",
    file: "ehs.jpg",
  },
  {
    name: "EHS-2",
    file: "ehs-2.jpg",
  },
];
export function AppSettingsVisualForm() {
  const { t } = useTranslation(undefined, { keyPrefix: "app_settings.tabs.visual" });
  const { t: t_b } = useTranslation(undefined, { keyPrefix: "app_settings.tabs.visual.background" });
  const { settings, setSettings } = useAppSettings();

  const form = useForm({
    defaultValues: settings.visual,
  });
  const doSubmit = (data) => {
    setSettings({
      ...settings,
      visual: {
        ...data,
      },
    });
  };

  useEffect(() => {
    if (form.watch("darkmode" !== settings.visual.darkmode)) {
      form.setValue("darkmode", settings.visual.darkmode, { shouldDirty: true });
    }
  }, [settings]);

  useEffect(() => {
    const subscription = form.watch(form.handleSubmit(doSubmit));
    return () => subscription.unsubscribe();
  }, [form.handleSubmit, form.watch]);

  return (
    <form>
      <Typography variant="h5">{t("name_colors.label")}</Typography>
      <SettingsEntry>
        <Controller
          name="playerNames.showColors"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              control={<Checkbox />}
              label={t("name_colors.show")}
            />
          )}
        />
      </SettingsEntry>
      <SettingsEntry>
        <Controller
          name="playerNames.preferSingleOverGradientColor"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              control={<Checkbox />}
              label={t("name_colors.prefer_solid_color")}
            />
          )}
        />
      </SettingsEntry>
      <SettingsEntry>
        <Controller
          name="playerNames.showOutline"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              control={<Checkbox />}
              label={t("name_colors.show_outline")}
            />
          )}
        />
      </SettingsEntry>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h5">{t_b("label")}</Typography>
      <SettingsEntry title={t_b("blur.label")} tooltip={t_b("blur.tooltip")}>
        <Controller
          name="background.blur"
          control={form.control}
          render={({ field }) => (
            <Slider
              value={field.value}
              onChange={(e, v) => field.onChange(v)}
              min={0}
              max={50}
              step={1}
              marks
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}px`}
            />
          )}
        />
      </SettingsEntry>

      <Typography variant="h6">{t_b("light_mode")}</Typography>
      <SettingsEntry title={t_b("label")}>
        <Controller
          name="background.light"
          control={form.control}
          render={({ field }) => (
            <TextField
              select
              fullWidth
              value={field.value}
              onChange={field.onChange}
              SelectProps={{
                MenuProps: { disableScrollLock: true },
              }}
            >
              <MenuItem value="">
                <em>{t_b("default")}</em>
              </MenuItem>
              {backgroundsLight.map((bg) => (
                <MenuItem key={bg.file} value={bg.file}>
                  {bg.name}
                </MenuItem>
              ))}
              <Divider />
              {testBackgrounds.map((bg) => (
                <MenuItem key={bg.file} value={bg.file}>
                  {bg.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </SettingsEntry>
      <SettingsEntry title={t_b("custom.label")} tooltip={t_b("custom.tooltip")}>
        <TextField
          fullWidth
          {...form.register("background.lightCustom")}
          placeholder={t_b("custom.placeholder")}
        />
      </SettingsEntry>

      <Typography variant="h6">{t_b("dark_mode")}</Typography>
      <SettingsEntry title={t_b("label")}>
        <Controller
          name="background.dark"
          control={form.control}
          render={({ field }) => (
            <TextField
              select
              fullWidth
              value={field.value}
              onChange={field.onChange}
              SelectProps={{
                MenuProps: { disableScrollLock: true },
              }}
            >
              <MenuItem value="">
                <em>{t_b("default")}</em>
              </MenuItem>
              {backgroundsDark.map((bg) => (
                <MenuItem key={bg.file} value={bg.file}>
                  {bg.name}
                </MenuItem>
              ))}
              <Divider />
              {testBackgrounds.map((bg) => (
                <MenuItem key={bg.file} value={bg.file}>
                  {bg.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </SettingsEntry>
      <SettingsEntry title={t_b("custom.label")} tooltip={t_b("custom.tooltip")}>
        <TextField
          fullWidth
          {...form.register("background.darkCustom")}
          placeholder={t_b("custom.placeholder")}
        />
      </SettingsEntry>

      <Footnote />
    </form>
  );
}

function AppSettingsTopGoldenListForm() {
  const { t } = useTranslation(undefined, { keyPrefix: "app_settings.tabs.top_golden_list" });
  const { settings, setSettings } = useAppSettings();

  const form = useForm({
    defaultValues: settings.visual,
  });
  const doSubmit = (data) => {
    setSettings({
      ...settings,
      visual: {
        ...data,
      },
    });
  };

  useEffect(() => {
    const subscription = form.watch(form.handleSubmit(doSubmit));
    return () => subscription.unsubscribe();
  }, [form.handleSubmit, form.watch]);

  return (
    <form>
      <SettingsEntry
        title={t("darken_colors.label")}
        tooltip={t("darken_colors.tooltip")}
        note={t("darken_colors.note")}
      >
        <Controller
          name="topGoldenList.darkenTierColors"
          control={form.control}
          render={({ field }) => (
            <Slider
              value={field.value}
              onChange={(e, v) => field.onChange(v)}
              min={0}
              max={100}
              step={5}
              marks
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}%`}
            />
          )}
        />
      </SettingsEntry>
      <SettingsEntry note={t("campaign_icons.note")}>
        <Controller
          name="topGoldenList.showCampaignIcons"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              control={<Checkbox />}
              label={t("campaign_icons.label")}
            />
          )}
        />
      </SettingsEntry>
      <SettingsEntry note={t("text_fc_icons.note")}>
        <Controller
          name="topGoldenList.useTextFcIcons"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              control={<Checkbox />}
              label={t("text_fc_icons.label")}
            />
          )}
        />
      </SettingsEntry>

      <SettingsEntry note={t("switch_order.note")}>
        <Controller
          name="topGoldenList.switchMapAndChallenge"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              control={<Checkbox />}
              label={t("switch_order.label")}
            />
          )}
        />
      </SettingsEntry>

      <SettingsEntry>
        <Controller
          name="topGoldenList.hideEmptyTiers"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              control={<Checkbox />}
              label={t("hide_empty_tiers")}
            />
          )}
        />
      </SettingsEntry>

      <Footnote />
    </form>
  );
}

function AppSettingsDifficultyColorsForm() {
  const { t } = useTranslation(undefined, { keyPrefix: "app_settings.tabs.difficulty_colors" });
  const { settings, setSettings } = useAppSettings();
  const [render, setRender] = useState(false);

  const form = useForm({
    defaultValues: settings.visual,
  });
  const doSubmit = (data) => {
    setSettings({
      ...settings,
      visual: {
        ...data,
      },
    });
  };

  useEffect(() => {
    const subscription = form.watch(form.handleSubmit(doSubmit));
    return () => subscription.unsubscribe();
  }, [form.handleSubmit, form.watch]);

  useEffect(() => {
    setTimeout(() => setRender(true), 300);
  }, []);

  const restorePreset = (preset) => {
    if (preset === 0) {
      //Default values
      form.setValue("difficultyColors", {
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
        13: "",
        14: "",
        15: "",
        16: "",
        17: "",
        18: "",
        19: "",
      });
    } else if (preset === 1) {
      //Protanopia
      form.setValue("difficultyColors", {
        1: "",
        2: "#f67dc9",
        3: "",
        4: "#a71802",
        5: "#d44d38",
        6: "#f28e7d",
        7: "#4c6603",
        8: "#abcf44",
        9: "#dbef9f",
        10: "#064e29",
        11: "#45a471",
        12: "#85ddad",
        13: "",
        14: "",
        15: "#232255",
        16: "",
        17: "",
        18: "",
        19: "",
      });
    }
  };

  const diffIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  if (!render) return <LoadingSpinner />;

  return (
    <form>
      <Typography variant="body2" color={(t) => t.palette.text.secondary}>
        {t("description")}
      </Typography>
      <Grid container rowSpacing={1} columnSpacing={2}>
        <Grid item xs={12} md={4} textAlign="center">
          <Typography variant="h6">{t("high")}</Typography>
        </Grid>
        <Grid item xs={12} md={4} textAlign="center">
          <Typography variant="h6">{t("mid")}</Typography>
        </Grid>
        <Grid item xs={12} md={4} textAlign="center">
          <Typography variant="h6">{t("low")}</Typography>
        </Grid>
      </Grid>
      <Grid container rowSpacing={1} columnSpacing={2}>
        {diffIds.map((id) => {
          if (id === 13) {
            return (
              <Grid item xs={12} md={12} key={id}>
                <Typography variant="h6">{t("t4+")}</Typography>
              </Grid>
            );
          }
          const width = id > 13 ? 6 : 4;
          return (
            <Grid item xs={12} md={width} key={id}>
              <Controller
                name={`difficultyColors.${id}`}
                control={form.control}
                render={({ field }) => (
                  <SettingsColorPicker id={id} value={field.value} onChange={field.onChange} />
                )}
              />
            </Grid>
          );
        })}
      </Grid>
      <Stack direction="row" gap={2} alignItems="center" sx={{ mt: 2 }}>
        <Typography variant="body1">{t("presets.label")}</Typography>
        <Button variant="outlined" onClick={() => restorePreset(0)}>
          {t("presets.default")}
        </Button>
      </Stack>
      <Stack direction="row" gap={2} alignItems="center" sx={{ mt: 2 }}>
        <Typography variant="body1">{t("presets.colorblind")}</Typography>
        <Button variant="outlined" onClick={() => restorePreset(1)}>
          {t("presets.protanopia")}
        </Button>
        <Button variant="outlined" onClick={() => {}} disabled>
          {t("presets.deuteranopia")}
        </Button>
        <Button variant="outlined" onClick={() => {}} disabled>
          {t("presets.tritanopia")}
        </Button>
      </Stack>
    </form>
  );
}
function SettingsColorPicker({ id, value, onChange }) {
  const { settings } = useAppSettings();

  const difficultyColors = getNewDifficultyColors(settings, id);

  return (
    <MuiColorInput
      format="hex"
      value={value === "" ? difficultyColors.color : value}
      fullWidth
      onChange={(color, colors) => onChange(colors.hex)}
      isAlphaHidden
      sx={{
        borderRadius: "4px",
        boxShadow: value !== "" ? "0 0 0 2px #ffff8e" : "none",
      }}
    />
  );
}

export function SettingsEntry({ title = "", tooltip, note, children, shiftNote = false }) {
  return (
    <Grid container columnSpacing={2} sx={{ mb: 1 }}>
      <Grid item xs={12} md={3} display="flex" alignItems="center" justifyContent="flex-start">
        {tooltip === undefined ? (
          <Typography>{title}</Typography>
        ) : (
          <Tooltip title={tooltip}>
            <Typography>
              {title} <FontAwesomeIcon icon={faInfoCircle} fontSize="1em" />
            </Typography>
          </Tooltip>
        )}
      </Grid>
      <Grid item xs={12} md={9} display="flex" alignItems="center">
        {children}
      </Grid>
      {note && (title === "" || shiftNote) && <Grid item xs={12} md={3} />}
      {note && (
        <Grid item xs={12} md={title === "" || shiftNote ? 9 : 12}>
          <Typography variant="body2" color={(t) => t.palette.text.secondary} sx={{ mb: 1 }}>
            {note}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}

function Footnote({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "app_settings" });
  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Typography variant="body2">
        <FontAwesomeIcon icon={faInfoCircle} /> {t("footnote")}
      </Typography>
    </>
  );
}
