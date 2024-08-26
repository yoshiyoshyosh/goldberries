import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAuth } from "../../hooks/AuthProvider";
import { fetchSubmission, postSubmission } from "../../util/api";
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CustomIconButton,
  ErrorDisplay,
  LoadingSpinner,
  ProofEmbed,
  StyledLink,
  TooltipInfoButton,
} from "../BasicComponents";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import {
  FullChallengeSelect,
  VerificationStatusChip,
  PlayerSelect,
  PlayerChip,
  DifficultySelectControlled,
} from "../GoldberriesComponents";
import { jsonDateToJsDate } from "../../util/util";
import { useDebounce } from "@uidotdev/usehooks";
import { FormOptions } from "../../util/constants";
import { FullChallengeDisplay } from "../../pages/Submission";
import { usePostSubmission } from "../../hooks/useApi";
import { CreateAnyButton } from "../../pages/manage/Challenges";
import { useTranslation } from "react-i18next";
import { DatePicker, DateTimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { CustomModal, ModalButtons, useModal } from "../../hooks/useModal";
import { ChallengeDetailsList } from "../../pages/Challenge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketShopping } from "@fortawesome/free-solid-svg-icons";

export function FormSubmissionWrapper({ id, onSave, ...props }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const query = useQuery({
    queryKey: ["submission", id],
    queryFn: () => fetchSubmission(id),
    staleTime: 0,
  });

  if (query.isLoading || query.isFetching) {
    return (
      <>
        <Typography variant="h6">
          {t_g("submission", { count: 1 })} ({id})
        </Typography>
        <LoadingSpinner />
      </>
    );
  } else if (query.isError) {
    return (
      <>
        <Typography variant="h6">
          {t_g("submission", { count: 1 })} ({id})
        </Typography>
        <ErrorDisplay error={query.error} />
      </>
    );
  }

  return <FormSubmission submission={query.data?.data ?? query.data} onSave={onSave} {...props} />;
}

export function FormSubmission({ submission, onSave, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.submission" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_a } = useTranslation();
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const auth = useAuth();
  const mapCollectiblesModal = useModal(null, undefined, {
    actions: [ModalButtons.close],
  });

  const { mutate: saveSubmission } = usePostSubmission((submission) => {
    toast.success(t("feedback.updated"));
    if (onSave) onSave(submission);
  });

  const [challenge, setChallenge] = useState(submission.challenge ?? null);
  const [player, setPlayer] = useState(submission.player ?? null);

  const form = useForm({
    defaultValues: { ...submission, skip_webhook: false },
  });
  const onUpdateSubmit = form.handleSubmit((data) => {
    saveSubmission({ ...data, challenge_id: challenge?.id, player_id: player.id });
  });
  const onVerifySubmit = () => {
    form.setValue("is_verified", true);
    onUpdateSubmit();
  };
  const onRejectSubmit = () => {
    form.setValue("is_verified", false);
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

  const onCreateChallenge = (challenge) => {
    setChallenge(challenge);
  };

  const isVerifier = auth.hasVerifierPriv;
  const submitDisabled = player === null || (challenge === null && !submission.new_challenge_id);

  const new_challenge_id = form.watch("new_challenge_id");

  if (!isVerifier && submission.player.id !== auth.user.player.id) {
    return (
      <>
        <Typography variant="h6" gutterBottom>
          {t_g("submission", { count: 1 })} ({submission.id})
        </Typography>
        <ErrorDisplay error={{ message: "You do not have permission to edit this submission" }} />
      </>
    );
  }

  return (
    <>
      <form {...props}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">
            {t_g("submission", { count: 1 })} (
            <StyledLink to={"/submission/" + submission.id}>{submission.id}</StyledLink>)
          </Typography>
          <VerificationStatusChip isVerified={submission.is_verified} i18keySuffix="status_prefix" />
        </Stack>

        {isVerifier ? (
          <FullChallengeSelect challenge={challenge} setChallenge={setChallenge} />
        ) : (
          new_challenge_id === null && <FullChallengeDisplay challenge={challenge} />
        )}

        {new_challenge_id && (
          <Stack direction="column" gap={2} sx={{ mt: 2 }}>
            <Divider flexItem />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{t("new_challenge_title")}</Typography>
              {isVerifier && (
                <Stack direction="row" gap={2}>
                  <CreateAnyButton
                    defaultCampaignName={submission.new_challenge?.name}
                    defaultCampaignUrl={submission.new_challenge?.url}
                    defaultMapName={submission.new_challenge?.name}
                    defaultDifficultyId={submission.suggested_difficulty_id ?? undefined}
                    onCreateChallenge={onCreateChallenge}
                  />
                </Stack>
              )}
            </Stack>
            <TextField
              label={t_g("url")}
              disabled={!isVerifier}
              fullWidth
              {...form.register("new_challenge.url", FormOptions.UrlRequired(t_ff))}
            />
            <TextField
              label={t_g("name")}
              disabled={!isVerifier}
              fullWidth
              {...form.register("new_challenge.name", FormOptions.Name128Required(t_ff))}
            />
            <TextField
              label={t_g("description")}
              multiline
              minRows={2}
              disabled={!isVerifier}
              fullWidth
              {...form.register("new_challenge.description")}
            />
          </Stack>
        )}

        <Divider sx={{ my: 2 }} />

        {isVerifier ? (
          <PlayerSelect type="all" value={player} onChange={(e, v) => setPlayer(v)} sx={{ mt: 2, mb: 1 }} />
        ) : (
          <Stack direction="row" gap={2} sx={{ mt: 2, mb: 1 }}>
            <Typography variant="h6">{t_g("player", { count: 1 })}:</Typography>
            <PlayerChip player={player} />
          </Stack>
        )}

        <Stack direction="row" gap={1} sx={{ mt: 2 }} alignItems="center">
          <Controller
            control={form.control}
            name="is_fc"
            defaultValue={submission.is_fc}
            render={({ field }) => (
              <FormControlLabel
                onChange={field.onChange}
                label={t("is_fc")}
                checked={field.value}
                disabled={!isVerifier}
                control={<Checkbox />}
              />
            )}
          />
          {isVerifier && submission.is_verified !== null && (
            <>
              <Controller
                control={form.control}
                name="is_verified"
                defaultValue={submission.is_verified}
                render={({ field }) => (
                  <FormControlLabel
                    onChange={field.onChange}
                    label={t("is_verified")}
                    checked={field.value}
                    control={<Checkbox />}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="is_obsolete"
                defaultValue={submission.is_obsolete}
                render={({ field }) => (
                  <FormControlLabel
                    onChange={field.onChange}
                    label={t("is_obsolete")}
                    checked={field.value}
                    control={<Checkbox />}
                  />
                )}
              />
            </>
          )}
          {submission.challenge?.map && (
            <>
              <span style={{ flexGrow: 1 }} />
              <Tooltip arrow placement="top" title={t("map_information")}>
                <CustomIconButton
                  onClick={() => mapCollectiblesModal.open(submission.challenge?.map)}
                  sx={{ alignSelf: "stretch" }}
                >
                  <FontAwesomeIcon icon={faBasketShopping} />
                </CustomIconButton>
              </Tooltip>
            </>
          )}
        </Stack>

        <TextField
          {...form.register("proof_url")}
          label={t("proof_url") + " *"}
          disabled={!isVerifier}
          fullWidth
          sx={{ my: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        {proofUrlDebounced && <ProofEmbed url={proofUrlDebounced} />}

        {submission.raw_session_url && (
          <TextField
            {...form.register("raw_session_url")}
            label={t("raw_session_url") + " *"}
            fullWidth
            sx={{ mt: 2 }}
            disabled={!isVerifier}
            InputLabelProps={{ shrink: true }}
          />
        )}
        <TextField
          {...form.register("player_notes")}
          label={t("player_notes")}
          multiline
          rows={2}
          fullWidth
          sx={{ mt: 2 }}
          InputLabelProps={{ shrink: true }}
        />

        <Grid container columnSpacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm>
            <Controller
              control={form.control}
              name="suggested_difficulty_id"
              render={({ field }) => (
                <DifficultySelectControlled
                  label={t_a("components.difficulty_select.label")}
                  difficultyId={field.value}
                  setDifficultyId={field.onChange}
                  isSuggestion
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm="auto" display="flex" alignItems="center" justifyContent="center">
            <Controller
              control={form.control}
              name="is_personal"
              render={({ field }) => (
                <FormControlLabel
                  onChange={field.onChange}
                  label={t("is_personal")}
                  checked={field.value}
                  control={<Checkbox />}
                />
              )}
            />
            <TooltipInfoButton title={t("personal_note")} />
          </Grid>
        </Grid>

        {isVerifier && (
          <Controller
            control={form.control}
            name="date_created"
            render={({ field }) => (
              <DateTimePicker
                label={t("date_submitted") + " *"}
                value={dayjs(field.value)}
                onChange={(value) => {
                  field.onChange(value.toISOString());
                }}
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                }}
                sx={{ mt: 2, width: "100%" }}
              />
            )}
          />
        )}
        <List dense sx={{ pb: 0 }}>
          {!isVerifier && (
            <ListItem>
              <ListItemText
                primary={jsonDateToJsDate(submission.date_created).toLocaleString(navigator.language)}
                secondary={t("date_submitted")}
              />
            </ListItem>
          )}
          {submission.is_verified !== null ? (
            <>
              <ListItem>
                <ListItemText
                  primary={
                    submission.date_verified
                      ? jsonDateToJsDate(submission.date_verified).toLocaleString(navigator.language)
                      : "-"
                  }
                  secondary={t("date_verified")}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={submission.verifier ? submission.verifier.name : "Modded Golden Team"}
                  secondary={t("verifier")}
                />
              </ListItem>
            </>
          ) : null}
        </List>

        {isVerifier ? (
          <TextField
            {...form.register("verifier_notes")}
            label={t("verifier_notes")}
            multiline
            rows={1}
            fullWidth
            sx={{ mt: 1 }}
            InputLabelProps={{ shrink: true }}
          />
        ) : null}

        <Divider sx={{ my: 2 }} />

        {isVerifier && submission.is_verified === null && (
          <>
            <Stack direction="row" gap={2}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={onVerifySubmit}
                disabled={submitDisabled}
              >
                {t("buttons.verify")}
              </Button>
              <Button
                variant="contained"
                fullWidth
                color="error"
                onClick={onRejectSubmit}
                disabled={submitDisabled}
              >
                {t("buttons.reject")}
              </Button>
            </Stack>
            <Divider sx={{ my: 2 }} />
          </>
        )}
        <Button
          variant="contained"
          fullWidth
          color="primary"
          onClick={onUpdateSubmit}
          disabled={submitDisabled}
        >
          {t("buttons.update")}
        </Button>
      </form>

      <CustomModal modalHook={mapCollectiblesModal} options={{}} maxWidth="md">
        {mapCollectiblesModal.data && (
          <>
            <Typography variant="h6" gutterBottom>
              {t("map_information")} (
              <StyledLink to={"/map/" + mapCollectiblesModal.data.id}>
                {mapCollectiblesModal.data.id}
              </StyledLink>
              )
            </Typography>
            <ChallengeDetailsList map={mapCollectiblesModal.data} />
          </>
        )}
      </CustomModal>
    </>
  );
}
