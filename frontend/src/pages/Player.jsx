import { Box, Checkbox, Divider, FormControlLabel, Stack, Typography } from "@mui/material";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  getErrorFromMultiple,
} from "../components/BasicComponents";
import { getQueryData, useGetAllDifficulties, useGetPlayer, useGetPlayerStats } from "../hooks/useApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { Link, useParams } from "react-router-dom";
import { TopGoldenList } from "../components/TopGoldenList";
import {
  AdminIcon,
  InputMethodIcon,
  LinkIcon,
  SuspendedIcon,
  VerifierIcon,
} from "../components/GoldberriesComponents";
import { RecentSubmissions } from "./Index";
import { BarChart } from "@mui/x-charts/BarChart";
import { DIFFICULTY_COLORS } from "../util/constants";
import { getDifficultyName, getPlayerNameColorStyle } from "../util/data_util";
import { useLocalStorage } from "@uidotdev/usehooks";

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

  const nameStyle = getPlayerNameColorStyle(player);
  const aboutMeSplit = player.account.about_me?.split("\n") || [];

  const title = `${player.name} - Profile`;

  return (
    <>
      <HeadTitle title={title} />
      <Stack direction="column" gap={1}>
        <Stack direction="row" alignItems="center" gap={1}>
          <FontAwesomeIcon icon={faUser} size="2x" />
          <Typography
            variant="h6"
            sx={{
              textDecoration: suspended ? "line-through" : "inherit",
              color: suspended ? "grey" : "inherit",
              ...nameStyle,
            }}
          >
            {player.name}
          </Typography>
          {player.account.is_suspended && <SuspendedIcon reason={player.account.suspension_reason} />}
          {player.account.is_verifier && <VerifierIcon />}
          {player.account.is_admin && <AdminIcon />}
          <Box flexGrow={1} />
          {player.account.input_method && (
            <>
              <Typography variant="body1">Input Method </Typography>
              <InputMethodIcon method={player.account.input_method} />
            </>
          )}
        </Stack>
        {player.account?.links ? (
          <Stack direction="row" gap={1}>
            {player.account.links.map((link) => (
              <LinkIcon url={link} />
            ))}
          </Stack>
        ) : null}
        <Link to={`/player/${id}/top-golden-list`}>Top Golden List</Link>

        {player.account.about_me && (
          <>
            <Typography variant="h6">About Me</Typography>
            {aboutMeSplit.map((line) => (
              <Typography variant="body1">{line}</Typography>
            ))}
          </>
        )}
      </Stack>

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
  const [showArchived, setShowArchived] = useLocalStorage("top_filter_archived", false);
  const [showArbitrary, setShowArbitrary] = useLocalStorage("top_filter_arbitrary", false);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const player = getQueryData(query);
  const apostrophe = player.name.endsWith("s") ? "'" : "'s";

  const title = `${player.name}${apostrophe} Top Golden List`;

  return (
    <Box sx={{ mx: 2 }}>
      <HeadTitle title={title} />
      <Typography variant="h4">
        <Link to={`/player/${id}`}>{player.name}</Link>
        {apostrophe} Top Golden List
      </Typography>
      <Stack direction="row" spacing={2}>
        <FormControlLabel
          control={<Checkbox checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />}
          label="Show Archived"
        />
        <FormControlLabel
          control={<Checkbox checked={showArbitrary} onChange={(e) => setShowArbitrary(e.target.checked)} />}
          label="Show Arbitrary"
        />
      </Stack>
      <TopGoldenList type="player" id={id} archived={showArchived} arbitrary={showArbitrary} />
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
