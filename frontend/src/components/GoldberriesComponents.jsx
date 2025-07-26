import { useQuery } from "react-query";
import { fetchAllObjectives, fetchAllPlayers, fetchPlayerList } from "../util/api";
import { toast } from "react-toastify";
import {
  getCampaignName,
  getChallengeFcLong,
  getChallengeFcShort,
  getChallengeIcon,
  getChallengeName,
  getChallengeNameClean,
  getDifficultyName,
  getGamebananaEmbedUrl,
  getObjectiveName,
  getPlayerNameColorStyle,
} from "../util/data_util";
import { Autocomplete, Chip, Divider, Grid, MenuItem, Stack, TextField, Tooltip } from "@mui/material";
import {
  API_BASE_URL,
  DIFF_CONSTS,
  getNewDifficultyColors,
  getOldDifficultyLabelColor,
  getOldDifficultyName,
} from "../util/constants";
import { memo, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowRight,
  faArrowUp,
  faBan,
  faBook,
  faChildCombatant,
  faCircleExclamation,
  faComment,
  faExternalLinkAlt,
  faGamepad,
  faHammer,
  faHand,
  faHeartPulse,
  faHourglass,
  faInfoCircle,
  faKeyboard,
  faLink,
  faNewspaper,
  faPersonDrowning,
  faQuestionCircle,
  faShield,
  faShieldHeart,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import {
  faDiscord,
  faTwitch,
  faYoutube,
  faSteam,
  faXTwitter,
  faGithub,
  faInstagram,
  faReddit,
  faBilibili,
} from "@fortawesome/free-brands-svg-icons";
import { useTheme } from "@emotion/react";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import {
  getQueryData,
  useGetAllCampaigns,
  useGetAllChallengesInCampaign,
  useGetAllChallengesInMap,
  useGetAllDifficulties,
  useGetAllMapsInCampaign,
  useGetPlayerSubmissions,
} from "../hooks/useApi";
import { StyledExternalLink, StyledLink, TooltipLineBreaks } from "./BasicComponents";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { DateTimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import { isAdmin, isHelper, isNewsWriter, isVerifier } from "../hooks/AuthProvider";
import { useLocalStorage } from "@uidotdev/usehooks";

export function CampaignSelect({
  selected,
  setSelected,
  filter = null,
  disabled = false,
  empty = false,
  rejected = false,
}) {
  const { t } = useTranslation();
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const query = useGetAllCampaigns(empty, rejected);

  let rawCampaigns = getQueryData(query);
  let campaigns = rawCampaigns ?? [];
  if (filter !== null) {
    campaigns = campaigns.filter(filter);
  }
  campaigns.sort((a, b) => a.name.localeCompare(b.name));

  const getOptionLabel = (campaign) => {
    if (rawCampaigns === null) return t("general.loading");
    return getCampaignName(campaign, t_g);
  };

  return (
    <Autocomplete
      fullWidth
      disabled={disabled}
      getOptionKey={(campaign) => campaign.id}
      getOptionLabel={getOptionLabel}
      getOptionDisabled={(campaign) => rawCampaigns === null}
      options={campaigns.length === 0 ? [{ name: "test" }] : campaigns}
      value={selected}
      onChange={(event, newValue) => {
        setSelected(newValue);
      }}
      renderInput={(params) => <TextField {...params} label={t("general.campaign", { count: 1 })} />}
    />
  );
}

export function MapSelect({ campaign, selected, setSelected, disabled, ...props }) {
  const { t } = useTranslation();
  const query = useGetAllMapsInCampaign(campaign?.id);

  const maps = campaign ? getQueryData(query)?.maps ?? [] : [];

  const getOptionLabel = (map) => {
    const oldPrefix = map.is_archived ? "[Old] " : "";
    return oldPrefix + map.name;
  };

  return (
    <Autocomplete
      fullWidth
      disabled={disabled}
      getOptionKey={(map) => map.id}
      getOptionLabel={getOptionLabel}
      options={maps}
      value={selected}
      onChange={(event, newValue) => {
        setSelected(newValue);
      }}
      {...props}
      renderInput={(params) => <TextField {...params} label={t("general.map", { count: 1 })} />}
    />
  );
}

export function ChallengeSelect({ map, selected, setSelected, disabled, hideLabel = false }) {
  const { t } = useTranslation();
  const query = useGetAllChallengesInMap(map?.id);
  const challenges = getQueryData(query)?.challenges ?? [];

  const getOptionLabel = (challenge) => {
    return getChallengeName(challenge);
  };

  return (
    <Autocomplete
      fullWidth
      disabled={disabled}
      getOptionKey={(challenge) => challenge.id}
      getOptionLabel={getOptionLabel}
      options={challenges}
      disableListWrap
      value={selected}
      onChange={(event, newValue) => {
        setSelected(newValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label={hideLabel ? undefined : t("general.challenge", { count: 1 })} />
      )}
      renderOption={(props, challenge) => {
        return (
          <Stack direction="row" gap={1} {...props}>
            {getChallengeName(challenge)}
          </Stack>
        );
      }}
    />
  );
}
export function CampaignChallengeSelect({ campaign, selected, setSelected, disabled, hideLabel = false }) {
  const { t } = useTranslation();
  const query = useGetAllChallengesInCampaign(campaign?.id);
  const challenges = getQueryData(query)?.challenges ?? [];

  const getOptionLabel = (challenge) => {
    return getChallengeName(challenge);
  };

  return (
    <Autocomplete
      fullWidth
      disabled={disabled}
      getOptionKey={(challenge) => challenge.id}
      getOptionLabel={getOptionLabel}
      options={challenges}
      disableListWrap
      value={selected}
      onChange={(event, newValue) => {
        setSelected(newValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label={hideLabel ? undefined : t("general.challenge", { count: 1 })} />
      )}
      renderOption={(props, challenge) => {
        return (
          <Stack direction="row" gap={1} {...props}>
            {getChallengeName(challenge)}
          </Stack>
        );
      }}
    />
  );
}

export function PlayerSubmissionSelect({ playerId, submission, setSubmission, ...props }) {
  const { t } = useTranslation();
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const query = useGetPlayerSubmissions(playerId, true, true);

  let submissions = getQueryData(query) ?? [];

  const getOptionLabel = (submission) => {
    return getChallengeNameClean(submission.challenge, t_g);
  };

  return (
    <Autocomplete
      fullWidth
      getOptionKey={(submission) => submission.id}
      getOptionLabel={getOptionLabel}
      options={submissions}
      value={submission}
      onChange={(event, newValue) => {
        setSubmission(newValue);
      }}
      renderInput={(params) => <TextField {...params} label={t("general.submission", { count: 1 })} />}
      {...props}
    />
  );
}

const SUBTIER_ICONS = {
  high: { icon: "subtier-high.png", alt: "High", faIcon: faArrowUp, color: "black" },
  mid: { icon: "subtier-mid.png", alt: "Mid", faIcon: faArrowRight, color: "black" },
  low: { icon: "subtier-low.png", alt: "Low", faIcon: faArrowDown, color: "black" },
};
export function SubtierIcon({ subtier, height = "1em" }) {
  if (subtier === null) return null;
  const entry = SUBTIER_ICONS[subtier];

  if (true) {
    return <FontAwesomeIcon icon={entry.faIcon} style={{ height: height }} />;
  }

  return (
    <img
      src={"/icons/" + entry.icon}
      alt={entry.alt}
      style={{
        height: height,
      }}
    />
  );
}
export function DifficultyChip({
  difficulty,
  frac = null,
  prefix = "",
  useDarkening = false,
  isPersonal = false,
  highlightPersonal = false,
  sx = {},
  ...props
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.difficulty_chip" });
  const { settings } = useAppSettings();
  const theme = useTheme();
  if (difficulty === null) return null;

  const text = getDifficultyName(difficulty);
  let suffix = "";
  if (frac !== null && settings.general.showFractionalTiers) {
    if (frac < 10) {
      suffix = ".0" + frac;
    } else {
      suffix = "." + frac;
    }
  }
  const colors = getNewDifficultyColors(settings, difficulty?.id, useDarkening);

  const showOld =
    settings.general.showOldTierNames &&
    difficulty.id !== DIFF_CONSTS.TRIVIAL_ID &&
    difficulty.id !== DIFF_CONSTS.UNTIERED_ID &&
    false;
  const isTrivial = difficulty.id === DIFF_CONSTS.TRIVIAL_ID;

  const bgColor = colors.color;
  const opacity = isPersonal && !highlightPersonal ? 0.25 : 1;
  const boxShadow =
    isPersonal && highlightPersonal
      ? "0px 0px 3px red, 0px 0px 3px red, 0px 0px 3px red, 0px 0px 3px red, 0px 0px 3px red"
      : "none";

  const chip = (
    <Chip
      label={
        <Stack direction="column" gap={0} sx={{ lineHeight: "11px" }} alignItems="center">
          <Stack direction="row" gap={1} alignItems="center">
            <span>{prefix + text + suffix}</span>
            {isTrivial && (
              <Tooltip title={t("trivial_explanation")} arrow>
                <FontAwesomeIcon icon={faInfoCircle} />
              </Tooltip>
            )}
          </Stack>
          {showOld && (
            <span
              style={{
                // color: getOldDifficultyLabelColor(difficulty.id),
                color: colors.muted_contrast_color,
                fontSize: "0.8em",
              }}
            >
              ({getOldDifficultyName(difficulty.id)})
            </span>
          )}
        </Stack>
      }
      size="small"
      {...props}
      sx={{
        bgcolor: bgColor,
        color: colors.contrast_color,
        opacity: opacity,
        boxShadow: boxShadow,
        ...sx,
      }}
    />
  );

  if (isPersonal) {
    return (
      <Tooltip title={t("personal_tooltip")} placement="top" arrow>
        {chip}
      </Tooltip>
    );
  }

  return chip;
}
export function DifficultyValueChip({
  difficulty,
  value,
  prefix = "",
  suffix = "",
  useDarkening = false,
  sx = {},
  ...props
}) {
  const { settings } = useAppSettings();
  if (difficulty === null) return null;

  const text = getDifficultyName(difficulty);
  const colors = getNewDifficultyColors(settings, difficulty?.id, useDarkening);
  return (
    <Grid container columnSpacing={0.75}>
      <Grid item xs>
        <Chip
          label={prefix + text + suffix}
          size="small"
          {...props}
          sx={{
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            bgcolor: colors.color,
            color: colors.contrast_color,
            ...sx,
          }}
        />
      </Grid>
      <Grid item xs="auto" minWidth="50px">
        <Chip
          label={value}
          size="small"
          {...props}
          sx={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            bgcolor: colors.color,
            color: colors.contrast_color,
            ...sx,
          }}
        />
      </Grid>
    </Grid>
  );
}

export function DifficultySelectControlled({
  difficultyId,
  setDifficultyId,
  setDifficulty,
  isSuggestion = false,
  minSort = null,
  maxSort = null,
  label,
  ...props
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.difficulty_select" });
  const { settings } = useAppSettings();

  const query = useGetAllDifficulties();

  const showOldTierNames = settings.general.showOldTierNames && false;
  const getOldName = (id) => {
    if (showOldTierNames) {
      return " (" + getOldDifficultyName(id) + ")";
    }
    return "";
  };

  const onChangeDifficulty = (id) => {
    console.log("onChangeDifficulty", id);
    const difficulty = getQueryData(query).find((d) => d.id === id);
    if (!difficulty) {
      if (setDifficulty) setDifficulty(null);
      if (setDifficultyId) setDifficultyId(null);
    } else {
      if (setDifficulty) setDifficulty(difficulty);
      if (setDifficultyId) setDifficultyId(id);
    }
  };

  let difficulties = getQueryData(query) ?? [{ id: difficultyId }];
  difficulties = JSON.parse(JSON.stringify(difficulties));
  if (isSuggestion) {
    difficulties = difficulties.filter(
      (d) => d.id !== DIFF_CONSTS.TRIVIAL_ID && d.id !== DIFF_CONSTS.UNTIERED_ID
    );
  }
  if (minSort !== null) {
    difficulties = difficulties.filter((d) => d.sort >= minSort);
  }
  if (maxSort !== null) {
    difficulties = difficulties.filter((d) => d.sort <= maxSort);
  }
  //Add "No Selection" option at the start with id = 0
  difficulties.unshift({ id: 0 });

  const selectedDifficulty = difficulties.find((d) => d.id === difficultyId);

  return (
    <Autocomplete
      {...props}
      options={difficulties}
      getOptionLabel={(difficulty) => (difficulty.id === 0 ? "" : getDifficultyName(difficulty))}
      isOptionEqualToValue={(option, value) => {
        if (option?.id && value?.id) return option.id === value.id;
        return false;
      }}
      value={selectedDifficulty}
      onChange={(e, v) => onChangeDifficulty(v?.id)}
      noOptionsText={t("no_options")}
      loading={query.isLoading}
      loadingText={"Loading"}
      renderInput={(params) => (
        <TextField {...params} label={label ?? t(isSuggestion ? "label" : "label_no_opinion")} />
      )}
      renderOption={(props, difficulty) => {
        if (difficulty.id === 0) {
          return (
            <Stack direction="row" gap={1} {...props}>
              <em>{t(isSuggestion ? "no_suggestion" : "no_selection")}</em>
            </Stack>
          );
        }
        return (
          <Stack direction="row" gap={1} {...props}>
            <span>{getDifficultyName(difficulty)}</span>
            <span style={{ fontSize: "0.7em" }}>{getOldName(difficulty.id)}</span>
          </Stack>
        );
      }}
    />
  );

  // return (
  //   <TextField
  //     {...props}
  //     select
  //     value={difficultyId ?? ""}
  //     onChange={(e) => onChangeDifficulty(e.target.value === "" ? null : e.target.value)}
  //     SelectProps={{
  //       ...props.SelectProps,
  //       MenuProps: { disableScrollLock: true },
  //     }}
  //   >
  //     {difficulties.length !== 0 && (
  //       <MenuItem value="">
  //         <em>{t(isSuggestion ? "no_suggestion" : "no_selection")}</em>
  //       </MenuItem>
  //     )}
  //     {difficulties.map((difficulty) => (
  //       <MenuItem key={difficulty.id} value={difficulty.id}>
  //         <Stack direction="row" gap={1} alignItems="center">
  //           <span>{getDifficultyName(difficulty)}</span>
  //           <span style={{ fontSize: "0.7em" }}>{getOldName(difficulty.id)}</span>
  //         </Stack>
  //       </MenuItem>
  //     ))}
  //     {difficulties.length === 0 && (
  //       <MenuItem disabled>
  //         <em>Loading...</em>
  //       </MenuItem>
  //     )}
  //   </TextField>
  // );
}

export function ObjectiveSelect({ objectiveId, setObjectiveId, ...props }) {
  const { t } = useTranslation();
  const query = useQuery({
    queryKey: ["all_objectives"],
    queryFn: () => fetchAllObjectives(),
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const objectives = query.data?.data ?? [];
  objectives.sort((a, b) => a.id - b.id);

  return (
    <TextField
      {...props}
      label={t("general.objective", { count: 1 })}
      select
      value={objectiveId ?? 1}
      onChange={(e) => setObjectiveId(e.target.value)}
      SelectProps={{
        ...props.SelectProps,
        MenuProps: { disableScrollLock: true },
      }}
    >
      {objectives.map((objective) => (
        <MenuItem key={objective.id} value={objective.id}>
          {getObjectiveName(objective)}
        </MenuItem>
      ))}
    </TextField>
  );
}

export function VerificationStatusChip({ isVerified, i18keySuffix = null, ...props }) {
  const key = "components.verification_status_chip" + (i18keySuffix ? "." + i18keySuffix : "");
  const { t } = useTranslation(undefined, { keyPrefix: key });
  const text = isVerified === null ? t("pending") : isVerified ? t("verified") : t("rejected");
  const color = isVerified === null ? "warning" : isVerified ? "success" : "error";
  return <Chip label={text} color={color} {...props} />;
}

// ===== Full Select Components =====
export function FullChallengeSelect({ challenge, setChallenge, disabled }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.full_challenge_select" });
  const [campaign, setCampaign] = useState(challenge?.map?.campaign ?? challenge?.campaign ?? null);
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
    } else if (challenge !== null && challenge.campaign !== null) {
      setCampaign(challenge.campaign);
      setMap(null);
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
      {campaign && map === null && campaign.challenges?.length > 0 && (
        <>
          <Divider>
            <Chip label={t("full_game_label")} size="small" />
          </Divider>
          <CampaignChallengeSelect campaign={campaign} selected={challenge} setSelected={setChallenge} />
        </>
      )}
    </Stack>
  );
}

// ===== Player Components =====
export function PlayerSelect({ type, value, onChange, label, ...props }) {
  const { t } = useTranslation();
  const queryFn = type === "all" ? fetchAllPlayers : () => fetchPlayerList(type);
  const query = useQuery({
    queryKey: ["player_list", type],
    queryFn: queryFn,
  });

  const players = getQueryData(query) ?? [];
  //Sort alphabetically
  players.sort((a, b) => a.name.localeCompare(b.name));

  const getOptionLabel = (player) => {
    return player?.name ?? "";
  };

  label = label ?? t("general.player", { count: 1 });

  return (
    <Autocomplete
      options={players}
      getOptionLabel={getOptionLabel}
      renderInput={(params) => <TextField {...params} label={label} variant="outlined" />}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

export function PlayerChip({ player, trimLongNames = false, ...props }) {
  const { settings } = useAppSettings();
  if (player === undefined || player === null) {
    return <Chip label="<not found>" sx={{ mr: 1 }} {...props} />;
  }

  const style = getPlayerNameColorStyle(player, settings);
  if (trimLongNames) {
    style.overflow = "hidden";
    style.maxWidth = "130px";
  }

  return (
    <Link to={"/player/" + player.id}>
      <Chip
        label={
          <Stack direction="row" alignItems="center" gap={1}>
            <span style={style}>{player.name}</span>
            {player.account.is_suspended ? (
              <SuspendedIcon reason={player.account.suspension_reason} />
            ) : (
              <AccountRoleIcon account={player.account} />
            )}
          </Stack>
        }
        {...props}
      />
    </Link>
  );
}
export function PlayerLink({ player, ...props }) {
  const { settings } = useAppSettings();
  const nameStyle = getPlayerNameColorStyle(player, settings);
  return (
    <StyledLink to={"/player/" + player.id} style={{ whiteSpace: "nowrap", ...nameStyle }}>
      {player.name}
    </StyledLink>
  );
}

export function SubmissionIcon({ submission }) {
  const theme = useTheme();
  return (
    <Link to={"/submission/" + submission.id} style={{ color: theme.palette.links.main }}>
      <FontAwesomeIcon icon={faBook} />
    </Link>
  );
}

export function AccountRoleIcon({ account }) {
  if (isNewsWriter(account)) return <NewsWriterIcon />;
  if (isHelper(account)) return <HelperIcon />;
  if (isVerifier(account)) return <VerifierIcon />;
  if (isAdmin(account)) return <AdminIcon />;
  return null;
}
export function NewsWriterIcon() {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("components.roles.news_writer")} arrow placement="top">
      <FontAwesomeIcon icon={faNewspaper} color="grey" />
    </Tooltip>
  );
}
export function HelperIcon() {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("components.roles.helper")} arrow placement="top">
      <FontAwesomeIcon icon={faHand} color="grey" />
    </Tooltip>
  );
}
export function VerifierIcon() {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("components.roles.verifier")} arrow placement="top">
      <FontAwesomeIcon icon={faShield} color="grey" />
    </Tooltip>
  );
}
export function AdminIcon() {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("components.roles.admin")} arrow placement="top">
      <FontAwesomeIcon icon={faHammer} color="grey" />
    </Tooltip>
  );
}
export function SuspendedIcon({ reason }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.suspended_icon" });
  const text = reason ? t("with_reason", { reason }) : t("no_reason");
  return (
    <Tooltip title={text} arrow placement="top">
      <FontAwesomeIcon icon={faBan} />
    </Tooltip>
  );
}

export function CampaignIcon({ campaign, height = "1.3em", doLink = false }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const iconUrl = campaign.icon_url;
  if (iconUrl === null) return null;

  const comp = (
    <Tooltip title={getCampaignName(campaign, t_g)} arrow placement="top">
      <img
        src={iconUrl}
        alt={campaign.name}
        className="outlined"
        style={{
          height: height,
        }}
        loading="lazy"
      />
    </Tooltip>
  );

  return (
    <>
      {doLink ? (
        <Link to={"/campaign/" + campaign.id} style={{ height: height }}>
          {comp}
        </Link>
      ) : (
        comp
      )}
    </>
  );
}

export const INPUT_METHOD_ICONS = {
  keyboard: faKeyboard,
  dpad: faGamepad,
  analog: faGamepad,
  hybrid: faPersonDrowning,
  other: faChildCombatant,
};
export function InputMethodIcon({ method, ...props }) {
  const { t } = useTranslation();
  const icon = INPUT_METHOD_ICONS[method];
  const inputMethodName = t("components.input_methods." + method);
  return (
    <Tooltip title={inputMethodName} arrow placement="top">
      <FontAwesomeIcon icon={icon} {...props} />
    </Tooltip>
  );
}

const LINK_ICONS = {
  youtube: { icon: faYoutube, color: "red", identifier: ["youtu.be/", "youtube.com/"] },
  twitch: { icon: faTwitch, color: "purple", identifier: ["twitch.tv/"] },
  discord: { icon: faDiscord, color: "#5460ef", identifier: ["discord.gg/"] },
  twitter: {
    icon: faXTwitter,
    color: "black",
    darkModeColor: "white",
    identifier: ["twitter.com/", "x.com/"],
  },
  github: { icon: faGithub, color: "#161414", darkModeColor: "white", identifier: ["github.com/"] },
  instagram: { icon: faInstagram, color: "#ff2083", identifier: ["instagram.com/"] },
  speedrun: { icon: faTrophy, color: "#ffcf33", identifier: ["speedrun.com/"] },
  reddit: { icon: faReddit, color: "#ff4500", identifier: ["reddit.com/"] },
  bilibili: { icon: faBilibili, color: "#00a2d7", identifier: ["bilibili.com/", "b23.tv/"] },
  steam: {
    icon: faSteam,
    color: "#1e3050",
    darkModeColor: "white",
    identifier: ["steamcommunity.com/", "steampowered.com/"],
  },
};
export function LinkIcon({ url }) {
  const theme = useTheme();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const openTooltip = () => {
    setTooltipOpen(true);
  };
  const closeTooltip = () => {
    setTooltipOpen(false);
  };

  let linkIconElement = null;
  for (const [key, value] of Object.entries(LINK_ICONS)) {
    if (value.identifier.some((i) => url.includes(i))) {
      linkIconElement = (
        <FontAwesomeIcon
          icon={value.icon}
          color={theme.palette.mode === "dark" && value.darkModeColor ? value.darkModeColor : value.color}
        />
      );
      break;
    }
  }

  if (linkIconElement === null) {
    linkIconElement = <FontAwesomeIcon icon={faLink} color={theme.palette.links.main} />;
  }

  return (
    <Tooltip title={url} open={tooltipOpen} onOpen={openTooltip} onClose={closeTooltip} arrow placement="top">
      <StyledExternalLink href={url} onMouseEnter={openTooltip} onMouseLeave={closeTooltip}>
        {linkIconElement}
      </StyledExternalLink>
    </Tooltip>
  );
}
export function getPlatformIcon(url) {
  if (url === null) return faQuestionCircle;
  let icon = faExternalLinkAlt;
  for (const [key, value] of Object.entries(LINK_ICONS)) {
    if (value.identifier.some((i) => url.includes(i))) {
      icon = value.icon;
      break;
    }
  }
  return icon;
}

export function ChallengeFcIcon({
  challenge,
  height = "1em",
  showClear = false,
  allowTextIcons = false,
  style = {},
  ...props
}) {
  const { settings } = useAppSettings();
  const icon = challenge.requires_fc
    ? "fullclear.png"
    : challenge.has_fc
    ? "clear-fullclear.png"
    : "clear.png";
  const alt = getChallengeFcLong(challenge);
  const shortAlt = getChallengeFcShort(challenge);

  if (
    !challenge.requires_fc &&
    !challenge.has_fc &&
    allowTextIcons &&
    !settings.visual.topGoldenList.useTextFcIcons &&
    !showClear
  ) {
    return null;
  }

  return (
    <Tooltip title={alt} arrow placement="top">
      {allowTextIcons && settings.visual.topGoldenList.useTextFcIcons ? (
        <span style={{ whiteSpace: "nowrap" }}>{shortAlt}</span>
      ) : (
        <img
          src={"/icons/" + icon}
          alt={alt}
          className="outlined"
          style={{
            height: height,
            ...style,
          }}
          {...props}
          loading="lazy"
        />
      )}
    </Tooltip>
  );
}
export function SubmissionFcIcon({ submission, height = "1em", disableTooltip = false, style, ...props }) {
  if (!submission.is_fc) return null;
  const icon = "fullclear.png";
  const alt = "Full Clear";

  const comp = (
    <img
      src={"/icons/" + icon}
      alt={alt}
      className="outlined"
      style={{
        height: height,
        ...style,
      }}
      {...props}
      loading="lazy"
    />
  );

  if (disableTooltip) return comp;

  return (
    <Tooltip title={alt} arrow placement="top">
      {comp}
    </Tooltip>
  );
}

export function OtherIcon({ url, title, alt, height = "1em", style = {} }) {
  if (title === undefined) {
    return <img src={url} className="outlined" alt={alt} style={{ height: height, ...style }} />;
  }

  return (
    <Tooltip title={title} arrow placement="top">
      <img src={url} className="outlined" alt={alt} style={{ height: height, ...style }} />
    </Tooltip>
  );
}

export function ArbitraryIcon({ height = "1em" }) {
  return (
    <Tooltip title="Arbitrary" arrow placement="top">
      (A)
    </Tooltip>
  );
}

export function ObjectiveIcon({ objective, challenge = null, height = "1em" }) {
  const description = objective.description;
  let icon_url = null;
  if (challenge) {
    icon_url = getChallengeIcon(challenge);
  } else {
    icon_url = objective.icon_url;
  }

  if (icon_url === null || icon_url === undefined)
    return (
      <Tooltip title={description} arrow placement="top">
        <FontAwesomeIcon icon={faInfoCircle} height={height} />
      </Tooltip>
    );

  return (
    <Tooltip title={description} arrow placement="top">
      <img
        src={icon_url}
        alt={objective.name}
        className="outlined"
        style={{
          height: height,
        }}
        loading="lazy"
      />
    </Tooltip>
  );
}

const defaultEmote = {
  img: "golden-control.png",
  alt: "Golden Control",
};
export const EMOTES = [
  {
    img: "chart_with_sideways_trend.png",
    alt: "Chart with Sideways Trend",
    weight: 100,
  },
  {
    img: "chart_with_midwards_trend.png",
    alt: "Chart with Midwards Trend",
    weight: 100,
  },
  {
    img: "chart_with_awesome_trend.png",
    alt: "Chart with Awesome Trend",
    weight: 100,
  },
  {
    img: "chart_with_no_trend.png",
    alt: "Chart with No Trend",
    weight: 100,
  },
  {
    img: "chart_with_dunning_kruger_trend.png",
    alt: "Chart with Dunning Kruger Trend",
    weight: 100,
  },
  {
    img: "chart_with_horse_trend.png",
    alt: "Chart with Horse Trend",
    weight: 100,
  },
  {
    img: "clowneline.png",
    alt: "Clowneline",
    weight: 50,
  },
  {
    img: "frank.png",
    alt: "Frank",
    weight: 50,
  },
  {
    img: "3dgrineline.png",
    alt: "3dgrineline",
    weight: 50,
  },
  {
    img: "3dfrowneline.png",
    alt: "3dfrowneline",
    weight: 50,
  },
  {
    img: "entity.png",
    alt: "Entity",
    weight: 10,
  },
];
// new emotes: destareline, catplush, catbucket and catbus (uncommon), frontstare (rare), catnodwashingmachine and Cat (ultra rare)
export function WebsiteIcon({ height = "1em", style = {}, preventFunny = false, countLoad = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "navigation.icon_tooltip" });
  const [loaded, setLoaded] = useLocalStorage("website_icon_loaded", 0);

  //Track how often the icon is loaded
  useEffect(() => {
    if (countLoad) {
      setLoaded((prev) => prev + 1);
    }
  }, []);

  let totalWeight = EMOTES.reduce((sum, emote) => sum + emote.weight, 0);
  let rand = Math.random() * totalWeight;
  let icon = defaultEmote; // Default icon if no emote is selected
  let odds = 1;
  let postfix = "";

  if (!preventFunny && Math.random() < 0.01) {
    odds *= 0.01;
    for (const emote of EMOTES) {
      if (rand < emote.weight) {
        icon = emote;
        odds *= emote.weight / totalWeight;
        break;
      }
      rand -= emote.weight;
    }
  } else {
    odds *= 0.99;
  }
  // Flipped
  if (!preventFunny && Math.random() < 0.005) {
    odds *= 0.005;
    style.transform = "rotate(180deg)";
    postfix += " [" + t("flipped") + "]";
  } else {
    odds *= 0.995;
  }
  // Shiny
  if (!preventFunny && Math.random() < 1 / 8192) {
    odds *= 1 / 8192;
    style.filter = "hue-rotate(180deg)";
    postfix += " [" + t("shiny") + "]";
  } else {
    odds *= 8191 / 8192;
  }

  if (postfix === "") postfix = " [" + t("default") + "]";

  let oddsText;
  if (odds < 0.0001) {
    oddsText = "1 in " + Math.round(1 / odds).toLocaleString();
  } else {
    oddsText = (odds * 100).toFixed(2) + "%";
  }

  let iconToDisplay = useMemo(() => icon, []);
  let text = useMemo(
    () =>
      t("text", {
        icon: iconToDisplay.alt,
        postfix: postfix,
        odds: oddsText,
        count: loaded,
      }),
    []
  );
  let styleToDisplay = useMemo(() => style, []);

  return (
    <TooltipLineBreaks title={text}>
      <img
        src={"/emotes/" + iconToDisplay.img}
        alt={iconToDisplay.alt}
        style={{
          height: height,
          ...styleToDisplay,
        }}
      />
    </TooltipLineBreaks>
  );
}
export const MemoWebsiteIcon = memo(WebsiteIcon);

export function JournalIcon({ height = "1em", alt = "Generic Campaign Icon", style = {}, ...props }) {
  return (
    <img
      src={"/icons/journal.png"}
      alt={alt}
      className="outlined"
      style={{
        height: height,
        ...style,
      }}
      {...props}
    />
  );
}

export function SubmissionEmbed({ submission, noBorderRadius = false, style = {}, ...props }) {
  const { t } = useTranslation();
  const url = API_BASE_URL + "/embed/img/submission.php?id=" + submission.id;
  const imgStyle = {
    borderRadius: noBorderRadius ? 0 : "10px",
  };
  return (
    <img
      src={url}
      alt={t("general.submission", { count: 1 })}
      loading="lazy"
      style={{ ...imgStyle, ...style }}
      {...props}
    />
  );
}

export function GamebananaEmbed({ campaign, size = "medium", ...props }) {
  const { t } = useTranslation();
  const embedUrl = getGamebananaEmbedUrl(campaign.url, size);

  if (embedUrl === null) return;

  return (
    <Link to={campaign.url} target="_blank" {...props}>
      <img src={embedUrl} alt={t("components.gamebanana_embed.alt")} style={{ borderRadius: "5px" }} />
    </Link>
  );
}

export function EmoteImage({ emote, alt, height = "1em", style = {} }) {
  return <AnyImage path={"/emotes/" + emote} alt={alt ?? emote} height={height} style={style} />;
}

export function AnyImage({ path, alt, height = "1em", style = {}, ...props }) {
  return (
    <img
      src={path}
      alt={alt ?? path}
      style={{
        height: height,
        ...style,
      }}
      {...props}
    />
  );
}

export function TooltipIcon({ title, icon, fontSize = "1em" }) {
  return (
    <TooltipLineBreaks title={title}>
      <FontAwesomeIcon icon={icon} fontSize={fontSize} />
    </TooltipLineBreaks>
  );
}
export function VerifierNotesIcon({ notes, fontSize = "1em" }) {
  return <TooltipIcon title={notes} icon={faCircleExclamation} fontSize={fontSize} />;
}
export function PlayerNotesIcon({ notes, fontSize = "1em" }) {
  return <TooltipIcon title={notes} icon={faComment} fontSize={fontSize} />;
}

export function DateAchievedTimePicker({ value, onChange, sx = {}, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.submission" });
  return (
    <DateTimePicker
      label={t("date_achieved")}
      value={dayjs(value)}
      onChange={(value) => {
        onChange(value.toISOString());
      }}
      viewRenderers={{
        hours: renderTimeViewClock,
        minutes: renderTimeViewClock,
      }}
      maxDateTime={dayjs(new Date())}
      sx={{ width: "100%", ...sx }}
      {...props}
    />
  );
}

export function ProofExternalLinkButton({ url }) {
  return (
    <StyledLink to={url} target="_blank">
      <FontAwesomeIcon icon={getPlatformIcon(url)} />
    </StyledLink>
  );
}
