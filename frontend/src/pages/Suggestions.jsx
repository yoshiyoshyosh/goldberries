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
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  Pagination,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  getCampaignName,
  getChallengeCampaign,
  getChallengeIsFullGame,
  getChallengeName,
  getMapName,
  getMapNameClean,
  getSortedSuggestedDifficulties,
} from "../util/data_util";
import {
  ChallengeFcIcon,
  DifficultyChip,
  DifficultySelectControlled,
  FullChallengeSelect,
  ObjectiveIcon,
  PlayerChip,
} from "../components/GoldberriesComponents";
import { SuggestedDifficultyChart, SuggestedDifficultyTierCounts } from "../components/Stats";
import { useTheme } from "@emotion/react";
import { dateToTimeAgoString, jsonDateToJsDate } from "../util/util";
import {
  faArrowRight,
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

  const difficultiesSorted =
    suggestion.challenge_id !== null ? getSortedSuggestedDifficulties(suggestion.challenge) : [];
  const difficultiesCountTotal = difficultiesSorted ? difficultiesSorted.reduce((a, b) => a + b.value, 0) : 0;

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
        <Grid item xs={12} sm>
          <SuggestionName suggestion={suggestion} expired={expired} />
        </Grid>
        {canDelete && (
          <Grid item xs={12} sm="auto">
            <IconButton color="error" onClick={askDeleteSuggestion} size="small">
              <FontAwesomeIcon icon={faTrash} />
            </IconButton>
          </Grid>
        )}
      </Grid>

      {suggestion.challenge !== null && suggestion.suggested_difficulty !== null && (
        <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 1.5 }}>
          <DifficultyMoveDisplay
            from={suggestion.challenge.difficulty}
            to={suggestion.suggested_difficulty}
          />
          {difficultiesSorted.length > 0 && (
            <Stack direction="row" gap={1}>
              ( {((difficultiesSorted[0].value / difficultiesCountTotal) * 100).toFixed(0)}%{" "}
              {difficultiesSorted.map((d, index) => {
                if (d.value !== difficultiesSorted[0].value) return null;
                return (
                  <>
                    {index > 0 && " / "}
                    <DifficultyChip difficulty={d.difficulty} useSubtierColors />
                  </>
                );
              })}
              )
            </Stack>
          )}
        </Stack>
      )}

      <Grid container sx={{ mb: 1 }}>
        <Grid item xs={12} sm={8}>
          <Stack direction="row" gap={1}>
            <Typography variant="body2">
              {suggestion.author_id === null ? (
                "(deleted player)"
              ) : (
                <PlayerChip player={suggestion.author} size="small" />
              )}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.25 }}>
              <FontAwesomeIcon icon={faComment} /> {suggestion.comment ?? "-"}
            </Typography>
          </Stack>
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

export function DifficultyMoveDisplay({ from, to, ...props }) {
  return (
    <Stack direction="row" gap={1} alignItems="center" {...props}>
      <DifficultyChip difficulty={from} useSubtierColors />
      <FontAwesomeIcon icon={faArrowRight} />
      <DifficultyChip difficulty={to} useSubtierColors />
    </Stack>
  );
}

function SuggestionName({ suggestion, expired }) {
  const theme = useTheme();
  const challenge = suggestion.challenge;
  const map = challenge?.map;
  const campaign = getChallengeCampaign(challenge);
  const sameMapName =
    suggestion.challenge_id !== null && challenge.map_id !== null && map.name === campaign.name;
  const isFullGame = suggestion.challenge_id !== null && getChallengeIsFullGame(challenge);

  return (
    <Stack direction="column" gap={0}>
      <Stack direction="row" gap={1} alignItems="center">
        {suggestion.challenge_id === null ? (
          <>
            {/* <FontAwesomeIcon icon={faInfoCircle} /> */}
            <Typography variant="h6">General Suggestion</Typography>
          </>
        ) : (
          <>
            <Stack direction="column" gap={1}>
              <Typography variant="h6">
                {getMapNameClean(map, campaign, true)}
                {challenge.description && " [" + challenge.description + "]"}
              </Typography>
            </Stack>
            <ObjectiveIcon objective={challenge.objective} height="1.2em" />
            <ChallengeFcIcon challenge={challenge} height="1.4em" />
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
              sm: 0,
            },
            color: theme.palette.text.secondary,
          }}
        >
          {/* <FontAwesomeIcon icon={faArrowTurnUp} style={{ transform: "rotateZ(90deg)" }} /> */}
          {/* <StyledLink to={"/challenge/" + suggestion.challenge.id}> */}
          {sameMapName
            ? "by " + campaign.author_gb_name
            : "from " + campaign.name + " (by " + campaign.author_gb_name + ")"}
          {/* </StyledLink> */}
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
          opacity: count === 0 ? 0.3 : 1,
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

  const query = useGetSuggestion(id);
  const suggestion = getQueryData(query);

  const { mutateAsync: deleteVote } = useDeleteSuggestionVote(() => {
    // query.refetch();
  });
  const { mutateAsync: postVote } = usePostSuggestionVote(() => {
    query.refetch();
  });
  const { mutate: postSuggestion } = usePostSuggestion(() => {
    query.refetch();
    toast.success("Suggestion updated");
  });

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
    if (hasVoted) {
      const voteObj = suggestion.votes.find((vote) => vote.player_id === auth.user.player.id);
      deleteVote(voteObj.id).then(() => {
        if (vote !== userVote) {
          postVote({
            suggestion_id: suggestion.id,
            vote: vote,
            comment: userText === "" ? null : userText,
          });
        } else {
          //Refetch manually
          query.refetch();
        }
      });
      return;
    } else {
      postVote({
        suggestion_id: suggestion.id,
        vote: vote,
        comment: userText === "" ? null : userText,
      });
    }
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
      <Grid container rowSpacing={1.5} columnSpacing={1}>
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
        {suggestion.challenge !== null && suggestion.suggested_difficulty !== null && (
          <Grid item xs={12}>
            <DifficultyMoveDisplay
              from={suggestion.challenge.difficulty}
              to={suggestion.suggested_difficulty}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Stack direction="row" gap={1} alignItems="center">
            <Typography variant="body2">
              {suggestion.author_id === null ? (
                "(deleted player)"
              ) : (
                <PlayerChip player={suggestion.author} size="small" />
              )}
            </Typography>
            <Typography variant="body2">
              <FontAwesomeIcon icon={faComment} /> {suggestion.comment ?? "-"}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="column" gap={0.25}>
            <Stack direction="row" gap={0.5}>
              <Button
                variant={!auth.hasPlayerClaimed || !hasVoted || userVote !== "+" ? "outlined" : "contained"}
                color="success"
                fullWidth
                onClick={() => vote("+")}
              >
                <FontAwesomeIcon icon={faThumbsUp} style={{ height: "1.4em" }} />
                <Box component="span" sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
                  For
                </Box>
              </Button>
              <Button
                variant={!auth.hasPlayerClaimed || !hasVoted || userVote !== "-" ? "outlined" : "contained"}
                color="error"
                fullWidth
                onClick={() => vote("-")}
              >
                <FontAwesomeIcon icon={faThumbsDown} style={{ height: "1.4em" }} />
                <Box component="span" sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
                  Against
                </Box>
              </Button>
              <Button
                variant={!auth.hasPlayerClaimed || !hasVoted || userVote !== "i" ? "outlined" : "contained"}
                fullWidth
                onClick={() => vote("i")}
              >
                <FontAwesomeIcon icon={faHorse} style={{ height: "1.4em" }} />
                <Box component="span" sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
                  Indifferent
                </Box>
              </Button>
            </Stack>
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
            <Typography variant="body2" color={(t) => t.palette.text.secondary} sx={{ mt: 0.25 }}>
              <FontAwesomeIcon icon={faInfoCircle} /> To change your comment after you voted, remove your vote
              and vote again.
            </Typography>
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
              <SuggestedDifficultyTierCounts
                challenge={suggestion.challenge}
                direction="column"
                useSubtierColors
              />
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
  const theme = useTheme();
  const { mutate: postSuggestion } = usePostSuggestion(() => {
    toast.success("Suggestion created");
    if (onSuccess) onSuccess();
  });

  const form = useForm({
    defaultValues: {
      challenge: null,
      suggested_difficulty_id: null,
      is_general_challenge_suggestion: false,
      comment: "",
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    postSuggestion({
      ...data,
      challenge: undefined,
      is_general_challenge_suggestion: undefined,
      challenge_id: data.challenge?.id,
    });
  });

  const selectedChallenge = form.watch("challenge");
  const comment = form.watch("comment");
  const isGeneral = form.watch("is_general_challenge_suggestion");
  const selectedDifficulty = form.watch("suggested_difficulty_id");
  const isDisabled =
    (selectedChallenge !== null && selectedDifficulty === null && !isGeneral) ||
    (selectedDifficulty !== null && isGeneral) ||
    (comment.length < 10 && (isGeneral || selectedChallenge === null));

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
      {selectedChallenge !== null && (
        <>
          <Grid item xs={12}>
            <Divider>
              <Chip label="Suggestion Type" size="small" />
            </Divider>
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="suggested_difficulty_id"
              control={form.control}
              render={({ field }) => (
                <DifficultySelectControlled
                  label="Suggested Difficulty"
                  fullWidth
                  isSuggestion
                  difficultyId={field.value}
                  setDifficultyId={(d) => {
                    field.onChange(d);
                  }}
                  sx={{ mt: 1 }}
                />
              )}
            />
            {isGeneral && selectedDifficulty !== null && (
              <FormHelperText sx={{ color: theme.palette.error.main }}>
                Cannot select a difficulty when making a general challenge suggestion.
              </FormHelperText>
            )}
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="is_general_challenge_suggestion"
              control={form.control}
              render={({ field }) => (
                <FormControlLabel
                  label="Not a placement suggestion"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  control={<Checkbox />}
                  sx={{ mt: 0 }}
                />
              )}
            />
            <FormHelperText>
              Checking this means not suggesting a difficulty, e.g. when split a C/FC challenge into C and FC.
            </FormHelperText>
          </Grid>
        </>
      )}
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
        {(isGeneral || selectedChallenge === null) && comment.length < 10 && (
          <FormHelperText sx={{ color: theme.palette.error.main }}>
            Comment is required for general suggestions.
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={onSubmit} disabled={isDisabled}>
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
        actions={[ModalButtons.cancel, ModalButtons.delete]}
      >
        <Typography variant="body1">
          Are you sure you want to delete this suggestion and all attached votes?
        </Typography>
      </CustomModal>
    </>
  );
}
