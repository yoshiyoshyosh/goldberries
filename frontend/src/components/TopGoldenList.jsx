import { useQuery } from "react-query";
import { fetchTopGoldenList } from "../util/api";
import { ErrorDisplay, LoadingSpinner } from "./BasicComponents";
import { Box, Button, Checkbox, FormControlLabel, Stack, Tooltip, Typography } from "@mui/material";
import { getDifficultyColors } from "../util/constants";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faEdit, faList } from "@fortawesome/free-solid-svg-icons";
import { ChallengeSubmissionTable } from "../pages/Challenge";
import { getChallengeFcShort, getChallengeObjectiveSuffix, getMapName } from "../util/data_util";
import { DifficultyChip } from "../components/GoldberriesComponents";
import { useAuth } from "../hooks/AuthProvider";
import { getQueryData } from "../hooks/useApi";
import { useLocalStorage } from "@uidotdev/usehooks";
import { CustomModal, useModal } from "../hooks/useModal";
import { FormChallengeWrapper } from "./forms/Challenge";

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
      <Stack direction="row" gap={0}>
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
  const colors = getDifficultyColors(tier[0].id);

  const headerStyle = {
    backgroundColor: colors.group_color,
    borderRight: "1px solid black",
    borderLeft: "1px solid black",
    borderTop: "1px solid black",
    alignSelf: "flex-start",
  };
  const tableStyle = {
    backgroundColor: colors.group_color + "!important",
    textAlign: "center",
    fontSize: "130%",
    borderCollapse: "collapse",
  };
  const borderStyle = {
    borderBottom: "2px solid black",
  };

  return (
    <Box sx={{ mb: 5, display: "flex", flexDirection: "column" }} style={headerStyle}>
      <TopGoldenListGroupHeader tier={tier} />
      <table style={tableStyle} cellSpacing={0}>
        <thead style={borderStyle}>
          <tr>
            <th style={{ minWidth: "100px", borderRight: "1px solid black" }}>
              <Typography fontWeight="bold">Map</Typography>
            </th>
            <th
              style={{
                minWidth: "80px",
                borderRight: "1px solid black",
                display: useSuggested ? "none" : "table-cell",
              }}
            >
              <Typography fontWeight="bold">{isPlayer ? "Sug. Diff." : "Clears"}</Typography>
            </th>
            <th style={{ minWidth: "60px" }}>
              <Typography fontWeight="bold">Video</Typography>
            </th>
          </tr>
        </thead>
        <tbody>
          {tier.map((subtier) => {
            const tierChallenges = challenges.filter(
              (challenge) =>
                (useSuggested
                  ? challenge.submissions[0].suggested_difficulty?.id ?? challenge.difficulty.id
                  : challenge.difficulty.id) === subtier.id
            );
            return tierChallenges.map((challenge) => {
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
            });
          })}
        </tbody>
      </table>
    </Box>
  );
}

function TopGoldenListGroupHeader({ tier }) {
  const borderStyle = {
    borderBottom: "2px solid black",
  };
  return (
    <div style={borderStyle}>
      <Typography variant="h6" sx={{ mx: 5, may: 3, whiteSpace: "nowrap", textAlign: "center" }}>
        {/* {group.isRanked !== null ? (
          <span>
            {group.tier} [{group.isRanked ? "Ranked" : "Unranked"}]
          </span>
        ) : ( */}
        {tier[0].name}
        {/* )} */}
      </Typography>
    </div>
  );
}

function TopGoldenListRow({ subtier, challenge, campaign, map, isPlayer, useSuggested, openEditChallenge }) {
  const auth = useAuth();
  const colors = getDifficultyColors(subtier.id);

  const rowStyle = {
    backgroundColor: colors.color,
    borderBottom: "1px solid black",
  };
  const cellStyle = {
    borderLeft: "1px solid black",
  };

  return (
    <tr style={rowStyle}>
      <td
        style={{
          ...rowStyle,
          maxWidth: "300px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: "left",
          padding: "0 5px",
        }}
      >
        <Link style={{ color: "inherit", textDecoration: "none" }} to={"/map/" + map.id}>
          {getMapName(map, campaign)} {getChallengeFcShort(challenge, true)}{" "}
          {getChallengeObjectiveSuffix(challenge)}
        </Link>
      </td>
      <td
        style={{
          ...rowStyle,
          ...cellStyle,
          textAlign: "left",
          paddingLeft: isPlayer ? "0" : "5px",
          display: useSuggested ? "none" : "table-cell",
        }}
      >
        {isPlayer ? (
          <Stack direction="row" gap={1} alignItems="center" justifyContent="center">
            <DifficultyChip difficulty={challenge.submissions[0].suggested_difficulty} />
          </Stack>
        ) : (
          challenge.submissions.length
        )}
      </td>
      <td style={{ ...rowStyle, ...cellStyle }}>
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
            >
              <Typography color="info.dark" sx={{ cursor: "pointer" }}>
                <FontAwesomeIcon icon={faList} />
              </Typography>
            </Tooltip>
          )}
        </Stack>
      </td>
    </tr>
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
