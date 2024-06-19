import {
  Button,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Paper,
  Stack,
  StyledEngineProvider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  InfoBox,
  InfoBoxIconTextLine,
  LoadingSpinner,
  StyledExternalLink,
  StyledLink,
} from "../components/BasicComponents";
import {
  ChallengeFcIcon,
  DifficultyChip,
  GamebananaEmbed,
  ObjectiveIcon,
  SubmissionFcIcon,
} from "../components/GoldberriesComponents";
import {
  getChallengeCampaign,
  getChallengeNameShort,
  getGamebananaEmbedUrl,
  getMapLobbyInfo,
  getPlayerNameColorStyle,
} from "../util/data_util";
import { GoldberriesBreadcrumbs } from "../components/Breadcrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBook,
  faCheckCircle,
  faComment,
  faEdit,
  faExternalLink,
  faExternalLinkAlt,
  faFlagCheckered,
  faInfoCircle,
  faLandmark,
  faPlus,
  faShield,
} from "@fortawesome/free-solid-svg-icons";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import { CustomModal, useModal } from "../hooks/useModal";
import { useAuth } from "../hooks/AuthProvider";
import { FormChallengeWrapper } from "../components/forms/Challenge";
import { getQueryData, useGetChallenge } from "../hooks/useApi";
import { Changelog } from "../components/Changelog";
import { SuggestedDifficultyChart, SuggestedDifficultyTierCounts } from "../components/Stats";
import { useAppSettings } from "../hooks/AppSettingsProvider";

const displayNoneOnMobile = {
  display: {
    xs: "none",
    sm: "table-cell",
  },
};

export function PageChallenge({}) {
  const { id } = useParams();

  return (
    <BasicContainerBox maxWidth="md">
      <ChallengeDisplay id={parseInt(id)} />
    </BasicContainerBox>
  );
}

export function ChallengeDisplay({ id }) {
  const auth = useAuth();
  const query = useGetChallenge(id);

  const editChallengeModal = useModal();

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const challenge = getQueryData(query);
  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);
  const title = (map?.name ?? campaign.name) + " - " + getChallengeNameShort(challenge);

  return (
    <>
      <HeadTitle title={title} />
      <GoldberriesBreadcrumbs campaign={campaign} map={map} challenge={challenge} />
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 1.5 }}>
        <GamebananaEmbed campaign={campaign} size="large" />
      </Stack>
      {auth.hasPlayerClaimed && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
          {auth.hasVerifierPriv && (
            <Link to={"/submit/single-challenge/" + id}>
              <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} sx={{ mt: 0, mb: 0 }}>
                Submit A Run
              </Button>
            </Link>
          )}
          <Button
            onClick={editChallengeModal.open}
            variant="outlined"
            sx={{ mr: 1, mt: 0 }}
            startIcon={<FontAwesomeIcon icon={faEdit} />}
          >
            Edit Challenge
          </Button>
        </Stack>
      )}
      <ChallengeDetailsList map={challenge.map} challenge={challenge} sx={{ mb: 1, mt: 0.5 }} />
      <ChallengeSubmissionTable challenge={challenge} />

      <Divider sx={{ my: 2 }}>
        <Chip label="Difficulty Suggestions" size="small" />
      </Divider>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <SuggestedDifficultyChart challenge={challenge} />
      </div>
      <SuggestedDifficultyTierCounts
        challenge={challenge}
        sx={{
          mt: 2,
        }}
      />

      <Divider sx={{ my: 2 }} />
      <Changelog type="challenge" id={id} />

      <CustomModal modalHook={editChallengeModal} options={{ hideFooter: true }}>
        <FormChallengeWrapper id={id} onSave={editChallengeModal.close} />
      </CustomModal>
    </>
  );
}

export function ChallengeDetailsList({ map, challenge = null, ...props }) {
  const campaign = challenge === null ? map.campaign : getChallengeCampaign(challenge);

  const lobbyInfo = getMapLobbyInfo(map);
  const hasLobbyInfo = lobbyInfo !== null && (lobbyInfo.major !== undefined || lobbyInfo.minor !== undefined);

  return (
    <Grid container columnSpacing={1} rowSpacing={1} {...props}>
      <Grid item xs={12} sm={6} display="flex" flexDirection="column" rowGap={1}>
        <InfoBox>
          <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faBook} />} text="Campaign" />
          <InfoBoxIconTextLine text={campaign.name} isSecondary />
        </InfoBox>
        {map !== null ? (
          map.name === campaign.name ? null : (
            <InfoBox>
              <InfoBoxIconTextLine text="Map" />
              <InfoBoxIconTextLine text={map.name} isSecondary />
            </InfoBox>
          )
        ) : (
          <InfoBox>
            <InfoBoxIconTextLine text="Full Game?" />
            <InfoBoxIconTextLine text={<FontAwesomeIcon icon={faCheckCircle} color="green" />} isSecondary />
          </InfoBox>
        )}
        {challenge !== null && (
          <InfoBox>
            <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faFlagCheckered} />} text="Challenge" />
            <InfoBoxIconTextLine
              text={
                <Stack direction="row" alignItems="center" gap={0.5}>
                  {challenge.objective.name} <ObjectiveIcon objective={challenge.objective} />
                  <ChallengeFcIcon challenge={challenge} />
                </Stack>
              }
              isSecondary
            />
            {challenge.description && (
              <InfoBoxIconTextLine text={"[" + challenge.description + "]"} isSecondary />
            )}
          </InfoBox>
        )}
      </Grid>
      <Grid item xs={12} sm={6} display="flex" flexDirection="column" rowGap={1}>
        {hasLobbyInfo && (
          <InfoBox>
            <InfoBoxIconTextLine text="Lobby Info" />
            <InfoBoxIconTextLine text={<LobbyInfoSpan lobbyInfo={lobbyInfo} />} isSecondary />
          </InfoBox>
        )}
        {challenge !== null && (
          <InfoBox>
            <InfoBoxIconTextLine text="Difficulty" />
            <InfoBoxIconTextLine text={<DifficultyChip difficulty={challenge.difficulty} />} isSecondary />
          </InfoBox>
        )}
        <InfoBox>
          <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faExternalLink} />} text="URL" />
          <InfoBoxIconTextLine
            text={<StyledExternalLink href={campaign.url}>{campaign.url}</StyledExternalLink>}
            isSecondary
          />
        </InfoBox>
      </Grid>
    </Grid>
  );
}

function LobbyInfoSpan({ lobbyInfo }) {
  const textShadow =
    "black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px";
  return (
    <Stack direction="row" alignItems="center" gap={0.5}>
      {lobbyInfo.major && (
        <Typography variant="body1" color={lobbyInfo.major.color} sx={{ textShadow: textShadow }}>
          {lobbyInfo.major.label}
        </Typography>
      )}
      {lobbyInfo.major && lobbyInfo.minor && <FontAwesomeIcon icon={faArrowRight} />}
      {lobbyInfo.minor && (
        <Typography variant="body1" color={lobbyInfo.minor.color} sx={{ textShadow: textShadow }}>
          {lobbyInfo.minor.label}
        </Typography>
      )}
    </Stack>
  );
}

export function ChallengeSubmissionTable({
  challenge,
  compact = false,
  hideSubmissionIcon = false,
  ...props
}) {
  return (
    <TableContainer component={Paper} {...props}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell width={1} sx={displayNoneOnMobile}></TableCell>
            <TableCell width={compact ? 1 : undefined}>Player</TableCell>
            {compact ? null : (
              <TableCell width={1} align="center" sx={displayNoneOnMobile}>
                <FontAwesomeIcon icon={faComment} />
              </TableCell>
            )}
            <TableCell width={1} align="center" sx={displayNoneOnMobile}>
              <FontAwesomeIcon icon={faYoutube} />
            </TableCell>
            {compact ? null : (
              <TableCell
                width={1}
                align="center"
                sx={{
                  whiteSpace: {
                    xs: "normal",
                    sm: "nowrap",
                  },
                }}
              >
                Suggestion
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {challenge.submissions.map((submission, index) => (
            <ChallengeSubmissionRow
              key={submission.id}
              submission={submission}
              index={index}
              compact={compact}
              hideSubmissionIcon={hideSubmissionIcon}
            />
          ))}
          {challenge.submissions.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>No submissions</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function ChallengeSubmissionRow({ submission, index, compact, hideSubmissionIcon }) {
  const { settings } = useAppSettings();
  const nameStyle = getPlayerNameColorStyle(submission.player, settings);
  return (
    <TableRow>
      <TableCell width={1} sx={{ pr: 0, ...displayNoneOnMobile }}>
        #{index + 1}
      </TableCell>
      <TableCell width={compact ? 1 : undefined}>
        <Stack direction="row" gap={1} alignItems="center">
          {!hideSubmissionIcon && (
            <StyledLink to={"/submission/" + submission.id}>
              <FontAwesomeIcon icon={faBook} />
            </StyledLink>
          )}
          <StyledLink to={"/player/" + submission.player.id} style={{ whiteSpace: "nowrap", ...nameStyle }}>
            {submission.player.name}
          </StyledLink>
          <SubmissionFcIcon submission={submission} height="1.3em" />
        </Stack>
      </TableCell>
      {compact ? null : (
        <TableCell width={1} align="center" sx={displayNoneOnMobile}>
          {submission.player_notes && (
            <Tooltip title={submission.player_notes}>
              <FontAwesomeIcon icon={faComment} />
            </Tooltip>
          )}
        </TableCell>
      )}
      <TableCell width={1} align="center" sx={displayNoneOnMobile}>
        <StyledLink to={submission.proof_url} target="_blank">
          <FontAwesomeIcon icon={faExternalLinkAlt} />
        </StyledLink>
      </TableCell>
      {compact ? null : (
        <TableCell width={1} align="center">
          <DifficultyChip difficulty={submission.suggested_difficulty} isPersonal={submission.is_personal} />
        </TableCell>
      )}
    </TableRow>
  );
}
