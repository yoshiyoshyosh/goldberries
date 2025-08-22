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
import { faCheck, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { COLOR_PRESETS, useAppSettings } from "../hooks/AppSettingsProvider";
import { useLocalStorage } from "@uidotdev/usehooks";
import { MuiColorInput } from "mui-color-input";
import { DIFFICULTIES, getDifficultiesSorted, getNewDifficultyColors } from "../util/constants";
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
                    minWidth: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                  }}
                >
                  <LanguageFlag code={lang.code} height="32" />
                </Box>
                {lang.name}
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </SettingsEntry>

      <Divider sx={{ mt: 2, mb: 1 }} />

      <SettingsEntry note={t("golden_changes.note")}>
        <Controller
          name="alwaysShowGoldenChanges"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              control={<Checkbox />}
              label={t("golden_changes.label")}
            />
          )}
        />
      </SettingsEntry>

      {false && (
        <SettingsEntry note={t("old_tier_names.note")}>
          <Controller
            name="showOldTierNames"
            control={form.control}
            render={({ field }) => (
              <FormControlLabel
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                control={<Checkbox />}
                label={t("old_tier_names.label")}
              />
            )}
          />
        </SettingsEntry>
      )}

      <SettingsEntry note={t("show_fractional_tiers.note")}>
        <Controller
          name="showFractionalTiers"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              control={<Checkbox />}
              label={t("show_fractional_tiers.label")}
            />
          )}
        />
      </SettingsEntry>

      {isAprilFools && (
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
  {
    name: "Zenith's Descent",
    file: "zescent.png",
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

      <SettingsEntry note={t("hide_time_taken_column.note")}>
        <Controller
          name="topGoldenList.hideTimeTakenColumn"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              control={<Checkbox />}
              label={t("hide_time_taken_column.label")}
            />
          )}
        />
      </SettingsEntry>

      <SettingsEntry note={t("show_fractional_tiers.note")}>
        <Controller
          name="topGoldenList.showFractionalTiers"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              control={<Checkbox />}
              label={t("show_fractional_tiers.label")}
            />
          )}
        />
      </SettingsEntry>

      <SettingsEntry note={t("unstack_tiers.note")}>
        <Controller
          name="topGoldenList.unstackTiers"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              control={<Checkbox />}
              label={t("unstack_tiers.label")}
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
  const [hasExported, setHasExported] = useState(false);

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

  const restorePreset = (index) => {
    const preset = COLOR_PRESETS[index];
    form.setValue("difficultyColors", preset.colors);
  };

  const exportToClipboard = () => {
    const copy = JSON.stringify(settings.visual.difficultyColors);
    navigator.clipboard.writeText(copy);
    setHasExported(true);
    setTimeout(() => setHasExported(false), 3000);
  };
  const importFromClipboard = () => {
    navigator.clipboard.readText().then((text) => {
      console.log("Read from clipboard:", text);
      try {
        const data = JSON.parse(text);
        form.setValue("difficultyColors", data);
      } catch (e) {
        console.error(e);
      }
    });
  };

  if (!render) return <LoadingSpinner />;

  return (
    <form>
      {getDifficultiesSorted().map((diff) => {
        let name = diff.name;
        return (
          <Grid container rowSpacing={1} columnSpacing={2} key={diff.id} sx={{ mt: 0 }}>
            <Grid item xs={12} md={2} display="flex" alignItems="center" justifyContent="space-around">
              <Stack direction="column" alignItems="center" justifyContent="center" gap={0}>
                <Typography variant="body1">{name}</Typography>
                {settings.general.showOldTierNames && false && (
                  <Typography
                    variant="body2"
                    color={(t) => t.palette.text.secondary}
                    sx={{ fontSize: ".7em" }}
                  >
                    ({diff.old_name})
                  </Typography>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={10}>
              <Controller
                name={`difficultyColors.${diff.id}`}
                control={form.control}
                render={({ field }) => (
                  <SettingsColorPicker id={diff.id} value={field.value} onChange={field.onChange} />
                )}
              />
            </Grid>
          </Grid>
        );
      })}
      <Stack direction="row" gap={2} alignItems="center" sx={{ mt: 2 }}>
        <Typography variant="body1">{t("presets.label")}</Typography>
        {COLOR_PRESETS.map((preset, index) => (
          <Button
            key={index}
            variant="outlined"
            onClick={() => restorePreset(index)}
            disabled={preset.disabled}
          >
            {preset.name}
          </Button>
        ))}
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" gap={2} alignItems="center" sx={{ mt: 2 }}>
        <Typography variant="body1">{t("export.label")}</Typography>
        <Button
          variant="outlined"
          onClick={exportToClipboard}
          color={hasExported ? "success" : "primary"}
          startIcon={hasExported ? <FontAwesomeIcon icon={faCheck} size="sm" /> : undefined}
        >
          {t(hasExported ? "export.export_success" : "export.export")}
        </Button>
        <Button variant="outlined" onClick={importFromClipboard}>
          {t("export.import")}
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
