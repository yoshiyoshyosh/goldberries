import { useQuery } from "react-query";
import {
  fetchAllCampaigns,
  fetchAllChallengesInMap,
  fetchAllDifficulties,
  fetchAllMapsInCampaign,
  fetchAllObjectives,
  fetchAllPlayers,
  fetchPlayerList,
} from "../util/api";
import { toast } from "react-toastify";
import {
  getCampaignName,
  getChallengeFcLong,
  getChallengeFcShort,
  getChallengeName,
  getDifficultyName,
  getObjectiveName,
  getPlayerNameColorStyle,
} from "../util/data_util";
import { Autocomplete, Avatar, Chip, Grid, Menu, MenuItem, Stack, TextField, Tooltip } from "@mui/material";
import { getDifficultyColors, getDifficultyColorsSettings } from "../util/constants";
import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArchway,
  faArrowDown,
  faArrowRight,
  faArrowUp,
  faBan,
  faBook,
  faChild,
  faChildCombatant,
  faCircle,
  faDiamond,
  faGamepad,
  faHammer,
  faInfoCircle,
  faKeyboard,
  faLink,
  faPerson,
  faPersonDrowning,
  faQuestion,
  faShield,
  faSquare,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faDiscord, faMix, faTwitch, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { useTheme } from "@emotion/react";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { getQueryData, useGetChallengesInMap } from "../hooks/useApi";
import { StyledExternalLink } from "./BasicComponents";

export function CampaignSelect({ selected, setSelected, filter = null, disabled = false }) {
  const query = useQuery({
    queryKey: ["all_campaigns"],
    queryFn: () => fetchAllCampaigns(),
    onError: (error) => {
      toast.error(error.message);
    },
  });

  let campaigns = query.data?.data ?? [];
  if (filter !== null) {
    campaigns = campaigns.filter(filter);
  }
  campaigns.sort((a, b) => a.name.localeCompare(b.name));

  const getOptionLabel = (campaign) => {
    return getCampaignName(campaign);
  };

  return (
    <Autocomplete
      fullWidth
      disabled={disabled}
      getOptionKey={(campaign) => campaign.id}
      getOptionLabel={getOptionLabel}
      options={campaigns}
      value={selected}
      onChange={(event, newValue) => {
        setSelected(newValue);
      }}
      renderInput={(params) => <TextField {...params} label="Campaign" />}
    />
  );
}

export function MapSelect({ campaign, selected, setSelected, disabled }) {
  const query = useQuery({
    queryKey: ["all_maps", campaign.id],
    queryFn: () => fetchAllMapsInCampaign(campaign.id),
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const maps = query.data?.data?.maps ?? [];

  const getOptionLabel = (map) => {
    return map.name;
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
      renderInput={(params) => <TextField {...params} label="Map" />}
    />
  );
}

export function ChallengeSelect({ map, selected, setSelected, disabled, hideLabel = false }) {
  const query = useQuery({
    queryKey: ["all_challenges", map.id],
    queryFn: () => fetchAllChallengesInMap(map.id),
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const challenges = query.data?.data?.challenges ?? [];

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
      renderInput={(params) => <TextField {...params} label={hideLabel ? undefined : "Challenge"} />}
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

export function ChallengeSelectTf({ map, selected, setSelected, disabled, hideLabel = false }) {
  const query = useGetChallengesInMap(map.id);
  const challenges = getQueryData(query)?.challenges ?? [];
  const [selectedId, setSelectedId] = useState(selected?.id ?? "");

  const onUpdateSelectedId = (id) => {
    setSelectedId(id);
    setSelected(challenges.find((c) => c.id === id));
  };

  return (
    <TextField
      select
      fullWidth
      disabled={disabled}
      value={selectedId}
      onChange={(e) => onUpdateSelectedId(e.target.value)}
      label={hideLabel ? undefined : "Challenge"}
      SelectProps={{
        MenuProps: { disableScrollLock: true },
      }}
    >
      <MenuItem value="">
        <em>No Selection</em>
      </MenuItem>
      {challenges.map((challenge) => (
        <MenuItem key={challenge.id} value={challenge.id}>
          {getChallengeName(challenge)}
        </MenuItem>
      ))}
    </TextField>
  );
}

export function DifficultySelect({ defaultValue, ...props }) {
  const query = useQuery({
    queryKey: ["all_difficulties"],
    queryFn: () => fetchAllDifficulties(),
    onError: (error) => {
      toast.error(error.message);
    },
  });
  let difficulties = query.data?.data ?? [];
  //filter out id 13 (fwg) and 19 (undetermined)
  difficulties = difficulties.filter((d) => d.id !== 19 && d.id !== 13);

  return (
    <TextField
      {...props}
      select
      defaultValue={defaultValue}
      SelectProps={{
        ...props.SelectProps,
        MenuProps: { disableScrollLock: true },
      }}
    >
      <MenuItem value="">
        <em>No Suggestion</em>
      </MenuItem>
      {difficulties.map((difficulty) => (
        <MenuItem key={difficulty.id} value={difficulty.id}>
          {getDifficultyName(difficulty)}
        </MenuItem>
      ))}
    </TextField>
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
  prefix = "",
  suffix = "",
  useSubtierColors = false,
  useDarkening = false,
  sx = {},
  ...props
}) {
  const { settings } = useAppSettings();
  const text = difficulty === null ? "N/A" : getDifficultyName(difficulty);
  const colors = getDifficultyColorsSettings(settings, difficulty?.id, !useDarkening);
  if (difficulty === null) return null;
  return (
    <Chip
      label={prefix + text + suffix}
      size="small"
      {...props}
      sx={{
        bgcolor: useSubtierColors ? colors.color : colors.group_color,
        color: colors.contrast_color,
        ...sx,
      }}
    />
  );
}
export function DifficultyValueChip({
  difficulty,
  value,
  prefix = "",
  suffix = "",
  useSubtierColors = false,
  useDarkening = false,
  sx = {},
  ...props
}) {
  const { settings } = useAppSettings();
  const text = difficulty === null ? "N/A" : getDifficultyName(difficulty);
  const colors = getDifficultyColorsSettings(settings, difficulty?.id, !useDarkening);
  if (difficulty === null) return null;
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
            bgcolor: useSubtierColors ? colors.color : colors.group_color,
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
            bgcolor: useSubtierColors ? colors.color : colors.group_color,
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
  isSuggestion = false,
  ...props
}) {
  const query = useQuery({
    queryKey: ["all_difficulties"],
    queryFn: () => fetchAllDifficulties(),
    onError: (error) => {
      toast.error(error.message);
    },
  });
  let difficulties = query.data?.data ?? [];
  //filter out id 13 (fwg) and 19 (undetermined)
  if (isSuggestion) {
    difficulties = difficulties.filter((d) => d.id !== 19 && d.id !== 13);
  }

  return (
    <TextField
      {...props}
      select
      value={difficultyId ?? ""}
      onChange={(e) => setDifficultyId(e.target.value === "" ? null : e.target.value)}
      SelectProps={{
        ...props.SelectProps,
        MenuProps: { disableScrollLock: true },
      }}
    >
      <MenuItem value="">
        <em>No {isSuggestion ? "Suggestion" : "Selection"}</em>
      </MenuItem>
      {difficulties.map((difficulty) => (
        <MenuItem key={difficulty.id} value={difficulty.id}>
          {getDifficultyName(difficulty)}
        </MenuItem>
      ))}
    </TextField>
  );
}

export function ObjectiveSelect({ objectiveId, setObjectiveId, ...props }) {
  const query = useQuery({
    queryKey: ["all_objectives"],
    queryFn: () => fetchAllObjectives(),
    onError: (error) => {
      toast.error(error.message);
    },
  });
  let objectives = query.data?.data ?? [];

  return (
    <TextField
      {...props}
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

export function VerificationStatusChip({ isVerified, prefix = "", ...props }) {
  const text = isVerified === null ? "Pending" : isVerified ? "Verified" : "Rejected";
  const color = isVerified === null ? "warning" : isVerified ? "success" : "error";
  return <Chip label={prefix + text} color={color} {...props} />;
}

// ===== Full Select Components =====
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
    if (challenge !== null && challenge.map !== null) {
      setCampaign(challenge.map?.campaign);
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
        <ChallengeSelect map={map} selected={challenge} setSelected={setChallenge} disabled={disabled} />
      )}
    </Stack>
  );
}

export function FullMapSelect({ map, setMap, disabled }) {
  const [campaign, setCampaign] = useState(map?.campaign ?? null);

  const onCampaignSelect = (campaign) => {
    setCampaign(campaign);
    if (campaign !== null && campaign.maps.length === 1) {
      setMap(campaign.maps[0]);
    } else {
      setMap(null);
    }
  };

  useEffect(() => {
    if (map && map.campaign) {
      setCampaign(map.campaign);
    }
  }, [map]);

  return (
    <Stack direction="column" gap={2}>
      <CampaignSelect selected={campaign} setSelected={onCampaignSelect} disabled={disabled} />
      {campaign && <MapSelect campaign={campaign} selected={map} setSelected={setMap} disabled={disabled} />}
    </Stack>
  );
}

// ===== Player Components =====
export function PlayerSelect({ type, value, onChange, label = "Player", ...props }) {
  const queryFn = type === "all" ? fetchAllPlayers : () => fetchPlayerList(type);
  const query = useQuery({
    queryKey: ["player_list", type],
    queryFn: queryFn,
  });

  const players = query.data?.data ?? [];
  //Sort alphabetically
  players.sort((a, b) => a.name.localeCompare(b.name));

  const getOptionLabel = (player) => {
    return player?.name;
  };

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

export function PlayerChip({ player, ...props }) {
  const { settings } = useAppSettings();
  if (player === undefined || player === null) {
    return <Chip label="<none>" sx={{ mr: 1 }} {...props} />;
  }

  const style = getPlayerNameColorStyle(player, settings);

  return (
    <Link to={"/player/" + player.id}>
      <Chip
        label={
          <Stack direction="row" alignItems="center" gap={1}>
            <span style={style}>{player.name}</span>
            {player.account.is_verifier && <VerifierIcon />}
            {player.account.is_suspended && <SuspendedIcon reason={player.account.suspension_reason} />}
          </Stack>
        }
        {...props}
      />
    </Link>
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

export function VerifierIcon() {
  return (
    <Tooltip title="Part of the Modded Golden Team">
      <FontAwesomeIcon icon={faShield} color="grey" />
    </Tooltip>
  );
}
export function AdminIcon() {
  return (
    <Tooltip title="Website Admin">
      <FontAwesomeIcon icon={faHammer} color="grey" />
    </Tooltip>
  );
}
export function SuspendedIcon({ reason }) {
  const text = reason ? "This user is suspended: " + reason : "This user is suspended";
  return (
    <Tooltip title={text}>
      <FontAwesomeIcon icon={faBan} />
    </Tooltip>
  );
}

export function CampaignIcon({ campaign, height = "1.3em", doLink = false }) {
  const iconUrl = campaign.icon_url;
  if (iconUrl === null) return null;

  const comp = (
    <Tooltip title={getCampaignName(campaign)}>
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

export const INPUT_METHODS = {
  keyboard: { name: "Keyboard", icon: faKeyboard },
  dpad: { name: "D-Pad", icon: faGamepad },
  analog: { name: "Analog", icon: faGamepad },
  hybrid: { name: "Hybrid", icon: faPersonDrowning },
  other: { name: "Other", icon: faChildCombatant },
};
export function InputMethodIcon({ method, ...props }) {
  const icon = INPUT_METHODS[method];
  const inputMethodName = icon.name;
  return (
    <Tooltip title={inputMethodName}>
      <FontAwesomeIcon icon={icon.icon} {...props} />
    </Tooltip>
  );
}

const LINK_ICONS = {
  youtube: { icon: faYoutube, color: "red", identifier: ["youtu.be/", "youtube.com/"] },
  twitch: { icon: faTwitch, color: "purple", identifier: ["twitch.tv/"] },
  discord: { icon: faDiscord, color: "#5460ef", identifier: ["discord.gg/"] },
};
export function LinkIcon({ url }) {
  const theme = useTheme();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const openTooltip = () => {
    console.log("Opening tooltip");
    setTooltipOpen(true);
  };
  const closeTooltip = () => {
    console.log("Closing tooltip");
    setTooltipOpen(false);
  };

  let linkIconElement = null;
  for (const [key, value] of Object.entries(LINK_ICONS)) {
    if (value.identifier.some((i) => url.includes(i))) {
      linkIconElement = <FontAwesomeIcon icon={value.icon} color={value.color} />;
      break;
    }
  }

  if (linkIconElement === null) {
    linkIconElement = <FontAwesomeIcon icon={faLink} color={theme.palette.links.main} />;
  }

  return (
    <Tooltip title={url} open={tooltipOpen} onOpen={openTooltip} onClose={closeTooltip}>
      <StyledExternalLink href={url} onMouseEnter={openTooltip} onMouseLeave={closeTooltip}>
        {linkIconElement}
      </StyledExternalLink>
    </Tooltip>
  );
}

export function ChallengeFcIcon({
  challenge,
  height = "1em",
  showClear = false,
  isTopGoldenList = false,
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
    isTopGoldenList &&
    !settings.visual.topGoldenList.useTextFcIcons &&
    !showClear
  ) {
    return null;
  }

  return (
    <Tooltip title={alt}>
      {isTopGoldenList && settings.visual.topGoldenList.useTextFcIcons ? (
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

  return <Tooltip title={alt}>{comp}</Tooltip>;
}

export function OtherIcon({ name, title, alt, height = "1em" }) {
  if (title === undefined) {
    return <img src={"/icons/" + name + ".png"} alt={alt} style={{ height: height }} />;
  }

  return (
    <Tooltip title={title}>
      <img src={"/icons/" + name + ".png"} alt={alt} style={{ height: height }} />
    </Tooltip>
  );
}

export function ArbitraryIcon({ height = "1em" }) {
  return <Tooltip title="Arbitrary">(A)</Tooltip>;
}

export function ObjectiveIcon({ objective, challengeDescription, height = "1em" }) {
  const description = challengeDescription
    ? objective.name + ": " + challengeDescription
    : objective.description;
  if (objective.icon_url === null || objective.icon_url === undefined)
    return (
      <Tooltip title={description}>
        <FontAwesomeIcon icon={faInfoCircle} height={height} />
      </Tooltip>
    );

  return (
    <Tooltip title={description}>
      <img
        src={objective.icon_url}
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

export const EMOTES = [
  {
    img: "golden-control.png",
    alt: "Goldberries.net",
  },
  {
    img: "chart_with_sideways_trend.png",
    alt: "Chart with Sideways Trend",
  },
  {
    img: "chart_with_midwards_trend.png",
    alt: "Chart with Midwards Trend",
  },
  {
    img: "chart_with_awesome_trend.png",
    alt: "Chart with Awesome Trend",
  },
  {
    img: "chart_with_no_trend.png",
    alt: "Chart with No Trend",
  },
  {
    img: "chart_with_dunning_kruger_trend.png",
    alt: "Chart with Dunning Kruger Trend",
  },
  {
    img: "chart_with_horse_trend.png",
    alt: "Chart with Horse Trend",
  },
];
export function WebsiteIcon({ height = "1em", style = {}, preventFunny = false }) {
  let icon = EMOTES[0];

  const rand = Math.random();
  if (!preventFunny && rand < 0.01) {
    const randomIndex = Math.floor(1 + Math.random() * (EMOTES.length - 1));
    icon = EMOTES[randomIndex];
  }

  return (
    <img
      src={"/emotes/" + icon.img}
      alt={icon.alt}
      style={{
        height: height,
        ...style,
      }}
    />
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
