import { Checkbox, Divider, FormControlLabel, Stack, Typography } from "@mui/material";
import { getQueryData, useGetTopGoldenList } from "../hooks/useApi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { useTheme } from "@emotion/react";
import { ErrorDisplay, LoadingSpinner } from "./BasicComponents";
import { getChallengeName, getChallengeNameClean, getDifficultyName } from "../util/data_util";
import { getNewDifficultyColors } from "../util/constants";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { CustomModal, ModalButtons } from "../hooks/useModal";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "@uidotdev/usehooks";

export function TimeTakenTiersGraphModal({ modalHook, id, filter, useSuggested = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.time_taken_graph" });
  const query = useGetTopGoldenList("player", id, filter);
  const data = getQueryData(query);
  return (
    <CustomModal
      modalHook={modalHook}
      maxWidth={false}
      actions={[ModalButtons.close]}
      options={{ title: t("title") }}
    >
      {query.isLoading && <LoadingSpinner />}
      {query.isError && <ErrorDisplay error={query.error} />}
      {query.isSuccess && <TimeTakenTiersGraph tgl={data} useSuggested={useSuggested} />}
    </CustomModal>
  );
}

function TimeTakenTiersGraph({ tgl, useSuggested }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.time_taken_graph" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const theme = useTheme();
  const { settings } = useAppSettings();
  const [scatter, setScatter] = useLocalStorage("tgl_stats_scatter", false);

  const hideEmpty = settings.visual.topGoldenList.hideEmptyTiers;

  //Goal: A horizontal bar chart. X-axis is the time taken for a challenge. Each bar on the y-axis represents a tier of difficulty.
  //The length of the bar represents the time span from the minimum time taken to the maximum time taken for that tier.
  //data: [{name: string, color: string, time_taken: [int, int]}]

  const dataBar = [];
  const dataScatter = [];

  //Step 1: flatten difficulties to ignore subtiers
  //tgl data format: { tiers: [{ id: 1, name: "High Tier 0"}, {...}, {...}, {...}, {...}, {...}, {...}, ...] }
  //Flatten difficulties to ignore subtiers
  //Rework: no longer necessary
  const difficulties = tgl.tiers;

  //Step 2: extract the time taken for each difficulty
  let diffFunction = (challenge) => challenge.difficulty_id;
  if (useSuggested) diffFunction = (challenge) => challenge.submissions[0].suggested_difficulty_id;

  difficulties.forEach((difficulty) => {
    //Filter the challenges from tgl.challenges, based on challenge.difficulty_id matching the current difficulty.id
    //Then, grab the time_taken from each challenge via challenge.submissions[0].time_taken (check for NULL)
    const time_taken = [];
    tgl.challenges.forEach((challenge) => {
      if (diffFunction(challenge) === difficulty.id && challenge.submissions[0].time_taken !== null) {
        if (challenge.map_id !== null) {
          challenge.map = tgl.maps[challenge.map_id];
          challenge.map.campaign = tgl.campaigns[challenge.map.campaign_id];
        } else if (challenge.campaign_id !== null) {
          challenge.campaign = tgl.campaigns[challenge.campaign_id];
        }

        let time_temp = challenge.submissions[0].time_taken;
        //time_taken is in seconds. convert to hours (max 1 decimal places)
        time_temp = Math.round((time_temp / 3600) * 10) / 10;
        dataScatter.push({
          difficulty: difficulty,
          tier: getDifficultyName(difficulty),
          challenge: challenge,
          name: getChallengeNameClean(challenge, t_g),
          time_taken: time_temp,
        });
        time_taken.push(time_temp);
      }
    });

    //If there are no challenges for this difficulty, skip it
    if (time_taken.length === 0 && hideEmpty) {
      return;
    }

    //Step 3: calculate the min and max time taken
    let min_time_taken = time_taken.length === 0 ? 0 : Math.min(...time_taken);
    const max_time_taken = time_taken.length === 0 ? 0 : Math.max(...time_taken);

    //If min === max, decreate min by 1% to make the bar visible
    let is_same = false;
    if (min_time_taken === max_time_taken) {
      is_same = true;
      min_time_taken = Math.max(min_time_taken - 0.3, 0);
      //Round to 1 decimal place again
      min_time_taken = Math.round(min_time_taken * 10) / 10;
    }

    //Step 4: add the difficulty to the data array
    dataBar.push({
      name: getDifficultyName(difficulty),
      color: getNewDifficultyColors(settings, difficulty.id, false).color,
      time_taken: [min_time_taken, max_time_taken],
      id: difficulty.id,
      is_same: is_same,
    });
  });

  //Reverse data array to display the highest tier at the bottom
  dataBar.reverse();

  return (
    <Stack direction="column" gap={1}>
      <FormControlLabel
        control={<Checkbox size="small" checked={scatter} onChange={(e) => setScatter(e.target.checked)} />}
        label={t("show_scatter")}
        sx={{ ml: 1 }}
      />
      {!scatter && (
        <>
          <Typography variant="body">{t("description")}</Typography>
          <ResponsiveContainer width="100%" height={600}>
            <BarChart
              data={dataBar}
              barCategoryGap="8%"
              layout="vertical"
              barGap={50}
              margin={{
                top: 20,
                right: 40,
                left: 10,
                bottom: 15,
              }}
            >
              <CartesianGrid strokeDasharray="2 8" vertical={false} />
              <XAxis
                type="number"
                domain={[(dataMin) => 0, "auto"]}
                unit="h"
                label={{
                  value: t("x_axis"),
                  position: "insideBottom",
                  offset: -10,
                  fill: theme.palette.text.primary,
                }}
                tick={{ fill: theme.palette.text.primary }}
              />
              <YAxis dataKey="name" type="category" tick={{ fill: theme.palette.text.primary }} />
              <Bar
                id="time-taken-tier-bar"
                dataKey="time_taken"
                fill={theme.palette.text.primary}
                label={(props) => {
                  return (
                    <text
                      x={props.x + props.width}
                      y={props.y + props.height / 2}
                      dx={10}
                      dy={5}
                      fill={props.fill}
                      fontSize={16}
                      textAnchor="start"
                    >
                      {dataBar[props.index].is_same ? (
                        dataBar[props.index].time_taken[0] === 0 ? (
                          <></>
                        ) : (
                          <>{dataBar[props.index].time_taken[0]}</>
                        )
                      ) : (
                        <>
                          {dataBar[props.index].time_taken[0]} ~ {dataBar[props.index].time_taken[1]}
                        </>
                      )}
                    </text>
                  );
                }}
              >
                {dataBar.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
      {scatter && (
        <>
          <Typography variant="body">{t("scatter_description")}</Typography>

          <ResponsiveContainer width="100%" height={600}>
            <ScatterChart
              margin={{
                top: 20,
                right: 40,
                left: 10,
                bottom: 15,
              }}
            >
              <CartesianGrid strokeDasharray="2 8" vertical={false} />
              <XAxis
                dataKey="time_taken"
                type="number"
                name={t("x_axis")}
                unit="h"
                tick={{ fill: theme.palette.text.primary }}
                label={{
                  value: t("x_axis"),
                  position: "insideBottom",
                  offset: -10,
                  fill: theme.palette.text.primary,
                }}
              />
              <YAxis
                dataKey="tier"
                type="category"
                allowDuplicatedCategory={false}
                tick={{ fill: theme.palette.text.primary }}
              />
              <ZAxis dataKey="name" type="category" range={[120, 121]} name="Challenge" />
              <Tooltip cursor={{ strokeDasharray: "2 8" }} />
              {difficulties.map((difficulty) => {
                const filteredData = dataScatter.filter((data) => data.difficulty.id === difficulty.id);
                return (
                  <Scatter
                    key={difficulty.id}
                    name={getDifficultyName(difficulty)}
                    data={filteredData}
                    fill={getNewDifficultyColors(settings, difficulty.id, false).color}
                  />
                );
              })}
            </ScatterChart>
          </ResponsiveContainer>
        </>
      )}
    </Stack>
  );
}
