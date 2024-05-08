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
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hooks/AuthProvider";
import { DifficultyChip, VerificationStatusChip, PlayerChip } from "../components/GoldberriesComponents";
import {
  displayDate,
  getChallengeCampaign,
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
        <Grid item xs={12} sm="auto">
          <Typography variant="h4">Submission</Typography>
        </Grid>
        <Grid item xs={6} sm>
          <VerificationStatusChip isVerified={submission.is_verified} />
        </Grid>
        <Grid item xs={6} sm="auto">
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
      <PlayerChip player={submission.player} sx={{ mb: 2 }} />
      {submission.challenge !== null ? (
        <FullChallengeDisplay challenge={submission.challenge} />
      ) : (
        <NewChallengeDisplay newChallenge={submission.new_challenge} />
      )}
      <Divider sx={{ my: 2 }}>{/* <Chip label="Details" size="small" /> */}</Divider>
      <ProofEmbed url={submission.proof_url} />
      <SubmissionDetailsDisplay submission={submission} />

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

export function NewChallengeDisplay({ newChallenge }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Campaign URL</TableCell>
            <TableCell>{newChallenge.url}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Map</TableCell>
            <TableCell>{newChallenge.name}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
            <TableCell>{newChallenge.description}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function SubmissionDetailsDisplay({ submission }) {
  const verifier = getSubmissionVerifier(submission);
  return (
    <Grid container>
      <Grid item xs={12} sm={6}>
        <List dense>
          <ListSubheader>Submission Details</ListSubheader>
          <ListItem>
            <ListItemIcon>
              <FontAwesomeIcon icon={faClock} />
            </ListItemIcon>
            <ListItemText primary={displayDate(submission.date_created)} secondary="Submitted" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FontAwesomeIcon icon={faComment} />
            </ListItemIcon>
            <ListItemText primary={submission.player_notes ?? "-"} secondary="Player Notes" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FontAwesomeIcon icon={faShield} />
            </ListItemIcon>
            <ListItemText
              primary={<DifficultyChip difficulty={submission.suggested_difficulty} />}
              secondary="Suggested Difficulty"
            />
          </ListItem>
        </List>
      </Grid>
      {submission.is_verified !== null ? (
        <Grid item xs={12} sm={6}>
          <List dense>
            <ListSubheader>Verification Details</ListSubheader>
            <ListItem>
              <ListItemIcon>
                <FontAwesomeIcon icon={faClock} />
              </ListItemIcon>
              <ListItemText primary={displayDate(submission.date_verified)} secondary="Verified" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FontAwesomeIcon icon={faComment} />
              </ListItemIcon>
              <ListItemText primary={submission.verifier_notes ?? "-"} secondary="Verifier Notes" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FontAwesomeIcon icon={faUser} />
              </ListItemIcon>
              <ListItemText
                primary={
                  verifier.id ? (
                    <StyledLink to={"/player/" + verifier.id}>{verifier.name}</StyledLink>
                  ) : (
                    <>{verifier.name}</>
                  )
                }
                secondary="Verifier"
              />
            </ListItem>
          </List>
        </Grid>
      ) : null}
    </Grid>
  );
}
