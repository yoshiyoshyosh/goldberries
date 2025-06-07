import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Slider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  BasicBox,
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LanguageFlag,
  LoadingSpinner,
  StyledExternalLink,
  StyledLink,
  TooltipLineBreaks,
  getErrorFromMultiple,
  parseYouTubeUrl,
} from "../components/BasicComponents";
import {
  getQueryData,
  useGetAllDifficulties,
  useGetPlayer,
  useGetPlayerStats,
  useGetShowcaseSubmissions,
  useGetTopGoldenList,
} from "../hooks/useApi";
import { useNavigate, useParams } from "react-router-dom";
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
  ChallengeFcIcon,
  DifficultyChip,
  AnyImage,
} from "../components/GoldberriesComponents";
import { RecentSubmissionsHeadless } from "../components/RecentSubmissions";
import {
  API_BASE_URL,
  DIFFICULTIES,
  DIFF_CONSTS,
  getNewDifficultyColors,
  sortToDifficulty,
} from "../util/constants";
import {
  getCampaignName,
  getChallengeCampaign,
  getChallengeSuffix,
  getDifficultyNameShort,
  getMapName,
  getPlayerNameColorStyle,
  isMapSameNameAsCampaign,
} from "../util/data_util";
import { useDebounce, useLocalStorage } from "@uidotdev/usehooks";
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
import { useEffect, useRef, useState } from "react";
import TimelineOppositeContent, { timelineOppositeContentClasses } from "@mui/lab/TimelineOppositeContent";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineConnector from "@mui/lab/TimelineConnector";
import { BadgeDisplay } from "../components/Badge";

export function PagePlayer() {
  const { id, tab } = useParams();
  const [selectedTab, setSelectedTab] = useState(tab || "info");
  useEffect(() => {
    if (tab && tab !== selectedTab) {
      setSelectedTab(tab);
    } else if (tab === undefined) {
      setSelectedTab("info");
    }
  }, [tab]);

  if (selectedTab === "top-golden-list") {
    return <PagePlayerTopGoldenList id={id} />;
  }

  return (
    <BasicContainerBox maxWidth="md">
      <PlayerDisplay id={parseInt(id)} tab={selectedTab} setTab={setSelectedTab} />
    </BasicContainerBox>
  );
}

export function PlayerDisplay({ id, tab, setTab }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player" });
  const { t: t_a } = useTranslation();
  const { t: t_ap } = useTranslation(undefined, { keyPrefix: "account.tabs.profile" });
  const { settings } = useAppSettings();
  const query = useGetPlayer(id);
  const statsQuery = useGetPlayerStats(id);
  const navigate = useNavigate();

  if (query.isLoading || statsQuery.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError || statsQuery.isError) {
    const error = getErrorFromMultiple(query, statsQuery);
    return <ErrorDisplay error={error} />;
  }

  const navigateToTab = (newTab) => {
    setTab(newTab);
    if (newTab === "info") {
      navigate(`/player/${id}`, { replace: true });
    } else {
      navigate(`/player/${id}/${newTab}`, { replace: true });
    }
  };

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
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          {player.account?.links ? (
            <Stack direction="row" gap={1}>
              {player.account.links.map((link) => (
                <LinkIcon url={link} />
              ))}
            </Stack>
          ) : null}
          <Box flexGrow={1} />
          <BadgeDisplay player={player} />
        </Stack>

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

      <Tabs
        variant="fullWidth"
        value={tab}
        onChange={(event, newTab) => navigateToTab(newTab)}
        sx={{ mt: 0.5 }}
      >
        <Tab label={t("tabs.info.label")} value="info" />
        <Tab label={t("tabs.timeline.label")} value="timeline" />
      </Tabs>

      <Divider sx={{ mt: 0, mb: 1 }} />

      {tab === "info" && <PlayerInfo id={id} stats={stats} />}
      {tab === "timeline" && <PlayerTimeline id={id} />}

      {/* <Divider sx={{ my: 2 }} />
      <PlayerInfo id={id} stats={stats} /> */}
    </>
  );
}

function PlayerInfo({ id, stats }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.info" });
  return (
    <>
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
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.info" });
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

  const defaultFilter = getDefaultFilter(false);
  const [filter, setFilter] = useLocalStorage("top_golden_list_filter_player", defaultFilter);

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
          <SubmissionFilter
            type="player"
            id={id}
            filter={filter}
            setFilter={setFilter}
            defaultFilter={defaultFilter}
          />
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
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.info.chart" });
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

//#region TIMELINE
function PlayerTimeline({ id }) {
  const { t } = useTranslation(undefined, { keyPrefix: "player.tabs.timeline" });
  const [filter, setFilter] = useLocalStorage("player_timeline_filter", getDefaultFilter(false));
  const query = useGetTopGoldenList("player", id, filter);
  const groupCampaigns = false; //I thought this might be cool, but it kinda sucked so w/e
  const [ratio, setRatio] = useLocalStorage("player_timeline_show_difficulty_ratio", 0.05);

  const defaultFilter = getDefaultFilter(false);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const data = JSON.parse(JSON.stringify(getQueryData(query))); //Don't modify the original data
  //Invert data structure
  const submissions = [];
  data.challenges.forEach((challenge) => {
    const submission = challenge.submissions[0];
    submission.challenge = challenge;
    if (challenge.map_id !== null) {
      challenge.map = data.maps[challenge.map_id];
      challenge.map.campaign = data.campaigns[challenge.map.campaign_id];
    }
    if (challenge.campaign_id !== null) challenge.campaign = data.campaigns[challenge.campaign_id];
    challenge.submissions = null; //Unset to remove cyclic references
    submissions.push(submission);
  });
  const showDifficulty = calculateShowPreviewImageDifficulty(submissions, ratio);

  //Sort submissions by submission.date_achieved DESC. Date is in ISO format
  submissions.sort((a, b) => {
    return new Date(b.date_achieved) - new Date(a.date_achieved);
  });

  //Group submissions by day
  const groupedByDay = [];
  submissions.forEach((submission) => {
    const date = submission.date_achieved.split("T")[0];
    const group = groupedByDay.find((g) => g.date === date);
    if (group) {
      group.submissions.push(submission);
    } else {
      groupedByDay.push({
        date: date,
        submissions: [submission],
      });
    }
  });

  //Group again by year, so that we can have clean year separators
  const groupedByYear = [];
  groupedByDay.forEach((group) => {
    const year = group.date.split("-")[0];
    const yearGroup = groupedByYear.find((g) => g.year === year);
    if (yearGroup) {
      yearGroup.days.push(group);
    } else {
      groupedByYear.push({
        year: year,
        days: [group],
      });
    }
  });

  //Currently the groupedByYear array looks like: [{year: "2024", days: []}, {year: "2022", days: []}]
  //Insert all missing years between the first year (the very end of the array) and the current year (possibly present in the array, possibly absent)
  if (groupedByYear.length > 0) {
    const currentYear = new Date().getFullYear();
    const firstYear = parseInt(groupedByYear[groupedByYear.length - 1].year);

    for (let year = firstYear; year <= currentYear; year++) {
      if (!groupedByYear.some((g) => g.year === year.toString())) {
        groupedByYear.push({ year: year.toString(), days: [] });
      }
    }

    // Sort the years in descending order to maintain order consistency
    groupedByYear.sort((a, b) => parseInt(b.year) - parseInt(a.year));
  }

  return (
    <Stack direction="column" gap={1}>
      <Grid container spacing={2}>
        <Grid item xs>
          <Typography variant="h5">{t("label")}</Typography>
        </Grid>
        <Grid item xs="auto">
          <SubmissionFilter
            type="player"
            id={id}
            filter={filter}
            defaultFilter={defaultFilter}
            setFilter={setFilter}
            variant="outlined"
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            {t("show_difficulty_ratio")}: {(ratio * 100).toFixed(0) + "%"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TimelineRatioSlider ratio={ratio} setRatio={setRatio} />
        </Grid>
      </Grid>

      <Timeline
        sx={{
          px: 0,
          [`& .${timelineOppositeContentClasses.root}`]: {
            flex: 0.12,
            minWidth: "100px",
          },
        }}
      >
        <BigTimelineLabel label={"Now"} isNow />
        {groupedByYear.length === 0 && <BigTimelineLabel label={new Date().getFullYear()} isLast />}
        {groupedByYear.map((yearGroup, yearIndex) => (
          <>
            {yearGroup.days.map((dayGroup, dayIndex) => (
              <TimelineDay
                key={dayGroup.date}
                date={dayGroup.date}
                submissions={dayGroup.submissions}
                isLast={dayIndex >= dayGroup.length - 1}
                groupCampaigns={groupCampaigns}
                showDifficulty={showDifficulty}
              />
            ))}
            <BigTimelineLabel
              key={yearGroup.year}
              label={yearGroup.year}
              isLast={yearIndex >= groupedByYear.length - 1}
            />
          </>
        ))}
      </Timeline>
    </Stack>
  );
}

function TimelineRatioSlider({ ratio, setRatio }) {
  const [localRatio, setLocalRatio] = useState(ratio);
  const ratioDebounced = useDebounce(localRatio, 500);
  useEffect(() => {
    setRatio(ratioDebounced);
  }, [ratioDebounced]);

  return (
    <Slider
      value={localRatio}
      onChange={(_, value) => setLocalRatio(value)}
      valueLabelFormat={(value) => (value * 100).toFixed(0) + "%"}
      valueLabelDisplay="auto"
      step={0.01}
      min={0}
      max={1}
    />
  );
}

function BigTimelineLabel({ label, isLast = false, isNow = false }) {
  const theme = useTheme();
  const isDarkmode = theme.palette.mode === "dark";
  const lineColor = isDarkmode ? "#bdbdbd" : "#bdbdbd";
  return (
    <TimelineItem>
      <TimelineOppositeContent>
        <Typography variant="h4">{label}</Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot />
        {!isLast && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent>
        {!isNow && <Divider sx={{ borderColor: lineColor, borderWidth: 2, borderRadius: 10, mt: 1.125 }} />}
      </TimelineContent>
    </TimelineItem>
  );
}

function TimelineDay({ key, date, submissions, isLast, groupCampaigns, showDifficulty }) {
  const dateStr = new Date(date).toLocaleDateString(navigator.language, { month: "short", day: "numeric" });

  const groupedByCampaign = [];
  submissions.forEach((submission) => {
    const campaign = getChallengeCampaign(submission.challenge);
    const group = groupedByCampaign.find((g) => g.campaign.id === campaign.id);
    if (group) {
      group.submissions.push(submission);
    } else {
      groupedByCampaign.push({
        campaign: campaign,
        submissions: [submission],
      });
    }
  });

  return (
    <TimelineItem key={key}>
      <TimelineOppositeContent>
        <Typography variant="body1">{dateStr}</Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot />
        {!isLast && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent>
        <Stack direction="column" gap={0.5}>
          {groupedByCampaign.map((group) => {
            if (groupCampaigns && group.submissions.length > 1) {
              return (
                <TimelineCampaignMultiSubmissions
                  key={group.campaign.id}
                  campaign={group.campaign}
                  submissions={group.submissions}
                />
              );
            }
            return (
              <>
                {group.submissions.map((submission, index) => (
                  <TimelineSubmissionSingle submission={submission} showDifficulty={showDifficulty} />
                ))}
              </>
            );
          })}
        </Stack>
      </TimelineContent>
    </TimelineItem>
  );
}

function TimelineSubmissionSingle({ submission, showDifficulty }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  const challenge = submission.challenge;
  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);
  const showCampaignImage = showDifficulty ? challenge.difficulty.sort >= showDifficulty.sort : false;

  return (
    <Stack direction="column" gap={1} alignItems="flex-start" justifyContent="space-between">
      <Stack
        direction="row"
        columnGap={1}
        alignItems="center"
        sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}
      >
        <DifficultyChip difficulty={challenge.difficulty} sx={{ mt: "1px" }} />
        <ChallengeInline challenge={challenge} submission={submission} />
      </Stack>
      {showCampaignImage && <TimelineSubmissionPreviewImage submission={submission} />}
    </Stack>
  );
}

function TimelineCampaignMultiSubmissions({ campaign, submissions }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const minDifficultySort = Math.min(...submissions.map((s) => s.challenge.difficulty.sort));
  const maxDifficultySort = Math.max(...submissions.map((s) => s.challenge.difficulty.sort));
  //Find the first difficulty object matching the given min/max sorts
  const minDifficulty = submissions.find((s) => s.challenge.difficulty.sort === minDifficultySort).challenge
    .difficulty;
  const maxDifficulty = submissions.find((s) => s.challenge.difficulty.sort === maxDifficultySort).challenge
    .difficulty;
  const isDifferent = minDifficultySort !== maxDifficultySort;
  const count = submissions.length;

  return (
    <Stack direction="row" columnGap={1} alignItems="center" sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}>
      <Stack direction="row" alignItems="center" columnGap={1} flexWrap="wrap">
        <StyledLink to={"/campaign/" + campaign.id}>{getCampaignName(campaign, t_g, true)}</StyledLink>
        <Typography variant="body2" color="textSecondary">
          {count}x submissions
        </Typography>
      </Stack>
      <DifficultyChip difficulty={minDifficulty} sx={{ mt: "1px" }} />
      {isDifferent && (
        <>
          {" ~ "}
          <DifficultyChip difficulty={maxDifficulty} sx={{ mt: "1px" }} />
        </>
      )}
    </Stack>
  );
}

function TimelineSubmissionPreviewImage({ submission }) {
  const challenge = submission.challenge;
  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);

  let url = null;

  const youtubeData = parseYouTubeUrl(submission.proof_url);
  if (youtubeData !== null) {
    url = "https://img.youtube.com/vi/" + youtubeData.videoId + "/mqdefault.jpg";
  }

  if (url === null) {
    url = API_BASE_URL + "/embed/img/campaign_image.php?id=" + campaign.id;
  }

  return (
    <StyledExternalLink href={submission.proof_url}>
      <img src={url} alt={campaign.name} style={{ maxWidth: "200px", borderRadius: "5px" }} />
    </StyledExternalLink>
  );
}

export function ChallengeInline({ challenge, submission, separateChallenge = false, ...props }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);

  const nameIsSame = isMapSameNameAsCampaign(map, campaign);

  return (
    <Stack
      display={"inline-flex"}
      direction="row"
      alignItems="center"
      columnGap={1}
      flexWrap="wrap"
      {...props}
    >
      <StyledLink to={"/campaign/" + campaign.id}>{getCampaignName(campaign, t_g, true)}</StyledLink>
      {!nameIsSame && map && (
        <>
          {"/"}
          <StyledLink to={"/map/" + map.id}>{getMapName(map, campaign, false)}</StyledLink>
        </>
      )}
      {separateChallenge && "/"}
      {getChallengeSuffix(challenge) !== null && (
        <Typography variant="body2" color="textSecondary">
          [{getChallengeSuffix(challenge)}]
        </Typography>
      )}
      {submission ? (
        <StyledLink to={"/submission/" + submission.id} style={{ lineHeight: "1" }}>
          <ChallengeFcIcon showClear allowTextIcons challenge={challenge} height="1.3em" />
        </StyledLink>
      ) : (
        <StyledLink to={"/challenge/" + challenge.id} style={{ lineHeight: "0" }}>
          <ChallengeFcIcon showClear allowTextIcons challenge={challenge} height="1.3em" />
        </StyledLink>
      )}
    </Stack>
  );
}

function calculateShowPreviewImageDifficulty(submissions, ratio) {
  if (ratio === 0) return null;
  if (submissions.length === 0) return null;
  const sortedSubmissions = submissions.sort(
    (a, b) => b.challenge.difficulty.sort - a.challenge.difficulty.sort
  );
  const index = Math.floor(Math.min(submissions.length * ratio, submissions.length - 1));
  return sortedSubmissions[index].challenge.difficulty;
}
//#endregion
