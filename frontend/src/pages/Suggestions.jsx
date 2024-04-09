import { useParams } from "react-router-dom";
import {
  getQueryData,
  useDeleteSuggestion,
  useDeleteSuggestionVote,
  useGetSuggestion,
  useGetSuggestions,
  usePostSuggestionVote,
} from "../hooks/useApi";
import { useEffect, useRef, useState } from "react";
import {
  BasicBox,
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledLink,
} from "../components/BasicComponents";
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { getCampaignName, getChallengeName, getMapName } from "../util/data_util";
import { DifficultyChip, PlayerChip } from "../components/GoldberriesComponents";
import { SuggestedDifficultyChart, SuggestedDifficultyTierCounts } from "../components/Stats";
import { useTheme } from "@emotion/react";
import { jsonDateToJsDate } from "../util/util";
import {
  faArrowTurnUp,
  faBook,
  faCheck,
  faCircleCheck,
  faCircleXmark,
  faComment,
  faCross,
  faEyeSlash,
  faHorse,
  faHorseHead,
  faInfoCircle,
  faList,
  faPlus,
  faQuestionCircle,
  faThumbsDown,
  faThumbsUp,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Helmet } from "react-helmet";
import { CustomModal, ModalButtons, useModal } from "../hooks/useModal";
import { useAuth } from "../hooks/AuthProvider";
import { set } from "react-hook-form";
import { ChallengeSubmissionTable } from "./Challenge";

export function PageSuggestions({}) {
  const { id } = useParams();

  const modalRefs = {
    delete: useRef(),
    view: useRef(),
  };

  return (
    <BasicContainerBox maxWidth="md">
      <Helmet>
        <title>Suggestions</title>
      </Helmet>
      <Grid container>
        <Grid item xs>
          <Typography variant="h4" gutterBottom>
            Suggestions
          </Typography>
        </Grid>
        <Grid item xs="auto">
          <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />}>
            New
          </Button>
        </Grid>
      </Grid>
      <SuggestionsList expired={false} modalRefs={modalRefs} />
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        Expired Suggestions
      </Typography>
      <SuggestionsList expired={true} modalRefs={modalRefs} />
      <SuggestionsModalContainer modalRefs={modalRefs} />
    </BasicContainerBox>
  );
}

function SuggestionsList({ expired, modalRefs }) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const query = useGetSuggestions(page, perPage, expired);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const response = getQueryData(query);
  const suggestions = response.suggestions;

  return (
    <Stack direction="column" gap={2}>
      {!expired && <HeadTitle title={"(" + suggestions.length + ") Suggestions"} />}
      {suggestions.map((suggestion) => (
        <SuggestionDisplay suggestion={suggestion} expired={expired} modalRefs={modalRefs} />
      ))}
    </Stack>
  );
}

function SuggestionDisplay({ suggestion, expired, modalRefs }) {
  const theme = useTheme();

  const viewSuggestion = (e) => {
    modalRefs.view.current.open(suggestion.id);
  };
  const deleteSuggestion = () => {
    modalRefs.delete.current.open(suggestion.id);
  };

  const isGeneral = suggestion.challenge_id === null;
  const votesSubmission = suggestion.votes.filter((vote) => vote.submission !== null);
  const votesNoSubmission = suggestion.votes.filter((vote) => vote.submission === null);
  let acceptedColor =
    suggestion.is_accepted === null
      ? theme.palette.box.border
      : suggestion.is_accepted
      ? theme.palette.success.main
      : theme.palette.error.main;
  const borderWidth = suggestion.is_accepted === null ? "1px" : "3px";
  const unverified = suggestion.is_verified !== true;

  return (
    <BasicBox
      sx={{
        width: "100%",
        borderColor: acceptedColor,
        borderWidth: borderWidth,
        cursor: "pointer",
        transition: "background 0.3s",
        "&:hover": {
          background: theme.palette.box.hover,
        },
        background: unverified ? theme.palette.errorBackground : theme.palette.background.other,
      }}
      onClick={viewSuggestion}
    >
      <Grid container sx={{ mb: 1 }}>
        <Grid item xs={12} sm={10}>
          <SuggestionName suggestion={suggestion} expired={expired} />
        </Grid>
        <Grid
          item
          xs={12}
          sm={2}
          textAlign={{
            xs: "left",
            sm: "right",
          }}
        >
          {suggestion.challenge_id !== null && (
            <DifficultyChip difficulty={suggestion.challenge.difficulty} />
          )}
        </Grid>
      </Grid>

      <Typography variant="body2" gutterBottom>
        Comment: {suggestion.comment ?? "-"}
      </Typography>
      <Grid container sx={{ mt: 1 }}>
        <Grid item xs={12} sm={8}>
          <Typography variant="body2">
            {suggestion.author_id === null ? (
              "(deleted player)"
            ) : (
              <PlayerChip player={suggestion.author} size="small" />
            )}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          sm={4}
          textAlign={{
            xs: "left",
            sm: "right",
          }}
        >
          <Typography variant="body2">
            {jsonDateToJsDate(suggestion.date_created).toLocaleString()}
          </Typography>
        </Grid>
      </Grid>

      {suggestion.challenge_id !== null && (
        <>
          <Divider sx={{ my: 1 }} />
          <Stack direction="row" gap={2}>
            <span>Community Suggestions:</span>
            <SuggestedDifficultyTierCounts challenge={suggestion.challenge} />
          </Stack>
        </>
      )}

      <Divider sx={{ my: 1 }} />
      {suggestion.votes.length === 0 ? (
        <Typography variant="body2">No votes yet.</Typography>
      ) : (
        <Grid container columnSpacing={1}>
          {!isGeneral && (
            <Grid item xs={12} sm={6} display="flex" justifyContent="space-between">
              <VotesDisplay votes={votesSubmission} hasSubmission={true} />
              <Divider orientation="vertical" />
            </Grid>
          )}
          <Grid item xs={12} sm={isGeneral ? 12 : 6}>
            <VotesDisplay votes={votesNoSubmission} hasSubmission={false} />
          </Grid>
        </Grid>
      )}
    </BasicBox>
  );
}

function SuggestionName({ suggestion, expired }) {
  const theme = useTheme();
  const sameMapName =
    suggestion.challenge_id !== null &&
    suggestion.challenge.map.name === suggestion.challenge.map.campaign.name;

  return (
    <Stack direction="column" gap={0}>
      <Stack direction="row" gap={1} alignItems="center">
        {suggestion.challenge_id === null ? (
          <>
            <FontAwesomeIcon icon={faInfoCircle} />
            <Typography variant="h6">General Suggestion</Typography>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faList} />
            <Stack direction="column" gap={1}>
              <Typography variant="h6">
                {sameMapName
                  ? getCampaignName(suggestion.challenge.map.campaign)
                  : getCampaignName(suggestion.challenge.map.campaign) +
                    " - " +
                    getMapName(suggestion.challenge.map)}
              </Typography>
            </Stack>
          </>
        )}
        {expired && <SuggestionAcceptedIcon isAccepted={suggestion.is_accepted} />}
        {suggestion.is_verified === null && (
          <Tooltip title="Pending Verification" arrow placement="top">
            <FontAwesomeIcon icon={faEyeSlash} />
          </Tooltip>
        )}
        {suggestion.is_verified === false && (
          <Tooltip title="Rejected Verification" arrow placement="top">
            <FontAwesomeIcon icon={faCircleXmark} color={theme.palette.error.main} />
          </Tooltip>
        )}
      </Stack>

      {suggestion.challenge_id !== null && (
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          sx={{
            pl: {
              xs: 0,
              sm: 1,
            },
          }}
        >
          <FontAwesomeIcon icon={faArrowTurnUp} style={{ transform: "rotateZ(90deg)" }} />
          <StyledLink to={"/challenge/" + suggestion.challenge.id}>
            {getChallengeName(suggestion.challenge)}
          </StyledLink>
        </Stack>
      )}
    </Stack>
  );
}

function VotesDisplay({ votes, hasSubmission }) {
  const countFor = votes.filter((vote) => vote.vote === "+").length;
  const countAgainst = votes.filter((vote) => vote.vote === "-").length;
  const countIndifferent = votes.filter((vote) => vote.vote === "i").length;
  const hideEmpty = true;

  return (
    <Stack direction="row" gap={2}>
      {(!hideEmpty || countFor > 0) && (
        <VoteDisplay type="+" count={countFor} hasSubmission={hasSubmission} />
      )}
      {(!hideEmpty || countAgainst > 0) && (
        <VoteDisplay type="-" count={countAgainst} hasSubmission={hasSubmission} />
      )}
      {(!hideEmpty || countIndifferent > 0) && (
        <VoteDisplay type="i" count={countIndifferent} hasSubmission={hasSubmission} />
      )}
    </Stack>
  );
}

function VoteDisplay({ type, count, hasSubmission }) {
  const theme = useTheme();
  const icon = type === "+" ? faThumbsUp : type === "-" ? faThumbsDown : faQuestionCircle;
  const color = type === "+" ? theme.palette.success.main : type === "-" ? theme.palette.error.main : "gray";

  const tooltip = hasSubmission
    ? "Votes from players who did this challenge"
    : "Votes from players who did not do this challenge";
  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Box
        sx={{
          border: "1px solid " + (hasSubmission ? color : theme.palette.box.border),
          borderRadius: "5px",
          px: 1,
          py: 0.5,
        }}
      >
        <Stack direction="row" gap={1} alignItems="center">
          <span>{count}</span>
          <FontAwesomeIcon icon={icon} height="1em" color={color} />
        </Stack>
      </Box>
    </Tooltip>
  );
}

function SuggestionAcceptedIcon({ isAccepted, height = "1.5em" }) {
  const theme = useTheme();

  if (isAccepted === null)
    return (
      <Tooltip title="Undecided" arrow placement="top">
        <FontAwesomeIcon icon={faQuestionCircle} height={height} />
      </Tooltip>
    );

  const acceptedText = isAccepted ? "Accepted" : "Rejected";
  const icon = isAccepted === true ? faCircleCheck : faCircleXmark;
  const color = isAccepted ? theme.palette.success.main : theme.palette.error.main;
  return (
    <Tooltip title={acceptedText} arrow placement="top">
      <FontAwesomeIcon icon={icon} color={color} height={height} />
    </Tooltip>
  );
}

function ViewSuggestionModal({ id }) {
  const auth = useAuth();
  const [userText, setUserText] = useState("");

  const { mutate: deleteVote } = useDeleteSuggestionVote(() => {
    query.refetch();
  });
  const { mutate: postVote } = usePostSuggestionVote(() => {
    query.refetch();
  });

  const query = useGetSuggestion(id);
  const suggestion = getQueryData(query);

  useEffect(() => {
    if (query.isSuccess) {
      //Find the users vote
      const userVote = suggestion.votes.find((vote) => vote.player_id === auth.user.player.id);
      if (userVote) {
        setUserText(userVote.comment ?? "");
      } else {
        setUserText("");
      }
    }
  }, [query.isSuccess]);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const dateCreated = jsonDateToJsDate(suggestion.date_created);
  const isExpired =
    suggestion.is_accepted !== null || dateCreated < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const hasVoted =
    auth.hasPlayerClaimed && suggestion.votes.some((vote) => vote.player_id === auth.user.player.id);
  const userVote = hasVoted
    ? suggestion.votes.find((vote) => vote.player_id === auth.user.player.id).vote
    : null;

  const vote = (vote) => {
    if (hasVoted && userVote === vote) {
      const vote = suggestion.votes.find((vote) => vote.player_id === auth.user.player.id);
      deleteVote(vote.id);
      return;
    }

    postVote({
      suggestion_id: suggestion.id,
      vote: vote,
      comment: userText === "" ? null : userText,
    });
  };

  return (
    <>
      <Grid container rowSpacing={2} columnSpacing={1}>
        <Grid item xs={12} sm>
          <SuggestionName suggestion={suggestion} expired={isExpired} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <ButtonGroup variant="outlined">
            <Button color="success">
              <FontAwesomeIcon icon={faCheck} style={{ height: "1.5em" }} />
            </Button>
            <Button color="error">
              <FontAwesomeIcon icon={faXmark} style={{ height: "1.5em" }} />
            </Button>
          </ButtonGroup>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" gutterBottom>
            Comment: {suggestion.comment ?? "-"}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <ButtonGroup variant="contained" fullWidth>
            <Button
              color="success"
              disabled={!auth.hasPlayerClaimed || (hasVoted && userVote !== "+")}
              fullWidth
              startIcon={<FontAwesomeIcon icon={faThumbsUp} />}
              onClick={() => vote("+")}
            >
              For
            </Button>
            <Button
              color="error"
              disabled={!auth.hasPlayerClaimed || (hasVoted && userVote !== "-")}
              fullWidth
              startIcon={<FontAwesomeIcon icon={faThumbsDown} />}
              onClick={() => vote("-")}
            >
              Against
            </Button>
            <Button
              disabled={!auth.hasPlayerClaimed || (hasVoted && userVote !== "i")}
              fullWidth
              startIcon={<FontAwesomeIcon icon={faHorse} />}
              onClick={() => vote("i")}
            >
              Indifferent
            </Button>
          </ButtonGroup>
        </Grid>
        {auth.hasPlayerClaimed && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Your Comment"
              multiline
              minRows={3}
              variant="outlined"
              disabled={hasVoted}
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
            />
          </Grid>
        )}

        {suggestion.challenge_id !== null && (
          <>
            <Grid item xs={12}>
              <Divider>
                <Chip label="Submissions" size="small" />
              </Divider>
            </Grid>
            <Grid item xs={12}>
              <ChallengeSubmissionTable challenge={suggestion.challenge} />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12} sm={9}>
              <SuggestedDifficultyChart challenge={suggestion.challenge} />
            </Grid>
            <Grid item xs={12} sm>
              <Divider orientation="vertical" />
            </Grid>
            <Grid item xs={12} sm>
              <Typography variant="body1" gutterBottom>
                Totals
              </Typography>
              <SuggestedDifficultyTierCounts challenge={suggestion.challenge} direction="column" />
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <Divider>
            <Chip label="Votes" size="small" />
          </Divider>
        </Grid>
        <Grid item xs={12} sm={12}>
          <Typography variant="body1">Done Challenge</Typography>
          <Grid container columnSpacing={1}>
            <Grid item xs={12} sm={4}>
              <VotesDetailsDisplay votes={suggestion.votes} voteType="+" hasSubmission={true} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <VotesDetailsDisplay votes={suggestion.votes} voteType="-" hasSubmission={true} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <VotesDetailsDisplay votes={suggestion.votes} voteType="i" hasSubmission={true} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12} sm={12}>
          <Typography variant="body1">Not Done Challenge</Typography>
          <Grid container columnSpacing={1}>
            <Grid item xs={12} sm={4}>
              <VotesDetailsDisplay votes={suggestion.votes} voteType="+" hasSubmission={false} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <VotesDetailsDisplay votes={suggestion.votes} voteType="-" hasSubmission={false} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <VotesDetailsDisplay votes={suggestion.votes} voteType="i" hasSubmission={false} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

function VotesDetailsDisplay({ votes, voteType, hasSubmission }) {
  const votesFiltered = votes.filter(
    (vote) => vote.vote === voteType && (hasSubmission ? vote.submission !== null : vote.submission === null)
  );
  const count = votesFiltered.length;
  const voteIcon = voteType === "+" ? faThumbsUp : voteType === "-" ? faThumbsDown : faQuestionCircle;
  const voteColor = voteType === "+" ? "green" : voteType === "-" ? "red" : "gray";

  return (
    <Stack direction="column" gap={1} alignItems="center">
      <Typography variant="body1">
        <FontAwesomeIcon icon={voteIcon} color={voteColor} />
      </Typography>
      <Typography variant="body2">{count} votes</Typography>
      {votesFiltered.map((vote) => (
        <Stack direction="row" gap={0.5} alignItems="center">
          <PlayerChip player={vote.player} size="small" />
          {vote.comment && (
            <Tooltip title={vote.comment} arrow placement="top">
              <FontAwesomeIcon icon={faComment} />
            </Tooltip>
          )}
        </Stack>
      ))}
    </Stack>
  );
}

function SuggestionsModalContainer({ modalRefs }) {
  const { mutate: deleteSuggestion } = useDeleteSuggestion();

  const viewSuggestionModal = useModal();
  const deleteSuggestionModal = useModal(null, (cancelled, data) => {
    if (cancelled) return;
    deleteSuggestion(data.id);
  });

  // Setting the refs
  modalRefs.delete.current = deleteSuggestionModal;
  modalRefs.view.current = viewSuggestionModal;

  console.log("modalRefs", modalRefs);

  return (
    <>
      <CustomModal modalHook={viewSuggestionModal} maxWidth="md" options={{ hideFooter: true }}>
        {viewSuggestionModal.data == null ? (
          <LoadingSpinner />
        ) : (
          <ViewSuggestionModal id={viewSuggestionModal.data} />
        )}
      </CustomModal>
      <CustomModal
        modalHook={deleteSuggestionModal}
        options={{ title: "Delete Suggestion?" }}
        actions={[ModalButtons.Cancel, ModalButtons.Delete]}
      >
        <Typography variant="body1">
          Are you sure you want to delete this suggestion and all attached votes?
        </Typography>
      </CustomModal>
    </>
  );
}
