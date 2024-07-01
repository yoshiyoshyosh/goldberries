import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Button,
  Chip,
  Divider,
  Grid,
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
  faCheckCircle,
  faExternalLink,
  faFlagCheckered,
  faBook,
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
  StyledExternalLink,
  ShareButton,
  InfoBox,
  InfoBoxIconTextLine,
} from "../components/BasicComponents";
import { FormSubmissionWrapper } from "../components/forms/Submission";
import { CustomModal, ModalButtons, useModal } from "../hooks/useModal";
import { getQueryData, useDeleteSubmission, useGetSubmission } from "../hooks/useApi";
import { API_BASE_URL } from "../util/constants";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(undefined, { keyPrefix: "submission" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const auth = useAuth();
  const query = useGetSubmission(id);
  const { mutate: deleteSubmission } = useDeleteSubmission((submission) => {
    toast.success(t("feedback.deleted"));
    if (onDelete !== undefined) onDelete();
  });

  const editModal = useModal();
  const deleteModal = useModal(
    null,
    (cancelled, data) => {
      if (cancelled) return;
      deleteSubmission(data.id);
    },
    { actions: [ModalButtons.cancel, ModalButtons.delete] }
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
    title = t("title", { challenge: submission.new_challenge.name, player: submission.player.name });
  } else {
    const challengeName = (map?.name ?? campaign.name) + " - " + getChallengeNameShort(challenge);
    title = t("title", { challenge: challengeName, player: submission.player.name });
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
          <Typography variant="h4">{t_g("submission", { count: 1 })}</Typography>
        </Grid>
        <Grid item xs={12} sm="auto">
          <Stack direction="row" gap={1}>
            <ShareButton text={API_BASE_URL + "/embed/submission.php?id=" + submission.id} />
            {isVerifier || isOwnSubmission ? (
              <CustomizedMenu title={t("buttons.modify")}>
                <MenuItem disableRipple onClick={() => editModal.open(submission)}>
                  <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faEdit} />
                  {t("buttons.edit")}
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
                    {t("buttons.delete")}
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

      <CustomModal modalHook={deleteModal} options={{ title: t("delete_modal.title") }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {t("delete_modal.description")}
        </Typography>
      </CustomModal>
    </>
  );
}

export function FullChallengeDisplay({ challenge, ...props }) {
  return (
    <Grid container columnSpacing={1} rowSpacing={1} {...props}>
      <Grid item xs={12} sm={12} display="flex" flexDirection="column" rowGap={1}>
        <ChallengeInfoBoxes challenge={challenge} />
      </Grid>
    </Grid>
  );
}

export function SubmissionDetailsDisplay({ submission, challenge = null, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "submission.details" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_a } = useTranslation();
  const verifier = getSubmissionVerifier(submission);
  challenge = challenge ?? submission.challenge;
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
          {challenge === null ? t("new_challenge") : t_g("map", { count: 1 })}
        </Typography>
        {challenge !== null ? (
          <ChallengeInfoBoxes challenge={challenge} />
        ) : (
          <>
            <InfoBox>
              <InfoBoxIconTextLine
                icon={<FontAwesomeIcon icon={faExternalLink} />}
                text={t_a("forms.create_full_challenge.campaign.url")}
              />
              <InfoBoxIconTextLine
                text={<StyledExternalLink href={newChallenge.url}>{newChallenge.url}</StyledExternalLink>}
                isSecondary
              />
            </InfoBox>
            <InfoBox>
              <InfoBoxIconTextLine text={t_g("map", { count: 1 })} />
              <InfoBoxIconTextLine text={newChallenge.name} isSecondary />
            </InfoBox>
            <InfoBox>
              <InfoBoxIconTextLine text={t_g("description")} />
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
          {t_g("submission", { count: 1 })}
        </Typography>
        <InfoBox>
          <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faUser} />} text={t_g("player", { count: 1 })} />
          <InfoBoxIconTextLine text={<PlayerChip player={submission.player} size="small" />} isSecondary />
        </InfoBox>
        <InfoBox>
          <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faClock} />} text={t("submitted")} />
          <InfoBoxIconTextLine text={displayDate(submission.date_created)} isSecondary />
        </InfoBox>
        <InfoBox>
          <InfoBoxIconTextLine
            icon={<FontAwesomeIcon icon={faComment} />}
            text={t_a("forms.submission.player_notes")}
          />
          <InfoBoxIconTextLine text={submission.player_notes ?? "-"} isSecondary />
        </InfoBox>
        <InfoBox>
          <InfoBoxIconTextLine
            icon={<FontAwesomeIcon icon={faShield} />}
            text={t_a("components.difficulty_select.label")}
          />
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
          {t("verification")}
        </Typography>
        {submission.is_verified !== null ? (
          <>
            <InfoBox>
              <InfoBoxIconTextLine
                icon={<FontAwesomeIcon icon={faUser} />}
                text={t_a("forms.submission.verifier")}
              />
              <InfoBoxIconTextLine
                text={verifier.id ? <PlayerChip player={submission.verifier} size="small" /> : verifier.name}
                isSecondary
              />
            </InfoBox>
            <InfoBox>
              <InfoBoxIconTextLine
                text={<VerificationStatusChip isVerified={submission.is_verified} size="small" />}
              />
              <InfoBoxIconTextLine text={displayDate(submission.date_verified)} isSecondary />
            </InfoBox>
            <InfoBox>
              <InfoBoxIconTextLine
                icon={<FontAwesomeIcon icon={faComment} />}
                text={t_a("forms.submission.verifier_notes")}
              />
              <InfoBoxIconTextLine text={submission.verifier_notes ?? "-"} isSecondary />
            </InfoBox>
          </>
        ) : (
          <>
            <InfoBox>
              <InfoBoxIconTextLine text={t("status")} />
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

function ChallengeInfoBoxes({ challenge }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_a } = useTranslation();
  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);
  return (
    <>
      <InfoBox>
        <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faBook} />} text={t_g("campaign", { count: 1 })} />
        <InfoBoxIconTextLine text={campaign.name} isSecondary />
      </InfoBox>
      {map !== null ? (
        map.name === campaign.name ? null : (
          <InfoBox>
            <InfoBoxIconTextLine text={t_g("map", { count: 1 })} />
            <InfoBoxIconTextLine text={map.name} isSecondary />
          </InfoBox>
        )
      ) : (
        <InfoBox>
          <InfoBoxIconTextLine text={t_a("challenge.is_full_game")} />
          <InfoBoxIconTextLine text={<FontAwesomeIcon icon={faCheckCircle} color="green" />} isSecondary />
        </InfoBox>
      )}
      <InfoBox>
        <InfoBoxIconTextLine
          icon={<FontAwesomeIcon icon={faFlagCheckered} />}
          text={t_g("challenge", { count: 1 })}
        />
        <InfoBoxIconTextLine text={getChallengeNameShort(challenge)} isSecondary />
      </InfoBox>
      <InfoBox>
        <InfoBoxIconTextLine text={t_g("difficulty", { count: 1 })} />
        <InfoBoxIconTextLine text={<DifficultyChip difficulty={challenge.difficulty} />} isSecondary />
      </InfoBox>
    </>
  );
}
