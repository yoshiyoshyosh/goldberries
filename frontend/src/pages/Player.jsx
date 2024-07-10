import { Box, Checkbox, Divider, FormControlLabel, Grid, Stack, Typography } from "@mui/material";
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
  VerifierIcon,
} from "../components/GoldberriesComponents";
import { RecentSubmissionsHeadless } from "../components/RecentSubmissions";
import { BarChart } from "@mui/x-charts/BarChart";
import { DIFFICULTY_COLORS } from "../util/constants";
import { getDifficultyName, getPlayerNameColorStyle } from "../util/data_util";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Changelog } from "../components/Changelog";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { useAuth } from "../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import { SubmissionFilter, getDefaultFilter } from "../components/SubmissionFilter";

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
  const [showArchived, setShowArchived] = useLocalStorage("top_filter_archived", false);
  const [showArbitrary, setShowArbitrary] = useLocalStorage("top_filter_arbitrary", false);
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
          <StyledLink to={`/player/${id}`}>{player.name}</StyledLink>- {t("personal_tgl")}
        </Typography>
        <SubmissionFilter type="player" id={id} filter={filter} setFilter={setFilter} />
      </BasicBox>
      <TopGoldenList type="player" id={id} filter={filter} />
    </Box>
  );
}

export function DifficultyCountChart({ difficulty_counts }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.chart" });
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
      xAxis={[{ scaleType: "band", data: [t("x_axis")] }]}
      series={seriesData}
      height={300}
      slotProps={{ legend: { hidden: true } }}
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
