import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faComment,
  faEdit,
  faShield,
  faUser,
  faTrash,
  faShare,
  faCheckCircle,
  faExternalLink,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hooks/AuthProvider";
import {
  DifficultyChip,
  VerificationStatusChip,
  PlayerChip,
  JournalIcon,
} from "../components/GoldberriesComponents";
import {
  displayDate,
  getChallengeCampaign,
  getChallengeDescription,
  getChallengeFlags,
  getChallengeName,
  getChallengeNameShort,
  getSubmissionVerifier,
} from "../util/data_util";
import { GoldberriesBreadcrumbs } from "../components/Breadcrumb";
import {
  CustomizedMenu,
  BasicContainerBox,
  ErrorDisplay,
  LoadingSpinner,
  ProofEmbed,
  HeadTitle,
  StyledLink,
  StyledExternalLink,
  ShareButton,
  InfoBox,
  InfoBoxIconTextLine,
} from "../components/BasicComponents";
import { FormSubmissionWrapper } from "../components/forms/Submission";
import { CustomModal, ModalButtons, useModal } from "../hooks/useModal";
import { getQueryData, useDeleteSubmission, useGetSubmission } from "../hooks/useApi";
import { API_BASE_URL, API_URL, APP_URL } from "../util/constants";

export function PageSubmission({}) {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <BasicContainerBox maxWidth="md">
      <SubmissionDisplay
        id={parseInt(id)}
        onDelete={() => {
          navigate("/");
        }}
      />
    </BasicContainerBox>
  );
}

export function SubmissionDisplay({ id, onDelete }) {
  const auth = useAuth();
  const query = useGetSubmission(id);
  console.log("SubmissionDisplay query -> ", query);
  const { mutate: deleteSubmission } = useDeleteSubmission((submission) => {
    toast.success("Submission deleted!");
    if (onDelete !== undefined) onDelete();
  });

  const editModal = useModal();
  const deleteModal = useModal(
    null,
    (cancelled, data) => {
      if (cancelled) return;
      deleteSubmission(data.id);
    },
    { actions: [ModalButtons.Cancel, ModalButtons.Delete] }
  );

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const submission = getQueryData(query);
  const isOwnSubmission = auth.hasPlayerClaimed && submission && submission.player_id === auth.user.player.id;
  const isVerifier = auth.hasVerifierPriv;

  const challenge = submission.challenge;
  const map = challenge?.map;
  const campaign = getChallengeCampaign(challenge);

  let title = "";
  if (submission.new_challenge !== null) {
    title = submission.new_challenge.name + " by '" + submission.player.name + "'";
  } else {
    title =
      (map?.name ?? campaign.name) +
      " - " +
      getChallengeNameShort(submission.challenge) +
      " by '" +
      submission.player.name +
      "'";
  }

  return (
    <>
      <HeadTitle title={title} />
      {submission.challenge !== null && (
        <>
          <GoldberriesBreadcrumbs
            campaign={campaign}
            map={map}
            challenge={challenge}
            submission={submission}
          />
          <Divider sx={{ my: 2 }}></Divider>
        </>
      )}
      <Grid container spacing={1} sx={{ mb: 1 }} alignItems="center">
        <Grid item xs={12} sm>
          <Typography variant="h4">Submission</Typography>
        </Grid>
        <Grid item xs={12} sm="auto">
          <Stack direction="row" gap={1}>
            <ShareButton text={API_BASE_URL + "/embed/submission.php?id=" + submission.id} />
            {isVerifier || isOwnSubmission ? (
              <CustomizedMenu title="Modify">
                <MenuItem disableRipple onClick={() => editModal.open(submission)}>
                  <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faEdit} />
                  Edit
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem disableRipple disableGutters sx={{ py: 0 }}>
                  <Button
                    onClick={() => deleteModal.open(submission)}
                    color="error"
                    disableRipple
                    sx={{ px: "16px" }}
                  >
                    <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faTrash} />
                    Delete
                  </Button>
                </MenuItem>
              </CustomizedMenu>
            ) : null}
          </Stack>
        </Grid>
      </Grid>
      <ProofEmbed url={submission.proof_url} />
      <SubmissionDetailsDisplay submission={submission} sx={{ mt: 0 }} />

      <CustomModal modalHook={editModal} options={{ hideFooter: true }}>
        <FormSubmissionWrapper id={editModal.data?.id} onSave={() => editModal.close()} />
      </CustomModal>

      <CustomModal modalHook={deleteModal} options={{ title: "Delete Submission" }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to delete this submission?
        </Typography>
      </CustomModal>
    </>
  );
}

export function FullChallengeDisplay({ challenge }) {
  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Campaign</TableCell>
            <TableCell>{campaign.name}</TableCell>
          </TableRow>
          {map === null ? (
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>Is Full Game?</TableCell>
              <TableCell>Yes</TableCell>
            </TableRow>
          ) : (
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Map</TableCell>
              <TableCell>{challenge.map.name}</TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Challenge</TableCell>
            <TableCell>
              {getChallengeName(challenge)} - {challenge.objective.description}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Flags</TableCell>
            <TableCell>
              <Stack direction="row" gap={1}>
                <DifficultyChip difficulty={challenge.difficulty} prefix="Difficulty: " />
                {getChallengeFlags(challenge).map((f) => (
                  <Chip label={f} size="small" />
                ))}
              </Stack>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function SubmissionDetailsDisplay({ submission, challenge = null, ...props }) {
  const verifier = getSubmissionVerifier(submission);
  challenge = challenge ?? submission.challenge;
  const map = challenge !== null ? challenge.map : null;
  const campaign = challenge !== null ? getChallengeCampaign(challenge) : null;
  const newChallenge = submission.new_challenge;

  return (
    <Grid container columnSpacing={1} rowSpacing={1} {...props}>
      <Grid item xs={12} sm={4} display="flex" flexDirection="column" rowGap={1}>
        <Typography
          variant="body1"
          textTransform="uppercase"
          color={(t) => t.palette.text.secondary}
          fontSize="90%"
        >
          {challenge === null ? "New Challenge" : "Map"}
        </Typography>
        {challenge !== null ? (
          <>
            <InfoBox>
              <InfoBoxIconTextLine text="Campaign" />
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
                <InfoBoxIconTextLine
                  text={<FontAwesomeIcon icon={faCheckCircle} color="green" />}
                  isSecondary
                />
              </InfoBox>
            )}
            <InfoBox>
              <InfoBoxIconTextLine text="Challenge" />
              <InfoBoxIconTextLine text={getChallengeName(challenge)} isSecondary />
            </InfoBox>
            <InfoBox>
              <InfoBoxIconTextLine text="Difficulty" />
              <InfoBoxIconTextLine text={<DifficultyChip difficulty={challenge.difficulty} />} isSecondary />
            </InfoBox>
          </>
        ) : (
          <>
            <InfoBox>
              <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faExternalLink} />} text="Campaign URL" />
              <InfoBoxIconTextLine
                text={<StyledExternalLink href={newChallenge.url}>{newChallenge.url}</StyledExternalLink>}
                isSecondary
              />
            </InfoBox>
            <InfoBox>
              <InfoBoxIconTextLine text="Map" />
              <InfoBoxIconTextLine text={newChallenge.name} isSecondary />
            </InfoBox>
            <InfoBox>
              <InfoBoxIconTextLine text="Description" />
              <InfoBoxIconTextLine text={newChallenge.description ?? "-"} isSecondary />
            </InfoBox>
          </>
        )}
      </Grid>
      <Grid item xs={12} sm={4} display="flex" flexDirection="column" rowGap={1}>
        <Typography
          variant="body1"
          textTransform="uppercase"
          color={(t) => t.palette.text.secondary}
          fontSize="90%"
        >
          Submission
        </Typography>
        <InfoBox>
          <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faUser} />} text="Player" />
          <InfoBoxIconTextLine text={<PlayerChip player={submission.player} size="small" />} isSecondary />
        </InfoBox>
        <InfoBox>
          <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faClock} />} text="Submitted" />
          <InfoBoxIconTextLine text={displayDate(submission.date_created)} isSecondary />
        </InfoBox>
        <InfoBox>
          <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faComment} />} text="Player Notes" />
          <InfoBoxIconTextLine text={submission.player_notes ?? "-"} isSecondary />
        </InfoBox>
        <InfoBox>
          <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faShield} />} text="Suggested Difficulty" />
          <InfoBoxIconTextLine
            text={
              submission.suggested_difficulty === null ? (
                "-"
              ) : (
                <DifficultyChip difficulty={submission.suggested_difficulty} />
              )
            }
            isSecondary
          />
        </InfoBox>
      </Grid>
      <Grid item xs={12} sm={4} display="flex" flexDirection="column" rowGap={1}>
        <Typography
          variant="body1"
          textTransform="uppercase"
          color={(t) => t.palette.text.secondary}
          fontSize="90%"
        >
          Verification
        </Typography>
        {submission.is_verified !== null ? (
          <>
            <InfoBox>
              <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faUser} />} text="Verifier" />
              <InfoBoxIconTextLine
                text={verifier.id ? <PlayerChip player={submission.verifier} size="small" /> : verifier.name}
                isSecondary
              />
            </InfoBox>
            <InfoBox>
              <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faClock} />} text="Verified" />
              <InfoBoxIconTextLine text={displayDate(submission.date_verified)} isSecondary />
            </InfoBox>
            <InfoBox>
              <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faComment} />} text="Verifier Notes" />
              <InfoBoxIconTextLine text={submission.verifier_notes ?? "-"} isSecondary />
            </InfoBox>
          </>
        ) : (
          <>
            <InfoBox>
              <InfoBoxIconTextLine text="Status" />
              <InfoBoxIconTextLine
                text={<VerificationStatusChip isVerified={submission.is_verified} size="small" />}
                isSecondary
              />
            </InfoBox>
          </>
        )}
      </Grid>
    </Grid>
  );
}
