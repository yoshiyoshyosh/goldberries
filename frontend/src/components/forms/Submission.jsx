import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAuth } from "../../hooks/AuthProvider";
import { deleteSubmission, fetchSubmission, postSubmission } from "../../util/api";
import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ErrorDisplay, LoadingSpinner } from "../BasicComponents";
import { Controller, set, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FullChallengeDisplay, FullChallengeSelect, VerificationStatusChip } from "../../pages/Submission";
import { useEffect, useState } from "react";
import { PlayerChip, PlayerSelect } from "../../pages/ClaimPlayer";
import { DifficultySelect } from "../../pages/Submit";
import { jsonDateToJsDate } from "../../util/util";

export function FormSubmissionWrapper({ id, onSave, ...props }) {
  const query = useQuery({
    queryKey: ["submission", id],
    queryFn: () => fetchSubmission(id),
  });

  if (query.isLoading) {
    return (
      <>
        <Typography variant="h6">Submission ({id})</Typography>
        <LoadingSpinner />
      </>
    );
  } else if (query.isError) {
    return (
      <>
        <Typography variant="h6">Submission ({id})</Typography>
        <ErrorDisplay error={query.error} />
      </>
    );
  }

  return <FormSubmission submission={query.data.data} onSave={onSave} {...props} />;
}

export function FormSubmission({ submission, onSave, ...props }) {
  const auth = useAuth();
  const queryClient = useQueryClient();

  const { mutate: saveSubmission } = useMutation({
    mutationFn: (submission) => postSubmission(submission),
    onSuccess: (response) => {
      queryClient.invalidateQueries(["submission", submission.id]);
      queryClient.invalidateQueries(["submission_queue"]);
      toast.success("Submission updated!");
      if (onSave) onSave(response.data);
    },
  });

  const [challenge, setChallenge] = useState(submission.challenge ?? null);
  const [player, setPlayer] = useState(submission.player ?? null);

  const form = useForm({
    defaultValues: submission,
  });
  const onUpdateSubmit = form.handleSubmit((data) => {
    saveSubmission({ ...data, challenge_id: challenge.id, player_id: player.id });
  });
  const onVerifySubmit = () => {
    form.setValue("is_verified", true);
    onUpdateSubmit();
  };
  const onRejectSubmit = () => {
    form.setValue("is_rejected", true);
    onUpdateSubmit();
  };

  useEffect(() => {
    //Update all fields from submission to the form
    form.reset(submission);
    setChallenge(submission.challenge ?? null);
    setPlayer(submission.player ?? null);
  }, [submission]);

  const isVerifier = auth.hasVerifierPriv;
  const submitDisabled = challenge === null || player === null;

  if (!isVerifier && submission.player.id !== auth.user.player.id) {
    return (
      <>
        <Typography variant="h6" gutterBottom>
          Submission ({submission.id})
        </Typography>
        <ErrorDisplay error={{ message: "You do not have permission to edit this submission" }} />
      </>
    );
  }

  return (
    <form {...props}>
      <Typography variant="h6" gutterBottom>
        Submission ({submission.id})
      </Typography>
      {isVerifier ? (
        <FullChallengeSelect challenge={challenge} setChallenge={setChallenge} />
      ) : (
        <FullChallengeDisplay challenge={challenge} />
      )}

      {submission.new_challenge_id ? (
        <>
          <TextField label="New Challenge URL" disabled fullWidth />
          <TextField label="New Challenge Name" disabled fullWidth />
          <TextField label="New Challenge Description" multiline minRows={2} disabled fullWidth />
        </>
      ) : null}

      <Divider sx={{ my: 2 }} />

      {isVerifier ? (
        <PlayerSelect type="all" value={player} onChange={(e, v) => setPlayer(v)} sx={{ mt: 2, mb: 1 }} />
      ) : (
        <Stack direction="row" gap={2} sx={{ mt: 2, mb: 1 }}>
          <Typography variant="h6">Player:</Typography>
          <PlayerChip player={player} />
        </Stack>
      )}

      <Controller
        control={form.control}
        name="is_fc"
        defaultValue={submission.is_fc}
        render={({ field }) => (
          <FormControlLabel
            onChange={field.onChange}
            label="Is FC"
            checked={field.value}
            control={<Checkbox />}
          />
        )}
      />
      {isVerifier && (submission.is_verified || submission.is_rejected) ? (
        <>
          <Controller
            control={form.control}
            name="is_verified"
            defaultValue={submission.is_verified}
            render={({ field }) => (
              <FormControlLabel
                onChange={field.onChange}
                label="Is Verified"
                checked={field.value}
                control={<Checkbox />}
              />
            )}
          />
          <Controller
            control={form.control}
            name="is_rejected"
            defaultValue={submission.is_rejected}
            render={({ field }) => (
              <FormControlLabel
                onChange={field.onChange}
                label="Is Rejected"
                checked={field.value}
                control={<Checkbox />}
              />
            )}
          />
        </>
      ) : (
        <VerificationStatusChip
          isVerified={submission.is_verified}
          isRejected={submission.is_rejected}
          prefix="Status: "
        />
      )}

      <TextField
        {...form.register("proof_url")}
        label="Proof URL*"
        disabled={!isVerifier}
        fullWidth
        sx={{ mt: 2 }}
      />
      {submission.raw_session_url ? (
        <TextField {...form.register("raw_session_url")} label="Raw Session URL" fullWidth sx={{ mt: 2 }} />
      ) : null}
      <TextField
        {...form.register("player_notes")}
        label="Player Notes"
        multiline
        rows={2}
        fullWidth
        sx={{ mt: 2 }}
        InputLabelProps={{ shrink: true }}
      />

      <DifficultySelect
        label="Suggested Difficulty"
        {...form.register("suggested_difficulty_id")}
        sx={{ mt: 2 }}
        fullWidth
        defaultValue={submission.suggested_difficulty_id ?? null}
      />

      <List dense>
        <ListItem>
          <ListItemText
            primary={jsonDateToJsDate(submission.date_created).toLocaleString()}
            secondary="Date Submitted"
          />
        </ListItem>
        {submission.is_verified ? (
          <>
            <ListItem>
              <ListItemText
                primary={
                  submission.date_verified ? jsonDateToJsDate(submission.date_verified).toLocaleString() : "-"
                }
                secondary="Date Verified"
              />
            </ListItem>
            {!isVerifier ? (
              <ListItem>
                <ListItemText
                  primary={
                    submission.date_verified
                      ? jsonDateToJsDate(submission.date_verified).toLocaleString()
                      : "-"
                  }
                  secondary="Date Verified"
                />
              </ListItem>
            ) : null}
            <ListItem>
              <ListItemText
                primary={submission.verifier ? submission.verifier.name : "-"}
                secondary="Verifier"
              />
            </ListItem>
          </>
        ) : null}
      </List>

      {isVerifier ? (
        <TextField
          {...form.register("verifier_notes")}
          label="Verifier Notes"
          multiline
          rows={1}
          fullWidth
          sx={{ mt: 0 }}
          InputLabelProps={{ shrink: true }}
        />
      ) : null}

      <Divider sx={{ my: 2 }} />

      {isVerifier ? (
        submission.is_verified || submission.is_rejected ? (
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            onClick={onUpdateSubmit}
            disabled={submitDisabled}
          >
            Update Submission
          </Button>
        ) : (
          <Stack direction="row" gap={2}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={onVerifySubmit}
              disabled={submitDisabled}
            >
              Verify
            </Button>
            <Button
              variant="contained"
              fullWidth
              color="error"
              onClick={onRejectSubmit}
              disabled={submitDisabled}
            >
              Reject
            </Button>
          </Stack>
        )
      ) : (
        <Button
          variant="contained"
          fullWidth
          color="primary"
          onClick={onUpdateSubmit}
          disabled={submitDisabled}
        >
          Update Submission
        </Button>
      )}
    </form>
  );
}
