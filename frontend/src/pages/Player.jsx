import { Box, Divider, Stack, Typography } from "@mui/material";
import {
  BasicContainerBox,
  ErrorDisplay,
  LoadingSpinner,
  getErrorFromMultiple,
} from "../components/BasicComponents";
import { useAuth } from "../hooks/AuthProvider";
import { getQueryData, useGetAllDifficulties, useGetPlayer, useGetPlayerStats } from "../hooks/useApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { Link, useParams } from "react-router-dom";
import { TopGoldenList } from "../components/TopGoldenList";
import { AdminIcon, SuspendedIcon, VerifierIcon } from "../components/GoldberriesComponents";
import { RecentSubmissions } from "./Index";
import { BarChart } from "@mui/x-charts/BarChart";
import { DIFFICULTY_COLORS } from "../util/constants";
import { getDifficultyName } from "../util/data_util";

export function PagePlayer() {
  const { id, tab } = useParams();

  if (tab === "top-golden-list") {
    return <PagePlayerTopGoldenList id={id} />;
  }

  return (
    <BasicContainerBox maxWidth="md">
      <PlayerDisplay id={parseInt(id)} tab={tab} />
    </BasicContainerBox>
  );
}

export function PlayerDisplay({ id }) {
  const query = useGetPlayer(id);
  const statsQuery = useGetPlayerStats(id);

  if (query.isLoading || statsQuery.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError || statsQuery.isError) {
    const error = getErrorFromMultiple(query, statsQuery);
    return <ErrorDisplay error={error} />;
  }

  const player = getQueryData(query);
  const suspended = player.account.is_suspended;
  const stats = getQueryData(statsQuery);

  return (
    <>
      <Stack direction="row" alignItems="center" gap={1}>
        <FontAwesomeIcon icon={faUser} size="2x" />
        <Typography
          variant="h6"
          sx={{
            textDecoration: suspended ? "line-through" : "inherit",
            color: suspended ? "grey" : "inherit",
          }}
        >
          {player.name}
        </Typography>
        {player.account.is_suspended && <SuspendedIcon reason={player.account.suspension_reason} />}
        <Box flexGrow={1} />
        {player.account.is_verifier && <VerifierIcon />}
        {player.account.is_admin && <AdminIcon />}
      </Stack>
      <ul>
        <li>
          <Link to={`/player/${id}/top-golden-list`}>Top Golden List</Link>
        </li>
      </ul>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h5">Player Stats</Typography>
      <DifficultyCountChart difficulty_counts={stats.count_by_difficulty} />
      <Divider sx={{ my: 2 }} />
      <RecentSubmissions playerId={id} />
    </>
  );
}

export function PagePlayerTopGoldenList({ id }) {
  const query = useGetPlayer(id);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const player = query.data.data;
  const apostrophe = player.name.endsWith("s") ? "'" : "'s";

  return (
    <Box sx={{ mx: 2 }}>
      <Typography variant="h4">
        <Link to={`/player/${id}`}>{player.name}</Link>
        {apostrophe} Top Golden List
      </Typography>
      <TopGoldenList type="player" id={id} />
    </Box>
  );
}

export function DifficultyCountChart({ difficulty_counts }) {
  const query = useGetAllDifficulties();

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const rawDiffs = getQueryData(query);
  const difficulties = rawDiffs.filter((d) => d.id !== 13);
  const data = difficulties.map((difficulty) => {
    return {
      name: getDifficultyName(difficulty),
      count: difficulty_counts[difficulty.id] || 0,
      color: difficulty.id === 18 ? DIFFICULTY_COLORS[18].contrast_color : DIFFICULTY_COLORS[difficulty.id],
    };
  });

  const seriesData = data.map((d) => {
    return {
      data: [d.count],
      color: d.color.color,
      label: d.name,
      highlighted: "series",
      faded: "global",
    };
  });

  return (
    <BarChart
      yAxis={[{ scaleType: "linear", min: 0, max: Math.max(4, Math.max(...data.map((d) => d.count))) }]}
      xAxis={[{ scaleType: "band", data: ["Count of Goldens per Tier"] }]}
      series={seriesData}
      height={300}
      slotProps={{ legend: { hidden: true } }}
      title="Tier Counts"
      margin={{
        left: 30,
        right: 0,
        bottom: 30,
        top: 15,
      }}
      skipAnimation
    />
  );
}
