import { Chip, Stack, Typography } from "@mui/material";
import { getDifficultyColors } from "../util/constants";
import { getDifficultyName } from "../util/data_util";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { useState } from "react";
import { DifficultyChip } from "./GoldberriesComponents";

export function SuggestedDifficultyChart({ challenge }) {
  const [spin, setSpin] = useState(false);

  let allSuggestedDiffs = challenge.submissions.map((submission) => submission.suggested_difficulty);
  allSuggestedDiffs = allSuggestedDiffs.filter((diff) => diff !== null);

  const difficulties = {}; // count of each difficulty
  allSuggestedDiffs.forEach((diff) => {
    if (difficulties[diff.id] === undefined) {
      difficulties[diff.id] = {
        id: diff.id,
        value: 1,
        label: getDifficultyName(diff),
        arcLabel: diff.subtier ? diff.subtier.charAt(0).toUpperCase() + diff.subtier.slice(1) : "",
      };
    } else {
      difficulties[diff.id].value += 1;
    }
  });
  const data = Object.entries(difficulties).map(([id, value]) => {
    return {
      id: id,
      value: value.value,
      label: value.label,
      arcLabel: value.arcLabel,
      color: getDifficultyColors(id).group_color,
    };
  });
  //Sort by difficulty.sort DESC
  data.sort((a, b) => b.id - a.id);

  const startSpin = () => {
    if (spin) return;
    setSpin(true);
    setTimeout(() => setSpin(false), 3000);
  };

  return (
    <>
      {allSuggestedDiffs.length === 0 ? (
        <Typography variant="body2">No difficulty suggestions</Typography>
      ) : (
        <PieChart
          series={[
            {
              arcLabel: (item) => `${item.label}`,
              arcLabelMinAngle: 60,
              data: data,
              innerRadius: 25,
              outerRadius: 150,
              cornerRadius: 5,
              paddingAngle: 2,
              cx: 150,
              highlightScope: { faded: "global", highlighted: "item" },
              faded: { innerRadius: 30, additionalRadius: -10, color: "gray" },
            },
          ]}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
          sx={{
            animation: spin ? "spin 3s ease-in-out infinite" : "",
            [`& .${pieArcLabelClasses.root}`]: {
              fill: "white",
              fontWeight: "bold",
            },
          }}
          height={300}
          width={310}
          onClick={startSpin}
        />
      )}
    </>
  );
}

export function SuggestedDifficultyTierCounts({
  challenge,
  sx,
  direction = "row",
  nowrap = true,
  useSubtierColors = false,
}) {
  let allSuggestedDiffs = challenge.submissions.map((submission) => submission.suggested_difficulty);
  allSuggestedDiffs = allSuggestedDiffs.filter((diff) => diff !== null);

  const difficulties = {}; // count of each difficulty
  allSuggestedDiffs.forEach((diff) => {
    if (difficulties[diff.id] === undefined) {
      difficulties[diff.id] = {
        difficulty: diff,
        value: 1,
      };
    } else {
      difficulties[diff.id].value += 1;
    }
  });
  //Sort difficulties by count DESC
  const sortedDifficulties = Object.entries(difficulties).map(([id, value]) => {
    return {
      difficulty: value.difficulty,
      value: value.value,
    };
  });
  sortedDifficulties.sort((a, b) => b.value - a.value);

  return (
    <Stack direction={direction} flexWrap="wrap" gap={2} sx={sx} alignItems="center">
      {sortedDifficulties.length === 0 && (
        <Typography variant="body2" whiteSpace={nowrap ? "nowrap" : "initial"}>
          No suggestions yet.
        </Typography>
      )}
      {sortedDifficulties.map((diff) => (
        <Stack key={diff.difficulty.id} direction="row" spacing={1}>
          <Typography variant="body1">{diff.value}x</Typography>
          <DifficultyChip difficulty={diff.difficulty} useSubtierColors={useSubtierColors} />
        </Stack>
      ))}
    </Stack>
  );
}
