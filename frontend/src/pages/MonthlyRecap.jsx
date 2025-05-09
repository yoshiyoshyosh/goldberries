import { Button, Checkbox, Chip, Divider, FormControlLabel, Grid, Stack, Typography } from "@mui/material";
import {
  BasicContainerBox,
  CustomIconButton,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledLink,
  getErrorFromMultiple,
} from "../components/BasicComponents";
import { TiersCountDisplay } from "./Index";
import {
  getQueryData,
  useGetAllDifficulties,
  useGetStatsGlobal,
  useGetStatsMonthlyRecap,
} from "../hooks/useApi";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChallengeFcIcon,
  DifficultyChip,
  DifficultySelectControlled,
  PlayerChip,
} from "../components/GoldberriesComponents";
import {
  extractDifficultiesFromChangelog,
  getCampaignName,
  getChallengeCampaign,
  getChallengeSuffix,
  getMapName,
  isMapSameNameAsCampaign,
} from "../util/data_util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faBook } from "@fortawesome/free-solid-svg-icons";

import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent, { timelineOppositeContentClasses } from "@mui/lab/TimelineOppositeContent";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { DifficultyMoveDisplay } from "./Suggestions";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { DIFF_CONSTS } from "../util/constants";

export function PageMonthlyRecap() {
  const { t } = useTranslation(undefined, { keyPrefix: "monthly_recap.settings" });
  const { month } = useParams();
  const navigate = useNavigate();

  const defaultDate = month ? new Date(month + "-02") : new Date();
  const [date, setDate] = useState(defaultDate.toISOString());
  //Format date into a string like 2024-08
  const selectedMonth = date ? date.slice(0, 7) : null;

  const setMonth = (dateISO) => {
    const toSet = dateISO ? new Date(dateISO) : new Date();
    setDate(toSet.toISOString());
    const dateFormatted = toSet.toISOString().slice(0, 7);
    navigate("/monthly-recap/" + dateFormatted, { replace: true });
  };
  const navigateMonth = (direction) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + direction);
    setMonth(newDate.toISOString());
  };

  useEffect(() => {
    if (month !== selectedMonth && month !== undefined) {
      setMonth(month + "-02");
    }
  }, [month]);

  return (
    <BasicContainerBox maxWidth="md">
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <Typography variant="h4" textAlign="center">
          {t("header")}
        </Typography>
        <span style={{ flex: 1 }} />
        <Stack direction="row" spacing={0.25} alignItems="center">
          <CustomIconButton color="info" onClick={() => navigateMonth(-1)} sx={{ alignSelf: "stretch" }}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </CustomIconButton>
          <DatePicker
            value={date ? dayjs(date) : null}
            onChange={(value) => {
              if (value.isValid()) {
                setMonth(value.toISOString());
              }
            }}
            minDate={dayjs(new Date(2018, 9, 12, 12))}
            maxDate={dayjs(new Date())}
            views={["year", "month"]}
            sx={{ mt: 1, maxWidth: "200px" }}
          />
          <CustomIconButton color="info" onClick={() => navigateMonth(1)} sx={{ alignSelf: "stretch" }}>
            <FontAwesomeIcon icon={faArrowRight} />
          </CustomIconButton>
        </Stack>
      </Stack>
      <MonthlyRecap month={selectedMonth} />
    </BasicContainerBox>
  );
}

function MonthlyRecap({ month }) {
  const { t } = useTranslation(undefined, { keyPrefix: "monthly_recap" });
  const { t: t_s } = useTranslation(undefined, { keyPrefix: "monthly_recap.settings" });
  const [allClearsDifficulty, setAllClearsDifficulty] = useLocalStorage(
    "monthly_recap_all_clears_tier_sort",
    null
  );
  const [firstClearsDifficulty, setFirstClearsDifficulty] = useLocalStorage(
    "monthly_recap_first_clears_tier_sort",
    null
  );
  const [hideChangelog, setHideChangelog] = useLocalStorage("monthly_recap_hide_changelog", false);

  const query = useGetStatsMonthlyRecap(month, allClearsDifficulty?.sort, firstClearsDifficulty?.sort);
  const snapshotQuery = useGetStatsGlobal(month);

  const diffGrid = (
    <Grid container columnSpacing={2} rowSpacing={1} sx={{ mb: 0 }}>
      <Grid item xs={12} md={6}>
        <DifficultySelectControlled
          label={t_s("normal_clears")}
          fullWidth
          difficultyId={allClearsDifficulty?.id ?? 23}
          setDifficulty={setAllClearsDifficulty}
          minSort={DIFF_CONSTS.TIERED_SORT_START}
          maxSort={DIFF_CONSTS.MAX_SORT}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <DifficultySelectControlled
          label={t_s("first_clears")}
          fullWidth
          difficultyId={firstClearsDifficulty?.id ?? 12}
          setDifficulty={setFirstClearsDifficulty}
          minSort={DIFF_CONSTS.STANDARD_SORT_START}
          maxSort={DIFF_CONSTS.MAX_SORT}
          noGuard
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={<Checkbox />}
          label={t_s("hide_changelog")}
          checked={hideChangelog}
          onChange={(e) => setHideChangelog(e.target.checked)}
        />
      </Grid>
    </Grid>
  );

  if (query.isLoading || snapshotQuery.isLoading) {
    return (
      <>
        {diffGrid}
        <LoadingSpinner />
      </>
    );
  } else if (query.isError || snapshotQuery.isError) {
    const error = getErrorFromMultiple(query, snapshotQuery);
    return (
      <>
        {diffGrid}
        <ErrorDisplay error={error} />
      </>
    );
  }

  const data = getQueryData(query);
  const { tier_clears, submissions_t0, challenge_changes, newly_cleared_t3 } = data;
  const { overall, difficulty } = getQueryData(snapshotQuery);

  return (
    <>
      <HeadTitle title={t("title", { month: month })} />
      {diffGrid}

      <Typography variant="caption" sx={{ mt: 0 }}>
        * {t("disclaimer")}
      </Typography>

      <Divider sx={{ mt: 1, mb: 2 }} />

      <Typography variant="h6" sx={{ mt: 2 }}>
        {t("total_clears")}
      </Typography>
      <TiersCountDisplay stats={difficulty} differences={tier_clears} hideEmpty equalWidths={3} />

      <Typography variant="h6" sx={{ mt: 3 }}>
        {t("timeline.label")}
      </Typography>
      <MonthlyRecapTimeline
        submissions_t0={submissions_t0}
        newly_cleared_t3={newly_cleared_t3}
        challenge_changes={challenge_changes}
        hideChangelog={hideChangelog}
      />
    </>
  );
}

function MonthlyRecapTimeline({ submissions_t0, newly_cleared_t3, challenge_changes, hideChangelog }) {
  //Group submissions and newly cleared challenges by the day they were submitted
  //submissions_t0 is a list of submissions, where the date field is submission.date_created
  //newly_cleared_t3 is a list of challenges, where the date field is the first submission's date_created, so challenge.submissions[0].date_created

  //Group submissions by date
  const submissionsByDate = submissions_t0.reduce((acc, submission) => {
    const date = new Date(submission.date_achieved).setHours(0, 0, 0, 0);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(submission);
    return acc;
  }, {});

  //Group newly cleared challenges by date
  const newlyClearedByDate = newly_cleared_t3.reduce((acc, challenge) => {
    const date = new Date(challenge.submissions[0].date_achieved).setHours(0, 0, 0, 0);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(challenge);
    return acc;
  }, {});

  //Group challenge changes by date
  const challengeChangesByDate = challenge_changes.reduce((acc, change) => {
    const date = new Date(change.date).setHours(0, 0, 0, 0);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(change);
    return acc;
  }, {});

  //Combine the two groups into a single list of items, sorted by date
  let timelineDates = Object.keys(submissionsByDate)
    .concat(Object.keys(newlyClearedByDate))
    .concat(Object.keys(challengeChangesByDate));
  timelineDates = [...new Set(timelineDates)]; //Remove duplicates
  let timelineItems = timelineDates
    .sort((a, b) => parseInt(b) - parseInt(a))
    .map((date) => {
      const submissions_t0 = submissionsByDate[date] || [];
      const newly_cleared_t3 = newlyClearedByDate[date] || [];
      const challenge_changes = challengeChangesByDate[date] || [];
      return { date: new Date(parseInt(date)), submissions_t0, newly_cleared_t3, challenge_changes };
    });

  //Filter out empty entries
  timelineItems = timelineItems.filter((item) => {
    return (
      item.submissions_t0.length +
        item.newly_cleared_t3.length +
        (hideChangelog ? 0 : item.challenge_changes.length) >
      0
    );
  });

  return (
    <Timeline
      sx={{
        px: 0,
        [`& .${timelineOppositeContentClasses.root}`]: {
          flex: 0.08,
        },
      }}
    >
      {timelineItems.map((item, index) => (
        <MonthlyRecapTimelineItem
          key={item.date}
          {...item}
          isLast={index === timelineItems.length - 1}
          hideChangelog={hideChangelog}
        />
      ))}
    </Timeline>
  );
}
function MonthlyRecapTimelineItem({
  date,
  submissions_t0,
  newly_cleared_t3,
  challenge_changes,
  isLast = false,
  hideChangelog = false,
}) {
  //Show date as locale date string with month and day numbers
  const dateStr = date.toLocaleDateString(navigator.language, { month: "short", day: "numeric" });
  const totalEntries =
    submissions_t0.length + newly_cleared_t3.length + (hideChangelog ? 0 : challenge_changes.length);

  return (
    <TimelineItem>
      <TimelineOppositeContent color="text.secondary">{dateStr}</TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot />
        {(totalEntries > 1 || !isLast) && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent>
        <Stack direction="column" gap={1}>
          {newly_cleared_t3.map((submission) => {
            const actualSubmission = submission.submissions[0];
            const challenge = submission;
            return (
              <TimelineSubmission
                key={actualSubmission.id}
                submission={actualSubmission}
                challenge={challenge}
                isFirstClear
              />
            );
          })}
        </Stack>
        <Stack
          direction="column"
          gap={1}
          sx={{ mt: newly_cleared_t3.length === 0 || submissions_t0.length === 0 ? 0 : 1 }}
        >
          {submissions_t0.map((submission) => {
            return (
              <TimelineSubmission
                key={submission.id}
                submission={submission}
                challenge={submission.challenge}
              />
            );
          })}
        </Stack>
        <Stack
          direction="column"
          gap={1}
          sx={{
            mt: newly_cleared_t3.length === 0 && submissions_t0.length === 0 ? 0 : 1,
            display: hideChangelog ? "none" : "flex",
          }}
        >
          {challenge_changes.map((change) => {
            const challenge = change.challenge;
            return <TimelineChangelogEntry key={change.id} change={change} challenge={challenge} />;
          })}
        </Stack>
      </TimelineContent>
    </TimelineItem>
  );
}

function TimelineSubmission({ submission, challenge, isFirstClear }) {
  const { t } = useTranslation(undefined, { keyPrefix: "monthly_recap.timeline" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);
  const nameIsSame = isMapSameNameAsCampaign(map, campaign);
  const isBold = isFirstClear && challenge.difficulty.sort > DIFF_CONSTS.LOW_TIER_0_SORT;
  return (
    <Stack
      direction="row"
      columnGap={1}
      fontWeight={isBold ? "bold" : "inherit"}
      alignItems="center"
      sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}
    >
      <Chip size="small" label={t(isFirstClear ? "first_clear" : "clear")} />
      <PlayerChip player={submission.player} size="small" />
      <DifficultyChip difficulty={challenge.difficulty} sx={{ mt: "1px" }} />
      <Stack direction="row" alignItems="center" columnGap={1} flexWrap="wrap">
        <StyledLink to={"/campaign/" + campaign.id}>{getCampaignName(campaign, t_g, true)}</StyledLink>
        {!nameIsSame && map && (
          <>
            {"/"}
            <StyledLink to={"/map/" + map.id}>{getMapName(map, campaign, false)}</StyledLink>
          </>
        )}
        {getChallengeSuffix(challenge) !== null && (
          <Typography variant="body2" color="textSecondary">
            [{getChallengeSuffix(challenge)}]
          </Typography>
        )}
        <StyledLink to={"/submission/" + submission.id} style={{ lineHeight: "1" }}>
          <ChallengeFcIcon challenge={challenge} height="1.3em" />
        </StyledLink>
      </Stack>
    </Stack>
  );
}

function TimelineChangelogEntry({ change, challenge }) {
  const { t } = useTranslation(undefined, { keyPrefix: "monthly_recap.timeline" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);
  const nameIsSame = map?.name === campaign.name;

  const query = useGetAllDifficulties();
  if (query.isLoading) return <LoadingSpinner />;
  else if (query.isError) return <ErrorDisplay error={query.error} />;
  const result = extractDifficultiesFromChangelog(change, getQueryData(query));
  if (!result) return null;
  const [fromDiff, toDiff] = result;

  return (
    <Stack direction="row" columnGap={1} sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}>
      <Chip label={t("moved")} size="small" />
      <Stack direction="row" alignItems="center" columnGap={1} flexWrap="wrap">
        <StyledLink to={"/campaign/" + campaign.id}>{getCampaignName(campaign, t_g, true)}</StyledLink>
        {!nameIsSame && map && (
          <>
            {"/"}
            <StyledLink to={"/map/" + map.id}>{getMapName(map)}</StyledLink>
          </>
        )}
        {getChallengeSuffix(challenge) !== null && (
          <Typography variant="body2" color="textSecondary">
            [{getChallengeSuffix(challenge)}]
          </Typography>
        )}
        <StyledLink to={"/challenge/" + challenge.id} style={{ lineHeight: "1px" }}>
          <ChallengeFcIcon challenge={challenge} height="1.3em" />
        </StyledLink>
      </Stack>
      <DifficultyMoveDisplay from={fromDiff} to={toDiff} />
    </Stack>
  );
}
