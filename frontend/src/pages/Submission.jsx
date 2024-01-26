import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { fetchSubmission, postSubmission } from "../util/api";
import { toast } from "react-toastify";
import {
  Box,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hooks/AuthProvider";
import { errorToast, jsonDateToJsDate } from "../util/util";
import { CampaignSelect, ChallengeSelect, DifficultyChip, MapSelect } from "./Submit";
import { useEffect, useState } from "react";
import { displayDate, getChallengeFlags, getChallengeName } from "../util/data_util";
import { GoldberriesBreadcrumbs } from "../components/Breadcrumb";

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
          p: {
            xs: 2,
            sm: 5,
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

  const isOwnSubmission = auth.isLoggedIn && submission && submission.player_id === auth.user.player.id;
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

  console.log("Submission -> ", submission);

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
        <Grid container spacing={1} sx={{ mb: 1 }} alignItems="center">
          <Grid item xs={12} sm="auto">
            <Typography variant="h4">Submission</Typography>
          </Grid>
          <Grid item xs="auto" sm="auto">
            <Typography>by {submission.player.name}</Typography>
          </Grid>
          <Grid item xs={6} sm="auto">
            {submission.is_verified && <Chip label="Verified" color="success" />}
            {submission.is_rejected && <Chip label="Rejected" color="error" />}
            {!submission.is_verified && !submission.is_rejected && (
              <Chip label="Pending Verification" color="warning" />
            )}
          </Grid>
        </Grid>
        <FullChallengeDisplay challenge={submission.challenge} />
        <Divider sx={{ my: 2 }}>
          <Chip label="Details" size="small" />
        </Divider>
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

export function FullChallengeSelect({ defaultCampaign, defaultMap, challenge, setChallenge, disabled }) {
  const [campaign, setCampaign] = useState(defaultCampaign ?? null);
  const [map, setMap] = useState(defaultMap ?? null);

  return (
    <Stack direction="column" gap={2}>
      <CampaignSelect selected={campaign} setSelected={setCampaign} disabled={disabled} />
      <MapSelect campaign={campaign} selected={map} setSelected={setMap} disabled={disabled} />
      <ChallengeSelect
        campaign={campaign}
        map={map}
        selected={challenge}
        setSelected={setChallenge}
        disabled={disabled}
      />
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
  return (
    <Box gap={2}>
      <Typography variant="h4">Submission Details</Typography>
      <Typography variant="h6">Submitted on: {displayDate(submission.date_created)}</Typography>
      <Typography variant="h6">
        Proof Video:{" "}
        <a href={submission.proof_url} target="_blank" rel="noreferrer">
          {submission.proof_url}
        </a>
      </Typography>
      <Typography variant="h6">Notes:</Typography>
      <TextField fullWidth multiline rows={2} value={submission.notes} disabled />
      <Typography variant="h6">
        Suggested Difficulty: <DifficultyChip difficulty={submission.suggested_difficulty} />
      </Typography>
      {submission.is_verified || submission.is_rejected ? (
        <>
          <Divider sx={{ my: 2 }}>
            <Chip label="Verification" size="small" />
          </Divider>
          <Typography variant="h6">Verified By: {submission.verifier?.name ?? "Molden Team"}</Typography>
          <Typography variant="h6">On: {displayDate(submission.date_verified)}</Typography>
          <Typography variant="h6">Verifier Notes:</Typography>
          <TextField fullWidth multiline rows={2} value={submission.verifier_notes} disabled />
        </>
      ) : null}
    </Box>
  );
}
