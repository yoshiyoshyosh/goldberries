import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
} from "@mui/material";
import { useMutation, useQuery } from "react-query";
import {
  fetchAllCampaigns,
  fetchAllChallenges,
  fetchAllChallengesInMap,
  fetchAllDifficulties,
  fetchAllMapsInCampaign,
  postSubmission,
} from "../util/api";
import {
  getChallengeName,
  getChallengeFcShort,
  getChallengeObjectiveSuffix,
  getDifficultyName,
  getChallengeFlags,
} from "../util/data_util";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FormOptions, getDifficultyColors } from "../util/constants";
import { useAuth } from "./AuthProvider";
import { useNavigate } from "react-router-dom";

export function PageUserSubmission() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [map, setMap] = useState(null);
  const [challenge, setChallenge] = useState(null);

  const { mutate: submitRun } = useMutation({
    mutationFn: (data) => postSubmission(data),
    onSuccess: (response) => {
      navigate("/submissions/" + response.data.id);
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
    <Container component="main" maxWidth="md">
      <Paper
        elevation={1}
        sx={{
          px: {
            xs: 2,
            sm: 5,
          },
          pb: {
            xs: 2,
            sm: 5,
          },
          pt: 1,
        }}
      >
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
                label="Proof URL*"
                fullWidth
                {...form.register("proof_url", FormOptions.UrlRequired)}
                error={errors.proof_url}
                helperText={errors.proof_url?.message}
              />
              <FormHelperText>
                Upload your proof video to a permanent place, such as YouTube, Billibilli, Twitch Highlight
              </FormHelperText>
            </Grid>
            {challenge !== null && challenge.difficulty.id <= 13 && (
              <Grid item xs={12}>
                <TextField
                  label="Raw Session URL*"
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
      </Paper>
    </Container>
  );
}

export function ChallengeCombinedSelect({ selected, setSelected, isFullGame = false }) {
  const [challenges, setChallenges] = useState([]);
  const query = useQuery({
    queryKey: ["all_challenges", isFullGame],
    queryFn: () => fetchAllChallenges(isFullGame),
    onSuccess: (data) => {
      setChallenges(data.data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getOptionLabel = (challenge) => {
    return getChallengeName(challenge.map.campaign, challenge.map, challenge);
  };

  return (
    <Autocomplete
      fullWidth
      getOptionKey={(challenge) => challenge.id}
      getOptionLabel={getOptionLabel}
      options={challenges}
      // groupBy={(challenge) =>
      //   challenge.map.campaign.name !== challenge.map.name ? challenge.map.campaign.name : "Standalone"
      // }
      disableListWrap
      value={selected}
      onChange={(event, newValue) => {
        setSelected(newValue);
      }}
      renderInput={(params) => <TextField {...params} label="Challenge" />}
      renderOption={(props, challenge) => {
        return (
          <Stack direction="row" gap={1} {...props}>
            <b>{challenge.map.campaign.name}:</b> {" " + challenge.map.name} {getChallengeFcShort(challenge)}
          </Stack>
        );
      }}
    />
  );
}

export function CampaignSelect({ selected, setSelected }) {
  const [campaigns, setCampaigns] = useState([]);
  const query = useQuery({
    queryKey: ["all_campaigns"],
    queryFn: () => fetchAllCampaigns(),
    onSuccess: (data) => {
      setCampaigns(data.data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (query.data) {
      setCampaigns(query.data.data);
    }
  }, []);

  const getOptionLabel = (campaign) => {
    return campaign.name + " (by " + campaign.author_gb_name + ")";
  };

  return (
    <Autocomplete
      fullWidth
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

export function MapSelect({ campaign, selected, setSelected }) {
  const [maps, setMaps] = useState([]);
  const query = useQuery({
    queryKey: ["all_maps", campaign.id],
    queryFn: () => fetchAllMapsInCampaign(campaign.id),
    onSuccess: (data) => {
      setMaps(data.data.maps);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (campaign) {
      setMaps(campaign.maps);
    }
  }, [campaign]);

  const getOptionLabel = (map) => {
    return map.name;
  };

  return (
    <Autocomplete
      fullWidth
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

export function ChallengeSelect({ campaign, map, selected, setSelected }) {
  const keyFullGame = campaign === undefined ? "campaign" : "map";
  const targetId = campaign === undefined ? map.id : campaign.id;
  const query = useQuery({
    queryKey: ["all_challenges", keyFullGame, targetId],
    queryFn: () => fetchAllChallengesInMap(targetId),
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const challenges = query.data?.data?.challenges ?? [];
  console.log("Challenges in ChallengeSelect:", challenges, query.data);

  const getOptionLabel = (challenge) => {
    return getChallengeName(challenge);
  };

  return (
    <Autocomplete
      fullWidth
      getOptionKey={(challenge) => challenge.id}
      getOptionLabel={getOptionLabel}
      options={challenges}
      disableListWrap
      value={selected}
      onChange={(event, newValue) => {
        setSelected(newValue);
      }}
      renderInput={(params) => <TextField {...params} label="Challenge" />}
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

export function DifficultySelect(props) {
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

function DifficultyChip({ difficulty, prefix = "" }) {
  const colors = getDifficultyColors(difficulty.id);
  return (
    <Chip label={prefix + getDifficultyName(difficulty)} size="small" sx={{ bgcolor: colors.group_color }} />
  );
}
