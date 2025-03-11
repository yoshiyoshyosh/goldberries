import { faPalette } from "@fortawesome/free-solid-svg-icons";
import {
  Checkbox,
  FormControlLabel,
  Grid,
  Slider,
  Stack,
  Tab,
  Tabs,
  Typography,
  darken,
} from "@mui/material";
import { BasicContainerBox, HeadTitle } from "../components/BasicComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import Color from "color";
import { getNewDifficultyColors } from "../util/constants";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { ErrorBoundary } from "../components/ErrorBoundary";

const tabs = [{ name: "new-colors", label: "New Tier Colors", icon: faPalette, component: <NewColorsTab /> }];

export function PageTest({}) {
  const { tab } = useParams();
  const [selectedTab, setSelectedTab] = useState(tab || tabs[0].name);
  const navigate = useNavigate();

  const setTab = (tab) => {
    setSelectedTab(tab);
    if (tab === tabs[0].name) {
      navigate("/test", { replace: true });
    } else {
      navigate(`/test/${tab}`, { replace: true });
    }
  };

  const selectedComponent = tabs.find((t) => t.name === selectedTab).component;

  return (
    <BasicContainerBox maxWidth="lg">
      <HeadTitle title="Test Page" />
      <Tabs
        value={selectedTab}
        onChange={(e, tab) => setTab(tab)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: "1px solid grey", mb: 2 }}
      >
        {tabs.map((t) => (
          <Tab
            key={t.name}
            value={t.name}
            label={t.label}
            icon={<FontAwesomeIcon icon={t.icon} size="sm" />}
            iconPosition="end"
            sx={{ minHeight: "40px" }}
          />
        ))}
      </Tabs>
      <ErrorBoundary>{selectedComponent}</ErrorBoundary>
    </BasicContainerBox>
  );
}

function NewColorsTab({}) {
  const { settings } = useAppSettings();
  const difficulties = Array.from({ length: 26 }, (_, i) => i - 1);
  const [darkenBy, setDarkenBy] = useState(0.55);
  const [hueStart, setHueStart] = useState(250);
  const [huePerStep, setHuePerStep] = useState(-15);
  const [lightStart, setLightStart] = useState(70);
  const [lightPerStep, setLightPerStep] = useState(-0.25);
  const [saturation, setSaturation] = useState(100);
  const [gap, setGap] = useState(false);

  console.log(difficulties);
  const getColor = (difficulty) => {
    const color = new Color({
      h: getDifficultyHue(difficulty, hueStart, huePerStep),
      s: saturation,
      l: getDifficultyLightness(difficulty, lightStart, lightPerStep),
    });
    return color;
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Color playground for new Tier colors
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} alignItems="center" justifyContent="space-around" display="flex">
          <Stack direction="column" gap={1} sx={{ width: "100%" }}>
            <Stack direction="row" gap={3} alignItems="center">
              <Slider
                value={hueStart}
                onChange={(_, value) => setHueStart(value)}
                min={0}
                max={360}
                step={1}
                style={{ width: "300px" }}
              />
              <Typography variant="body2">Starting Hue ({hueStart}°)</Typography>
            </Stack>
            <Stack direction="row" gap={3} alignItems="center">
              <Slider
                value={huePerStep}
                onChange={(_, value) => setHuePerStep(value)}
                min={-30}
                max={0}
                step={0.25}
                style={{ width: "300px" }}
              />
              <Typography variant="body2">Hue Per Step ({huePerStep}°)</Typography>
            </Stack>
            <Stack direction="row" gap={3} alignItems="center">
              <Slider
                value={lightStart}
                onChange={(_, value) => setLightStart(value)}
                min={0}
                max={100}
                step={0.5}
                style={{ width: "300px" }}
              />
              <Typography variant="body2">Starting Lightness ({lightStart.toFixed(0)}%)</Typography>
            </Stack>
            <Stack direction="row" gap={3} alignItems="center">
              <Slider
                value={lightPerStep}
                onChange={(_, value) => setLightPerStep(value)}
                min={-2}
                max={2}
                step={0.01}
                style={{ width: "300px" }}
              />
              <Typography variant="body2">Lightness Per Step ({lightPerStep.toFixed(2)}%)</Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={6} alignItems="center" justifyContent="space-around" display="flex">
          <Stack direction="column" gap={1} sx={{ width: "100%" }}>
            <Stack direction="row" gap={3} alignItems="center">
              <FormControlLabel
                control={<Checkbox />}
                checked={gap}
                onChange={(_, value) => setGap(value)}
                label="Show Gap"
              />
            </Stack>
            <Stack direction="row" gap={3} alignItems="center">
              <Slider
                value={saturation}
                onChange={(_, value) => setSaturation(value)}
                min={0}
                max={100}
                step={1}
                style={{ width: "300px" }}
              />
              <Typography variant="body2">Saturation ({saturation.toFixed(0)}%)</Typography>
            </Stack>
            <Stack direction="row" gap={3} alignItems="center">
              <Slider
                value={darkenBy}
                onChange={(_, value) => setDarkenBy(value)}
                min={0}
                max={1}
                step={0.01}
                style={{ width: "300px" }}
              />
              <Typography variant="body2">With Darkening ({(darkenBy * 100).toFixed(0)}%)</Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
      <Stack direction="column" gap={gap ? 0.5 : 0}>
        {difficulties.map((sort) => {
          const color = getColor(sort);
          const contrast =
            color.contrast(new Color("#000000")) > color.contrast(new Color("#ffffff"))
              ? "#000000"
              : "#ffffff";
          const darkened = new Color(darken(color.hex(), darkenBy));
          const darkenedContrast =
            darkened.contrast(new Color("#000000")) > darkened.contrast(new Color("#ffffff"))
              ? "#000000"
              : "#ffffff";

          let hasOld = getDifficultyId(sort) !== undefined;
          const oldColor = hasOld
            ? getNewDifficultyColors(settings, getDifficultyId(sort), false).color
            : "#ffffff00";
          const oldContrast = hasOld
            ? getNewDifficultyColors(settings, getDifficultyId(sort), false).contrast_color
            : "#ffffff";
          return (
            <Grid container key={sort} spacing={1}>
              <Grid item xs={4}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    backgroundColor: oldColor,
                    width: "100%",
                    height: "25px",
                  }}
                >
                  {hasOld && (
                    <Typography variant="body2" color={oldContrast}>
                      {getName(sort)} ({sort}) -&gt; {oldColor}
                    </Typography>
                  )}
                </div>
              </Grid>
              <Grid item xs={4}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    backgroundColor: color.string(),
                    width: "100%",
                    height: "25px",
                  }}
                >
                  <Typography variant="body2" color={contrast}>
                    {getName(sort)} ({sort}) -&gt; {color.string(2)}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={4}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    backgroundColor: darkened.string(),
                    width: "100%",
                    height: "25px",
                  }}
                >
                  <Typography variant="body2" color={darkenedContrast}>
                    {sort} -&gt; {darkened.hex()}
                  </Typography>
                </div>
              </Grid>
            </Grid>
          );
        })}
      </Stack>
    </>
  );
}

const SORT_TO_HUE = {
  1: 240,
  2: 225,
  3: 210,
  4: 190,
  5: 165,
  6: 140,
  7: 120,
  8: 100,
  9: 85,
  10: 70,
  11: 60,
  12: 50,
  13: 40,
  14: 30,
  15: 20,
  16: 10,
  17: 0,
  18: 350,
  19: 335,
  20: 320,
  21: 300,
  22: 285,
  23: 270,
  24: 255,
};
function getDifficultyHue(sort, hueStart, huePerStep) {
  if (sort <= 0) {
    //White
    return 0;
  }
  // return SORT_TO_HUE[sort];
  const hue = hueStart + huePerStep * (sort - 1);
  return hue < 0 ? 360 + hue : hue;
}

function getDifficultyLightness(sort, lightStart, lightPerStep) {
  if (sort <= 0) {
    //White
    return 100;
  }

  const light = lightStart + lightPerStep * sort;
  return light < 0 ? 0 : light > 100 ? 100 : light;
}

const SORT_TO_NAME = {
  "-1": "Undetermined",
  0: "Trivial",
  1: "Low Standard",
  2: "Mid Standard",
  3: "High Standard",
  4: "Tier 7",
  5: "Tier 6",
  6: "Tier 5",
  7: "Tier 4",
  8: "Low Tier 3",
  9: "Mid Tier 3",
  10: "High Tier 3",
  11: "Low Tier 2",
  12: "Mid Tier 2",
  13: "High Tier 2",
  14: "Low Tier 1",
  15: "Mid Tier 1",
  16: "High Tier 1",
  17: "Low Tier 0",
  18: "Mid Tier 0",
  19: "High Tier 0",
};

function getName(sort) {
  return SORT_TO_NAME[sort];
}

const SORT_TO_ID = {
  "-1": 19,
  0: 20,
  1: 21,
  2: 18,
  3: 22,
  4: 17,
  5: 16,
  6: 15,
  7: 14,
  8: 12,
  9: 11,
  10: 10,
  11: 9,
  12: 8,
  13: 7,
  14: 6,
  15: 5,
  16: 4,
  17: 3,
  18: 2,
  19: 1,
};

function getDifficultyId(sort) {
  return SORT_TO_ID[sort];
}
