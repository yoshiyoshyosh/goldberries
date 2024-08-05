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
  getChallengeCampaign,
  getChallengeIsFullGame,
  getChallengeSuffix,
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
  faCheck,
  faCircleCheck,
  faCircleXmark,
  faComment,
  faEquals,
  faEyeSlash,
  faHorse,
  faInfoCircle,
  faPlus,
  faQuestionCircle,
  faThumbsDown,
  faThumbsUp,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomModal, ModalButtons, useModal } from "../hooks/useModal";
import { useAuth } from "../hooks/AuthProvider";
import { ChallengeSubmissionTable } from "./Challenge";
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";

export function PageSuggestions({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions" });
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
      <HeadTitle title={t("title")} />
      <Grid container>
        <Grid item xs>
          <Typography variant="h4">{t("header")}</Typography>
        </Grid>
        <Grid item xs="auto">
          <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} onClick={newSuggestion}>
            {t("buttons.create")}
          </Button>
        </Grid>
      </Grid>
      <Typography variant="body1">
        <Trans t={t} i18nKey="intro" />
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {t("language_info")}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        {t("active")}
      </Typography>
      <SuggestionsList expired={false} defaultPerPage={30} modalRefs={modalRefs} />
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        {t("expired")}
      </Typography>
      <SuggestionsList expired={true} defaultPerPage={15} modalRefs={modalRefs} />
      <SuggestionsModalContainer modalRefs={modalRefs} suggestionId={id} closeModal={onCloseSuggestion} />
    </BasicContainerBox>
  );
}

//#region == Suggestions List ==
function SuggestionsList({ expired, defaultPerPage, modalRefs }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions" });
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
      {!expired && <HeadTitle title={t("title")} />}
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
          {t("showing", {
            from: max_count === 0 ? 0 : (page - 1) * perPage + 1,
            to: (page - 1) * perPage + suggestions.length,
            count: max_count,
          })}
        </Typography>
        <Pagination count={max_page} page={page} onChange={(e, value) => setPage(value)} />
      </Stack>
    </Stack>
  );
}

function SuggestionDisplay({ suggestion, expired, modalRefs }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.display" });
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
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          flexWrap={{ xs: "wrap", sm: "unset" }}
          sx={{ mb: 1.5 }}
        >
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
          <Stack direction="row" gap={1} flexWrap={{ xs: "wrap", sm: "unset" }}>
            <Typography variant="body2">
              {suggestion.author_id === null ? (
                t("deleted_player")
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
        <Typography variant="body2">{t("no_votes")}</Typography>
      ) : (
        <Grid container columnSpacing={1} rowSpacing={0.5}>
          {!isGeneral && (
            <Grid item xs={12} sm={6} display="flex" justifyContent="space-between">
              <VotesDisplay votes={votesSubmission} hasSubmission={true} isGeneral={isGeneral} />
              <Divider sx={{ display: { xs: "none", sm: "block" } }} orientation="vertical" />
            </Grid>
          )}
          <Grid item xs={12} sm={isGeneral ? 12 : 6}>
            <VotesDisplay votes={votesNoSubmission} hasSubmission={false} isGeneral={isGeneral} />
          </Grid>
        </Grid>
      )}
    </BasicBox>
  );
}

export function DifficultyMoveDisplay({ from, to, ...props }) {
  return (
    <Stack direction="row" gap={1} alignItems="center" {...props}>
      {from && <DifficultyChip difficulty={from} useSubtierColors />}
      <FontAwesomeIcon icon={faArrowRight} />
      {to && <DifficultyChip difficulty={to} useSubtierColors />}
    </Stack>
  );
}

function SuggestionName({ suggestion, expired }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.name" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const theme = useTheme();
  const challenge = suggestion.challenge;
  const map = challenge?.map;
  const campaign = getChallengeCampaign(challenge);
  const sameMapName =
    suggestion.challenge_id !== null && challenge.map_id !== null && map.name === campaign.name;

  return (
    <Stack direction="column" gap={0}>
      <Stack direction="row" gap={1} alignItems="center">
        {suggestion.challenge_id === null ? (
          <>
            <Typography variant="h6">{t("general")}</Typography>
          </>
        ) : (
          <>
            <Stack direction="column" gap={1}>
              <Typography variant="h6">
                {getMapNameClean(map, campaign, t_g, true)}
                {getChallengeSuffix(challenge) && " [" + getChallengeSuffix(challenge) + "]"}
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
          <Tooltip title={t("pending")} arrow placement="top">
            <FontAwesomeIcon icon={faEyeSlash} />
          </Tooltip>
        )}
        {suggestion.is_verified === false && (
          <Tooltip title={t("rejected")} arrow placement="top">
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
          {sameMapName
            ? t("same_map", { author: campaign.author_gb_name })
            : t("different_map", { campaign: campaign.name, author: campaign.author_gb_name })}
        </Stack>
      )}
    </Stack>
  );
}

function VotesDisplay({ votes, hasSubmission, isGeneral }) {
  const countFor = votes.filter((vote) => vote.vote === "+").length;
  const countAgainst = votes.filter((vote) => vote.vote === "-").length;
  const countIndifferent = votes.filter((vote) => vote.vote === "i").length;
  const hideEmpty = false;

  return (
    <Stack direction="row" gap={2}>
      {(!hideEmpty || countFor > 0) && (
        <VoteDisplay type="+" count={countFor} hasSubmission={hasSubmission} isGeneral={isGeneral} />
      )}
      {(!hideEmpty || countAgainst > 0) && (
        <VoteDisplay type="-" count={countAgainst} hasSubmission={hasSubmission} isGeneral={isGeneral} />
      )}
      {(!hideEmpty || countIndifferent > 0) && (
        <VoteDisplay type="i" count={countIndifferent} hasSubmission={hasSubmission} isGeneral={isGeneral} />
      )}
    </Stack>
  );
}

function VoteDisplay({ type, count, hasSubmission, isGeneral }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.votes" });
  const theme = useTheme();
  const icon = type === "+" ? faThumbsUp : type === "-" ? faThumbsDown : faEquals;
  const color = type === "+" ? theme.palette.success.main : type === "-" ? theme.palette.error.main : "gray";

  const tooltip = hasSubmission ? t("did_challenge") : t("others");

  const comp = (
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
  );

  if (isGeneral) {
    return comp;
  } else {
    return (
      <Tooltip title={tooltip} arrow placement="top">
        {comp}
      </Tooltip>
    );
  }
}

function SuggestionAcceptedIcon({ isAccepted, height = "1.5em" }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.icon" });
  const theme = useTheme();

  if (isAccepted === null)
    return (
      <Tooltip title={t("undecided")} arrow placement="top">
        <FontAwesomeIcon icon={faQuestionCircle} height={height} />
      </Tooltip>
    );

  const acceptedText = t(isAccepted ? "accepted" : "rejected");
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
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.modals.view" });
  const { t: t_s } = useTranslation(undefined, { keyPrefix: "suggestions" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
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
    toast.success(t("feedback.updated"));
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
              <Tooltip title={t(isUnverified ? "buttons.verify" : "buttons.accept")} arrow>
                <Button variant={acceptVariant} color="success" onClick={() => updateSuggestion(true)}>
                  <FontAwesomeIcon icon={faCheck} style={{ height: "1.5em" }} />
                </Button>
              </Tooltip>
              <Tooltip
                title={t(isUnverified ? "buttons.reject_verification" : "buttons.reject_change")}
                arrow
              >
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
                t_s("display.deleted_player")
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
                  {t_s("votes.for")}
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
                  {t_s("votes.against")}
                </Box>
              </Button>
              <Button
                variant={!auth.hasPlayerClaimed || !hasVoted || userVote !== "i" ? "outlined" : "contained"}
                fullWidth
                onClick={() => vote("i")}
              >
                <FontAwesomeIcon icon={faHorse} style={{ height: "1.4em" }} />
                <Box component="span" sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
                  {t_s("votes.indifferent")}
                </Box>
              </Button>
            </Stack>
            {!auth.hasPlayerClaimed && (
              <Typography variant="body2" gutterBottom>
                {t("claim_player")}
              </Typography>
            )}
          </Stack>
        </Grid>
        {auth.hasPlayerClaimed && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t("your_comment")}
              multiline
              minRows={3}
              variant="outlined"
              disabled={hasVoted}
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
            />
            <Typography variant="body2" color={(t) => t.palette.text.secondary} sx={{ mt: 0.25 }}>
              <FontAwesomeIcon icon={faInfoCircle} /> {t("comment_note")}
            </Typography>
          </Grid>
        )}

        {suggestion.challenge_id !== null && (
          <>
            <Grid item xs={12}>
              <Divider>
                <Chip label={t_g("submission", { count: 30 })} size="small" />
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
                {t("totals")}
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
            <Chip label={t_s("votes.label")} size="small" />
          </Divider>
        </Grid>
        {!isGeneral && (
          <>
            <Grid item xs={12} sm={12}>
              <Typography variant="body1">{t("done_challenge")}</Typography>
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
          {!isGeneral && <Typography variant="body1">{t("not_done_challenge")}</Typography>}
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
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.votes" });
  const votesFiltered = votes.filter(
    (vote) => vote.vote === voteType && (hasSubmission ? vote.submission !== null : vote.submission === null)
  );
  const count = votesFiltered.length;
  const voteIcon = voteType === "+" ? faThumbsUp : voteType === "-" ? faThumbsDown : faEquals;
  const voteColor = voteType === "+" ? "green" : voteType === "-" ? "red" : "gray";

  return (
    <Stack direction="column" gap={1} alignItems="center">
      <Typography variant="body1">
        <FontAwesomeIcon icon={voteIcon} color={voteColor} />
      </Typography>
      <Typography variant="body2">{t("count", { count: count })}</Typography>
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
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.modals.create" });
  const { t: t_a } = useTranslation();
  const theme = useTheme();
  const { mutate: postSuggestion } = usePostSuggestion(() => {
    toast.success(t("feedback.created"));
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
          {t("header")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider>
          <Chip label={t("select_challenge")} size="small" />
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
              <Chip label={t("suggestion_type")} size="small" />
            </Divider>
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="suggested_difficulty_id"
              control={form.control}
              render={({ field }) => (
                <DifficultySelectControlled
                  label={t_a("components.difficulty_select.label")}
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
                {t("error_difficulty_general")}
              </FormHelperText>
            )}
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="is_general_challenge_suggestion"
              control={form.control}
              render={({ field }) => (
                <FormControlLabel
                  label={t("not_placement.label")}
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  control={<Checkbox />}
                  sx={{ mt: 0 }}
                />
              )}
            />
            <FormHelperText>{t("not_placement.note")}</FormHelperText>
          </Grid>
        </>
      )}
      {selectedChallenge === null && (
        <Grid item xs={12}>
          <Typography variant="body2">{t("no_challenge_note")}</Typography>
        </Grid>
      )}
      {query.isLoading && <LoadingSpinner />}
      {query.isError && <ErrorDisplay error={query.error} />}
      {fetchedChallenge !== null && (
        <>
          <Grid item xs={12}>
            <Divider>
              <Chip label={t("challenge_details")} size="small" />
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
              {t("totals")}
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
          label={t("comment.label")}
          placeholder={t("comment.placeholder")}
          required
          multiline
          minRows={3}
          variant="outlined"
          {...form.register("comment")}
        />
        {(isGeneral || selectedChallenge === null) && comment.length < 10 && (
          <FormHelperText sx={{ color: theme.palette.error.main }}>{t("comment.required")}</FormHelperText>
        )}
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={onSubmit} disabled={isDisabled}>
          {t("button")}
        </Button>
      </Grid>
    </Grid>
  );
}
//#endregion

function SuggestionsModalContainer({ modalRefs, suggestionId, closeModal }) {
  const { t } = useTranslation(undefined, { keyPrefix: "suggestions.modals.delete" });
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
        options={{ title: t("title") }}
        actions={[ModalButtons.cancel, ModalButtons.delete]}
      >
        <Typography variant="body1">{t("info")}</Typography>
      </CustomModal>
    </>
  );
}
