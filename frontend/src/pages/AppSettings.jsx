import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Slider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { BasicContainerBox, HeadTitle, LoadingSpinner } from "../components/BasicComponents";
import { Controller, set, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { useLocalStorage } from "@uidotdev/usehooks";
import { MuiColorInput } from "mui-color-input";
import { getNewDifficultyColors } from "../util/constants";

export function PageAppSettings({ isModal = false }) {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useLocalStorage("settings_tab", "visual");

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
    <BasicContainerBox maxWidth="md" sx={containerSx} containerSx={containerSx}>
      <HeadTitle title="Settings" />
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Tabs
        value={selectedTab}
        onChange={(event, newValue) => setTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {/* <Tab label="General" value="general" /> */}
        <Tab label="Visual" value="visual" />
        <Tab label="Top Golden list" value="top-golden-list" />
        <Tab label="Difficulty Colors" value="difficulty-colors" />
      </Tabs>
      {/* {selectedTab === "general" && <AppSettingsGeneralForm />} */}
      {selectedTab === "visual" && <AppSettingsVisualForm />}
      {selectedTab === "top-golden-list" && <AppSettingsTopGoldenListForm />}
      {selectedTab === "difficulty-colors" && <AppSettingsDifficultyColorsForm />}
    </BasicContainerBox>
  );
}

export function AppSettingsGeneralForm() {
  const { settings, setSettings } = useAppSettings();

  const form = useForm({
    defaultValues: settings.general,
  });

  return (
    <form>
      <Divider sx={{ my: 2 }} />
      <Typography variant="body2">
        <FontAwesomeIcon icon={faInfoCircle} /> Settings are saved automatically.
      </Typography>
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
      <Typography variant="h5">Player Name Colors</Typography>
      <SettingsEntry>
        <Controller
          name="playerNames.showColors"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              control={<Checkbox />}
              label="Show Player Name Colors"
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
              label="Prefer Solid Color Over Gradient Color"
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
              label="Show Outline"
            />
          )}
        />
      </SettingsEntry>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h5">Background</Typography>
      <SettingsEntry title="Background Blur" tooltip="Guassian Blur applied to the background">
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

      <Typography variant="h6">Light Mode</Typography>
      <SettingsEntry title="Background">
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
                <em>Default Background</em>
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
      <SettingsEntry title="Custom Background" tooltip="If set, replaces the selected background from above">
        <TextField fullWidth {...form.register("background.lightCustom")} placeholder="URL to image" />
      </SettingsEntry>

      <Typography variant="h6">Dark Mode</Typography>
      <SettingsEntry title="Background">
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
                <em>Default Background</em>
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
      <SettingsEntry title="Custom Background" tooltip="If set, replaces the selected background from above">
        <TextField fullWidth {...form.register("background.darkCustom")} placeholder="URL to image" />
      </SettingsEntry>

      <Divider sx={{ my: 2 }} />
      <Typography variant="body2">
        <FontAwesomeIcon icon={faInfoCircle} /> Settings are saved automatically.
      </Typography>
    </form>
  );
}

function AppSettingsTopGoldenListForm() {
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
        title="Darken Tier Colors"
        tooltip="In dark-mode, makes the tier colors darker. 0% doesn't change the colors, 100% makes them entirely black."
        note="This setting only affects the dark-mode colors!"
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
      <SettingsEntry note="Hides the popular campaign's icons, such as SJ, SC, D-Sides...">
        <Controller
          name="topGoldenList.showCampaignIcons"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              control={<Checkbox />}
              label="Show Campaign Icons"
            />
          )}
        />
      </SettingsEntry>
      <SettingsEntry note="This will replace the flag icons with [C], [FC] and [C/FC] 'icons'">
        <Controller
          name="topGoldenList.useTextFcIcons"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              control={<Checkbox />}
              label="Use Text FC Icons"
            />
          )}
        />
      </SettingsEntry>

      <SettingsEntry note="Switches from 'Segment Name [Map Name]' to 'Map Name [Segment Name]' format">
        <Controller
          name="topGoldenList.switchMapAndChallenge"
          control={form.control}
          render={({ field }) => (
            <FormControlLabel
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              control={<Checkbox />}
              label="Switch Map and Challenge"
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
              label="Hide Empty Tiers"
            />
          )}
        />
      </SettingsEntry>

      <Divider sx={{ my: 2 }} />
      <Typography variant="body2">
        <FontAwesomeIcon icon={faInfoCircle} /> Settings are saved automatically.
      </Typography>
    </form>
  );
}

function AppSettingsDifficultyColorsForm() {
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
    }
  };

  const diffIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  if (!render) return <LoadingSpinner />;

  return (
    <form>
      <Typography variant="body2" color={(t) => t.palette.text.secondary}>
        High and Low subtier colors are calculated based on the Mid color. You can overwrite this by
        explicitly setting the High and Low subtier colors.
      </Typography>
      <Grid container rowSpacing={1} columnSpacing={2}>
        <Grid item xs={12} md={4} textAlign="center">
          <Typography variant="h6">High</Typography>
        </Grid>
        <Grid item xs={12} md={4} textAlign="center">
          <Typography variant="h6">Mid</Typography>
        </Grid>
        <Grid item xs={12} md={4} textAlign="center">
          <Typography variant="h6">Low</Typography>
        </Grid>
      </Grid>
      <Grid container rowSpacing={1} columnSpacing={2}>
        {diffIds.map((id) => {
          if (id === 13) {
            return (
              <Grid item xs={12} md={12} key={id}>
                <Typography variant="h6">Tier 4+ (no subtiers)</Typography>
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
        <Typography variant="body1">Presets:</Typography>
        <Button variant="outlined" onClick={() => restorePreset(0)}>
          Default
        </Button>
      </Stack>
      <Stack direction="row" gap={2} alignItems="center" sx={{ mt: 2 }}>
        <Typography variant="body1">Colorblindness Presets:</Typography>
        <Button variant="outlined" onClick={() => {}} disabled>
          Protanopia
        </Button>
        <Button variant="outlined" onClick={() => {}} disabled>
          Deuteranopia
        </Button>
        <Button variant="outlined" onClick={() => {}} disabled>
          Tritanopia
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

function SettingsEntry({ title = "", tooltip, note, children }) {
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
      {note && title === "" && <Grid item xs={12} md={3} />}
      {note && (
        <Grid item xs={12} md={title === "" ? 9 : 12}>
          <Typography variant="body2" color={(t) => t.palette.text.secondary} sx={{ mb: 1 }}>
            {note}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}
