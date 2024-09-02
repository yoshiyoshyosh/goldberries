import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  BasicBox,
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledLink,
  getErrorFromMultiple,
} from "../components/BasicComponents";
import {
  getQueryData,
  useGetAllDifficulties,
  useGetPlayer,
  useGetPlayerStats,
  useGetShowcaseSubmissions,
} from "../hooks/useApi";
import { useParams } from "react-router-dom";
import { TopGoldenList } from "../components/TopGoldenList";
import {
  AdminIcon,
  InputMethodIcon,
  LinkIcon,
  SubmissionEmbed,
  SuspendedIcon,
  TempVerifierIcon,
  VerifierIcon,
} from "../components/GoldberriesComponents";
import { RecentSubmissionsHeadless } from "../components/RecentSubmissions";
import { DIFFICULTY_COLORS, getGroupId, isTempVerifier } from "../util/constants";
import { getDifficultyName, getPlayerNameColorStyle } from "../util/data_util";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Changelog } from "../components/Changelog";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { useAuth } from "../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import { SubmissionFilter, getDefaultFilter } from "../components/SubmissionFilter";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useState } from "react";
import { useTheme } from "@emotion/react";
import { ExportTopGoldenListModal } from "./TopGoldenList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport } from "@fortawesome/free-solid-svg-icons";
import { useModal } from "../hooks/useModal";

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
  const { t } = useTranslation(undefined, { keyPrefix: "player" });
  const { t: t_a } = useTranslation();
  const { t: t_ap } = useTranslation(undefined, { keyPrefix: "account.tabs.profile" });
  const { settings } = useAppSettings();
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

  const isTemp = player.account.is_verifier && isTempVerifier(player.id);

  const nameStyle = getPlayerNameColorStyle(player, settings);
  const aboutMeSplit = player.account.about_me?.split("\n") || [];

  const title = `${player.name} - ` + t("title");

  return (
    <>
      <HeadTitle title={title} />
      <Stack direction="column" gap={1}>
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <Typography
            variant="h4"
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
          {isTemp && <TempVerifierIcon />}
          <Box flexGrow={1} />
          <StyledLink to={`/player/${id}/top-golden-list`}>{t("personal_tgl")}</StyledLink>
        </Stack>
        {player.account?.links ? (
          <Stack direction="row" gap={1}>
            {player.account.links.map((link) => (
              <LinkIcon url={link} />
            ))}
          </Stack>
        ) : null}

        {player.account.about_me && (
          <>
            <Typography variant="h6">{t_ap("about_me.label")}</Typography>
            {aboutMeSplit.map((line) => (
              <Typography variant="body1">{line}</Typography>
            ))}
          </>
        )}

        {player.account.input_method && (
          <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 2 }}>
            <Typography variant="body1">
              {t_a("components.input_methods.label", { count: 1 })}:{" "}
              {t_a("components.input_methods." + player.account.input_method)}
            </Typography>
            <InputMethodIcon method={player.account.input_method} />
          </Stack>
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />
      <SubmissionShowcase id={id} />
      <Divider sx={{ my: 2 }} />
      <PlayerRecentSubmissions id={id} />
      <Divider sx={{ my: 2 }} />
      <Typography variant="h5">{t("stats")}</Typography>
      <DifficultyCountChart difficulty_counts={stats.count_by_difficulty} />
      {/* <ExampleChart /> */}
      <Divider sx={{ my: 2 }} />
      <Changelog type="player" id={id} />
    </>
  );
}

function SubmissionShowcase({ id }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player" });
  const { t: t_as } = useTranslation(undefined, { keyPrefix: "account.tabs.showcase" });
  const query = useGetShowcaseSubmissions(id);
  const data = getQueryData(query);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const { type, submissions } = data;
  const typeStr = type === "custom" ? t_as("title") : t("showcase_hardest");

  const widths = [12, 6, 6, 4, 4, 4, 4, 4, 4, 4];

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {typeStr}
      </Typography>
      <Grid container spacing={2}>
        {submissions.map((submission, index) => (
          <Grid item xs={12} md={widths[index]} display="flex" justifyContent="space-around">
            <StyledLink to={`/submission/${submission.id}`}>
              <SubmissionEmbed submission={submission} style={{ width: "100%", maxWidth: "540px" }} />
            </StyledLink>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

function PlayerRecentSubmissions({ id }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.recent_submissions" });
  const auth = useAuth();
  const canSeeRejected = auth.hasVerifierPriv || auth.isPlayerWithId(id);
  return (
    <>
      <Typography variant="h5" gutterBottom>
        {t("title")}
      </Typography>
      <RecentSubmissionsHeadless verified={null} playerId={id} showChip hideIfEmpty />
      <RecentSubmissionsHeadless verified={true} playerId={id} showChip chipSx={{ mt: 2 }} />

      {canSeeRejected && (
        <>
          <RecentSubmissionsHeadless verified={false} playerId={id} showChip hideIfEmpty chipSx={{ mt: 2 }} />
        </>
      )}
    </>
  );
}

export function PagePlayerTopGoldenList({ id }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player" });
  const { t: t_gl } = useTranslation(undefined, { keyPrefix: "golden_list" });
  const query = useGetPlayer(id);
  const theme = useTheme();

  const exportModal = useModal();
  const [filter, setFilter] = useLocalStorage("top_golden_list_filter", getDefaultFilter());

  if (query.isLoading) {
    return (
      <BasicBox>
        <LoadingSpinner />
      </BasicBox>
    );
  } else if (query.isError) {
    return (
      <BasicBox>
        <ErrorDisplay error={query.error} />
      </BasicBox>
    );
  }

  const player = getQueryData(query);

  const title = `${player.name} - ` + t("personal_tgl");

  return (
    <Box sx={{ mx: 2 }}>
      <HeadTitle title={title} />
      <BasicBox sx={{ mb: 1 }}>
        <Typography variant="h4">
          <StyledLink to={`/player/${id}`}>{player.name}</StyledLink> - {t("personal_tgl")}
        </Typography>
        <Stack direction="row" gap={1}>
          <SubmissionFilter type="player" id={id} filter={filter} setFilter={setFilter} />
          <IconButton onClick={exportModal.open}>
            <FontAwesomeIcon color={theme.palette.text.secondary} icon={faFileExport} fixedWidth size="2xs" />
          </IconButton>
        </Stack>
      </BasicBox>
      <TopGoldenList type="player" id={id} filter={filter} />
      <ExportTopGoldenListModal modalHook={exportModal} type="player" id={id} filter={filter} />
    </Box>
  );
}

export function DifficultyCountChart({ difficulty_counts }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.chart" });
  const theme = useTheme();
  const query = useGetAllDifficulties();
  const [showStandard, setShowStandard] = useLocalStorage("player_chart_show_standard", true);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const rawDiffs = getQueryData(query);
  let difficulties = rawDiffs.filter((d) => d.id !== 13);
  if (!showStandard) {
    difficulties = difficulties.filter((d) => d.id !== 18 && d.id !== 19 && d.id !== 20);
  }

  //Loop through all difficulties and do the following:
  // 1. Get the difficulties group id by getGroupId(id)
  // 2. If the group id is different from the id of the difficulty, add the difficulty_counts of the difficulty to the difficulty_counts of the group
  // 3. Then, remove the difficulty from the list of difficulties
  const difficulty_counts_grouped = {};
  difficulties.forEach((difficulty) => {
    const group_id = getGroupId(difficulty.id);
    const count = difficulty_counts[difficulty.id] || 0;
    if (!(group_id in difficulty_counts_grouped)) {
      difficulty_counts_grouped[group_id] = 0;
    }
    difficulty_counts_grouped[group_id] += count;
  });

  //Filter out the difficulties that are not in the difficulty_counts_grouped object
  difficulties = difficulties.filter((d) => d.id in difficulty_counts_grouped);

  const getDifficultyName = (id) => {
    const difficulty = difficulties.find((d) => d.id === id);
    return difficulty ? difficulty.name : "";
  };
  const getChartDifficultyColor = (id) => {
    if (id === 18) {
      return theme.palette.text.primary;
    } else {
      return DIFFICULTY_COLORS[id].color;
    }
  };

  const data = [];
  difficulties.forEach((difficulty) => {
    data.push({
      id: difficulty.id,
      name: difficulty.id === 19 ? "Undet." : getDifficultyName(difficulty.id),
      count: difficulty_counts_grouped[getGroupId(difficulty.id)] || 0,
    });
  });

  return (
    <Stack direction="column" gap={1}>
      <FormControlLabel
        checked={showStandard}
        onChange={() => setShowStandard(!showStandard)}
        control={<Checkbox />}
        label={t("show_standard")}
      />
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          barCategoryGap="8%"
          barGap={50}
          margin={{
            top: 20,
            right: 30,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: theme.palette.text.primary }} />
          <YAxis tick={{ fill: theme.palette.text.primary }} />
          <Legend iconSize={0} payload={[{ value: t("x_axis"), type: "bar", id: "tier-bar" }]} />
          <Bar id="tier-bar" dataKey="count" fill={theme.palette.text.primary} label={{ position: "top" }}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getChartDifficultyColor(entry.id)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Stack>
  );
}
