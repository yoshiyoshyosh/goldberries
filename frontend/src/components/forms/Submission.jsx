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
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
  duration,
  useMediaQuery,
  useTheme,
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
  DateAchievedTimePicker,
} from "../GoldberriesComponents";
import { jsonDateToJsDate } from "../../util/util";
import { useDebounce } from "@uidotdev/usehooks";
import { FormOptions } from "../../util/constants";
import { FullChallengeDisplay } from "../../pages/Submission";
import { getQueryData, usePostSubmission } from "../../hooks/useApi";
import { CreateAnyButton } from "../../pages/manage/Challenges";
import { useTranslation } from "react-i18next";
import { DatePicker, DateTimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { CustomModal, ModalButtons, useModal } from "../../hooks/useModal";
import {
  ChallengeDetailsList,
  ChallengeDetailsListWrapper,
  CollectiblesInfoBox,
} from "../../pages/Challenge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBasketShopping } from "@fortawesome/free-solid-svg-icons";
import { CharsCountLabel } from "../../pages/Suggestions";
import { durationToSeconds, secondsToDuration } from "../../util/data_util";

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

  const data = getQueryData(query);
  return <FormSubmission submission={data} onSave={onSave} {...props} />;
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
  const theme = useTheme();
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));

  const { mutate: saveSubmission } = usePostSubmission((submission) => {
    toast.success(t("feedback.updated"));
    if (onSave) onSave(submission);
  });

  const [challenge, setChallenge] = useState(submission.challenge ?? null);
  const [player, setPlayer] = useState(submission.player ?? null);

  const form = useForm({
    defaultValues: {
      ...submission,
      time_taken: secondsToDuration(submission.time_taken),
    },
  });
  const onUpdateSubmit = form.handleSubmit((data) => {
    saveSubmission({
      ...data,
      frac: data.frac === 50 ? null : data.frac,
      time_taken: durationToSeconds(data.time_taken),
      challenge_id: challenge?.id,
      player_id: player.id,
    });
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
    form.reset({
      ...submission,
      time_taken: secondsToDuration(submission.time_taken),
    });
    setChallenge(submission.challenge ?? null);
    setPlayer(submission.player ?? null);
  }, [submission]);

  const onCreateChallenge = (challenge) => {
    setChallenge(challenge);
  };

  const isHelper = auth.hasHelperPriv;
  const submitDisabled = player === null || (challenge === null && !submission.new_challenge_id);

  const new_challenge_id = form.watch("new_challenge_id");
  const new_challenge = form.watch("new_challenge");
  const suggested_difficulty_id = form.watch("suggested_difficulty_id");
  const frac = form.watch("frac");

  const markDateAchieved = shouldMarkSubmissionDateAchieved(submission);

  if (!isHelper && submission.player.id !== auth.user.player.id) {
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

        {isHelper ? (
          <FullChallengeSelect challenge={challenge} setChallenge={setChallenge} />
        ) : (
          new_challenge_id === null && <FullChallengeDisplay challenge={challenge} />
        )}

        {new_challenge_id && (
          <Stack direction="column" gap={2} sx={{ mt: 2 }}>
            <Divider flexItem />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{t("new_challenge_title")}</Typography>
              {isHelper && (
                <Stack direction="row" gap={2}>
                  <CreateAnyButton
                    defaultCampaignName={submission.new_challenge?.name}
                    defaultCampaignUrl={submission.new_challenge?.url}
                    defaultMapName={submission.new_challenge?.name}
                    defaultMapGoldenChanges={submission.new_challenge?.golden_changes}
                    defaultMapCollectibles={submission.new_challenge?.collectibles}
                    defaultDifficultyId={submission.suggested_difficulty_id ?? undefined}
                    onCreateChallenge={onCreateChallenge}
                  />
                </Stack>
              )}
            </Stack>
            <TextField
              label={t_g("url")}
              disabled={!isHelper}
              fullWidth
              {...form.register("new_challenge.url", FormOptions.UrlRequired(t_ff))}
            />
            <TextField
              label={t_g("name")}
              disabled={!isHelper}
              fullWidth
              {...form.register("new_challenge.name", FormOptions.Name128Required(t_ff))}
            />
            <TextField
              label={t_g("description")}
              multiline
              minRows={2}
              disabled={!isHelper}
              fullWidth
              {...form.register("new_challenge.description")}
            />
            <TextField
              label={t("golden_changes")}
              multiline
              minRows={2}
              disabled={!isHelper}
              fullWidth
              {...form.register("new_challenge.golden_changes")}
            />
            {new_challenge.collectibles && <CollectiblesInfoBox collectibles={new_challenge.collectibles} />}
          </Stack>
        )}

        <Divider sx={{ my: 2 }} />

        {isHelper ? (
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
                disabled={!isHelper}
                control={<Checkbox />}
              />
            )}
          />
          {isHelper && submission.is_verified !== null && (
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
                  onClick={() => mapCollectiblesModal.open(submission.challenge.map)}
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
          disabled={!isHelper}
          fullWidth
          sx={{ my: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        {proofUrlDebounced && <ProofEmbed url={proofUrlDebounced} />}

        {(submission.raw_session_url || isHelper) && (
          <TextField
            {...form.register("raw_session_url")}
            label={t("raw_session_url")}
            fullWidth
            sx={{ mt: 2 }}
            disabled={!isHelper}
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
        <CharsCountLabel text={form.watch("player_notes")} maxChars={5000} />

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
        <Controller
          control={form.control}
          name="frac"
          render={({ field }) => (
            <DifficultyFracGrid
              value={field.value}
              onChange={field.onChange}
              disabled={suggested_difficulty_id === null}
              compact
            />
          )}
        />

        <TextField
          {...form.register("time_taken", FormOptions.TimeTaken(t_ff))}
          label={t("time_taken")}
          fullWidth
          sx={{ mt: 2 }}
          InputLabelProps={{ shrink: true }}
          placeholder="(hh:)mm:ss"
          error={!!form.formState.errors.time_taken}
        />
        {form.formState.errors.time_taken && (
          <Typography variant="caption" color="error">
            {form.formState.errors.time_taken.message}
          </Typography>
        )}

        <Controller
          control={form.control}
          name="date_achieved"
          render={({ field }) => (
            <DateAchievedTimePicker
              value={field.value}
              disabled={!isHelper}
              onChange={(value) => {
                field.onChange(value);
              }}
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": markDateAchieved
                  ? {
                      "& fieldset": {
                        borderColor: "yellow",
                        borderWidth: 2,
                      },
                    }
                  : {},
              }}
            />
          )}
        />
        <List dense sx={{ pb: 0 }}>
          <ListItem>
            <ListItemText
              primary={jsonDateToJsDate(submission.date_created).toLocaleString(navigator.language)}
              secondary={t("date_submitted")}
            />
          </ListItem>
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

        {isHelper ? (
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

        {isHelper && submission.is_verified === null && (
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
              {t_g("campaign", { count: 1 })} (
              <StyledLink to={"/campaign/" + mapCollectiblesModal.data.campaign_id}>
                {mapCollectiblesModal.data.campaign_id}
              </StyledLink>
              ) <FontAwesomeIcon icon={faArrowRight} /> {t("map_information")} (
              <StyledLink to={"/map/" + mapCollectiblesModal.data.id}>
                {mapCollectiblesModal.data.id}
              </StyledLink>
              )
            </Typography>
            <ChallengeDetailsListWrapper id={mapCollectiblesModal.data.id} />
          </>
        )}
      </CustomModal>
    </>
  );
}

export function DifficultyFracGrid({ value, onChange, disabled, compact = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.submission" });

  return (
    <Grid container columnSpacing={2}>
      <Grid item xs={12} sm="auto" display="flex" alignItems="center">
        <Stack direction="row" gap={1} alignItems="center">
          <Typography variant="body2">{t("frac_header")}</Typography>
          <TooltipInfoButton title={t("frac_note")} />
        </Stack>
      </Grid>
      <Grid item xs={12} sm>
        <Grid container spacing={1}>
          <Grid item xs={10} display="flex" alignItems="center" justifyContent="space-around">
            <DifficultyFracSlider
              value={value ?? 50}
              onChange={onChange}
              disabled={disabled}
              compact={compact}
            />
          </Grid>
          <Grid item xs={2} display="flex" alignItems="center" justifyContent="space-around">
            <Typography variant="body2" align="center">
              {(value ?? 50) / 100}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
function DifficultyFracSlider({ value, onChange, disabled, compact }) {
  const theme = useTheme();
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));

  let top = 20;
  if (!isMdScreen) top += 5;
  if (!compact) top += 5;

  return (
    <Slider
      value={value}
      onChange={(_, v) => onChange(v)}
      valueLabelDisplay="auto"
      step={1}
      min={0}
      max={99}
      valueLabelFormat={(v) => "" + v / 100}
      marks={[
        { value: 0, label: "Low" },
        { value: 50, label: "Mid" },
        { value: 99, label: "High" },
      ]}
      slotProps={{
        root: { style: { marginBottom: "3px" } },
        markLabel: { style: { top: `${top}px` } },
      }}
      sx={{ width: "95%" }}
      disabled={disabled}
    />
  );
}

export function shouldMarkSubmissionDateAchieved(submission) {
  const dateAchievedCreatedDiscrepancy = dayjs(submission.date_achieved).diff(dayjs(submission.date_created));
  const isTooLongAgo = Math.abs(dateAchievedCreatedDiscrepancy) > 1000 * 60 * 60 * 24 * 28; // 28 days
  const isUnverified = submission.is_verified !== true;
  return isUnverified && isTooLongAgo;
}
