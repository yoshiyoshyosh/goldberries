import { useQuery } from "react-query";
import { fetchTopGoldenList } from "../util/api";
import { ErrorDisplay, LoadingSpinner } from "./BasicComponents";
import {
  Box,
  Button,
  Checkbox,
  Divider,
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
} from "@mui/material";
import { getDifficultyColors, getDifficultyColorsTheme } from "../util/constants";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faEdit,
  faExternalLink,
  faHashtag,
  faList,
  faListNumeric,
} from "@fortawesome/free-solid-svg-icons";
import { ChallengeSubmissionTable } from "../pages/Challenge";
import {
  getChallengeFcShort,
  getChallengeObjectiveSuffix,
  getDifficultyName,
  getMapName,
} from "../util/data_util";
import { CampaignIcon, DifficultyChip } from "../components/GoldberriesComponents";
import { useAuth } from "../hooks/AuthProvider";
import { getQueryData } from "../hooks/useApi";
import { useLocalStorage } from "@uidotdev/usehooks";
import { CustomModal, useModal } from "../hooks/useModal";
import { FormChallengeWrapper } from "./forms/Challenge";
import { useTheme } from "@emotion/react";

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
    challenge: {
      edit: useRef(),
    },
  };

  const openEditChallenge = (id) => {
    modalRefs.challenge.edit.current.open({ id });
  };

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const topGoldenList = getQueryData(query);
  const isPlayer = type === "player";

  return (
    <Stack direction="column" gap={1}>
      {isPlayer && (
        <Stack direction="row" spacing={2}>
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
      )}
      <Stack direction="row" gap={1}>
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
}) {
  const theme = useTheme();
  const colors = getDifficultyColorsTheme(theme, tier[0].id);

  return (
    <>
      <Stack direction="column" gap={1}>
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
            />
          );
        })}
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
}) {
  const theme = useTheme();
  const name = subtier.name;
  const subtierAddition = subtier.subtier ? ` - ${subtier.subtier}` : "";

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography fontWeight="bold" sx={{ textTransform: "capitalize" }}>
                {name + subtierAddition}
              </Typography>
            </TableCell>
            <TableCell
              sx={{
                borderLeft: "1px solid " + theme.palette.tableDivider,
              }}
              align="center"
            >
              <Typography fontWeight="bold" textAlign="center">
                <FontAwesomeIcon icon={faHashtag} fontSize=".8em" />
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
        <TableBody>
          {challenges.length === 0 && (
            <TableRow>
              <TableCell colSpan={3}>
                <Typography>No challenges in tier</Typography>
              </TableCell>
            </TableRow>
          )}
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
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function TopGoldenListRow({ subtier, challenge, campaign, map, isPlayer, useSuggested, openEditChallenge }) {
  const auth = useAuth();
  const theme = useTheme();
  const colors = getDifficultyColorsTheme(theme, subtier.id);

  const rowStyle = {
    backgroundColor: colors.color,
    color: colors.contrast_color,
  };
  const cellStyle = {
    padding: "2px 8px",
  };

  const name =
    getChallengeFcShort(challenge, true) +
    " " +
    getMapName(map, campaign) +
    " " +
    getChallengeObjectiveSuffix(challenge);

  return (
    <TableRow style={rowStyle}>
      <TableCell
        sx={{
          ...rowStyle,
          ...cellStyle,
          textAlign: "left",
          pl: 2,
        }}
      >
        <Link
          style={{
            color: "inherit",
            textDecoration: "none",
          }}
          to={"/map/" + map.id}
        >
          <Stack direction="row" gap={1} alignItems="center" sx={{ width: "200px" }}>
            <CampaignIcon campaign={campaign} height="1em" />
            <span
              style={{
                width: "200px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <Tooltip title={name} enterTouchDelay={0} leaveTouchDelay={0} leaveDelay={200}>
                {name}
              </Tooltip>
            </span>
          </Stack>
        </Link>
      </TableCell>
      <TableCell
        style={{
          ...rowStyle,
          ...cellStyle,
          display: useSuggested ? "none" : "table-cell",
          // fontWeight: "bold",
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
          <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-end">
            {challenge.submissions.length}
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
            >
              <Typography color="info.dark" sx={{ cursor: "pointer" }}>
                <FontAwesomeIcon icon={faList} />
              </Typography>
            </Tooltip>
          </Stack>
        )}
      </TableCell>
      <TableCell style={{ ...rowStyle, ...cellStyle, borderLeft: "1px solid " + theme.palette.tableDivider }}>
        <Stack direction="row" gap={1} alignItems="center" justifyContent="center">
          {challenge.submissions.length === 0 ? null : (
            <Link style={{ color: "black", textDecoration: "none" }} to={challenge.submissions[0].proof_url}>
              ▶
            </Link>
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
  const editChallengeModal = useModal();

  // Setting the refs
  modalRefs.challenge.edit.current = editChallengeModal;

  return (
    <>
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
