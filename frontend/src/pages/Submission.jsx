import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchSubmission, postSubmission } from "../util/api";
import { toast } from "react-toastify";
import {
  Box,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
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
  faShield,
  faSpinner,
  faUser,
  faUserAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hooks/AuthProvider";
import { errorToast, jsonDateToJsDate } from "../util/util";
import { CampaignSelect, ChallengeSelect, DifficultyChip, MapSelect } from "./Submit";
import { useEffect, useState } from "react";
import { displayDate, getChallengeFlags, getChallengeName, getSubmissionVerifier } from "../util/data_util";
import { GoldberriesBreadcrumbs } from "../components/Breadcrumb";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";

export function PageSubmission({}) {
  const { id } = useParams();

  return (
    <Container
      sx={{
        p: {
          xs: 0,
          sm: 1,
        },
      }}
      maxWidth="md"
    >
      <Paper
        elevation={2}
        sx={{
          px: {
            xs: 2,
            sm: 5,
          },
          py: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        <SubmissionDisplay id={id} />
      </Paper>
    </Container>
  );
}

export function SubmissionDisplay({ id, onDelete }) {
  const queryClient = useQueryClient();
  const auth = useAuth();
  const query = useQuery({
    queryKey: ["submission", id],
    queryFn: () => fetchSubmission(id),
    onSuccess: (response) => {
      setSubmission(response.data);
    },
    onError: errorToast,
  });
  const { mutate: updateSubmission } = useMutation({
    mutationFn: (data) => postSubmission(data),
    onSuccess: (data) => {
      toast.success("Submission updated!");
      queryClient.invalidateQueries(["submission", id]);
    },
    onError: errorToast,
  });
  const { mutate: deleteSubmission } = useMutation({
    mutationFn: (id) => deleteSubmission(id),
    onSuccess: (data) => {
      toast.success("Submission deleted!");
      queryClient.invalidateQueries(["submission", id]);
    },
    onError: errorToast,
  });

  const [submission, setSubmission] = useState(query.data ?? null);
  useEffect(() => {
    if (query.data) setSubmission(query.data.data);
  }, [id]);

  const isOwnSubmission = auth.hasPlayerClaimed && submission && submission.player_id === auth.user.player.id;
  const isVerifier = auth.hasVerifierPriv;

  if (query.isLoading) {
    return (
      <Box>
        <Typography variant="h3">
          Loading <FontAwesomeIcon icon={faSpinner} spin />
        </Typography>
      </Box>
    );
  } else if (query.isError) {
    return (
      <Box>
        <Typography variant="h3">Error: {query.error.message}</Typography>
      </Box>
    );
  }

  if (submission.new_challenge_id !== null) {
    return (
      <Box>
        <Typography variant="h3">Submission</Typography>
        <Typography variant="h6">Your submission for a new challenge is being checked!</Typography>
      </Box>
    );
  }
  if ((!isOwnSubmission && !isVerifier) || true) {
    return (
      <Box>
        <GoldberriesBreadcrumbs
          campaign={submission.challenge.map.campaign}
          map={submission.challenge.map}
          challenge={submission.challenge}
          submission={submission}
        />
        <Divider sx={{ my: 2 }}></Divider>
        <Grid container spacing={1} sx={{ mb: 1 }} alignItems="center">
          <Grid item xs={12} sm="auto">
            <Typography variant="h4">Submission</Typography>
          </Grid>
          <Grid item xs="auto" sm="auto">
            <Typography>by {submission.player.name}</Typography>
          </Grid>
          <Grid item xs={6} sm="auto">
            <VerificationStatusChip isVerified={submission.is_verified} isRejected={submission.is_rejected} />
          </Grid>
        </Grid>
        <FullChallengeDisplay challenge={submission.challenge} />
        <Divider sx={{ my: 2 }}>{/* <Chip label="Details" size="small" /> */}</Divider>
        <SubmissionDetailsDisplay submission={submission} />
      </Box>
    );
  }

  const setChallenge = (challenge) => {
    setSubmission({ ...submission, challenge: challenge, challenge_id: challenge.id });
  };

  return (
    <Box>
      <FullChallengeSelect
        defaultCampaign={submission.challenge.map?.campaign}
        defaultMap={submission.challenge.map}
        challenge={submission.challenge}
        setChallenge={setChallenge}
        disabled={!isOwnSubmission && !isVerifier}
      />
    </Box>
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
    if (challenge) {
      setCampaign(challenge.map.campaign);
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
        <ChallengeSelect
          campaign={campaign}
          map={map}
          selected={challenge}
          setSelected={setChallenge}
          disabled={disabled}
        />
      )}
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
              <FontAwesomeIcon icon={faYoutube} />
            </ListItemIcon>
            <ListItemText
              primary={<Link to={submission.proof_url}>{submission.proof_url}</Link>}
              secondary="Proof"
            />
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
