import { useQuery } from "react-query";
import { fetchTopGoldenList } from "../util/api";
import { BasicBox, ErrorDisplay, LoadingSpinner, StyledExternalLink, StyledLink } from "./BasicComponents";
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
import { getDifficultyColorsSettings } from "../util/constants";
import { Link } from "react-router-dom";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faEdit, faExternalLink, faHashtag, faList } from "@fortawesome/free-solid-svg-icons";
import { ChallengeSubmissionTable } from "../pages/Challenge";
import { getChallengeDescription, getChallengeIsArbitrary, getMapName } from "../util/data_util";
import { CampaignIcon, ChallengeFcIcon, DifficultyChip } from "../components/GoldberriesComponents";
import { useAuth } from "../hooks/AuthProvider";
import { getQueryData } from "../hooks/useApi";
import { useLocalStorage } from "@uidotdev/usehooks";
import { CustomModal, useModal } from "../hooks/useModal";
import { FormChallengeWrapper } from "./forms/Challenge";
import { useTheme } from "@emotion/react";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { MapDisplay } from "../pages/Map";
import { set } from "react-hook-form";

export function TopGoldenList({ type, id, archived = false, arbitrary = false }) {
  const [useSuggestedDifficulties, setUseSuggestedDifficulties] = useLocalStorage(
    "top_golden_list_useSuggestedDifficulties",
    false
  );
  const currentKey = "" + type + id + archived + arbitrary;
  const [renderUpTo, setRenderUpTo] = useState({ key: currentKey, index: 0 });

  console.log("Rendering TopGoldenList", currentKey, renderUpTo);

  const query = useQuery({
    queryKey: ["top_golden_list", type, id, archived, arbitrary],
    queryFn: () => fetchTopGoldenList(type, id, archived, arbitrary),
  });

  // Reset the render up to index when the key changes
  useEffect(() => {
    console.log("useEffect resetting renderUpTo", currentKey);
    setRenderUpTo({ key: currentKey, index: 0 });
  }, [type, id, archived, arbitrary]);

  // Set horizontal overflow only for this page
  useEffect(() => {
    console.log("useEffect scrolling");
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
  };

  const onFinishRendering = useCallback((index) => {
    if (index !== renderUpTo.index) return;
    setTimeout(() => {
      setRenderUpTo((prev) => {
        return { key: prev.key, index: prev.index + 1 };
      });
    }, 50);
  });
  const showMap = useCallback((id) => {
    modalRefs.map.show.current.open({ id });
  });
  const openEditChallenge = useCallback((id) => {
    modalRefs.challenge.edit.current.open({ id });
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

  return (
    <Stack direction="column" gap={1}>
      {isPlayer && (
        <BasicBox>
          <Stack direction="row" spacing={2} sx={{ py: 0 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={useSuggestedDifficulties}
                  onChange={(e) => setUseSuggestedDifficulties(e.target.checked)}
                />
              }
              label="Use Suggested Difficulties for ranking"
            />
          </Stack>
        </BasicBox>
      )}
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        gap={1}
      >
        {topGoldenList.tiers.map((tier, index) => {
          if (currentKey !== renderUpTo.key) return null;
          return (
            <MemoTopGoldenListGroup
              key={currentKey + index}
              index={index}
              tier={tier}
              campaigns={topGoldenList.campaigns}
              maps={topGoldenList.maps}
              challenges={topGoldenList.challenges}
              isPlayer={isPlayer}
              useSuggested={useSuggestedDifficulties}
              openEditChallenge={openEditChallenge}
              showMap={showMap}
              render={index <= renderUpTo.index}
              onFinishRendering={onFinishRendering}
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
  tier,
  campaigns,
  maps,
  challenges,
  isPlayer = false,
  useSuggested = false,
  openEditChallenge,
  showMap,
  render,
  onFinishRendering,
}) {
  const theme = useTheme();
  const name = tier[0].name;
  const { settings } = useAppSettings();
  const colors = getDifficultyColorsSettings(settings, tier[0].id);
  const [collapsed, setCollapsed] = useState(false);
  const glowColor = darken(colors.group_color, 0.5);

  useEffect(() => {
    if (render) onFinishRendering(index);
  }, [render]);

  if (render) {
    console.log("Rendering TopGoldenListGroup", index, name);
  } else {
    console.log("Not rendering TopGoldenListGroup", index, name);
  }

  if (!render) return null;

  return (
    <>
      <Stack direction="column" gap={1}>
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead onClick={() => setCollapsed(!collapsed)}>
              <TableRow>
                <TableCell
                  sx={{
                    p: 0,
                    pl: 1,
                  }}
                ></TableCell>
                <TableCell colSpan={1} sx={{ pl: 1 }}>
                  <Typography fontWeight="bold" sx={{ textTransform: "capitalize", whiteSpace: "nowrap" }}>
                    {name}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    borderLeft: "1px solid " + theme.palette.tableDivider,
                  }}
                  align="center"
                >
                  <Typography fontWeight="bold" textAlign="center">
                    {isPlayer ? (
                      <Tooltip title="Suggested difficulties of this player" arrow placement="top">
                        Sug.
                      </Tooltip>
                    ) : (
                      <Tooltip
                        title="This column shows the number of people who did a challenge"
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
                    borderLeft: "1px solid " + theme.palette.tableDivider,
                  }}
                  align="center"
                >
                  <Typography fontWeight="bold">
                    <Tooltip
                      title="These links lead to the video of the first clear of a challenge"
                      arrow
                      placement="top"
                    >
                      <FontAwesomeIcon icon={faExternalLink} fontSize=".8em" />
                    </Tooltip>
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            {collapsed || !render ? null : (
              <TableBody>
                {tier.map((subtier) => {
                  const tierChallenges = challenges.filter(
                    (challenge) =>
                      (useSuggested
                        ? challenge.submissions[0].suggested_difficulty?.id ?? challenge.difficulty.id
                        : challenge.difficulty.id) === subtier.id
                  );

                  return (
                    <TopGoldenListSubtier
                      key={subtier.id}
                      subtier={subtier}
                      challenges={tierChallenges}
                      maps={maps}
                      campaigns={campaigns}
                      isPlayer={isPlayer}
                      useSuggested={useSuggested}
                      openEditChallenge={openEditChallenge}
                      showMap={showMap}
                    />
                  );
                })}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Stack>
    </>
  );
}
const MemoTopGoldenListGroup = memo(TopGoldenListGroup, (prevProps, newProps) => {
  console.log("Memo comparison called");
  return prevProps.index === newProps.index && prevProps.render === newProps.render;
});

function TopGoldenListSubtier({
  subtier,
  challenges,
  maps,
  campaigns,
  isPlayer,
  useSuggested,
  openEditChallenge,
  showMap,
}) {
  return (
    <>
      {challenges.map((challenge) => {
        const map = maps[challenge.map_id];
        const campaign = campaigns[map.campaign_id];

        return (
          <TopGoldenListRow
            key={challenge.id}
            subtier={subtier}
            challenge={challenge}
            campaign={campaign}
            map={map}
            isPlayer={isPlayer}
            useSuggested={useSuggested}
            openEditChallenge={openEditChallenge}
            showMap={showMap}
          />
        );
      })}
    </>
  );
}

function TopGoldenListRow({
  subtier,
  challenge,
  campaign,
  map,
  isPlayer,
  useSuggested,
  openEditChallenge,
  showMap,
}) {
  const auth = useAuth();
  const theme = useTheme();
  const { settings } = useAppSettings();
  const darkmode = settings.visual.darkmode;
  const colors = getDifficultyColorsSettings(settings, subtier.id);

  const rowStyle = {
    backgroundColor: colors.color,
    color: colors.contrast_color,
  };
  const cellStyle = {
    padding: "2px 8px",
  };

  const name = getMapName(map, campaign);
  const nameSuffix = challenge.description === null ? "" : ` [${getChallengeDescription(challenge)}]`;
  const arbitrarySuffix = getChallengeIsArbitrary(challenge) ? " (A)" : "";

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
        <Stack direction="row" gap={1} alignItems="center" justifyContent="center">
          <ChallengeFcIcon challenge={challenge} height="1.3em" />
        </Stack>
      </TableCell>
      <TableCell
        sx={{
          ...rowStyle,
          ...cellStyle,
          textAlign: "left",
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
                maxWidth: "250px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onClick={() => showMap(map.id)}
            >
              {overflowActive ? (
                <Tooltip title={name} arrow placement="top">
                  <span ref={mapNameRef} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {name}
                  </span>
                </Tooltip>
              ) : (
                <span ref={mapNameRef} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  {name}
                </span>
              )}
              {nameSuffix !== "" ||
                (arbitrarySuffix !== "" && (
                  <span style={{ color: theme.palette.text.secondary }}>{nameSuffix + arbitrarySuffix}</span>
                ))}
            </Stack>
          </Box>
          {settings.visual.topGoldenList.showCampaignIcons && (
            <CampaignIcon campaign={campaign} height="1em" doLink />
          )}
        </Stack>
      </TableCell>
      <TableCell
        style={{
          ...rowStyle,
          ...cellStyle,
          display: useSuggested ? "table-cell" : "table-cell",
          fontSize: "1em",
          borderLeft: "1px solid " + theme.palette.tableDivider,
        }}
        align="right"
      >
        {isPlayer ? (
          <Stack direction="row" gap={1} alignItems="center" justifyContent="center">
            <DifficultyChip difficulty={challenge.submissions[0].suggested_difficulty} />
          </Stack>
        ) : (
          <Tooltip
            componentsProps={{
              tooltip: {
                sx: {
                  width: {
                    xs: "95vw",
                    sm: "auto",
                  },
                  maxWidth: {
                    xs: "95vw",
                    sm: "none",
                  },
                  maxHeight: "400px",
                  overflowY: "scroll",
                },
              },
            }}
            enterTouchDelay={0}
            leaveTouchDelay={0}
            leaveDelay={200}
            title={
              <>
                {auth.hasPlayerClaimed ? (
                  <Stack direction="column" gap="2px" sx={{ mb: "2px" }}>
                    <Link to={"/submit/single-challenge/" + challenge.id}>
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        color="info"
                        startIcon={<FontAwesomeIcon icon={faBook} />}
                      >
                        Submit
                      </Button>
                    </Link>
                    {auth.hasVerifierPriv && (
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        color="info"
                        startIcon={<FontAwesomeIcon icon={faEdit} />}
                        onClick={() => openEditChallenge(challenge.id)}
                      >
                        Edit
                      </Button>
                    )}
                  </Stack>
                ) : null}
                <ChallengeSubmissionTable challenge={challenge} compact />
              </>
            }
            enterDelay={500}
          >
            <Stack
              direction="row"
              gap={1}
              alignItems="center"
              justifyContent="flex-end"
              sx={{ cursor: "pointer" }}
            >
              {challenge.submissions.length}
              <Typography color="info.dark" sx={{}}>
                <FontAwesomeIcon icon={faList} />
              </Typography>
            </Stack>
          </Tooltip>
        )}
      </TableCell>
      <TableCell style={{ ...rowStyle, ...cellStyle, borderLeft: "1px solid " + theme.palette.tableDivider }}>
        <Stack direction="row" gap={1} alignItems="center" justifyContent="center">
          {challenge.submissions.length === 0 ? null : (
            <StyledExternalLink
              style={{ color: "inherit", textDecoration: "none", lineHeight: "1" }}
              href={challenge.submissions[0].proof_url}
              target="_blank"
              rel="noreferrer"
            >
              ▶
            </StyledExternalLink>
          )}
          {isPlayer ? (
            <StyledLink to={"/submission/" + challenge.submissions[0].id}>
              <FontAwesomeIcon icon={faBook} />
            </StyledLink>
          ) : null}
        </Stack>
      </TableCell>
    </TableRow>
  );
}

function ModalContainer({ modalRefs }) {
  const showMapModal = useModal();
  const editChallengeModal = useModal();

  // Setting the refs
  modalRefs.map.show.current = showMapModal;
  modalRefs.challenge.edit.current = editChallengeModal;

  return (
    <>
      <CustomModal modalHook={showMapModal} options={{ hideFooter: true }}>
        {showMapModal.data?.id == null ? <LoadingSpinner /> : <MapDisplay id={showMapModal.data.id} />}
      </CustomModal>

      <CustomModal modalHook={editChallengeModal} options={{ hideFooter: true }}>
        {editChallengeModal.data?.id == null ? (
          <LoadingSpinner />
        ) : (
          <FormChallengeWrapper id={editChallengeModal.data.id} onSave={editChallengeModal.close} />
        )}
      </CustomModal>
    </>
  );
}
