import { Button, Checkbox, Chip, Divider, FormControlLabel, Grid, Stack, Typography } from "@mui/material";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledLink,
  getErrorFromMultiple,
} from "../components/BasicComponents";
import { GlobalStatsComponent, TiersCountDisplay } from "./Index";
import { getQueryData, useGetAllDifficulties, useGetStats } from "../hooks/useApi";
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
  getMapName,
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
import { all } from "axios";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Changelog } from "../components/Changelog";
import { DifficultyMoveDisplay } from "./Suggestions";

export function PageMonthlyRecap() {
  const { month } = useParams();
  const navigate = useNavigate();

  const sliceMonth = (date) => date.toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(month ? month : sliceMonth(new Date()));
  //month is in format: YYYY-MM

  const newerMonth = new Date(selectedMonth + "-02");
  newerMonth.setMonth(newerMonth.getMonth() + 1);
  const olderMonth = new Date(selectedMonth + "-02");
  olderMonth.setMonth(olderMonth.getMonth() - 1);
  const hasNewerMonth = newerMonth <= new Date();

  const setMonth = (date) => {
    setSelectedMonth(sliceMonth(date));
    navigate("/monthly-recap/" + sliceMonth(date), { replace: true });
  };

  useEffect(() => {
    if (month !== selectedMonth && month !== undefined) {
      setSelectedMonth(month);
    }
  }, [month]);

  return (
    <BasicContainerBox maxWidth="md">
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => setMonth(olderMonth)}>
          <Stack direction="row" alignItems="center" gap={1}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Less Recent '{sliceMonth(olderMonth)}'
          </Stack>
        </Button>
        <span style={{ flex: 1 }}></span>
        <Button disabled={!hasNewerMonth} variant="outlined" onClick={() => setMonth(newerMonth)}>
          <Stack direction="row" alignItems="center" gap={1}>
            More Recent '{sliceMonth(newerMonth)}'
            <FontAwesomeIcon icon={faArrowRight} />
          </Stack>
        </Button>
      </Stack>

      <MonthlyRecap month={selectedMonth} />
    </BasicContainerBox>
  );
}

function MonthlyRecap({ month }) {
  const [allClearsDifficulty, setAllClearsDifficulty] = useLocalStorage(
    "monthly_recap_all_clears_tier_sort",
    null
  );
  const [firstClearsDifficulty, setFirstClearsDifficulty] = useLocalStorage(
    "monthly_recap_first_clears_tier_sort",
    null
  );
  const [hideChangelog, setHideChangelog] = useLocalStorage("monthly_recap_hide_changelog", false);

  const query = useGetStats("monthly_recap", month, allClearsDifficulty?.sort, firstClearsDifficulty?.sort);
  const snapshotQuery = useGetStats("all", month);

  const diffGrid = (
    <Grid container columnSpacing={2} sx={{ mb: 1 }}>
      <Grid item xs={12} md={6}>
        <DifficultySelectControlled
          label="Normal Clears Min. Difficulty"
          fullWidth
          difficultyId={allClearsDifficulty?.id ?? 3}
          setDifficulty={setAllClearsDifficulty}
          minSort={8}
          maxSort={19}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <DifficultySelectControlled
          label="First Clears Min. Difficulty"
          fullWidth
          difficultyId={firstClearsDifficulty?.id ?? 12}
          setDifficulty={setFirstClearsDifficulty}
          minSort={3}
          maxSort={19}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={<Checkbox />}
          label="Hide Changelog"
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
      <HeadTitle title={`Monthly Recap '${month}'`} />
      {diffGrid}

      <Divider sx={{ mt: 1, mb: 2 }} />

      <Typography variant="h5" textAlign="center">
        Monthly Recap for '{month}'
      </Typography>

      <Typography variant="h6" sx={{ mt: 2 }}>
        Total clears this month
      </Typography>
      <TiersCountDisplay stats={difficulty} differences={tier_clears} hideEmpty equalWidths={3} />

      <Typography variant="h6" sx={{ mt: 3 }}>
        Timeline
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
    const date = new Date(submission.date_created).setHours(0, 0, 0, 0);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(submission);
    return acc;
  }, {});

  //Group newly cleared challenges by date
  const newlyClearedByDate = newly_cleared_t3.reduce((acc, challenge) => {
    const date = new Date(challenge.submissions[0].date_created).setHours(0, 0, 0, 0);
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
  const dateStr = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);
  const nameIsSame = map?.name === campaign.name;
  const isBold = isFirstClear && challenge.difficulty.sort > 16;
  return (
    <Stack
      direction="row"
      columnGap={1}
      fontWeight={isBold ? "bold" : "inherit"}
      alignItems="center"
      sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}
    >
      <Chip size="small" label={isFirstClear ? "First Clear" : "Clear"} />
      <PlayerChip player={submission.player} size="small" />
      <DifficultyChip difficulty={challenge.difficulty} sx={{ mt: "1px" }} />
      <Stack direction="row" alignItems="center" columnGap={1} flexWrap="wrap">
        <StyledLink to={"/campaign/" + campaign.id}>{getCampaignName(campaign, true)}</StyledLink>
        {!nameIsSame && map && (
          <>
            {"/"}
            <StyledLink to={"/map/" + map.id}>{getMapName(map)}</StyledLink>
          </>
        )}
        {challenge.description && (
          <Typography variant="body2" color="textSecondary">
            [{challenge.description}]
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
      <Chip label="Moved" size="small" />
      <Stack direction="row" alignItems="center" columnGap={1} flexWrap="wrap">
        <StyledLink to={"/campaign/" + campaign.id}>{getCampaignName(campaign, true)}</StyledLink>
        {!nameIsSame && map && (
          <>
            {"/"}
            <StyledLink to={"/map/" + map.id}>{getMapName(map)}</StyledLink>
          </>
        )}
        {challenge.description && (
          <Typography variant="body2" color="textSecondary">
            [{challenge.description}]
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
