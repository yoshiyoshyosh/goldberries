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
  getChallengeName,
  getDifficultyName,
  getObjectiveName,
  getPlayerNameColorStyle,
} from "../util/data_util";
import { Autocomplete, Avatar, Chip, MenuItem, Stack, TextField, Tooltip } from "@mui/material";
import { getDifficultyColors } from "../util/constants";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArchway,
  faBan,
  faBook,
  faChild,
  faChildCombatant,
  faGamepad,
  faHammer,
  faKeyboard,
  faLink,
  faPersonDrowning,
  faQuestion,
  faShield,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faDiscord, faMix, faTwitch, faYoutube } from "@fortawesome/free-brands-svg-icons";

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

export function DifficultyChip({ difficulty, prefix = "", sx = {}, ...props }) {
  const text = difficulty === null ? "<none>" : getDifficultyName(difficulty);
  const colors = getDifficultyColors(difficulty?.id);
  return <Chip label={prefix + text} size="small" {...props} sx={{ ...sx, bgcolor: colors.group_color }} />;
}

export function DifficultySelectControlled({ difficultyId, setDifficultyId, isSuggestion, ...props }) {
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
      onChange={(e) => setDifficultyId(e.target.value)}
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

export function VerificationStatusChip({ isVerified, isRejected, prefix = "", ...props }) {
  if (isVerified) {
    return <Chip label={prefix + "Verified"} color="success" {...props} />;
  } else if (isRejected) {
    return <Chip label={prefix + "Rejected"} color="error" {...props} />;
  }
  return <Chip label={prefix + "Pending"} color="warning" {...props} />;
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
  if (player === undefined || player === null) {
    return <Chip label="<none>" sx={{ mr: 1 }} {...props} />;
  }

  const style = getPlayerNameColorStyle(player);

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
  return (
    <Link to={"/submission/" + submission.id}>
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

const INPUT_METHOD_ICONS = {
  keyboard: faKeyboard,
  controller: faGamepad,
  hybrid: faPersonDrowning,
  other: faChildCombatant,
};
export function InputMethodIcon({ method, ...props }) {
  const inputMethodName = method.charAt(0).toUpperCase() + method.slice(1);
  return (
    <Tooltip title={inputMethodName}>
      <FontAwesomeIcon icon={INPUT_METHOD_ICONS[method]} {...props} />
    </Tooltip>
  );
}

const LINK_ICONS = {
  youtube: { icon: faYoutube, color: "red", identifier: ["youtu.be/", "youtube.com/"] },
  twitch: { icon: faTwitch, color: "purple", identifier: ["twitch.tv/"] },
  discord: { icon: faDiscord, color: "#5460ef", identifier: ["discord.gg/"] },
};
export function LinkIcon({ url }) {
  let linkIconElement = null;
  for (const [key, value] of Object.entries(LINK_ICONS)) {
    if (value.identifier.some((i) => url.includes(i))) {
      linkIconElement = <FontAwesomeIcon icon={value.icon} color={value.color} />;
      break;
    }
  }

  if (linkIconElement === null) {
    linkIconElement = <FontAwesomeIcon icon={faLink} />;
  }

  return (
    <Tooltip title={url}>
      <a href={url} target="_blank" rel="noopener">
        {linkIconElement}
      </a>
    </Tooltip>
  );
}