import { Box, Checkbox, Divider, FormControlLabel, IconButton, Stack, Typography } from "@mui/material";
import {
  BasicBox,
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LanguageFlag,
  LoadingSpinner,
  StyledLink,
  TooltipLineBreaks,
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
  HelperIcon,
  VerifierIcon,
  AccountRoleIcon,
} from "../components/GoldberriesComponents";
import { RecentSubmissionsHeadless } from "../components/RecentSubmissions";
import { DIFFICULTIES, DIFF_CONSTS, getNewDifficultyColors } from "../util/constants";
import { getDifficultyNameShort, getPlayerNameColorStyle } from "../util/data_util";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Changelog } from "../components/Changelog";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { ROLES, useAuth } from "../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import { SubmissionFilter, getDefaultFilter } from "../components/SubmissionFilter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell } from "recharts";
import { useTheme } from "@emotion/react";
import { ExportTopGoldenListModal } from "./TopGoldenList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faFileExport } from "@fortawesome/free-solid-svg-icons";
import { useModal } from "../hooks/useModal";
import Grid from "@mui/material/Unstable_Grid2";
import { TimeTakenTiersGraphModal } from "../components/TimeTakenTiersGraph";
import { useRef } from "react";

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
          <AccountRoleIcon account={player.account} />
          {player.account.country && <LanguageFlag code={player.account.country} showTooltip height="24px" />}
          <ExRoleLabel account={player.account} />
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
  const offsets = [null, [1, 3], null, [3, 4], [3, 2], null, [6, 4], [6, 2], null];
  const getOffset = (index, length) => {
    const offset = offsets[length - 1];
    if (!offset || offset === null) {
      return undefined;
    }
    if (offset[0] === index) {
      return offset[1];
    }
    return undefined;
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {typeStr}
      </Typography>
      <Grid container spacing={2}>
        {submissions.map((submission, index) => (
          <Grid
            xs={12}
            md={widths[index]}
            display="flex"
            justifyContent="space-around"
            mdOffset={getOffset(index, submissions.length)}
          >
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
  const canSeeRejected = auth.hasHelperPriv || auth.isPlayerWithId(id);
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
  const { t: t_tgl } = useTranslation(undefined, { keyPrefix: "components.top_golden_list" });
  const query = useGetPlayer(id);
  const theme = useTheme();

  const exportModal = useModal();
  const statsModal = useModal();
  const useSuggestedRef = useRef();
  const [filter, setFilter] = useLocalStorage("top_golden_list_filter_player", getDefaultFilter(false));

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
          <TooltipLineBreaks title={t_tgl("export_button_tooltip")}>
            <IconButton onClick={exportModal.open}>
              <FontAwesomeIcon
                color={theme.palette.text.secondary}
                icon={faFileExport}
                fixedWidth
                size="2xs"
              />
            </IconButton>
          </TooltipLineBreaks>
          <TooltipLineBreaks title={t_tgl("stats_button_tooltip")}>
            <IconButton onClick={statsModal.open}>
              <FontAwesomeIcon color={theme.palette.text.secondary} icon={faChartBar} fixedWidth size="2xs" />
            </IconButton>
          </TooltipLineBreaks>
        </Stack>
      </BasicBox>
      <TopGoldenList type="player" id={id} filter={filter} useSuggestedRef={useSuggestedRef} />
      <ExportTopGoldenListModal modalHook={exportModal} type="player" id={id} filter={filter} isPersonal />
      <TimeTakenTiersGraphModal
        modalHook={statsModal}
        id={id}
        filter={filter}
        useSuggested={useSuggestedRef.current}
      />
    </Box>
  );
}

export function DifficultyCountChart({ difficulty_counts }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.chart" });
  const { settings } = useAppSettings();
  const theme = useTheme();
  const query = useGetAllDifficulties();
  const [showUntiered, setShowUntiered] = useLocalStorage("player_chart_show_untiered", true);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const rawDiffs = getQueryData(query);
  let difficulties = [...rawDiffs];
  if (!showUntiered) {
    difficulties = difficulties.filter(
      (d) => d.id !== DIFF_CONSTS.TRIVIAL_ID && d.id !== DIFF_CONSTS.UNTIERED_ID
    );
  }

  //Loop through all difficulties and do the following:
  // 1. ~~Get the difficulties group id by getGroupId(id)~~ -> Rework: just use the id
  // 2. If the group id is different from the id of the difficulty, add the difficulty_counts of the difficulty to the difficulty_counts of the group
  // 3. Then, remove the difficulty from the list of difficulties
  const difficulty_counts_grouped = {};
  difficulties.forEach((difficulty) => {
    const group_id = difficulty.id;
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
    return difficulty ? getDifficultyNameShort(difficulty) : "";
  };
  const getChartDifficultyColor = (id) => {
    // return DIFFICULTIES[id].color;
    return getNewDifficultyColors(settings, id).color;
  };

  const data = [];
  difficulties.forEach((difficulty) => {
    data.push({
      id: difficulty.id,
      name: getDifficultyName(difficulty.id),
      count: difficulty_counts_grouped[difficulty.id] || 0,
    });
  });

  return (
    <Stack direction="column" gap={1}>
      <FormControlLabel
        checked={showUntiered}
        onChange={() => setShowUntiered(!showUntiered)}
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

function ExRoleLabel({ account }) {
  //A small, fancy label for ex-roles
  const { t } = useTranslation(undefined, { keyPrefix: "components.roles" });
  const theme = useTheme();

  if (![ROLES.EX_HELPER, ROLES.EX_VERIFIER, ROLES.EX_ADMIN].includes(account.role)) {
    return null;
  }

  const style = {
    borderRadius: "15px",
    padding: "2px 10px",
    fontSize: "1em",
    fontWeight: "bold",
    color: theme.palette.mode === "dark" ? "white" : "black",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: theme.palette.mode === "dark" ? "white" : "#575757",
  };

  let icon = null;
  let text = null;
  if (account.role === ROLES.EX_HELPER) {
    icon = <HelperIcon />;
    text = t("ex_helper");
  } else if (account.role === ROLES.EX_VERIFIER) {
    icon = <VerifierIcon />;
    text = t("ex_verifier");
  } else if (account.role === ROLES.EX_ADMIN) {
    icon = <AdminIcon />;
    text = t("ex_admin");
  }

  return (
    <Stack direction="row" gap={1} alignItems="center">
      {/* {icon} */}
      <Typography variant="body1" sx={style}>
        {text}
      </Typography>
    </Stack>
  );
}
