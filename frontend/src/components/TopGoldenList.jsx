import { useQuery } from "react-query";
import { fetchTopGoldenList } from "../util/api";
import { BasicBox, ErrorDisplay, LoadingSpinner, StyledExternalLink } from "./BasicComponents";
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
import { useEffect, useRef, useState } from "react";
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

export function TopGoldenList({ type, id, archived = false, arbitrary = false }) {
  const [useSuggestedDifficulties, setUseSuggestedDifficulties] = useLocalStorage(
    "top_golden_list_useSuggestedDifficulties",
    false
  );

  const query = useQuery({
    queryKey: ["top_golden_list", type, id, archived, arbitrary],
    queryFn: () => fetchTopGoldenList(type, id, archived, arbitrary),
    cacheTime: 0,
    staleTime: 0,
  });

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
  };

  const showMap = (id) => {
    modalRefs.map.show.current.open({ id });
  };
  const openEditChallenge = (id) => {
    modalRefs.challenge.edit.current.open({ id });
  };

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
        {topGoldenList.tiers.map((tier, index) => (
          <TopGoldenListGroup
            key={index}
            tier={tier}
            campaigns={topGoldenList.campaigns}
            maps={topGoldenList.maps}
            challenges={topGoldenList.challenges}
            isPlayer={isPlayer}
            useSuggested={useSuggestedDifficulties}
            openEditChallenge={openEditChallenge}
            showMap={showMap}
          />
        ))}
      </Stack>
      <ModalContainer modalRefs={modalRefs} />
    </Stack>
  );
}

function TopGoldenListGroup({
  tier,
  campaigns,
  maps,
  challenges,
  isPlayer = false,
  useSuggested = false,
  openEditChallenge,
  showMap,
}) {
  const theme = useTheme();
  const name = tier[0].name;
  const { settings } = useAppSettings();
  const colors = getDifficultyColorsSettings(settings, tier[0].id);
  const [collapsed, setCollapsed] = useState(false);
  const glowColor = darken(colors.group_color, 0.5);

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
                    {isPlayer ? "Sug." : <FontAwesomeIcon icon={faHashtag} fontSize=".8em" />}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    borderLeft: "1px solid " + theme.palette.tableDivider,
                  }}
                  align="center"
                >
                  <Typography fontWeight="bold">
                    <FontAwesomeIcon icon={faExternalLink} fontSize=".8em" />
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            {collapsed ? null : (
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
            <Box
              component="span"
              sx={{
                cursor: "pointer",
                color: "inherit",
                textDecoration: "none",
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: darkmode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)",
                },
              }}
              onClick={() => showMap(map.id)}
            >
              <span>{name}</span>
              <span style={{ color: theme.palette.text.secondary }}>{nameSuffix + arbitrarySuffix}</span>
            </Box>
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
                      <Button variant="contained" size="small" fullWidth color="info">
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
              <Typography color="info.dark" sx={{ filter: "drop-shadow(0px 0px 1px white)" }}>
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
            <Link to={"/submission/" + challenge.submissions[0].id}>
              <FontAwesomeIcon icon={faBook} />
            </Link>
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
