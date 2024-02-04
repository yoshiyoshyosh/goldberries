import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteSubmission, fetchSubmission, postSubmission } from "../util/api";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faComment,
  faEdit,
  faFileExport,
  faShield,
  faSpinner,
  faTrash,
  faUser,
  faUserAlt,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hooks/AuthProvider";
import { errorToast, jsonDateToJsDate } from "../util/util";
import { CampaignSelect, ChallengeSelect, DifficultyChip, MapSelect } from "./Submit";
import { useEffect, useState } from "react";
import { displayDate, getChallengeFlags, getChallengeName, getSubmissionVerifier } from "../util/data_util";
import { GoldberriesBreadcrumbs } from "../components/Breadcrumb";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import CustomizedMenu, {
  BasicContainerBox,
  ErrorDisplay,
  LoadingSpinner,
  ProofEmbed,
} from "../components/BasicComponents";
import { FormSubmissionWrapper } from "../components/forms/Submission";
import { PlayerChip } from "./ClaimPlayer";
import { CustomModal, ModalButtons, useModal } from "../hooks/useModal";

export function PageSubmission({}) {
  const { id } = useParams();

  return (
    <BasicContainerBox maxWidth="md">
      <SubmissionDisplay id={parseInt(id)} />
    </BasicContainerBox>
  );
}

export function SubmissionDisplay({ id, onDelete }) {
  const queryClient = useQueryClient();
  const auth = useAuth();
  const query = useQuery({
    queryKey: ["submission", id],
    queryFn: () => fetchSubmission(id),
  });
  console.log("SubmissionDisplay query -> ", query.data?.data);
  const { mutate: doDeleteSubmission } = useMutation({
    mutationFn: (id) => deleteSubmission(id),
    onSuccess: (data) => {
      toast.success("Submission deleted!");
      queryClient.invalidateQueries(["submission", id]);
      if (onDelete !== undefined) onDelete();
    },
    onError: errorToast,
  });

  const editModal = useModal();
  const deleteModal = useModal(
    null,
    (cancelled, data) => {
      if (cancelled) return;
      doDeleteSubmission(data.id);
    },
    { actions: [ModalButtons.Cancel, ModalButtons.Delete] }
  );

  if (query.isLoading || query.isFetching) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const submission = query.data?.data;
  const isOwnSubmission = auth.hasPlayerClaimed && submission && submission.player_id === auth.user.player.id;
  const isVerifier = auth.hasVerifierPriv;

  return (
    <>
      {submission.challenge !== null && (
        <GoldberriesBreadcrumbs
          campaign={submission.challenge.map.campaign}
          map={submission.challenge.map}
          challenge={submission.challenge}
          submission={submission}
        />
      )}
      <Divider sx={{ my: 2 }}></Divider>
      <Grid container spacing={1} sx={{ mb: 1 }} alignItems="center">
        <Grid item xs={12} sm="auto">
          <Typography variant="h4">Submission</Typography>
        </Grid>
        <Grid item xs={6} sm>
          <VerificationStatusChip isVerified={submission.is_verified} isRejected={submission.is_rejected} />
        </Grid>
        {isVerifier || isOwnSubmission ? (
          <Grid item xs={6} sm="auto">
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
          </Grid>
        ) : null}
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

export function FullChallengeSelect({ challenge, setChallenge, disabled }) {
  const [campaign, setCampaign] = useState(challenge?.map?.campaign ?? null);
  const [map, setMap] = useState(challenge?.map ?? null);

  const onCampaignSelect = (campaign) => {
    setCampaign(campaign);
    if (campaign !== null && campaign.maps.length === 1) {
      setMap(campaign.maps[0]);
      if (campaign.maps[0].challenges.length === 1) {
        setChallenge(campaign.maps[0].challenges[0]);
      } else {
        setChallenge(null);
      }
    } else {
      setMap(null);
      setChallenge(null);
    }
  };
  const onMapSelect = (map) => {
    setMap(map);
    if (map !== null && map.challenges.length === 1) {
      setChallenge(map.challenges[0]);
    } else {
      setChallenge(null);
    }
  };

  useEffect(() => {
    if (challenge !== null && challenge.map !== null) {
      setCampaign(challenge.map?.campaign);
      setMap(challenge.map);
    }
  }, [challenge]);

  return (
    <Stack direction="column" gap={2}>
      <CampaignSelect selected={campaign} setSelected={onCampaignSelect} disabled={disabled} />
      {campaign && (
        <MapSelect campaign={campaign} selected={map} setSelected={onMapSelect} disabled={disabled} />
      )}
      {campaign && map && (
        <ChallengeSelect map={map} selected={challenge} setSelected={setChallenge} disabled={disabled} />
      )}
    </Stack>
  );
}

export function FullMapSelect({ map, setMap, disabled }) {
  const [campaign, setCampaign] = useState(map?.campaign ?? null);

  const onCampaignSelect = (campaign) => {
    setCampaign(campaign);
    if (campaign !== null && campaign.maps.length === 1) {
      setMap(campaign.maps[0]);
    } else {
      setMap(null);
    }
  };

  useEffect(() => {
    if (map && map.campaign) {
      setCampaign(map.campaign);
    }
  }, [map]);

  return (
    <Stack direction="column" gap={2}>
      <CampaignSelect selected={campaign} setSelected={onCampaignSelect} disabled={disabled} />
      {campaign && <MapSelect campaign={campaign} selected={map} setSelected={setMap} disabled={disabled} />}
    </Stack>
  );
}

export function FullChallengeDisplay({ challenge }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Campaign</TableCell>
            <TableCell>{challenge.map.campaign.name}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Map</TableCell>
            <TableCell>{challenge.map.name}</TableCell>
          </TableRow>
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
      {submission.is_verified || submission.is_rejected ? (
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
                    <Link to={"/player/" + verifier.id}>{verifier.name}</Link>
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

export function VerificationStatusChip({ isVerified, isRejected, prefix = "" }) {
  if (isVerified) {
    return <Chip label={prefix + "Verified"} color="success" />;
  } else if (isRejected) {
    return <Chip label={prefix + "Rejected"} color="error" />;
  }
  return <Chip label={prefix + "Pending"} color="warning" />;
}
