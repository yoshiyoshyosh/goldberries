import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAuth } from "../../hooks/AuthProvider";
import { fetchSubmission, postSubmission } from "../../util/api";
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ErrorDisplay, LoadingSpinner, ProofEmbed } from "../BasicComponents";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import {
  DifficultySelect,
  FullChallengeSelect,
  VerificationStatusChip,
  PlayerSelect,
  PlayerChip,
} from "../GoldberriesComponents";
import { jsonDateToJsDate } from "../../util/util";
import { useDebounce } from "@uidotdev/usehooks";
import { FormOptions } from "../../util/constants";
import { FullChallengeDisplay } from "../../pages/Submission";
import { usePostSubmission } from "../../hooks/useApi";
import { CreateAnyButton } from "../../pages/manage/Challenges";

export function FormSubmissionWrapper({ id, onSave, ...props }) {
  const query = useQuery({
    queryKey: ["submission", id],
    queryFn: () => fetchSubmission(id),
  });

  if (query.isLoading || query.isFetching) {
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

  return <FormSubmission submission={query.data?.data ?? query.data} onSave={onSave} {...props} />;
}

export function FormSubmission({ submission, onSave, ...props }) {
  const auth = useAuth();

  const { mutate: saveSubmission } = usePostSubmission((submission) => {
    toast.success("Submission updated");
    if (onSave) onSave(submission);
  });

  const [challenge, setChallenge] = useState(submission.challenge ?? null);
  const [player, setPlayer] = useState(submission.player ?? null);

  const form = useForm({
    defaultValues: submission,
  });
  const onUpdateSubmit = form.handleSubmit((data) => {
    saveSubmission({ ...data, challenge_id: challenge?.id, player_id: player.id });
  });
  const onVerifySubmit = () => {
    form.setValue("is_verified", true);
    onUpdateSubmit();
  };
  const onRejectSubmit = () => {
    form.setValue("is_rejected", true);
    onUpdateSubmit();
  };

  const proofUrl = form.watch("proof_url");
  const proofUrlDebounced = useDebounce(proofUrl, 150);

  useEffect(() => {
    //Update all fields from submission to the form
    form.reset(submission);
    setChallenge(submission.challenge ?? null);
    setPlayer(submission.player ?? null);
  }, [submission]);

  const isVerifier = auth.hasVerifierPriv;
  const submitDisabled = player === null || (challenge === null && !submission.new_challenge_id);

  const new_challenge_id = form.watch("new_challenge_id");

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
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Submission ({submission.id})</Typography>
        <VerificationStatusChip
          isVerified={submission.is_verified}
          isRejected={submission.is_rejected}
          prefix="Status: "
        />
      </Stack>

      {isVerifier ? (
        <FullChallengeSelect challenge={challenge} setChallenge={setChallenge} />
      ) : new_challenge_id === null ? (
        <FullChallengeDisplay challenge={challenge} />
      ) : null}

      {new_challenge_id ? (
        <Stack direction="column" gap={2} sx={{ mt: 2 }}>
          <Divider flexItem />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">New Challenge Details</Typography>
            {isVerifier ? (
              <Stack direction="row" gap={2}>
                <CreateAnyButton
                  defaultCampaignName={submission.new_challenge?.name}
                  defaultCampaignUrl={submission.new_challenge?.url}
                  defaultMapName={submission.new_challenge?.name}
                  defaultDifficultyId={submission.suggested_difficulty_id ?? undefined}
                />
              </Stack>
            ) : null}
          </Stack>
          <TextField
            label="URL"
            disabled={!isVerifier}
            fullWidth
            {...form.register("new_challenge.url", FormOptions.UrlRequired)}
          />
          <TextField
            label="Name"
            disabled={!isVerifier}
            fullWidth
            {...form.register("new_challenge.name", FormOptions.Name128Required)}
          />
          <TextField
            label="Description"
            multiline
            minRows={2}
            disabled={!isVerifier}
            fullWidth
            {...form.register("new_challenge.description")}
          />
        </Stack>
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
            disabled={!isVerifier}
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
      ) : null}

      <TextField
        {...form.register("proof_url")}
        label="Proof URL*"
        disabled={!isVerifier}
        fullWidth
        sx={{ my: 2 }}
        InputLabelProps={{ shrink: true }}
      />
      {proofUrlDebounced ? <ProofEmbed url={proofUrlDebounced} /> : null}

      {submission.raw_session_url ? (
        <TextField
          {...form.register("raw_session_url")}
          label="Raw Session URL"
          fullWidth
          sx={{ mt: 2 }}
          disabled={!isVerifier}
          InputLabelProps={{ shrink: true }}
        />
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

      <List dense sx={{ pb: 0 }}>
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
            <ListItem>
              <ListItemText
                primary={submission.verifier ? submission.verifier.name : "Modded Golden Team"}
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
          sx={{ mt: 1 }}
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
