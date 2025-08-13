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
  CustomIconButton,
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
  PlayerNotesIcon,
  ProofExternalLinkButton,
  SubmissionFcIcon,
  VerificationStatusChip,
  VerifierNotesIcon,
  getPlatformIcon,
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
  faCheck,
  faCheckCircle,
  faCircleExclamation,
  faClock,
  faComment,
  faEdit,
  faExclamationTriangle,
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
import {
  getQueryData,
  useGetChallenge,
  useGetMap,
  usePostChallenge,
  usePostMap,
  usePostSubmission,
} from "../hooks/useApi";
import { Changelog } from "../components/Changelog";
import { SuggestedDifficultyChart, SuggestedDifficultyTierCounts } from "../components/Stats";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { useTranslation } from "react-i18next";
import { AuthorInfoBoxLine, MapNoProgressTooltip } from "./Campaign";
import { toast } from "react-toastify";
import { memo, useState } from "react";
import { jsonDateToJsDate } from "../util/util";
import { ToggleSubmissionFcButton } from "../components/ToggleSubmissionFc";
import { COLLECTIBLES, getCollectibleIcon, getCollectibleName } from "../components/forms/Map";
import { useTheme } from "@emotion/react";

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
          {auth.hasHelperPriv && (
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
        hideIfEmpty
      />

      <Divider sx={{ my: 2 }} />
      <Changelog type="challenge" id={id} />

      <CustomModal modalHook={editChallengeModal} options={{ hideFooter: true }}>
        <FormChallengeWrapper id={id} onSave={editChallengeModal.close} />
      </CustomModal>
    </>
  );
}

export function ChallengeDetailsListWrapper({ id }) {
  const query = useGetMap(id);
  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }
  const map = getQueryData(query);
  return <ChallengeDetailsList map={map} />;
}
export function ChallengeDetailsList({ map, challenge = null, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "challenge" });
  const { t: t_cib } = useTranslation(undefined, { keyPrefix: "campaign.info_boxes" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const campaign = challenge === null ? map.campaign : getChallengeCampaign(challenge);

  const lobbyInfo = getMapLobbyInfo(map);
  const hasLobbyInfo = lobbyInfo !== null && (lobbyInfo.major !== undefined || lobbyInfo.minor !== undefined);

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
                <InfoBoxIconTextLine
                  text={
                    <Stack direction="row" alignItems="center" gap={0.75}>
                      <span>{getMapName(map, campaign)}</span>
                      {!map.is_progress && <MapNoProgressTooltip />}
                    </Stack>
                  }
                  isSecondary
                />
              </InfoBox>
            )}
            {challenge === null && <CollectiblesInfoBox map={map} collectibles={map.collectibles} />}
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
              <InfoBoxIconTextLine
                text={
                  <Stack direction="row" alignItems="center" gap={1}>
                    <DifficultyChip difficulty={challenge.difficulty} />
                    {challenge.reject_note && !challenge.is_rejected && (
                      <TooltipLineBreaks title={challenge.reject_note}>
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                      </TooltipLineBreaks>
                    )}
                  </Stack>
                }
                isSecondary
              />
            </InfoBox>
          </>
        )}
        {<MapCampaignUrlInfoBox campaign={campaign} map={map} />}
        {mapHasAuthor && (
          <InfoBox>
            <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faUser} />} text={t_cib("author")} />
            <AuthorInfoBoxLine author_gb_id={map.author_gb_id} author_gb_name={map.author_gb_name} />
          </InfoBox>
        )}
        {challenge !== null && challenge.is_rejected && (
          <InfoBox>
            <InfoBoxIconTextLine text={t("status")} />
            <InfoBoxIconTextLine
              text={
                <Stack direction="row" alignItems="center" gap={1}>
                  <VerificationStatusChip isVerified={false} size="small" />
                  {challenge.reject_note}
                </Stack>
              }
              isSecondary
            />
          </InfoBox>
        )}
        {map !== null && challenge === null && <MapGoldenChangesBox map={map} />}
      </Grid>
    </Grid>
  );
}

export function MapCampaignUrlInfoBox({ campaign, map = null }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_cib } = useTranslation(undefined, { keyPrefix: "campaign.info_boxes" });

  const isCampaign = map === null;

  const getMapUrls = (campaign, map) => {
    if (campaign === null) throw new Error("Campaign is null");
    if (map === null) {
      if (campaign.url !== null) return [[campaign.url, ""]];
      return null;
    } else {
      if (map.url !== null) return map.url;
      if (campaign.url !== null) return [[campaign.url, ""]];
      return null;
    }
  };
  const mapUrls = getMapUrls(campaign, map);

  return (
    <InfoBox>
      <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faExternalLink} />} text={t_g("url")} />
      {mapUrls === null ? (
        <>
          <InfoBoxIconTextLine key={0} text={t_cib("no_download")} isSecondary />
        </>
      ) : (
        mapUrls.map((item, index) => (
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
        ))
      )}
      {isCampaign && (
        <>
          <InfoBoxIconTextLine />
          <InfoBoxIconTextLine
            text={
              <StyledLink to={"/campaign/" + campaign.id + "/top-golden-list"}>
                {t_cib("campaign_tgl")}
              </StyledLink>
            }
            isSecondary
          />
        </>
      )}
    </InfoBox>
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
export function CollectiblesInfoBox({ map, collectibles }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map.info_boxes" });
  const auth = useAuth();
  const { mutate: postMap } = usePostMap();

  const objectiveToCollectible = { 1: 0, 2: 1, 9: 5 };
  const objectiveId = map?.challenges.length > 0 ? map?.challenges[0].objective_id : null;
  const collectible = objectiveToCollectible[objectiveId];
  const addDefaultCollectible = () => {
    postMap({
      ...map,
      collectibles: [[collectible + "", "", "", "", ""]],
    });
  };

  return (
    <InfoBox>
      <InfoBoxIconTextLine text={t("collectibles")} icon={<FontAwesomeIcon icon={faBasketShopping} />} />
      {collectibles === null && <InfoBoxIconTextLine text={t("no_collectibles")} isSecondary />}
      {map && collectibles === null && auth.hasHelperPriv && (
        <InfoBoxIconTextLine
          text={
            <InfoBoxIconTextLine
              text={
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  onClick={addDefaultCollectible}
                  disabled={collectible === undefined}
                >
                  Add default collectible
                </Button>
              }
              isSecondary
              isMultiline
            />
          }
          isSecondary
        />
      )}
      {collectibles &&
        collectibles.map((item, index) => {
          const collectible = COLLECTIBLES.find((c) => c.value === item[0]);
          if (!collectible) return null;
          let collectibleNote = item[2] ? item[2] : null;
          if (item[4]) {
            const append = t("meaningful_collectibles", { count: item[4] });
            collectibleNote = collectibleNote ? collectibleNote + "\n" + append : append;
          }
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
                    {getCollectibleName(item[0], item[1]) + " x" + (item[3] ? item[3] : "1")}
                  </Typography>
                  {collectibleNote && (
                    <TooltipLineBreaks title={collectibleNote}>
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
function MapGoldenChangesBox({ map }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map.info_boxes.golden_changes" });
  const { settings } = useAppSettings();
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const { mutate: postMap } = usePostMap();

  const setNoChanges = () => {
    postMap({
      ...map,
      golden_changes: null,
    });
  };

  const showChanges = open || settings.general.alwaysShowGoldenChanges;

  return (
    <InfoBox>
      <InfoBoxIconTextLine text={t("label")} />
      {showChanges ? (
        <InfoBoxIconTextLine text={map.golden_changes ?? t("no_changes")} isSecondary isMultiline />
      ) : (
        <InfoBoxIconTextLine
          text={
            <Button variant="outlined" size="small" onClick={() => setOpen(true)}>
              {t("show")}
            </Button>
          }
          isSecondary
          isMultiline
        />
      )}
      {auth.hasHelperPriv && map.golden_changes === "Unknown" && (
        <InfoBoxIconTextLine
          text={
            <Button variant="outlined" color="warning" size="small" onClick={setNoChanges}>
              Set to "No changes"
            </Button>
          }
          isSecondary
          isMultiline
        />
      )}
    </InfoBox>
  );
}

export function ChallengeSubmissionTable({ challenge, compact = false, onlyShowFirstFew = false, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "challenge.submission_table" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_fs } = useTranslation(undefined, { keyPrefix: "forms.submission" });
  const auth = useAuth();

  const [showAll, setShowAll] = useState(false);

  const allSubmissionsLength = challenge.submissions.length;
  const showsTooMany = allSubmissionsLength > 20;
  const submissions =
    showsTooMany && !showAll && onlyShowFirstFew ? challenge.submissions.slice(0, 15) : challenge.submissions;

  return (
    <TableContainer component={Paper} {...props}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell width={1} sx={displayNoneOnMobile}></TableCell>
            <TableCell width={compact ? 1 : undefined} sx={{ pl: 1.5, pr: 0.5 }}>
              {t_g("player", { count: 1 })}
            </TableCell>
            {!compact && auth.hasHelperPriv && (
              <TableCell width={1} sx={{ ...displayNoneOnMobile, px: 0 }}></TableCell>
            )}
            {!compact && (
              <TableCell width={1} align="center" sx={{ pl: 1.5, pr: 0.5 }}>
                <Tooltip arrow placement="top" title={t_fs("verifier_notes")}>
                  <FontAwesomeIcon icon={faCircleExclamation} />
                </Tooltip>
              </TableCell>
            )}
            {!compact && (
              <TableCell width={1} align="center" sx={{ pl: 1.5, pr: 0.5 }}>
                <Tooltip arrow placement="top" title={t_fs("player_notes")}>
                  <FontAwesomeIcon icon={faComment} />
                </Tooltip>
              </TableCell>
            )}
            {!compact && (
              <TableCell width={1} align="center" sx={{ pl: 1.5, pr: 0.5, ...displayNoneOnMobile }}>
                <FontAwesomeIcon icon={faClock} />
              </TableCell>
            )}
            <TableCell width={1} align="center" sx={{ pl: 0.75, pr: 0.25 }}>
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
                  pl: 1.5,
                  pr: 1,
                }}
              >
                {t("suggestion")}
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((submission, index) => (
            <MemoChallengeSubmissionRow
              key={submission.id}
              submission={submission}
              index={index}
              compact={compact}
            />
          ))}
          {showsTooMany && onlyShowFirstFew && (
            <TableRow>
              <TableCell colSpan={99}>
                <Button variant="outlined" fullWidth onClick={() => setShowAll(!showAll)}>
                  {showAll ? t("show_less") : t("show_all", { count: allSubmissionsLength })}
                </Button>
              </TableCell>
            </TableRow>
          )}
          {allSubmissionsLength.length === 0 && (
            <TableRow>
              <TableCell colSpan={99}>{t("empty")}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function ChallengeSubmissionRow({ submission, index, compact }) {
  const auth = useAuth();
  const { settings } = useAppSettings();
  const theme = useTheme();
  const nameStyle = getPlayerNameColorStyle(submission.player, settings);
  const linkStyle = {
    display: "block",
    textDecoration: "none",
    color: "inherit",
    padding: "5px 4px 5px 12px",
  };

  return (
    <TableRow
      sx={{
        "&:hover": { backgroundColor: theme.palette.background.lightShade, cursor: "pointer" },
        transition: "0.1s background",
      }}
    >
      <TableCell width={1} sx={{ pr: 0, ...displayNoneOnMobile, p: 0 }}>
        <Link to={"/submission/" + submission.id} style={linkStyle}>
          #{index + 1}
        </Link>
      </TableCell>
      <TableCell width={compact ? 1 : undefined} sx={{ p: 0 }}>
        <Link to={"/submission/" + submission.id} style={linkStyle}>
          <Stack direction="row" gap={1} alignItems="center">
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
        </Link>
      </TableCell>
      {!compact && auth.hasHelperPriv && (
        <TableCell width={1} align="center" sx={{ ...displayNoneOnMobile, p: 0 }}>
          <ToggleSubmissionFcButton submission={submission} />
        </TableCell>
      )}
      {!compact && (
        <TableCell width={1} align="center" sx={{ p: 0 }}>
          <Link
            to={"/submission/" + submission.id}
            style={{ ...linkStyle, height: "34px", display: "flex", alignItems: "center" }}
          >
            {submission.verifier_notes && <VerifierNotesIcon notes={submission.verifier_notes} />}
          </Link>
        </TableCell>
      )}
      {!compact && (
        <TableCell width={1} align="center" sx={{ p: 0 }}>
          <Link
            to={"/submission/" + submission.id}
            style={{ ...linkStyle, height: "34px", display: "flex", alignItems: "center" }}
          >
            {submission.player_notes && <PlayerNotesIcon notes={submission.player_notes} />}
          </Link>
        </TableCell>
      )}
      {!compact && (
        <TableCell width={1} align="center" sx={{ p: 0, ...displayNoneOnMobile }}>
          <Link to={"/submission/" + submission.id} style={linkStyle}>
            {submission.date_achieved &&
              jsonDateToJsDate(submission.date_achieved).toLocaleDateString(navigator.language, {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
              })}
          </Link>
        </TableCell>
      )}
      <TableCell width={1} align="center" sx={{ pl: 0.75, pr: 0.25 }}>
        <ProofExternalLinkButton url={submission.proof_url} />
      </TableCell>
      {compact ? null : (
        <TableCell width={1} align="center" sx={{ p: 0 }}>
          <Link to={"/submission/" + submission.id} style={linkStyle}>
            <DifficultyChip
              difficulty={submission.suggested_difficulty}
              isPersonal={submission.is_personal}
              frac={submission.frac ?? 50}
            />
          </Link>
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
