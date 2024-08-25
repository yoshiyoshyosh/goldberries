import {
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  InfoBox,
  InfoBoxIconTextLine,
  LoadingSpinner,
  StyledExternalLink,
  StyledLink,
  TooltipLineBreaks,
} from "../components/BasicComponents";
import {
  ChallengeFcIcon,
  DifficultyChip,
  GamebananaEmbed,
  ObjectiveIcon,
  OtherIcon,
  SubmissionFcIcon,
} from "../components/GoldberriesComponents";
import {
  getChallengeCampaign,
  getChallengeNameShort,
  getChallengeSuffix,
  getMapLobbyInfo,
  getMapName,
  getPlayerNameColorStyle,
} from "../util/data_util";
import { GoldberriesBreadcrumbs } from "../components/Breadcrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBasketShopping,
  faBook,
  faCheckCircle,
  faCircleExclamation,
  faClock,
  faComment,
  faEdit,
  faExternalLink,
  faExternalLinkAlt,
  faFlagCheckered,
  faInfoCircle,
  faPlus,
  faToggleOff,
  faToggleOn,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import { CustomModal, useModal } from "../hooks/useModal";
import { useAuth } from "../hooks/AuthProvider";
import { FormChallengeWrapper } from "../components/forms/Challenge";
import { getQueryData, useGetChallenge, usePostSubmission } from "../hooks/useApi";
import { Changelog } from "../components/Changelog";
import { SuggestedDifficultyChart, SuggestedDifficultyTierCounts } from "../components/Stats";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { useTranslation } from "react-i18next";
import { AuthorInfoBoxLine } from "./Campaign";
import { toast } from "react-toastify";
import { memo } from "react";
import { jsonDateToJsDate } from "../util/util";
import { ToggleSubmissionFcButton } from "../components/ToggleSubmissionFc";
import { COLLECTIBLES, getCollectibleIcon, getCollectibleName } from "../components/forms/Map";

const displayNoneOnMobile = {
  display: {
    xs: "none",
    sm: "table-cell",
  },
};

export function PageChallenge({}) {
  const { id } = useParams();

  return (
    <BasicContainerBox maxWidth="md">
      <ChallengeDisplay id={parseInt(id)} />
    </BasicContainerBox>
  );
}

export function ChallengeDisplay({ id }) {
  const { t } = useTranslation(undefined, { keyPrefix: "challenge" });
  const auth = useAuth();
  const query = useGetChallenge(id);

  const editChallengeModal = useModal();

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const challenge = getQueryData(query);
  const map = challenge.map;
  const campaign = getChallengeCampaign(challenge);
  const title = (map?.name ?? campaign.name) + " - " + getChallengeNameShort(challenge);

  return (
    <>
      <HeadTitle title={title} />
      <GoldberriesBreadcrumbs campaign={campaign} map={map} challenge={challenge} />
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 1.5 }}>
        <GamebananaEmbed campaign={campaign} size="large" />
      </Stack>
      {auth.hasPlayerClaimed && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
          <Link to={"/submit/single-challenge/" + id}>
            <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />} sx={{ mt: 0, mb: 0 }}>
              {t("buttons.submit")}
            </Button>
          </Link>
          {auth.hasVerifierPriv && (
            <Button
              onClick={editChallengeModal.open}
              variant="outlined"
              sx={{ mr: 1, mt: 0 }}
              startIcon={<FontAwesomeIcon icon={faEdit} />}
            >
              {t("buttons.edit")}
            </Button>
          )}
        </Stack>
      )}
      <ChallengeDetailsList map={challenge.map} challenge={challenge} sx={{ mb: 1, mt: 0.5 }} />
      {challenge.description && (
        <NoteDisclaimer title={t("description")} note={challenge.description} sx={{ mb: 2 }} />
      )}
      <ChallengeSubmissionTable challenge={challenge} />

      <Divider sx={{ my: 2 }}>
        <Chip label={t("difficulty_suggestions")} size="small" />
      </Divider>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <SuggestedDifficultyChart challenge={challenge} />
      </div>
      <SuggestedDifficultyTierCounts
        challenge={challenge}
        sx={{
          mt: 2,
        }}
      />

      <Divider sx={{ my: 2 }} />
      <Changelog type="challenge" id={id} />

      <CustomModal modalHook={editChallengeModal} options={{ hideFooter: true }}>
        <FormChallengeWrapper id={id} onSave={editChallengeModal.close} />
      </CustomModal>
    </>
  );
}

export function ChallengeDetailsList({ map, challenge = null, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "challenge" });
  const { t: t_cib } = useTranslation(undefined, { keyPrefix: "campaign.info_boxes" });
  const { t: t_mib } = useTranslation(undefined, { keyPrefix: "map.info_boxes" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { settings } = useAppSettings();
  const campaign = challenge === null ? map.campaign : getChallengeCampaign(challenge);

  const lobbyInfo = getMapLobbyInfo(map);
  const hasLobbyInfo = lobbyInfo !== null && (lobbyInfo.major !== undefined || lobbyInfo.minor !== undefined);

  const mapUrls =
    map !== null
      ? map.url !== null
        ? map.url
        : [[map.campaign.url, ""]]
      : campaign !== null
      ? [[campaign.url, ""]]
      : null;
  const mapHasAuthor = map !== null && map.author_gb_name !== null;

  return (
    <Grid container columnSpacing={1} rowSpacing={1} {...props}>
      <Grid item xs={12} sm={6} display="flex" flexDirection="column" rowGap={1}>
        <InfoBox>
          <InfoBoxIconTextLine
            icon={<FontAwesomeIcon icon={faBook} />}
            text={t_g("campaign", { count: 1 })}
          />
          <InfoBoxIconTextLine text={campaign.name} isSecondary />
        </InfoBox>
        {map !== null ? (
          <>
            {getMapName(map, campaign) === campaign.name ? null : (
              <InfoBox>
                <InfoBoxIconTextLine text={t_g("map", { count: 1 })} />
                <InfoBoxIconTextLine text={getMapName(map, campaign)} isSecondary />
              </InfoBox>
            )}
            {map.collectibles !== null && challenge === null && (
              <CollectiblesInfoBox collectibles={map.collectibles} />
            )}
          </>
        ) : (
          <InfoBox>
            <InfoBoxIconTextLine text={t("is_full_game")} />
            <InfoBoxIconTextLine text={<FontAwesomeIcon icon={faCheckCircle} color="green" />} isSecondary />
          </InfoBox>
        )}
        {challenge !== null && (
          <InfoBox>
            <InfoBoxIconTextLine
              icon={<FontAwesomeIcon icon={faFlagCheckered} />}
              text={t_g("challenge", { count: 1 })}
            />
            <InfoBoxIconTextLine
              text={
                <Stack direction="row" alignItems="center" gap={0.5}>
                  {challenge.objective.name}{" "}
                  <ObjectiveIcon objective={challenge.objective} challenge={challenge} />
                  <ChallengeFcIcon challenge={challenge} />
                </Stack>
              }
              isSecondary
            />
            {getChallengeSuffix(challenge, true) !== null && (
              <InfoBoxIconTextLine text={"[" + getChallengeSuffix(challenge, true) + "]"} isSecondary />
            )}
          </InfoBox>
        )}
      </Grid>
      <Grid item xs={12} sm={6} display="flex" flexDirection="column" rowGap={1}>
        {hasLobbyInfo && (
          <InfoBox>
            <InfoBoxIconTextLine text={t("lobby_info")} />
            <InfoBoxIconTextLine text={<LobbyInfoSpan lobbyInfo={lobbyInfo} />} isSecondary />
          </InfoBox>
        )}
        {challenge !== null && (
          <>
            <InfoBox>
              <InfoBoxIconTextLine text={t_g("difficulty", { count: 1 })} />
              <InfoBoxIconTextLine text={<DifficultyChip difficulty={challenge.difficulty} />} isSecondary />
            </InfoBox>
            {/* {challenge.description !== null && (
              <InfoBox>
                <InfoBoxIconTextLine text={t_g("description")} icon={<FontAwesomeIcon icon={faComment} />} />
                <InfoBoxIconTextLine text={challenge.description} isSecondary />
              </InfoBox>
            )} */}
          </>
        )}
        <InfoBox>
          <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faExternalLink} />} text={t_g("url")} />
          {mapUrls.map((item, index) => (
            <>
              <InfoBoxIconTextLine
                key={index + "-1"}
                text={<StyledExternalLink href={item[0]}>{item[0]}</StyledExternalLink>}
                isSecondary
              />
              <InfoBoxIconTextLine
                key={index + "-2"}
                text={
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {item[1]}
                  </Typography>
                }
                isSecondary
              />
            </>
          ))}
        </InfoBox>
        {mapHasAuthor && (
          <InfoBox>
            <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faUser} />} text={t_cib("author")} />
            <AuthorInfoBoxLine author_gb_id={map.author_gb_id} author_gb_name={map.author_gb_name} />
          </InfoBox>
        )}
        {map !== null && challenge === null && map.golden_changes && !settings.general.hideGoldenChanges && (
          <InfoBox>
            <InfoBoxIconTextLine text={t_mib("golden_changes")} />
            <InfoBoxIconTextLine text={map.golden_changes} isSecondary isMultiline />
          </InfoBox>
        )}
      </Grid>
    </Grid>
  );
}

function LobbyInfoSpan({ lobbyInfo }) {
  const textShadow =
    "black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px";
  return (
    <Stack direction="row" alignItems="center" gap={0.5}>
      {lobbyInfo.major && (
        <Typography variant="body1" color={lobbyInfo.major.color} sx={{ textShadow: textShadow }}>
          {lobbyInfo.major.label}
        </Typography>
      )}
      {lobbyInfo.major && lobbyInfo.minor && <FontAwesomeIcon icon={faArrowRight} />}
      {lobbyInfo.minor && (
        <Typography variant="body1" color={lobbyInfo.minor.color} sx={{ textShadow: textShadow }}>
          {lobbyInfo.minor.label}
        </Typography>
      )}
    </Stack>
  );
}
function CollectiblesInfoBox({ collectibles }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map.info_boxes" });
  return (
    <InfoBox>
      <InfoBoxIconTextLine text={t("collectibles")} icon={<FontAwesomeIcon icon={faBasketShopping} />} />
      {collectibles.map((item, index) => {
        const collectible = COLLECTIBLES.find((c) => c.value === item[0]);
        if (!collectible) return null;
        return (
          <InfoBoxIconTextLine
            key={collectibles.value}
            text={
              <Stack direction="row" gap={1} alignItems="center">
                <Stack
                  direction="row"
                  gap={1}
                  alignItems="center"
                  justifyContent="space-around"
                  sx={{ minWidth: "30px" }}
                >
                  <OtherIcon url={getCollectibleIcon(item[0], item[1])} />
                </Stack>
                <Typography variant="body1">
                  {getCollectibleName(item[0], item[1]) + " x" + (item[2] ? item[2] : "1")}
                </Typography>
                {item[3] && (
                  <TooltipLineBreaks title={item[3]}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </TooltipLineBreaks>
                )}
              </Stack>
            }
            isSecondary
          />
        );
      })}
    </InfoBox>
  );
}

export function ChallengeSubmissionTable({
  challenge,
  compact = false,
  hideSubmissionIcon = false,
  ...props
}) {
  const auth = useAuth();
  const { t } = useTranslation(undefined, { keyPrefix: "challenge.submission_table" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_fs } = useTranslation(undefined, { keyPrefix: "forms.submission" });
  return (
    <TableContainer component={Paper} {...props}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell width={1} sx={displayNoneOnMobile}></TableCell>
            <TableCell width={compact ? 1 : undefined}>{t_g("player", { count: 1 })}</TableCell>
            {!compact && auth.hasVerifierPriv && (
              <TableCell width={1} sx={{ ...displayNoneOnMobile, px: 0 }}></TableCell>
            )}
            {!compact && (
              <TableCell width={1} align="center">
                <Tooltip arrow placement="top" title={t_fs("verifier_notes")}>
                  <FontAwesomeIcon icon={faCircleExclamation} />
                </Tooltip>
              </TableCell>
            )}
            {!compact && (
              <TableCell width={1} align="center">
                <Tooltip arrow placement="top" title={t_fs("player_notes")}>
                  <FontAwesomeIcon icon={faComment} />
                </Tooltip>
              </TableCell>
            )}
            {!compact && (
              <TableCell width={1} align="center" sx={displayNoneOnMobile}>
                <FontAwesomeIcon icon={faClock} />
              </TableCell>
            )}
            <TableCell width={1} align="center" sx={displayNoneOnMobile}>
              <FontAwesomeIcon icon={faYoutube} />
            </TableCell>
            {!compact && (
              <TableCell
                width={1}
                align="center"
                sx={{
                  whiteSpace: {
                    xs: "normal",
                    sm: "nowrap",
                  },
                }}
              >
                {t("suggestion")}
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {challenge.submissions.map((submission, index) => (
            <MemoChallengeSubmissionRow
              key={submission.id}
              submission={submission}
              index={index}
              compact={compact}
              hideSubmissionIcon={hideSubmissionIcon}
            />
          ))}
          {challenge.submissions.length === 0 && (
            <TableRow>
              <TableCell colSpan={99}>{t("empty")}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function ChallengeSubmissionRow({ submission, index, compact, hideSubmissionIcon }) {
  const auth = useAuth();
  const { settings } = useAppSettings();
  const nameStyle = getPlayerNameColorStyle(submission.player, settings);

  return (
    <TableRow>
      <TableCell width={1} sx={{ pr: 0, ...displayNoneOnMobile }}>
        #{index + 1}
      </TableCell>
      <TableCell width={compact ? 1 : undefined}>
        <Stack direction="row" gap={1} alignItems="center">
          {!hideSubmissionIcon && (
            <StyledLink to={"/submission/" + submission.id}>
              <FontAwesomeIcon icon={faBook} />
            </StyledLink>
          )}
          <StyledLink
            to={"/player/" + submission.player.id}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "150px",
              overflow: "hidden",
              ...nameStyle,
            }}
          >
            {submission.player.name}
          </StyledLink>
          <SubmissionFcIcon submission={submission} height="1.3em" />
        </Stack>
      </TableCell>
      {!compact && auth.hasVerifierPriv && (
        <TableCell width={1} align="center" sx={{ ...displayNoneOnMobile, px: 0 }}>
          <ToggleSubmissionFcButton submission={submission} />
        </TableCell>
      )}
      {!compact && (
        <TableCell width={1} align="center">
          {submission.verifier_notes && (
            <TooltipLineBreaks title={submission.verifier_notes}>
              <FontAwesomeIcon icon={faCircleExclamation} />
            </TooltipLineBreaks>
          )}
        </TableCell>
      )}
      {!compact && (
        <TableCell width={1} align="center">
          {submission.player_notes && (
            <TooltipLineBreaks title={submission.player_notes}>
              <FontAwesomeIcon icon={faComment} />
            </TooltipLineBreaks>
          )}
        </TableCell>
      )}
      {!compact && (
        <TableCell width={1} align="center" sx={displayNoneOnMobile}>
          {submission.date_created &&
            jsonDateToJsDate(submission.date_created).toLocaleDateString(navigator.language, {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
            })}
        </TableCell>
      )}
      <TableCell width={1} align="center" sx={displayNoneOnMobile}>
        <StyledLink to={submission.proof_url} target="_blank">
          <FontAwesomeIcon icon={faExternalLinkAlt} />
        </StyledLink>
      </TableCell>
      {compact ? null : (
        <TableCell width={1} align="center">
          <DifficultyChip difficulty={submission.suggested_difficulty} isPersonal={submission.is_personal} />
        </TableCell>
      )}
    </TableRow>
  );
}
const MemoChallengeSubmissionRow = memo(ChallengeSubmissionRow);

export function NoteDisclaimer({ title, note, sx = {} }) {
  return (
    <Stack direction="column" gap={1} sx={sx}>
      <Stack direction="row" gap={1} alignItems="center">
        <FontAwesomeIcon icon={faInfoCircle} />
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="body2">{note}</Typography>
    </Stack>
  );
}
