import { useNavigate, useParams } from "react-router-dom";
import {
  getQueryData,
  useDeleteSuggestion,
  useDeleteSuggestionVote,
  useGetChallenge,
  useGetSuggestion,
  useGetSuggestions,
  usePostSuggestion,
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
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Pagination,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { getCampaignName, getChallengeName, getMapName } from "../util/data_util";
import { DifficultyChip, FullChallengeSelect, PlayerChip } from "../components/GoldberriesComponents";
import { SuggestedDifficultyChart, SuggestedDifficultyTierCounts } from "../components/Stats";
import { useTheme } from "@emotion/react";
import { dateToTimeAgoString, jsonDateToJsDate } from "../util/util";
import {
  faArrowTurnUp,
  faBook,
  faCheck,
  faCircleCheck,
  faCircleXmark,
  faComment,
  faCross,
  faEquals,
  faEyeSlash,
  faHorse,
  faHorseHead,
  faInfoCircle,
  faList,
  faPlus,
  faQuestionCircle,
  faThumbsDown,
  faThumbsUp,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Helmet } from "react-helmet";
import { CustomModal, ModalButtons, useModal } from "../hooks/useModal";
import { useAuth } from "../hooks/AuthProvider";
import { ChallengeSubmissionTable } from "./Challenge";
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";

export function PageSuggestions({}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const newSuggestion = () => {
    modalRefs.create.current.open();
  };

  const onCloseSuggestion = () => {
    navigate("/suggestions");
  };
  const openSuggestion = (id) => {
    navigate("/suggestions/" + id);
  };

  const modalRefs = {
    create: useRef(),
    delete: useRef(),
    view: useRef(),
  };
  modalRefs.view.current = openSuggestion;

  return (
    <BasicContainerBox maxWidth="md">
      <Helmet>
        <title>Suggestion</title>
      </Helmet>
      <Grid container>
        <Grid item xs>
          <Typography variant="h4" gutterBottom>
            #suggestion-box
          </Typography>
        </Grid>
        <Grid item xs="auto">
          <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={newSuggestion}>
            New
          </Button>
        </Grid>
      </Grid>
      <SuggestionsList expired={false} defaultPerPage={30} modalRefs={modalRefs} />
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        Expired Suggestions
      </Typography>
      <SuggestionsList expired={true} defaultPerPage={15} modalRefs={modalRefs} />
      <SuggestionsModalContainer modalRefs={modalRefs} suggestionId={id} closeModal={onCloseSuggestion} />
    </BasicContainerBox>
  );
}

//#region == Suggestions List ==
function SuggestionsList({ expired, defaultPerPage, modalRefs }) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);

  const query = useGetSuggestions(page, perPage, expired);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const response = getQueryData(query);
  const { suggestions, max_page, max_count } = response;

  return (
    <Stack direction="column" gap={2}>
      {!expired && <HeadTitle title={"Suggestions"} />}
      {suggestions.map((suggestion) => (
        <SuggestionDisplay
          key={suggestion.id}
          suggestion={suggestion}
          expired={expired}
          modalRefs={modalRefs}
        />
      ))}
      <Stack direction="row" gap={2} alignItems="center">
        <Typography variant="body2">
          Showing {(page - 1) * perPage + 1}-{(page - 1) * perPage + suggestions.length} of {max_count} total
          suggestions
        </Typography>
        <Pagination count={max_page} page={page} onChange={(e, value) => setPage(value)} />
      </Stack>
    </Stack>
  );
}

function SuggestionDisplay({ suggestion, expired, modalRefs }) {
  const theme = useTheme();
  const auth = useAuth();

  const viewSuggestion = () => {
    modalRefs.view.current(suggestion.id);
  };
  const askDeleteSuggestion = (e) => {
    e.stopPropagation();
    modalRefs.delete.current.open(suggestion);
  };

  const canDelete =
    auth.hasVerifierPriv ||
    (suggestion.author_id !== null &&
      auth.user?.player_id === suggestion.author_id &&
      suggestion.is_verified !== true);

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
          <Stack direction="row" gap={1} alignItems="center" justifyContent="space-between">
            <Box component="span" sx={{ flex: 1 }}>
              {suggestion.challenge_id !== null && (
                <DifficultyChip difficulty={suggestion.challenge.difficulty} />
              )}
            </Box>
            {canDelete && (
              <IconButton color="error" onClick={askDeleteSuggestion} size="small">
                <FontAwesomeIcon icon={faTrash} />
              </IconButton>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Typography variant="body2" gutterBottom>
        <FontAwesomeIcon icon={faComment} /> {suggestion.comment ?? "-"}
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
            <Tooltip title={jsonDateToJsDate(suggestion.date_created).toLocaleString()} arrow placement="top">
              <span>{dateToTimeAgoString(jsonDateToJsDate(suggestion.date_created))}</span>
            </Tooltip>
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
        {suggestion.is_verified !== false && expired && (
          <SuggestionAcceptedIcon isAccepted={suggestion.is_accepted} />
        )}
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
  const hideEmpty = false;

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
  const icon = type === "+" ? faThumbsUp : type === "-" ? faThumbsDown : faEquals;
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
//#endregion

//#region == View Suggestion Modal
function ViewSuggestionModal({ id }) {
  const auth = useAuth();
  const [userText, setUserText] = useState("");

  const { mutate: deleteVote } = useDeleteSuggestionVote(() => {
    query.refetch();
  });
  const { mutate: postVote } = usePostSuggestionVote(() => {
    query.refetch();
  });
  const { mutate: postSuggestion } = usePostSuggestion(() => {
    query.refetch();
    toast.success("Suggestion updated");
  });

  const query = useGetSuggestion(id);
  const suggestion = getQueryData(query);

  useEffect(() => {
    if (query.isSuccess) {
      //Find the users vote
      const userVote = !auth.hasPlayerClaimed
        ? null
        : suggestion.votes.find((vote) => vote.player_id === auth.user.player.id);
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
  const isGeneral = suggestion.challenge_id === null;

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

  const isUnverified = suggestion.is_verified !== true;
  const updateSuggestion = (accept) => {
    if (isUnverified) {
      postSuggestion({
        ...suggestion,
        is_verified: accept,
      });
    } else {
      postSuggestion({
        ...suggestion,
        is_accepted: suggestion.is_accepted === accept ? null : accept,
      });
    }
  };
  const acceptVariant = suggestion.is_accepted === true ? "contained" : "outlined";
  const rejectVariant =
    suggestion.is_verified === false || suggestion.is_accepted === false ? "contained" : "outlined";

  return (
    <>
      <Grid container rowSpacing={2} columnSpacing={1}>
        <Grid item xs={12} sm>
          <SuggestionName suggestion={suggestion} expired={isExpired} />
        </Grid>
        {auth.hasVerifierPriv && (
          <Grid item xs={12} sm="auto">
            <ButtonGroup>
              <Tooltip title={isUnverified ? "Verify" : "Accept Change"} arrow>
                <Button variant={acceptVariant} color="success" onClick={() => updateSuggestion(true)}>
                  <FontAwesomeIcon icon={faCheck} style={{ height: "1.5em" }} />
                </Button>
              </Tooltip>
              <Tooltip title={isUnverified ? "Reject Verification" : "Reject Change"} arrow>
                <Button variant={rejectVariant} color="error" onClick={() => updateSuggestion(false)}>
                  <FontAwesomeIcon icon={faXmark} style={{ height: "1.5em" }} />
                </Button>
              </Tooltip>
            </ButtonGroup>
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography variant="body2" gutterBottom>
            {suggestion.comment ?? "-"}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">
            {suggestion.author_id === null ? (
              "(deleted player)"
            ) : (
              <PlayerChip player={suggestion.author} size="small" />
            )}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="column" gap={0.25}>
            <ButtonGroup variant="contained" fullWidth>
              <Button
                color="success"
                disabled={!auth.hasPlayerClaimed || (hasVoted && userVote !== "+")}
                fullWidth
                onClick={() => vote("+")}
              >
                <FontAwesomeIcon icon={faThumbsUp} style={{ height: "1.4em" }} />
                <Box component="span" sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
                  For
                </Box>
              </Button>
              <Button
                color="error"
                disabled={!auth.hasPlayerClaimed || (hasVoted && userVote !== "-")}
                fullWidth
                onClick={() => vote("-")}
              >
                <FontAwesomeIcon icon={faThumbsDown} style={{ height: "1.4em" }} />
                <Box component="span" sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
                  Against
                </Box>
              </Button>
              <Button
                disabled={!auth.hasPlayerClaimed || (hasVoted && userVote !== "i")}
                fullWidth
                onClick={() => vote("i")}
              >
                <FontAwesomeIcon icon={faHorse} style={{ height: "1.4em" }} />
                <Box component="span" sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
                  Indifferent
                </Box>
              </Button>
            </ButtonGroup>
            {!auth.hasPlayerClaimed && (
              <Typography variant="body2" gutterBottom>
                Claim a player to be able to vote on suggestions!
              </Typography>
            )}
          </Stack>
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
              <ChallengeSubmissionTable challenge={suggestion.challenge} hideSubmissionIcon />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12} sm={9}>
              <Stack direction="row" justifyContent="space-around">
                <SuggestedDifficultyChart challenge={suggestion.challenge} />
              </Stack>
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
        {!isGeneral && (
          <>
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
          </>
        )}
        <Grid item xs={12} sm={12}>
          {!isGeneral && <Typography variant="body1">Not Done Challenge</Typography>}
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
  const voteIcon = voteType === "+" ? faThumbsUp : voteType === "-" ? faThumbsDown : faEquals;
  const voteColor = voteType === "+" ? "green" : voteType === "-" ? "red" : "gray";
  const s = count === 1 ? "" : "s";

  return (
    <Stack direction="column" gap={1} alignItems="center">
      <Typography variant="body1">
        <FontAwesomeIcon icon={voteIcon} color={voteColor} />
      </Typography>
      <Typography variant="body2">
        {count} vote{s}
      </Typography>
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
//#endregion

//#region == Create Suggestion Modal ==
function CreateSuggestionModal({ onSuccess }) {
  const { mutate: postSuggestion } = usePostSuggestion(() => {
    toast.success("Suggestion created");
    if (onSuccess) onSuccess();
  });

  const form = useForm({
    defaultValues: {
      challenge: null,
      comment: "",
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    postSuggestion({
      ...data,
      challenge: undefined,
      challenge_id: data.challenge?.id,
    });
  });

  const selectedChallenge = form.watch("challenge");
  const comment = form.watch("comment");

  const query = useGetChallenge(selectedChallenge?.id);
  const fetchedChallenge = getQueryData(query);

  return (
    <Grid container rowSpacing={1} columnSpacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Create Suggestion
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider>
          <Chip label="Select Challenge" size="small" />
        </Divider>
      </Grid>
      <Grid item xs={12}>
        <Controller
          name="challenge"
          control={form.control}
          render={({ field }) => (
            <FullChallengeSelect
              challenge={field.value}
              setChallenge={(c) => {
                field.onChange(c);
              }}
            />
          )}
        />
      </Grid>
      {selectedChallenge === null && (
        <Grid item xs={12}>
          <Typography variant="body2">Not selecting a challenge will create a general suggestion.</Typography>
        </Grid>
      )}
      {query.isLoading && <LoadingSpinner />}
      {query.isError && <ErrorDisplay error={query.error} />}
      {fetchedChallenge !== null && (
        <>
          <Grid item xs={12}>
            <Divider>
              <Chip label="Challenge Details" size="small" />
            </Divider>
          </Grid>
          <Grid item xs={12}>
            <DifficultyChip difficulty={fetchedChallenge.difficulty} />
          </Grid>
          <Grid item xs={12}>
            <ChallengeSubmissionTable challenge={fetchedChallenge} hideSubmissionIcon />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12} sm={9}>
            <Stack direction="row" justifyContent="space-around">
              <SuggestedDifficultyChart challenge={fetchedChallenge} />
            </Stack>
          </Grid>
          <Grid item xs={12} sm>
            <Typography variant="body1" gutterBottom>
              Total for each (sub-)tier
            </Typography>
            <SuggestedDifficultyTierCounts challenge={fetchedChallenge} direction="row" />
          </Grid>
        </>
      )}

      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Comment"
          placeholder="Explain why you think something should be changed"
          required
          multiline
          minRows={3}
          variant="outlined"
          {...form.register("comment")}
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={onSubmit} disabled={comment.length < 5}>
          Create
        </Button>
      </Grid>
    </Grid>
  );
}
//#endregion

function SuggestionsModalContainer({ modalRefs, suggestionId, closeModal }) {
  const { mutate: deleteSuggestion } = useDeleteSuggestion();

  const createSuggestionModal = useModal();
  const deleteSuggestionModal = useModal(null, (cancelled, data) => {
    if (cancelled) return;
    deleteSuggestion(data.id);
  });

  // Setting the refs
  modalRefs.create.current = createSuggestionModal;
  modalRefs.delete.current = deleteSuggestionModal;

  return (
    <>
      <CustomModal modalHook={createSuggestionModal} maxWidth="sm" options={{ hideFooter: true }}>
        <CreateSuggestionModal id={createSuggestionModal.data} onSuccess={createSuggestionModal.close} />
      </CustomModal>

      <Dialog
        onClose={closeModal}
        open={suggestionId !== undefined}
        maxWidth="md"
        fullWidth
        disableScrollLock
        disableRestoreFocus
      >
        <DialogContent dividers>
          {suggestionId !== undefined && <ViewSuggestionModal id={suggestionId} />}
        </DialogContent>
      </Dialog>

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
