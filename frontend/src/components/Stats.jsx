import { Chip, Divider, Grid, Stack, Typography, useMediaQuery } from "@mui/material";
import { getNewDifficultyColors } from "../util/constants";
import { getDifficultyName } from "../util/data_util";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { useState } from "react";
import { DifficultyChip } from "./GoldberriesComponents";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { useTranslation } from "react-i18next";
import { useTheme } from "@emotion/react";

export function SuggestedDifficultyChart({ challenge }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.stats" });
  const { settings } = useAppSettings();

  const difficultyCounts = getSuggestedDifficultyCounts(challenge);
  const datasets = [];
  if (challenge.requires_fc || !challenge.has_fc) {
    //Take only the combined counts
    datasets.push({
      label: undefined, //Don't show a label if theres only 1 type of submission
      data: difficultyCounts.combined,
    });
  } else {
    //Take both fc and c counts
    datasets.push({
      label: "Clear",
      data: difficultyCounts.c,
    });
    datasets.push({
      label: "Full Clear",
      data: difficultyCounts.fc,
    });
  }

  const dataTransformed = datasets.map((dataset) => {
    return Object.entries(dataset.data).map(([id, data]) => {
      const { difficulty, count } = data;
      return {
        id: difficulty.id,
        value: count,
        label: getDifficultyName(difficulty),
        arcLabel: difficulty.subtier
          ? difficulty.subtier.charAt(0).toUpperCase() + difficulty.subtier.slice(1)
          : "",
        color: getNewDifficultyColors(settings, difficulty.id).color,
        difficulty: difficulty,
      };
    });
  });

  dataTransformed.forEach((data) => {
    //Sort by difficulty.sort DESC
    data.sort((a, b) => a.difficulty.sort - b.difficulty.sort);
  });

  const width = dataTransformed.length === 1 ? 12 : 6;

  return (
    <Grid container spacing={1}>
      {dataTransformed.map((data, i) => (
        <Grid item key={i} xs={12} md={width}>
          {data.length === 0 ? (
            <Stack direction="column" gap={1} alignItems="center">
              {datasets[i].label && <Chip label={datasets[i].label} size="small" />}
              <Typography variant="body2" key={i + "-label"}>
                {t("no_suggestions_yet")}
              </Typography>
            </Stack>
          ) : (
            <SuggestedDifficultyPieChartWithLabel key={i} data={data} label={datasets[i].label} />
          )}
        </Grid>
      ))}
    </Grid>
  );
}

function SuggestedDifficultyPieChartWithLabel({ data, label }) {
  const [spin, setSpin] = useState(false);
  const startSpin = () => {
    if (spin) return;
    setSpin(true);
    setTimeout(() => setSpin(false), 3000);
  };

  return (
    <Stack direction="column" gap={1} alignItems="center" sx={{ width: "100%" }}>
      {label && <Chip label={label} size="small" />}
      <PieChart
        series={[
          {
            arcLabel: (item) => `${item.label}`,
            arcLabelMinAngle: 60,
            data: data,
            innerRadius: 25,
            cornerRadius: 5,
            paddingAngle: 2,
            highlightScope: { faded: "global", highlighted: "item" },
            faded: { innerRadius: 30, additionalRadius: -10, color: "gray" },
          },
        ]}
        slotProps={{
          legend: {
            hidden: true,
          },
        }}
        margin={{ right: 0 }}
        sx={{
          "& > g > g > g": { animation: spin ? "spin 3s ease-in-out infinite" : "" },
          [`& .${pieArcLabelClasses.root}`]: {
            fill: "black",
          },
        }}
        height={300}
        onClick={startSpin}
      />
    </Stack>
  );
}

export function SuggestedDifficultyTierCounts({
  challenge,
  sx,
  direction = "row",
  nowrap = true,
  hideIfEmpty = false,
  stackGrid = false,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.stats" });
  const theme = useTheme();
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));

  const difficultyCounts = getSuggestedDifficultyCounts(challenge);
  const datasets = [];

  if (challenge.requires_fc || !challenge.has_fc) {
    //Take only the combined counts
    datasets.push({ label: undefined, data: difficultyCounts.combined });
  } else {
    //Take both fc and c counts
    datasets.push({ label: "Clear", data: difficultyCounts.c });
    datasets.push({ label: "Full Clear", data: difficultyCounts.fc });
  }

  const dataTransformed = datasets.map((dataset) => {
    return Object.entries(dataset.data).map(([id, data]) => {
      const { difficulty, count } = data;
      return {
        id: difficulty.id,
        value: count,
        label: getDifficultyName(difficulty),
        difficulty: difficulty,
      };
    });
  });

  dataTransformed.forEach((data) => {
    data.sort((a, b) => b.difficulty.sort - a.difficulty.sort);
  });

  const width = dataTransformed.length === 1 || stackGrid ? 12 : 6;
  const showLabel = direction === "column" || (!isMdScreen && dataTransformed.length > 1);

  return (
    <Grid container spacing={1}>
      {dataTransformed.map((data, i) => (
        <>
          {i === 1 && stackGrid && (
            <Grid item xs={12}>
              <Divider key={i + "-divider"} sx={{ my: 1 }} />
            </Grid>
          )}
          <Grid item key={i} xs={12} md={width}>
            <Stack direction={direction} flexWrap="wrap" gap={2} sx={sx} alignItems="center">
              {showLabel && datasets[i].label && <Chip label={datasets[i].label} size="small" />}
              {data.length === 0 && !hideIfEmpty && (
                <Typography variant="body2" whiteSpace={nowrap ? "nowrap" : "initial"}>
                  {t("no_suggestions_yet")}
                </Typography>
              )}
              {data.map((diff) => (
                <Stack key={diff.difficulty.id} direction="row" spacing={1}>
                  <Typography variant="body1">{diff.value}x</Typography>
                  <DifficultyChip difficulty={diff.difficulty} />
                </Stack>
              ))}
            </Stack>
          </Grid>
        </>
      ))}
    </Grid>
  );
}

function getSuggestedDifficultyCounts(challenge) {
  //Input: challenge.submissions with possibly null suggested_difficulty
  //Output: { c: { <id>: <count> }, fc: { <id>: <count> }, combined: { <id>: <count> } }
  //If challenge.has_fc, then populate c, fc and combined fields, based on challenge.submissions[i].is_fc
  //If challenge.requires_fc, then populate only fc and combined fields. all submissions are guaranteed to have is_fc = true
  //If neither, then populate only c and combined fields. all submissions are guaranteed to have is_fc = false

  let suggestingSubmissions = challenge.submissions.filter(
    (submission) => submission.suggested_difficulty !== null && !submission.is_personal
  );

  let counts = { c: {}, fc: {}, combined: {} };

  suggestingSubmissions.forEach((submission) => {
    let diff = submission.suggested_difficulty;
    let key = submission.is_fc ? "fc" : "c";
    if (counts[key][diff.id] === undefined) {
      counts[key][diff.id] = { difficulty: diff, count: 1 };
    } else {
      counts[key][diff.id].count += 1;
    }
    if (counts.combined[diff.id] === undefined) {
      counts.combined[diff.id] = { difficulty: diff, count: 1 };
    } else {
      counts.combined[diff.id].count += 1;
    }
  });

  return counts;
}
