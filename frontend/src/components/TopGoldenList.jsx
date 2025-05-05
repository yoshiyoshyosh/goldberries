import {
  BasicBox,
  CustomIconButton,
  ErrorDisplay,
  LoadingSpinner,
  StyledExternalLink,
  StyledLink,
  TooltipLineBreaks,
} from "./BasicComponents";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  darken,
} from "@mui/material";
import { DIFFICULTY_STACKS, getNewDifficultyColors, getOldDifficultyName } from "../util/constants";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faClock,
  faComment,
  faEdit,
  faExclamationTriangle,
  faExternalLink,
  faHashtag,
  faInfoCircle,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { ChallengeDisplay } from "../pages/Challenge";
import { getChallengeSuffix, getMapName, secondsToDuration } from "../util/data_util";
import {
  CampaignIcon,
  ChallengeFcIcon,
  DifficultyChip,
  SubmissionFcIcon,
} from "../components/GoldberriesComponents";
import { useAuth } from "../hooks/AuthProvider";
import { getQueryData, useGetTopGoldenList } from "../hooks/useApi";
import { useLocalStorage } from "@uidotdev/usehooks";
import { CustomModal, useModal } from "../hooks/useModal";
import { FormChallengeWrapper } from "./forms/Challenge";
import { useTheme } from "@emotion/react";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { MapDisplay } from "../pages/Map";
import Color from "color";
import { useTranslation } from "react-i18next";
import { FormSubmissionWrapper } from "./forms/Submission";
import { ErrorBoundary } from "./ErrorBoundary";

export function TopGoldenList({ type, id, filter, isOverallList = false, useSuggestedRef = null }) {
  return (
    <Stack direction="column" gap={1}>
      <ErrorBoundary>
        <TopGoldenListComponent
          type={type}
          id={id}
          filter={filter}
          isOverallList={isOverallList}
          useSuggestedRef={useSuggestedRef}
        />
      </ErrorBoundary>
    </Stack>
  );
}
function TopGoldenListComponent({ type, id, filter, isOverallList = false, useSuggestedRef }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.top_golden_list" });
  const auth = useAuth();
  const { settings } = useAppSettings();
  const [useSuggestedDifficulties, setUseSuggestedDifficulties] = useLocalStorage(
    "top_golden_list_useSuggestedDifficulties",
    false
  );

  if (useSuggestedRef !== null) {
    useSuggestedRef.current = useSuggestedDifficulties;
  }

  const [editSuggestions, setEditSuggestions] = useState(false);

  const currentKey =
    "" +
    type +
    id +
    filter.archived +
    filter.undetermined +
    filter.min_diff_id +
    filter.max_diff_id +
    filter.hide_objectives.join(",") +
    filter.sub_count +
    filter.sub_count_is_min +
    filter.clear_state +
    filter.start_date +
    filter.end_date +
    settings.visual.topGoldenList.darkenTierColors +
    settings.visual.topGoldenList.showCampaignIcons +
    settings.visual.topGoldenList.useTextFcIcons +
    settings.visual.topGoldenList.switchMapAndChallenge +
    settings.visual.topGoldenList.hideEmptyTiers +
    settings.visual.topGoldenList.hideTimeTakenColumn +
    settings.visual.topGoldenList.showFractionalTiers +
    settings.general.showFractionalTiers +
    settings.visual.topGoldenList.unstackTiers;
  const [renderUpTo, setRenderUpTo] = useState({ key: currentKey, index: 0 });

  const query = useGetTopGoldenList(type, id, filter);

  // Reset the render up to index when the key changes
  useEffect(() => {
    // console.log("Checking to see if key changed");
    if (currentKey !== renderUpTo.key) {
      // console.log("Resetting render up to index");
      setRenderUpTo({ key: currentKey, index: 0 });
    }
  }, [
    type,
    id,
    filter.archived,
    filter.undetermined,
    filter.min_diff_id,
    filter.max_diff_id,
    filter.hide_objectives,
    filter.sub_count,
    filter.sub_count_is_min,
    filter.clear_state,
    filter.start_date,
    filter.end_date,
    settings.visual.topGoldenList.darkenTierColors,
    settings.visual.topGoldenList.showCampaignIcons,
    settings.visual.topGoldenList.useTextFcIcons,
    settings.visual.topGoldenList.switchMapAndChallenge,
    settings.visual.topGoldenList.hideEmptyTiers,
    settings.visual.topGoldenList.hideTimeTakenColumn,
    settings.visual.topGoldenList.showFractionalTiers,
    settings.general.showFractionalTiers,
    settings.visual.topGoldenList.unstackTiers,
  ]);

  // Set horizontal overflow only for this page
  useEffect(() => {
    document.body.parentElement.style.overflowX = "auto";
    return () => {
      document.body.parentElement.style.overflowX = "hidden";
    };
  }, []);

  const modalRefs = {
    map: {
      show: useRef(),
    },
    challenge: {
      edit: useRef(),
    },
    submission: {
      edit: useRef(),
    },
  };

  const onFinishRendering = useCallback((index) => {
    if (index !== renderUpTo.index) return;
    setTimeout(() => {
      setRenderUpTo((prev) => {
        return { key: prev.key, index: prev.index + 1 };
      });
    }, 50);
  });
  const showMap = useCallback((id, challengeId, isCampaign) => {
    modalRefs.map.show.current.open({ id, challengeId, isCampaign });
  });
  const openEditChallenge = useCallback((id) => {
    modalRefs.challenge.edit.current.open({ id });
  });
  const openEditSubmission = useCallback((id) => {
    modalRefs.submission.edit.current.open({ id });
  });

  if (query.isLoading) {
    return (
      <BasicBox sx={{ width: "fit-content" }}>
        <LoadingSpinner />
      </BasicBox>
    );
  } else if (query.isError) {
    return (
      <BasicBox sx={{ width: "fit-content" }}>
        <ErrorDisplay error={query.error} />
      </BasicBox>
    );
  }

  const topGoldenList = getQueryData(query);
  const isPlayer = type === "player";
  const ownPlayer = isPlayer && auth.hasPlayerClaimed && auth.user.player_id + "" === id;

  //topGoldenList.tiers is an array of difficulties, sorted so that hardest = first
  //format these difficulties into groups, based on DIFFICULTY_STACKS array, which looks like:
  //[ [2, 3, 24], [4, 5, 6], ... ] <- each inner array is a group of difficulties that are supposed to be stacked on top of each other

  const unstack = settings.visual.topGoldenList.unstackTiers;
  let tierStacks = null;

  if (unstack) {
    //Just put all tiers in the array
    tierStacks = topGoldenList.tiers.map((tier) => [tier]);
  } else {
    tierStacks = DIFFICULTY_STACKS.map((stack) => {
      return stack.map((id) => {
        return topGoldenList.tiers.find((diff) => diff.id === id);
      });
    });

    //Filter out any undefined stacks that end up being undefined
    tierStacks = tierStacks.filter((stack) => stack[0] !== undefined);
    //Filter out any undefined difficulties IN each stack too
    tierStacks = tierStacks.map((stack) => stack.filter((diff) => diff !== undefined));
  }

  return (
    <Stack direction="column" gap={1}>
      {isPlayer && (
        <BasicBox>
          <Stack direction="column" gap={0} sx={{ py: 0, pl: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={useSuggestedDifficulties}
                  onChange={(e) => setUseSuggestedDifficulties(e.target.checked)}
                />
              }
              label={t("use_suggested")}
            />
            {(ownPlayer || auth.hasHelperPriv) && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editSuggestions}
                    onChange={(e) => setEditSuggestions(e.target.checked)}
                  />
                }
                label={t("toggle_edit_mode")}
              />
            )}
          </Stack>
        </BasicBox>
      )}
      {topGoldenList.challenges.length === 0 && (
        <BasicBox>
          <Typography variant="body2" color="textSecondary">
            {t("empty")}
          </Typography>
        </BasicBox>
      )}
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        gap={1}
      >
        {tierStacks.map((tierStack, index) => {
          if (currentKey !== renderUpTo.key) return null;
          return (
            <MemoTopGoldenListGroup
              key={currentKey + index}
              index={index}
              tierStack={tierStack}
              campaigns={topGoldenList.campaigns}
              maps={topGoldenList.maps}
              challenges={topGoldenList.challenges}
              isPlayer={isPlayer}
              isOwnPlayer={ownPlayer}
              useSuggested={isPlayer && useSuggestedDifficulties}
              editSuggestions={isPlayer && editSuggestions}
              openEditChallenge={openEditChallenge}
              openEditSubmission={openEditSubmission}
              showMap={showMap}
              render={index <= renderUpTo.index}
              onFinishRendering={onFinishRendering}
              isOverallList={isOverallList}
              isHidingObjective1={filter.hide_objectives.includes(1)}
            />
          );
        })}
      </Stack>
      <ModalContainer modalRefs={modalRefs} />
    </Stack>
  );
}

function TopGoldenListGroup({
  index,
  tierStack,
  campaigns,
  maps,
  challenges,
  isPlayer = false,
  isOwnPlayer = false,
  useSuggested = false,
  editSuggestions = false,
  openEditChallenge,
  openEditSubmission,
  showMap,
  render,
  onFinishRendering,
  isOverallList,
  isHidingObjective1,
}) {
  const { settings } = useAppSettings();

  useEffect(() => {
    if (render) onFinishRendering(index);
  }, [render]);

  if (!render) return null;

  const countChallengesInStack = tierStack.reduce((acc, tier) => {
    const count = challenges.filter(
      (challenge) =>
        (useSuggested
          ? challenge.submissions[0].suggested_difficulty?.id ?? challenge.difficulty.id
          : challenge.difficulty.id) === tier.id
    ).length;
    return acc + count;
  }, 0);
  if (countChallengesInStack === 0 && settings.visual.topGoldenList.hideEmptyTiers) return null;

  return (
    <Stack direction="column" gap={1}>
      {tierStack.map((tier, index) => {
        return (
          <TopGoldenListTier
            render={render}
            key={tier.id}
            tier={tier}
            challenges={challenges}
            maps={maps}
            campaigns={campaigns}
            isPlayer={isPlayer}
            isOwnPlayer={isOwnPlayer}
            useSuggested={useSuggested}
            editSuggestions={editSuggestions}
            openEditChallenge={openEditChallenge}
            openEditSubmission={openEditSubmission}
            showMap={showMap}
            isOverallList={isOverallList}
            isHidingObjective1={isHidingObjective1}
          />
        );
      })}
    </Stack>
  );
}
const MemoTopGoldenListGroup = memo(TopGoldenListGroup, (prevProps, newProps) => {
  return (
    prevProps.index === newProps.index &&
    prevProps.render === newProps.render &&
    prevProps.useSuggested === newProps.useSuggested &&
    prevProps.editSuggestions === newProps.editSuggestions
  );
});

function TopGoldenListTier({
  render,
  tier,
  challenges,
  maps,
  campaigns,
  isPlayer,
  isOwnPlayer,
  useSuggested,
  editSuggestions,
  openEditChallenge,
  openEditSubmission,
  showMap,
  isOverallList,
  isHidingObjective1,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.top_golden_list" });
  const { settings } = useAppSettings();
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const challengesInTier = challenges.filter(
    (challenge) =>
      (useSuggested
        ? challenge.submissions[0].suggested_difficulty?.id ?? challenge.difficulty.id
        : challenge.difficulty.id) === tier.id
  );

  const challengeCount = challengesInTier.length;
  const isEmptyTier = challengeCount === 0;
  const submissionCount = challengesInTier.reduce(
    (acc, challenge) => acc + challenge.data.submission_count,
    0
  );

  if (settings.visual.topGoldenList.hideEmptyTiers && isEmptyTier) {
    return null;
  }

  //Sort challenges by getMapName(challenge.map, challenge.map.campaign)
  const sortByFractionalTiers =
    (settings.visual.topGoldenList.showFractionalTiers && !isPlayer) ||
    (settings.general.showFractionalTiers && isPlayer);
  sortChallengesForTGL(challengesInTier, maps, campaigns, sortByFractionalTiers, isPlayer);

  const showTimeTakenColumn = isPlayer && !settings.visual.topGoldenList.hideTimeTakenColumn;
  const showOldTierNames = settings.general.showOldTierNames && false;

  const cellStyle = {
    borderBottom: "1px solid " + theme.palette.tableDivider,
  };

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table size="small">
        <TableHead onClick={() => setCollapsed(!collapsed)}>
          <TableRow>
            <TableCell sx={{ ...cellStyle, p: 0 }}>
              <Stack
                direction="row"
                gap={1}
                alignItems="center"
                justifyContent="center"
                sx={{ minWidth: "18px" }}
              ></Stack>
            </TableCell>
            <TableCell colSpan={1} sx={{ ...cellStyle, pl: 1 }}>
              <Stack direction="row" gap={1} alignItems="center">
                <Typography fontWeight="bold" sx={{ textTransform: "capitalize", whiteSpace: "nowrap" }}>
                  {tier.name}
                </Typography>
                {showOldTierNames && (
                  <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: "nowrap" }}>
                    ({getOldDifficultyName(tier.id)})
                  </Typography>
                )}
              </Stack>
            </TableCell>
            <TableCell
              sx={{
                ...cellStyle,
                borderLeft: "1px solid " + theme.palette.tableDivider,
                display: useSuggested ? "none" : "table-cell",
              }}
              align="center"
            >
              <Typography fontWeight="bold" textAlign="center">
                {isPlayer ? (
                  <Tooltip title={t("note_suggested_difficulties")} arrow placement="top">
                    <span>{t("suggestion_abbreviated")}</span>
                  </Tooltip>
                ) : (
                  <Tooltip
                    title={t("note_number_people", {
                      challenges: challengeCount,
                      submissions: submissionCount,
                    })}
                    arrow
                    placement="top"
                  >
                    <FontAwesomeIcon icon={faHashtag} fontSize=".8em" />
                  </Tooltip>
                )}
              </Typography>
            </TableCell>
            <TableCell
              sx={{
                ...cellStyle,
                borderLeft: "1px solid " + theme.palette.tableDivider,
              }}
              align="center"
            >
              <Typography fontWeight="bold">
                <Tooltip
                  title={t(isPlayer ? "note_video_link_personal" : "note_video_link_other")}
                  arrow
                  placement="top"
                >
                  <FontAwesomeIcon icon={faExternalLink} fontSize=".8em" />
                </Tooltip>
              </Typography>
            </TableCell>
            {showTimeTakenColumn && (
              <TableCell
                sx={{
                  ...cellStyle,
                  borderLeft: "1px solid " + theme.palette.tableDivider,
                }}
                align="center"
              >
                <Typography fontWeight="bold">
                  <Tooltip title={t("note_time_taken")} arrow placement="top">
                    <FontAwesomeIcon icon={faClock} fontSize=".8em" />
                  </Tooltip>
                </Typography>
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        {collapsed || !render ? null : (
          <TableBody>
            {isEmptyTier && (
              <TableRow>
                <TableCell colSpan={99} align="center" style={{ padding: "2px 8px" }}>
                  <Typography variant="body2" color="textSecondary">
                    -
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {challengesInTier.map((challenge, index) => {
              const map = maps[challenge.map_id];
              const campaign =
                map === undefined ? campaigns[challenge.campaign_id] : campaigns[map.campaign_id];

              return (
                <TopGoldenListRow
                  key={challenge.id}
                  tier={tier}
                  challenge={challenge}
                  campaign={campaign}
                  map={map}
                  isPlayer={isPlayer}
                  isOverallList={isOverallList}
                  isOwnPlayer={isOwnPlayer}
                  useSuggested={useSuggested}
                  editSuggestions={editSuggestions}
                  openEditChallenge={openEditChallenge}
                  openEditSubmission={openEditSubmission}
                  showMap={showMap}
                />
              );
            })}
          </TableBody>
        )}
      </Table>
    </TableContainer>
  );
}
export function sortChallengesForTGL(challenges, maps, campaigns, sortByFractionalTiers, isPlayer = false) {
  const sortChallenges = (a, b) => {
    //If fraction is available, use that for sorting first. if no frac is available, treat it as 0.5
    if (sortByFractionalTiers) {
      let fracA = 0.5;
      let fracB = 0.5;
      if (isPlayer) {
        //First sort for the suggested difficulty, if it exists
        const diffSortA = a.submissions[0].suggested_difficulty?.sort ?? a.difficulty.sort;
        const diffSortB = b.submissions[0].suggested_difficulty?.sort ?? b.difficulty.sort;

        if (diffSortA !== diffSortB) {
          return diffSortB - diffSortA;
        }

        fracA = a.submissions[0].frac ?? 50;
        fracB = b.submissions[0].frac ?? 50;
      } else {
        fracA = a.data.frac !== false && a.data.frac !== undefined ? a.data.frac : 0.5;
        fracB = b.data.frac !== false && b.data.frac !== undefined ? b.data.frac : 0.5;
      }
      if (fracA !== fracB) {
        return fracB - fracA;
      }
    }

    const mapA = maps[a.map_id];
    const mapB = maps[b.map_id];
    const campaignA = mapA === undefined ? campaigns[a.campaign_id] : campaigns[mapA.campaign_id];
    const campaignB = mapB === undefined ? campaigns[b.campaign_id] : campaigns[mapB.campaign_id];
    const mapNameA = getMapName(mapA, campaignA, true, false);
    const mapNameB = getMapName(mapB, campaignB, true, false);
    return mapNameA.localeCompare(mapNameB);
  };
  challenges.sort(sortChallenges);
  return challenges;
}

function TopGoldenListRow({
  tier,
  challenge,
  campaign,
  map,
  isPlayer,
  isOverallList,
  isOwnPlayer,
  useSuggested,
  editSuggestions,
  openEditChallenge,
  openEditSubmission,
  showMap,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.top_golden_list" });
  const auth = useAuth();
  const theme = useTheme();
  const { settings } = useAppSettings();
  const tpgSettings = settings.visual.topGoldenList;
  const darkmode = settings.visual.darkmode;
  const colors = getNewDifficultyColors(settings, tier.id, true);
  const isReference = challenge.data.is_stable;

  const showTimeTakenColumn = isPlayer && !settings.visual.topGoldenList.hideTimeTakenColumn;

  const rowStyle = {
    backgroundColor: colors.color,
    color: colors.contrast_color,
  };
  const cellStyle = {
    padding: "2px 8px",
    borderBottom: "1px solid " + theme.palette.tableDivider,
  };

  let nameSuffix = getChallengeSuffix(challenge) === null ? "" : `${getChallengeSuffix(challenge)}`;
  let name = nameSuffix !== "" ? `${getMapName(map, campaign)}` : getMapName(map, campaign);
  //TODO - Prepend tier fraction if the setting is enabled
  if (
    ((settings.visual.topGoldenList.showFractionalTiers && !isPlayer) ||
      (settings.general.showFractionalTiers && isPlayer)) &&
    (!isPlayer || useSuggested)
  ) {
    let frac = 0.5;
    if (isPlayer) {
      frac = (challenge.submissions[0].frac ?? 50) / 100;
    } else {
      frac = challenge.data.frac !== false && challenge.data.frac !== undefined ? challenge.data.frac : 0.5;
    }

    if (useSuggested && challenge.submissions[0].suggested_difficulty !== null) {
      frac += challenge.submissions[0].suggested_difficulty.sort;
    } else {
      frac += challenge.difficulty.sort;
    }
    name = `${frac.toFixed(2)} - ${name}`;
  }
  if (nameSuffix !== "") {
    if (!tpgSettings.switchMapAndChallenge) {
      nameSuffix = ` [${nameSuffix}]`;
    } else {
      name = ` [${name}]`;
    }
  }
  let suffixColor = new Color(colors.contrast_color);
  if (suffixColor.isDark()) {
    suffixColor = suffixColor.lightness(25).string();
  } else {
    suffixColor = suffixColor.lightness(75).string();
  }

  const firstSubmission = challenge.submissions[0];
  const firstSubmissionSuggestion = firstSubmission.suggested_difficulty;

  const [overflowActive, setOverflowActive] = useState(false);
  const mapNameRef = useRef();
  function isOverflowActive(event) {
    return event.offsetWidth < event.scrollWidth;
  }
  useEffect(() => {
    if (isOverflowActive(mapNameRef.current)) {
      setOverflowActive(true);
      return;
    }
    setOverflowActive(false);
  }, [isOverflowActive]);

  const [descOverflowActive, setDescOverflowActive] = useState(false);
  const labelRef = useRef();
  useEffect(() => {
    if (labelRef.current && isOverflowActive(labelRef.current)) {
      setDescOverflowActive(true);
      return;
    }
    setDescOverflowActive(false);
  }, [isOverflowActive]);

  const nameElement = (
    <span
      ref={mapNameRef}
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        color: nameSuffix !== "" && tpgSettings.switchMapAndChallenge ? suffixColor : "inherit",
        order: !tpgSettings.switchMapAndChallenge ? 1 : 2,
        // fontWeight: isReference ? "bold" : "normal",
      }}
    >
      {name}
    </span>
  );
  const labelElement = (
    <span
      ref={labelRef}
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        color: !tpgSettings.switchMapAndChallenge ? suffixColor : "inherit",
        order: !tpgSettings.switchMapAndChallenge ? 2 : 1,
      }}
    >
      {nameSuffix}
    </span>
  );

  const onEditSuggestion = () => {
    openEditSubmission(firstSubmission.id);
  };

  return (
    <TableRow style={rowStyle}>
      <TableCell
        sx={{
          ...rowStyle,
          ...cellStyle,
          p: 0,
          pl: 1,
        }}
        align="center"
      >
        <Stack direction="row" gap={1} alignItems="center" justifyContent="center" sx={{ minWidth: "18px" }}>
          <ChallengeFcIcon challenge={challenge} height="1.3em" allowTextIcons />
        </Stack>
      </TableCell>
      <TableCell
        sx={{
          ...rowStyle,
          ...cellStyle,
          textAlign: "left",
          width: isOverallList ? "250px" : undefined,
          minWidth: isOverallList ? "250px" : undefined,
          pl: 1,
        }}
      >
        <Stack direction="row" gap={1} alignItems="center">
          <Box
            component="span"
            sx={{
              whiteSpace: {
                xs: "normal",
                sm: "nowrap",
              },
            }}
          >
            <Stack
              direction="row"
              gap={0.5}
              sx={{
                cursor: "pointer",
                color: "inherit",
                textDecoration: "none",
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: darkmode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)",
                },
                maxWidth: isOverallList ? "230px" : "250px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onClick={() =>
                showMap(
                  map?.id ?? challenge.id,
                  map !== null ? challenge.id : null,
                  map === null || map === undefined
                )
              }
            >
              {overflowActive ? (
                <Tooltip title={name} arrow placement="top">
                  {nameElement}
                </Tooltip>
              ) : (
                nameElement
              )}
              {nameSuffix !== "" &&
                (descOverflowActive ? (
                  <Tooltip title={nameSuffix} arrow placement="top">
                    {labelElement}
                  </Tooltip>
                ) : (
                  labelElement
                ))}
            </Stack>
          </Box>
          {settings.visual.topGoldenList.showCampaignIcons && (
            <CampaignIcon campaign={campaign} height="1em" doLink />
          )}
          {isReference && (
            <Tooltip title={t("stable_explanation")} arrow placement="top">
              <span style={{ userSelect: "none", cursor: "default" }}>★</span>
            </Tooltip>
          )}
          {isPlayer &&
            useSuggested &&
            firstSubmission.suggested_difficulty_id !== null &&
            firstSubmission.suggested_difficulty_id !== challenge.difficulty_id && (
              <Tooltip
                title={
                  <span>
                    <DifficultyChip
                      difficulty={challenge.difficulty}
                      prefix={t("placement_difficulty") + " "}
                    />
                  </span>
                }
                arrow
                placement="top"
              >
                <FontAwesomeIcon icon={faInfoCircle} color="lightgrey" />
              </Tooltip>
            )}
          {isPlayer && firstSubmission.is_obsolete === true && (
            <TooltipLineBreaks title={t("obsolete_notice")}>
              <FontAwesomeIcon icon={faExclamationTriangle} color="lightgrey" />
            </TooltipLineBreaks>
          )}
          {isPlayer && firstSubmission.player_notes && (
            <TooltipLineBreaks title={firstSubmission.player_notes}>
              <FontAwesomeIcon icon={faComment} />
            </TooltipLineBreaks>
          )}
        </Stack>
      </TableCell>
      <TableCell
        style={{
          ...rowStyle,
          ...cellStyle,
          display: useSuggested ? "none" : "table-cell",
          fontSize: "1em",
          borderLeft: "1px solid " + theme.palette.tableDivider,
        }}
        align="right"
      >
        {isPlayer ? (
          <Stack direction="row" gap={1} alignItems="center" justifyContent="center">
            <DifficultyChip
              difficulty={
                useSuggested
                  ? firstSubmissionSuggestion === null
                    ? null
                    : challenge.difficulty
                  : firstSubmissionSuggestion
              }
              frac={firstSubmission.frac ?? 50}
              isPersonal={firstSubmission.is_personal}
              highlightPersonal
            />
          </Stack>
        ) : (
          <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-end" sx={{}}>
            {challenge.data.submission_count}
          </Stack>
        )}
      </TableCell>
      <TableCell style={{ ...rowStyle, ...cellStyle, borderLeft: "1px solid " + theme.palette.tableDivider }}>
        <Stack direction="row" gap={1} alignItems="center" justifyContent="center">
          {challenge.submissions.length !== 0 && (
            <StyledExternalLink
              style={{ color: "inherit", textDecoration: "none", lineHeight: "1" }}
              href={firstSubmission.proof_url}
              target="_blank"
              rel="noreferrer"
            >
              ▶
            </StyledExternalLink>
          )}
          {isPlayer && (
            <StyledLink to={"/submission/" + firstSubmission.id} style={{ display: "flex" }}>
              {firstSubmission.is_fc ? (
                <SubmissionFcIcon submission={firstSubmission} height="1.0em" disableTooltip />
              ) : (
                <FontAwesomeIcon icon={faBook} />
              )}
            </StyledLink>
          )}
          {isPlayer && (isOwnPlayer || auth.hasHelperPriv) && editSuggestions && (
            <CustomIconButton
              onClick={onEditSuggestion}
              sx={{
                py: 3 / 8,
                px: 8 / 8,
                color: colors.contrast_color,
                borderColor: colors.contrast_color,
              }}
            >
              <FontAwesomeIcon icon={faEdit} size="sm" />
            </CustomIconButton>
          )}
        </Stack>
      </TableCell>
      {showTimeTakenColumn && (
        <TableCell
          style={{ ...rowStyle, ...cellStyle, borderLeft: "1px solid " + theme.palette.tableDivider }}
        >
          <Stack direction="row" gap={1} alignItems="center" justifyContent="center">
            {secondsToDuration(firstSubmission.time_taken)}
          </Stack>
        </TableCell>
      )}
    </TableRow>
  );
}

function ModalContainer({ modalRefs }) {
  const showMapModal = useModal();
  const editChallengeModal = useModal();
  const editSubmissionModal = useModal();

  // Setting the refs
  modalRefs.map.show.current = showMapModal;
  modalRefs.challenge.edit.current = editChallengeModal;
  modalRefs.submission.edit.current = editSubmissionModal;

  return (
    <>
      <CustomModal
        modalHook={showMapModal}
        maxWidth={false}
        sx={{ maxWidth: "720px", margin: "auto" }}
        options={{ hideFooter: true }}
      >
        {showMapModal.data?.id == null ? (
          <LoadingSpinner />
        ) : showMapModal.data?.isCampaign ? (
          <ChallengeDisplay id={showMapModal.data.id} />
        ) : (
          <MapDisplay id={showMapModal.data.id} challengeId={showMapModal.data.challengeId} isModal />
        )}
      </CustomModal>

      <CustomModal modalHook={editChallengeModal} options={{ hideFooter: true }}>
        {editChallengeModal.data?.id == null ? (
          <LoadingSpinner />
        ) : (
          <FormChallengeWrapper id={editChallengeModal.data.id} onSave={editChallengeModal.close} />
        )}
      </CustomModal>

      <CustomModal modalHook={editSubmissionModal} options={{ hideFooter: true }}>
        {editSubmissionModal.data?.id == null ? (
          <LoadingSpinner />
        ) : (
          <FormSubmissionWrapper id={editSubmissionModal.data.id} onSave={editSubmissionModal.close} />
        )}
      </CustomModal>
    </>
  );
}
