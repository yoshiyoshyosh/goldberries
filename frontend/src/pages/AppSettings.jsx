import {
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Slider,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { BasicContainerBox, HeadTitle } from "../components/BasicComponents";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faSave } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSettings } from "../hooks/AppSettingsProvider";

export function PageAppSettings({ isModal = false }) {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(isModal ? "visual" : tab ?? "visual");

  const setTab = (tab) => {
    setSelectedTab(tab);
    if (isModal) return;

    if (tab === "visual") {
      navigate("/settings", { replace: true });
    } else {
      navigate(`/settings/${tab}`, { replace: true });
    }
  };

  return (
    <BasicContainerBox maxWidth="md" sx={{ mt: 0 }}>
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
      </Tabs>
      {/* {selectedTab === "general" && <AppSettingsGeneralForm />} */}
      {selectedTab === "visual" && <AppSettingsVisualForm />}
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
    name: "9D",
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

      <Typography variant="h5">Top Golden List</Typography>
      <SettingsEntry>
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

      <SettingsEntry>
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

      <Divider sx={{ my: 2 }} />
      <Typography variant="body2">
        <FontAwesomeIcon icon={faInfoCircle} /> Settings are saved automatically.
      </Typography>
    </form>
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
      {note && (
        <Grid item xs={12}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {note}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}
