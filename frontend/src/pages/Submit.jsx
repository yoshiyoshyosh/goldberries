import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Container,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "react-query";
import {
  fetchAllCampaigns,
  fetchAllChallenges,
  fetchAllChallengesInMap,
  fetchAllDifficulties,
  fetchAllMapsInCampaign,
  fetchAllObjectives,
  fetchChallenge,
  postSubmission,
} from "../util/api";
import {
  getChallengeName,
  getChallengeFcShort,
  getChallengeObjectiveSuffix,
  getDifficultyName,
  getChallengeFlags,
  getMapLobbyInfo,
  getObjectiveName,
} from "../util/data_util";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FormOptions, getDifficultyColors } from "../util/constants";
import { useAuth } from "../hooks/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";
import { BasicContainerBox, ErrorDisplay, LoadingSpinner } from "../components/BasicComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronLeft, faCross, faXmark } from "@fortawesome/free-solid-svg-icons";

export function PageSubmit() {
  const { tab, challengeId } = useParams();
  const [selectedTab, setSelectedTab] = useState(tab ?? "single-challenge");

  const query = useQuery({
    queryKey: ["challenge", challengeId],
    queryFn: () => fetchChallenge(challengeId),
    enabled: challengeId !== undefined,
  });

  if (query.isFetching) {
    return (
      <BasicContainerBox maxWidth="md">
        <Tabs
          value={selectedTab}
          onChange={(event, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Single Challenge" value="single-challenge" />
          <Tab label="Multi Challenge" value="multi-challenge" />
          <Tab label="New Challenge" value="new-challenge" />
        </Tabs>
        <LoadingSpinner sx={{ mt: 2 }} />
      </BasicContainerBox>
    );
  } else if (query.isError) {
    return (
      <BasicContainerBox maxWidth="md">
        <ErrorDisplay error={query.error} />
      </BasicContainerBox>
    );
  }

  const challenge = query.data?.data ?? null;

  return (
    <BasicContainerBox maxWidth="md">
      <Tabs
        value={selectedTab}
        onChange={(event, newValue) => setSelectedTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Single Challenge" value="single-challenge" />
        <Tab label="Multi Challenge" value="multi-challenge" />
        <Tab label="New Challenge" value="new-challenge" />
      </Tabs>
      {selectedTab === "single-challenge" && (
        <SingleUserSubmission
          defaultCampaign={challenge?.map?.campaign}
          defaultMap={challenge?.map}
          defaultChallenge={challenge}
        />
      )}
      {selectedTab === "multi-challenge" && <MultiUserSubmission />}
      {selectedTab === "new-challenge" && <NewChallengeUserSubmission />}
    </BasicContainerBox>
  );
}

export function SingleUserSubmission({ defaultCampaign, defaultMap, defaultChallenge }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(defaultCampaign ?? null);
  const [map, setMap] = useState(defaultMap ?? null);
  const [challenge, setChallenge] = useState(defaultChallenge ?? null);

  const { mutate: submitRun } = useMutation({
    mutationFn: (data) => postSubmission(data),
    onSuccess: (response) => {
      navigate("/submission/" + response.data.id);
    },
    onError: (error) => {
      toast.error(error.response.data.error);
    },
  });

  //Form props
  const form = useForm({
    defaultValues: {
      proof_url: "",
      raw_session_url: "",
      player_notes: "",
      is_fc: false,
      suggested_difficulty_id: null,
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    console.log("Form data:", data);
    submitRun({
      challenge_id: challenge.id,
      player_id: auth.user.player.id,
      ...data,
    });
  });
  const errors = form.formState.errors;

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

  const onChallengeSelect = (challenge) => {
    setChallenge(challenge);
    if (challenge !== null) {
      form.setValue("is_fc", challenge.requires_fc);
    }
  };

  return (
    <>
      <h1 style={{ marginBottom: "0" }}>Submit a run</h1>
      <Stack gap={2}>
        <h4 style={{ marginBottom: "0" }}>Select a Challenge</h4>
        <CampaignSelect selected={campaign} setSelected={onCampaignSelect} />
        {campaign && <MapSelect campaign={campaign} selected={map} setSelected={onMapSelect} />}
        {map && <ChallengeSelect map={map} selected={challenge} setSelected={onChallengeSelect} />}
      </Stack>
      {challenge && (
        <>
          <h4>Challenge Data</h4>
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Objective</TableCell>
                  <TableCell>
                    {challenge.objective.name} - {challenge.objective.description}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Flags</TableCell>
                  <TableCell>
                    <Stack direction="row" gap={1}>
                      <DifficultyChip difficulty={challenge.difficulty} prefix="Difficulty: " />
                      {getChallengeFlags(challenge).map((f) => (
                        <Chip label={f} size="small" />
                      ))}
                    </Stack>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      <Divider sx={{ my: 3 }} />
      <h4>Your Run</h4>
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Proof URL *"
              fullWidth
              {...form.register("proof_url", FormOptions.UrlRequired)}
              error={errors.proof_url}
              helperText={errors.proof_url?.message}
            />
            <FormHelperText>
              Upload your proof video to a permanent place, such as YouTube, Bilibili, Twitch Highlight
            </FormHelperText>
          </Grid>
          {challenge !== null && challenge.difficulty.id <= 13 && (
            <Grid item xs={12}>
              <TextField
                label="Raw Session URL *"
                fullWidth
                {...form.register("raw_session_url", FormOptions.UrlRequired)}
                error={errors.raw_session_url}
                helperText={errors.raw_session_url?.message}
              />
              <FormHelperText>
                Raw session recording of the winning run is required for Tier 3+ goldens.
              </FormHelperText>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              label="Player Notes"
              multiline
              fullWidth
              minRows={2}
              {...form.register("player_notes")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked={challenge !== null && challenge.requires_fc}
                  disabled={challenge === null || challenge.requires_fc || !challenge.has_fc}
                />
              }
              {...form.register("is_fc")}
              label="Run is FC"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DifficultySelect
              label="Suggested Difficulty"
              fullWidth
              SelectProps={{ ...form.register("suggested_difficulty_id") }}
              helperText="Please use responsibly, meme suggestions will be removed!"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="contained" fullWidth onClick={onSubmit} disabled={challenge === null}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}

export function MultiUserSubmission() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [sortMajorIndex, setSortMajorIndex] = useState(null);
  const [sortMinorIndex, setSortMinorIndex] = useState(null);
  const [preferFc, setPreferFc] = useState(false);
  const [mapDataList, setMapDataList] = useState([]); // [{map: map, challenge: challenge, is_fc: false, player_notes: "", suggested_difficulty_id: null}]

  const { mutate: submitRun } = useMutation({
    mutationFn: (data) => postSubmission(data),
    onSuccess: (response) => {
      toast.success("Submission successful!");
    },
    onError: (error) => {
      toast.error(error.response.data.error);
    },
  });

  //Form props
  const form = useForm({
    defaultValues: {
      proof_url: "",
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    mapDataList.forEach((mapData) => {
      submitRun({
        challenge_id: mapData.challenge.id,
        player_id: auth.user.player.id,
        is_fc: mapData.is_fc,
        player_notes: mapData.player_notes,
        raw_session_url: mapData.raw_session_url,
        suggested_difficulty_id: mapData.suggested_difficulty_id,
        proof_url: data.proof_url,
      });
    });
  });
  const errors = form.formState.errors;

  const onCampaignSelect = (campaign) => {
    //Sort campaign.maps by sort_major, sort_minor, sort_order then name
    if (campaign !== null) {
      campaign.maps.sort((a, b) => {
        if (a.sort_major !== b.sort_major) {
          return a.sort_major - b.sort_major;
        }
        if (a.sort_minor !== b.sort_minor) {
          return a.sort_minor - b.sort_minor;
        }
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }
        return a.name.localeCompare(b.name);
      });
    }
    setCampaign(campaign);
  };

  const resetMapDataList = () => {
    const mapDataList = [];
    if (campaign !== null) {
      campaign.maps.forEach((map) => {
        if (sortMajorIndex !== null && map.sort_major !== sortMajorIndex) {
          return;
        }
        if (sortMinorIndex !== null && map.sort_minor !== sortMinorIndex) {
          return;
        }
        if (map.challenges.length === 0) {
          return;
        }
        let challenge = map.challenges[0];
        if (map.challenges.length > 1) {
          challenge = map.challenges.find(
            (c) => (c.requires_fc && preferFc) || (!c.requires_fc && !preferFc)
          );
        }
        map.campaign = campaign;
        mapDataList.push({
          map: map,
          challenge: challenge,
          is_fc: challenge.requires_fc || (preferFc && challenge.has_fc),
          player_notes: "",
          raw_session_url: "",
          suggested_difficulty_id: null,
        });
      });
    }
    setMapDataList(mapDataList);
  };

  const updateMapDataRow = (index, data) => {
    const newMapDataList = [...mapDataList];
    newMapDataList[index] = data;
    setMapDataList(newMapDataList);
  };
  const deleteRow = (index) => {
    const newMapDataList = [...mapDataList];
    newMapDataList.splice(index, 1);
    setMapDataList(newMapDataList);
  };

  useEffect(() => {
    resetMapDataList();
  }, [campaign, sortMajorIndex, sortMinorIndex, preferFc]);

  const hasSortMajor = campaign !== null && campaign.sort_major_name !== null;
  const hasSortMinor = campaign !== null && campaign.sort_minor_name !== null;

  let submittable = campaign !== null && mapDataList.length > 0;
  let rawSessionsGood = true;
  mapDataList.forEach((mapData) => {
    if (mapData.challenge && mapData.challenge.difficulty.id <= 13 && mapData.raw_session_url === "") {
      rawSessionsGood = false;
    }
    if (mapData.challenge === null) {
      submittable = false;
    }
  });

  return (
    <>
      <h1 style={{ marginBottom: "0" }}>Submit a compilation video</h1>
      <Typography variant="body1">
        This is for submitting a compilation video of an entire campaign or lobby.
      </Typography>
      <Stack gap={2}>
        <h4 style={{ marginBottom: "0" }}>Select a Campaign</h4>
        <CampaignSelect
          selected={campaign}
          setSelected={onCampaignSelect}
          filter={(campaign) => campaign.maps.length > 1}
        />
      </Stack>
      {hasSortMajor && (
        <>
          <h4 style={{ marginBottom: "0" }}>{campaign.sort_major_name}</h4>
          <TextField
            select
            fullWidth
            value={sortMajorIndex ?? null}
            onChange={(e) => setSortMajorIndex(e.target.value)}
            SelectProps={{
              MenuProps: { disableScrollLock: true },
            }}
          >
            <MenuItem value={null}>
              <em>All {campaign.sort_major_name}</em>
            </MenuItem>
            {campaign.sort_major_labels.map((value, index) => (
              <MenuItem key={index} value={index}>
                {value}
              </MenuItem>
            ))}
          </TextField>
        </>
      )}
      {hasSortMinor && (
        <>
          <h4 style={{ marginBottom: "0" }}>{campaign.sort_minor_name}</h4>
          <TextField
            select
            fullWidth
            value={sortMinorIndex ?? null}
            onChange={(e) => setSortMinorIndex(e.target.value)}
            SelectProps={{
              MenuProps: { disableScrollLock: true },
            }}
          >
            <MenuItem value={null}>
              <em>All {campaign.sort_minor_name}</em>
            </MenuItem>
            {campaign.sort_minor_labels.map((value, index) => (
              <MenuItem key={index} value={index}>
                {value}
              </MenuItem>
            ))}
          </TextField>
        </>
      )}
      <FormControlLabel
        control={<Checkbox />}
        label="Prefer FC"
        checked={preferFc}
        onChange={(e, v) => setPreferFc(v)}
      />
      {campaign !== null && (
        <>
          <Divider sx={{ my: 3 }} />
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Map</TableCell>
                  <TableCell>Challenge</TableCell>
                  <TableCell>Is FC</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mapDataList.map((mapData, index) => (
                  <MultiUserSubmissionMapRow
                    key={mapData.map.id}
                    mapData={mapData}
                    index={index}
                    updateMapDataRow={updateMapDataRow}
                    deleteRow={deleteRow}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      <Divider sx={{ my: 3 }} />
      <h4>Compilation Video</h4>
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Proof URL *"
              fullWidth
              {...form.register("proof_url", FormOptions.UrlRequired)}
              error={errors.proof_url}
              helperText={errors.proof_url?.message}
            />
            <FormHelperText>
              Upload your proof video to a permanent place, such as YouTube, Bilibili, Twitch Highlight...
            </FormHelperText>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={onSubmit}
              disabled={!submittable || !rawSessionsGood}
            >
              Submit
            </Button>
          </Grid>
          {!rawSessionsGood && (
            <Grid item xs={12}>
              <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                Raw session recording of the winning run is required for Tier 3+ challenges.
              </Typography>
            </Grid>
          )}
        </Grid>
      </form>
    </>
  );
}

export function NewChallengeUserSubmission({}) {
  const auth = useAuth();
  const navigate = useNavigate();

  const { mutate: submitRun } = useMutation({
    mutationFn: (data) => postSubmission(data),
    onSuccess: (response) => {
      navigate("/submission/" + response.data.id);
    },
    onError: (error) => {
      toast.error(error.response.data.error);
    },
  });

  //Form props
  const form = useForm({
    defaultValues: {
      new_challenge: {
        url: "",
        name: "",
        description: "",
      },
      proof_url: "",
      raw_session_url: "",
      player_notes: "",
      is_fc: false,
      suggested_difficulty_id: null,
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    console.log("Form data:", data);
    submitRun({
      player_id: auth.user.player.id,
      ...data,
    });
  });
  const errors = form.formState.errors;
  const suggested_difficulty_id = form.watch("suggested_difficulty_id");

  return (
    <>
      <h1 style={{ marginBottom: "0" }}>Submit a run</h1>
      <form>
        <Typography variant="body1">
          This form is for submitting a run for a challenge that is not yet in the database. Might take longer
          to get verified!
        </Typography>
        <h4>Challenge Data</h4>
        <Stack direction="column" gap={2}>
          <TextField
            label="GameBanana URL *"
            fullWidth
            {...form.register("new_challenge.url", FormOptions.UrlRequired)}
            error={errors.new_challenge?.url}
            helperText={errors.new_challenge?.url?.message}
          />
          <TextField
            label="Map Name *"
            fullWidth
            {...form.register("new_challenge.name", FormOptions.Name128Required)}
            error={errors.new_challenge?.name}
            helperText={errors.new_challenge?.name?.message}
          />
          <TextField
            label="Challenge Description"
            fullWidth
            multiline
            minRows={3}
            {...form.register("new_challenge.description")}
            InputLabelProps={{ shrink: true }}
            placeholder="Description of the challenge, if different from a regular deathless run"
          />
        </Stack>
        <Divider sx={{ my: 3 }} />
        <h4>Your Run</h4>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Proof URL *"
              fullWidth
              {...form.register("proof_url", FormOptions.UrlRequired)}
              error={errors.proof_url}
              helperText={errors.proof_url?.message}
            />
            <FormHelperText>
              Upload your proof video to a permanent place, such as YouTube, Bilibili, Twitch Highlight
            </FormHelperText>
          </Grid>
          {suggested_difficulty_id !== null && suggested_difficulty_id < 13 && (
            <Grid item xs={12}>
              <TextField
                label="Raw Session URL *"
                fullWidth
                {...form.register("raw_session_url", FormOptions.UrlRequired)}
                error={errors.raw_session_url}
                helperText={errors.raw_session_url?.message}
              />
              <FormHelperText>
                Raw session recording of the winning run is required for Tier 3+ goldens.
              </FormHelperText>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              label="Player Notes"
              multiline
              fullWidth
              minRows={2}
              {...form.register("player_notes")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel control={<Checkbox />} {...form.register("is_fc")} label="Run is FC" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DifficultySelect
              label="Suggested Difficulty"
              fullWidth
              SelectProps={{ ...form.register("suggested_difficulty_id") }}
              helperText="Please use responsibly, meme suggestions will be removed!"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="contained" fullWidth onClick={onSubmit}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}

/* COMPONENTS */

export function MultiUserSubmissionMapRow({ mapData, index, updateMapDataRow, deleteRow }) {
  const [expanded, setExpanded] = useState(mapData.challenge?.difficulty.id <= 13 ? true : false);

  const lobbyInfo = getMapLobbyInfo(mapData.map);
  const color = lobbyInfo?.major ? lobbyInfo?.major?.color : lobbyInfo?.minor?.color ?? "inherit";
  const border = lobbyInfo?.major || lobbyInfo?.minor ? "20px solid " + color : "none";

  return (
    <>
      <TableRow sx={{ borderLeft: border }}>
        <TableCell width={1} sx={{ pr: 0 }}>
          {index + 1}
        </TableCell>
        <TableCell width={1}>
          <Typography variant="body1" sx={{ whiteSpace: "nowrap" }}>
            {mapData.map.name}
          </Typography>
        </TableCell>
        <TableCell>
          <ChallengeSelect
            map={mapData.map}
            selected={mapData.challenge}
            setSelected={(c) => updateMapDataRow(index, { ...mapData, challenge: c })}
            disabled={mapData.map.challenges.length === 1}
            hideLabel
          />
        </TableCell>
        <TableCell width={1}>
          <FormControlLabel
            control={<Checkbox />}
            checked={mapData.is_fc}
            onChange={(e, v) => updateMapDataRow(index, { ...mapData, is_fc: v })}
            label="Is FC"
            slotProps={{
              typography: {
                sx: {
                  whiteSpace: "nowrap",
                },
              },
            }}
          />
        </TableCell>
        <TableCell width={1}>
          <Button variant="text" onClick={() => setExpanded(!expanded)}>
            {expanded ? <FontAwesomeIcon icon={faChevronDown} /> : <FontAwesomeIcon icon={faChevronLeft} />}
          </Button>
        </TableCell>
      </TableRow>
      <TableRow sx={{ borderBottom: expanded ? "1px solid lightgrey" : "unset" }}>
        <TableCell sx={{ py: expanded ? 1 : 0, borderBottom: "unset" }} colSpan={6}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Table size="small">
              <TableBody>
                <TableRow
                  sx={{
                    "& > *": {
                      borderBottom: "unset",
                    },
                  }}
                >
                  <TableCell colSpan={5}>
                    <TextField
                      label="Player Notes"
                      value={mapData.player_notes}
                      onChange={(e) => updateMapDataRow(index, { ...mapData, player_notes: e.target.value })}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <DifficultySelect
                      label="Suggested Difficulty"
                      fullWidth
                      value={mapData.suggested_difficulty_id}
                      onChange={(e) =>
                        updateMapDataRow(index, { ...mapData, suggested_difficulty_id: e.target.value })
                      }
                    />
                  </TableCell>
                  <TableCell width={1}>
                    <Tooltip title="Remove Map">
                      <IconButton
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setExpanded(false);
                          deleteRow(index);
                        }}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
                {mapData.challenge && mapData.challenge.difficulty.id <= 13 && (
                  <TableRow
                    sx={{
                      "& > *": {
                        borderBottom: "unset",
                      },
                    }}
                  >
                    <TableCell colSpan={7}>
                      <TextField
                        label="Raw Session URL *"
                        value={mapData.raw_session_url}
                        onChange={(e) =>
                          updateMapDataRow(index, { ...mapData, raw_session_url: e.target.value })
                        }
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

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
    return campaign.name + " (by " + campaign.author_gb_name + ")";
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

export function DifficultySelectControlled({ difficultyId, setDifficultyId, ...props }) {
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
      value={difficultyId ?? ""}
      onChange={(e) => setDifficultyId(e.target.value)}
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
