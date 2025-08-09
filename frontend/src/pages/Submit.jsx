import {
  Button,
  Checkbox,
  Chip,
  Collapse,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
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
import { useQuery } from "react-query";
import { fetchChallenge } from "../util/api";
import { durationToSeconds, getChallengeIsArbitrary, getMapLobbyInfo } from "../util/data_util";
import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { DIFF_CONSTS, FormOptions, difficultyIdToSort } from "../util/constants";
import { useAuth } from "../hooks/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  ProofEmbed,
  StyledLink,
  TooltipInfoButton,
} from "../components/BasicComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronLeft,
  faInfoCircle,
  faTents,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  CampaignSelect,
  MapSelect,
  ChallengeSelect,
  PlayerSelect,
  PlayerChip,
  CampaignChallengeSelect,
  DateAchievedTimePicker,
  DifficultySelectControlled,
} from "../components/GoldberriesComponents";
import { usePostPlayer, usePostSubmission } from "../hooks/useApi";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { Trans, useTranslation } from "react-i18next";
import { FullChallengeDisplay } from "./Submission";
import { DateTimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { CharsCountLabel } from "./Suggestions";
import { useTheme } from "@emotion/react";
import { getCollectibleOptions, getCollectibleVariantOptions } from "../components/forms/Map";
import { StringListEditor } from "../components/StringListEditor";
import { NOTIFICATIONS, hasFlag } from "./Account";
import { DifficultyFracGrid } from "../components/forms/Submission";

export function PageSubmit() {
  const { t } = useTranslation(undefined, { keyPrefix: "submit" });
  const { tab, challengeId } = useParams();
  const [selectedTab, setSelectedTab] = useState(tab ?? "single-challenge");
  const navigate = useNavigate();

  const setTab = (tab) => {
    setSelectedTab(tab);
    if (tab === "single-challenge") {
      navigate("/submit", { replace: true });
    } else {
      navigate(`/submit/${tab}`, { replace: true });
    }
  };

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
          onChange={(event, newValue) => setTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t("tabs.single.label")} value="single-challenge" />
          <Tab label={t("tabs.multi.label")} value="multi-challenge" />
          <Tab label={t("tabs.new.label")} value="new-challenge" />
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
      <HeadTitle title={t("title")} />
      <Tabs
        value={selectedTab}
        onChange={(event, newValue) => setTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label={t("tabs.single.label")} value="single-challenge" />
        <Tab label={t("tabs.multi.label")} value="multi-challenge" />
        <Tab label={t("tabs.new.label")} value="new-challenge" />
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
  const { t } = useTranslation(undefined, { keyPrefix: "submit.tabs.single" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const { t: t_fs } = useTranslation(undefined, { keyPrefix: "forms.submission" });
  const { t: t_a } = useTranslation(undefined);
  const auth = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(defaultCampaign ?? null);
  const [map, setMap] = useState(defaultMap ?? null);
  const [challenge, setChallenge] = useState(defaultChallenge ?? null);
  const [selectedPlayer, setSelectedPlayer] = useState(auth.user?.player ?? null);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [showEmbed, setShowEmbed] = useState(false);

  const { mutateAsync: postPlayer } = usePostPlayer();

  const { mutate: submitRun } = usePostSubmission((submission) => {
    navigate("/submission/" + submission.id);
  });

  //Form props
  const form = useForm({
    defaultValues: {
      proof_url: "",
      raw_session_url: "",
      player_notes: "",
      is_fc: false,
      suggested_difficulty_id: null,
      frac: 50,
      is_personal: false,
      time_taken: "",
      date_achieved: new Date().toISOString(),
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    submitRun({
      challenge_id: challenge.id,
      player_id: selectedPlayer.id,
      ...data,
      time_taken: durationToSeconds(data.time_taken),
    });
  });
  const errors = form.formState.errors;
  const proof_url = form.watch("proof_url");
  const raw_session_url = form.watch("raw_session_url");
  const suggested_difficulty_id = form.watch("suggested_difficulty_id");
  const sameUrl = proof_url === raw_session_url && raw_session_url !== "";
  const needsRawSession =
    challenge !== null && challenge.difficulty.sort >= DIFF_CONSTS.RAW_SESSION_REQUIRED_SORT;

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

  const addPlayer = () => {
    if (isAddingPlayer) {
      if (newPlayerName !== "") {
        postPlayer({ name: newPlayerName })
          .then((response) => {
            setSelectedPlayer(response.data);
            setIsAddingPlayer(false);
          })
          .catch((e) => {});
      } else {
        setIsAddingPlayer(false);
      }
    } else {
      setIsAddingPlayer(true);
    }
  };

  return (
    <>
      <h1 style={{ marginBottom: "0" }}>{t("header")}</h1>
      <Stack gap={2}>
        <h4 style={{ marginBottom: "0" }}>{t("select")}</h4>
        <CampaignSelect selected={campaign} setSelected={onCampaignSelect} />
        {campaign && (
          <>
            <MapSelect campaign={campaign} selected={map} setSelected={onMapSelect} />
          </>
        )}
        {map && <ChallengeSelect map={map} selected={challenge} setSelected={onChallengeSelect} />}
        {campaign && map === null && campaign.challenges?.length > 0 && (
          <>
            <Divider>
              <Chip label={t("full_game")} size="small" />
            </Divider>
            <CampaignChallengeSelect
              campaign={campaign}
              selected={challenge}
              setSelected={onChallengeSelect}
            />
          </>
        )}
      </Stack>
      {challenge && (
        <>
          <h4>{t("challenge_data")}</h4>
          <FullChallengeDisplay challenge={challenge} map={map} campaign={campaign} hideMap showObjective />
        </>
      )}
      <Divider sx={{ my: 3 }} />
      <h4>{t("your_run")}</h4>
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {auth.hasHelperPriv ? (
              <PlayerSelect
                type="all"
                label={t("verifier.player_select")}
                value={selectedPlayer}
                onChange={(e, v) => setSelectedPlayer(v)}
              />
            ) : (
              <PlayerChip player={selectedPlayer} />
            )}
          </Grid>
          {auth.hasHelperPriv && (
            <Grid item xs={12} sm={6}>
              <Stack direction="row" gap={1} alignItems="center" sx={{ height: "100%" }}>
                {isAddingPlayer && (
                  <TextField
                    label={t("verifier.new_player_name")}
                    fullWidth
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                  />
                )}
                <Button
                  variant={isAddingPlayer ? "contained" : "outlined"}
                  color={isAddingPlayer && newPlayerName.length < 3 ? "error" : "primary"}
                  onClick={addPlayer}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {t(
                    isAddingPlayer && newPlayerName.length < 3
                      ? "verifier.buttons.cancel"
                      : "verifier.buttons.add_player"
                  )}
                </Button>
              </Stack>
            </Grid>
          )}
          <Grid item xs>
            <TextField
              label={t_fs("proof_url") + " *"}
              fullWidth
              {...form.register("proof_url", { validate: validateUrl })}
              error={errors.proof_url}
              helperText={
                errors.proof_url?.message ? (
                  <Trans
                    t={t_ff}
                    i18nKey={"submission_url." + errors.proof_url?.message}
                    components={{ CustomLink: <StyledLink /> }}
                  />
                ) : null
              }
            />
          </Grid>
          <Grid item xs="auto" display="flex">
            <Button
              variant="outlined"
              onClick={() => setShowEmbed(!showEmbed)}
              sx={{ alignSelf: "stretch" }}
              disabled={proof_url === ""}
              color={showEmbed ? "success" : "primary"}
              fullWidth
            >
              {t(showEmbed ? "hide_embed" : "test_embed")}
            </Button>
          </Grid>
          <Grid item xs={12} sx={{ "&&": { pt: 0 } }}>
            <FormHelperText>{t("proof_note")}</FormHelperText>
          </Grid>
          {showEmbed && (
            <Grid item xs={12} sx={{ "&&": { pt: 1 } }}>
              <ProofEmbed url={form.watch("proof_url")} />
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              label={t_fs("raw_session_url") + (needsRawSession ? " *" : " (Optional)")}
              fullWidth
              {...form.register("raw_session_url", {
                validate: needsRawSession ? validateUrl : validateUrlNotRequired,
              })}
              error={errors.raw_session_url}
              helperText={
                errors.raw_session_url?.message ? (
                  <Trans
                    t={t_ff}
                    i18nKey={"submission_url." + errors.raw_session_url?.message}
                    components={{ CustomLink: <StyledLink /> }}
                  />
                ) : null
              }
            />
            <FormHelperText>{t("raw_session_note")}</FormHelperText>
            {sameUrl && (
              <Typography variant="caption" color="error">
                {t("raw_session_same_url_info")}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t_fs("player_notes")}
              multiline
              fullWidth
              minRows={2}
              {...form.register("player_notes")}
            />
            <CharsCountLabel text={form.watch("player_notes")} maxChars={5000} />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Controller
              name="is_fc"
              control={form.control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox />}
                  label={t("is_fc")}
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={challenge === null || challenge.requires_fc || !challenge.has_fc}
                />
              )}
            />
          </Grid>
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
                  label={t_fs("is_personal")}
                  checked={field.value}
                  control={<Checkbox />}
                />
              )}
            />
            <TooltipInfoButton title={t_fs("personal_note")} />
          </Grid>
          <Grid item xs={12} sm={12} sx={{ "&&": { pt: 0 } }}>
            <Controller
              control={form.control}
              name="frac"
              render={({ field }) => (
                <DifficultyFracGrid
                  value={field.value}
                  onChange={field.onChange}
                  disabled={suggested_difficulty_id === null}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              {...form.register("time_taken", FormOptions.TimeTaken(t_ff))}
              label={t_fs("time_taken")}
              fullWidth
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
              placeholder="(hh:)mm:ss"
              error={!!errors.time_taken}
            />
            {errors.time_taken && (
              <Typography variant="caption" color="error">
                {errors.time_taken.message}
              </Typography>
            )}
          </Grid>
          <Grid item xs>
            <Controller
              control={form.control}
              name="date_achieved"
              render={({ field }) => (
                <DateAchievedTimePicker
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs="auto" display="flex" alignItems="center" justifyContent="center">
            <TooltipInfoButton title={t("date_achieved_note")} />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={onSubmit}
              disabled={challenge === null || selectedPlayer === null}
            >
              {t("button")}
            </Button>
          </Grid>
          <NotificationNotice />
        </Grid>
      </form>
    </>
  );
}

export function MultiUserSubmission() {
  const { t } = useTranslation(undefined, { keyPrefix: "submit.tabs.multi" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const { t: t_fs } = useTranslation(undefined, { keyPrefix: "forms.submission" });
  const { t: t_ts } = useTranslation(undefined, { keyPrefix: "submit.tabs.single" });
  const { t: t_a } = useTranslation(undefined);
  const auth = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [sortMajorIndex, setSortMajorIndex] = useState(null);
  const [sortMinorIndex, setSortMinorIndex] = useState(null);
  const [preferFc, setPreferFc] = useState(false);
  const [multiVideo, setMultiVideo] = useState(false);
  const [mapDataList, setMapDataList] = useState([]); // [{map: map, challenge: challenge, is_fc: false, player_notes: "", suggested_difficulty_id: null}]
  const [selectedPlayer, setSelectedPlayer] = useState(auth.user?.player ?? null);
  const [showEmbed, setShowEmbed] = useState(false);

  const { mutateAsync: submitRun } = usePostSubmission();

  //Form props
  const form = useForm({
    defaultValues: {
      proof_url: "",
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    //Check if all individually attached videos are valid
    // const hasAllIndividualVideos = mapDataList.every(
    //   (mapData) => validateUrlNotRequired(mapData.proof_url) === true
    // );
    //count how many are invalid:
    const invalidUrls = mapDataList.filter((mapData) => validateUrlNotRequired(mapData.proof_url) !== true);
    if (invalidUrls.length > 0) {
      toast.error(t("feedback.invalid_urls", { count: invalidUrls.length }));
      return;
    }

    const toastId = toast.loading(t("feedback.submitting", { current: 0, total: mapDataList.length }), {
      autoClose: false,
    });

    const addRunRecursive = (index) => {
      if (index >= mapDataList.length) {
        toast.update(toastId, {
          render: t("feedback.submitted"),
          isLoading: false,
          type: "success",
          autoClose: 10000,
          closeOnClick: true,
        });
        return;
      }
      const mapData = mapDataList[index];
      const timeTakenFormatted = durationToSeconds(mapData.time_taken);
      submitRun({
        challenge_id: mapData.challenge.id,
        player_id: selectedPlayer.id,
        is_fc: mapData.is_fc,
        player_notes: mapData.player_notes,
        raw_session_url: mapData.raw_session_url,
        suggested_difficulty_id: mapData.suggested_difficulty_id,
        proof_url: mapData.proof_url !== "" ? mapData.proof_url : data.proof_url,
        date_achieved: mapData.date_achieved,
        time_taken: timeTakenFormatted,
      })
        .then(() => {
          toast.update(toastId, {
            render: t("feedback.submitting", { current: index + 1, total: mapDataList.length }),
          });
          addRunRecursive(index + 1);
        })
        .catch((e) => {
          //Skip ahead to next submission
          addRunRecursive(index + 1);
        });
    };

    addRunRecursive(0);
  });
  const errors = form.formState.errors;
  const proof_url = form.watch("proof_url");

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
    setSortMajorIndex(null);
    setSortMinorIndex(null);
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
          //If challenge wasnt found
          if (challenge === undefined) {
            //Find first challenge that isn't arbitrary
            challenge = map.challenges.find((c) => getChallengeIsArbitrary(c) === false);
          }
        }
        map.campaign = campaign;
        mapDataList.push({
          map: map,
          challenge: challenge,
          is_fc: challenge.requires_fc || (preferFc && challenge.has_fc),
          player_notes: "",
          raw_session_url: "",
          proof_url: "",
          suggested_difficulty_id: null,
          date_achieved: new Date().toISOString(),
          time_taken: "",
        });
      });
    }
    setMapDataList(mapDataList);
  };

  const updateMapDataRow = useCallback((index, data) => {
    //Check if the challenge is FC or regular C, and set is_fc accordingly
    if (data.challenge !== null) {
      if (data.challenge.requires_fc) {
        data.is_fc = true;
      } else if (data.challenge.has_fc && preferFc) {
        data.is_fc = true;
      } else if (!data.challenge.has_fc && !data.challenge.requires_fc) {
        data.is_fc = false;
      }
    }
    setMapDataList((mapDataList) => {
      mapDataList[index] = data;
      return [...mapDataList];
    });
  }, []);
  const deleteRow = useCallback((index) => {
    setMapDataList((mapDataList) => {
      mapDataList.splice(index, 1);
      return [...mapDataList];
    });
  }, []);

  useEffect(() => {
    resetMapDataList();
  }, [campaign, sortMajorIndex, sortMinorIndex, preferFc]);

  const hasSortMajor = campaign !== null && campaign.sort_major_name !== null;
  const hasSortMinor = campaign !== null && campaign.sort_minor_name !== null;

  let hasAllIndividualVideos = mapDataList.every((mapData) => mapData.proof_url !== "");
  let submittable =
    campaign !== null && mapDataList.length > 0 && (form.watch("proof_url") !== "" || hasAllIndividualVideos);
  let rawSessionsGood = true;
  mapDataList.forEach((mapData) => {
    if (
      mapData.challenge &&
      mapData.challenge.difficulty.sort >= DIFF_CONSTS.RAW_SESSION_REQUIRED_SORT &&
      mapData.raw_session_url === ""
    ) {
      rawSessionsGood = false;
    }
    if (mapData.challenge === null) {
      submittable = false;
    }
  });

  return (
    <>
      <h1 style={{ marginBottom: "0" }}>{t("header")}</h1>
      <Typography variant="body1">{t("info")}</Typography>
      <Stack gap={2}>
        <h4 style={{ marginBottom: "0" }}>{t("select_campaign")}</h4>
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
              <em>{t("all")}</em>
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
              <em>{t("all")}</em>
            </MenuItem>
            {campaign.sort_minor_labels.map((value, index) => (
              <MenuItem key={index} value={index}>
                {value}
              </MenuItem>
            ))}
          </TextField>
        </>
      )}
      <Stack direction="row" alignItems="center" gap={1}>
        <FormControlLabel
          control={<Checkbox />}
          label={t("prefer_fc")}
          checked={preferFc}
          onChange={(e, v) => setPreferFc(v)}
        />
        <Stack direction="row" alignItems="center" gap={0}>
          <FormControlLabel
            control={<Checkbox />}
            label={t("multi_video.label")}
            checked={multiVideo}
            onChange={(e, v) => setMultiVideo(v)}
          />
          <Tooltip title={t("multi_video.tooltip")}>
            <FontAwesomeIcon icon={faInfoCircle} />
          </Tooltip>
        </Stack>
      </Stack>
      {campaign !== null && (
        <>
          <Divider sx={{ my: 3 }} />
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>{t_g("map", { count: 1 })}</TableCell>
                  <TableCell>{t_g("challenge", { count: 1 })}</TableCell>
                  <TableCell>{t("is_fc")}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mapDataList.map((mapData, index) => {
                  return (
                    <MemoMultiUserSubmissionMapRow
                      key={mapData.map.id}
                      mapData={mapData}
                      index={index}
                      updateMapDataRow={updateMapDataRow}
                      deleteRow={deleteRow}
                      multiVideo={multiVideo}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      <Divider sx={{ my: 3 }} />
      <h4>{t("compilation_video")}</h4>
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {auth.hasHelperPriv ? (
              <PlayerSelect
                type="all"
                label={t_ts("verifier.player_select")}
                value={selectedPlayer}
                onChange={(e, v) => setSelectedPlayer(v)}
              />
            ) : (
              <PlayerChip player={selectedPlayer} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}></Grid>
          <Grid item xs>
            <TextField
              label={t_fs("proof_url") + (hasAllIndividualVideos ? "" : " *")}
              fullWidth
              {...form.register("proof_url", { validate: validateUrlNotRequired })}
              error={errors.proof_url}
              disabled={hasAllIndividualVideos}
              helperText={
                errors.proof_url?.message ? (
                  <Trans
                    t={t_ff}
                    i18nKey={"submission_url." + errors.proof_url?.message}
                    components={{ CustomLink: <StyledLink /> }}
                  />
                ) : null
              }
            />
          </Grid>
          <Grid item xs="auto" display="flex">
            <Button
              variant="outlined"
              onClick={() => setShowEmbed(!showEmbed)}
              sx={{ alignSelf: "stretch" }}
              disabled={proof_url === ""}
              color={showEmbed ? "success" : "primary"}
              fullWidth
            >
              {t_ts(showEmbed ? "hide_embed" : "test_embed")}
            </Button>
          </Grid>
          <Grid item xs={12} sx={{ "&&": { pt: 0 } }}>
            <FormHelperText>{t_ts("proof_note")}</FormHelperText>
          </Grid>
          {showEmbed && (
            <Grid item xs={12} sx={{ "&&": { pt: 1 } }}>
              <ProofEmbed url={form.watch("proof_url")} />
            </Grid>
          )}
          <Grid item xs={12} sm={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={onSubmit}
              disabled={!submittable || !rawSessionsGood}
            >
              {t("button", { count: mapDataList.length })}
            </Button>
          </Grid>
          {!rawSessionsGood && (
            <Grid item xs={12}>
              <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                {t_ts("raw_session_note")}
              </Typography>
            </Grid>
          )}
          <NotificationNotice />
        </Grid>
      </form>
    </>
  );
}

export function NewChallengeUserSubmission({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "submit.tabs.new" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const { t: t_fs } = useTranslation(undefined, { keyPrefix: "forms.submission" });
  const { t: t_fm } = useTranslation(undefined, { keyPrefix: "forms.map" });
  const { t: t_ts } = useTranslation(undefined, { keyPrefix: "submit.tabs.single" });
  const { t: t_a } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState(auth.user?.player ?? null);
  const [showEmbed, setShowEmbed] = useState(false);

  const { mutate: submitRun } = usePostSubmission((submission) => {
    navigate("/submission/" + submission.id);
  });

  //Form props
  const form = useForm({
    defaultValues: {
      new_challenge: {
        url: "",
        name: "",
        description: "",
        collectibles: null,
        golden_changes: "",
      },
      proof_url: "",
      raw_session_url: "",
      player_notes: "",
      is_fc: false,
      suggested_difficulty_id: null,
      frac: 50,
      is_personal: false,
      time_taken: "",
      date_achieved: new Date().toISOString(),
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    submitRun({
      player_id: selectedPlayer.id,
      ...data,
      time_taken: durationToSeconds(data.time_taken),
    });
  });
  const errors = form.formState.errors;
  const suggested_difficulty_id = form.watch("suggested_difficulty_id");
  const proof_url = form.watch("proof_url");
  const raw_session_url = form.watch("raw_session_url");
  const needsRawSession =
    suggested_difficulty_id !== null &&
    difficultyIdToSort(suggested_difficulty_id) >= DIFF_CONSTS.RAW_SESSION_REQUIRED_SORT;
  const sameUrl = proof_url === raw_session_url && raw_session_url !== "";

  return (
    <>
      <h1 style={{ marginBottom: "0" }}>{t("header")}</h1>
      <form>
        <Typography variant="body1">{t("info")}</Typography>
        <h4>{t("challenge_data")}</h4>
        <Stack direction="column" gap={2}>
          <TextField
            label={t("gamebanana_url") + " *"}
            fullWidth
            {...form.register("new_challenge.url", FormOptions.UrlRequired(t_ff))}
            error={errors.new_challenge?.url}
            helperText={errors.new_challenge?.url?.message}
          />
          <TextField
            label={t_a("forms.create_full_challenge.map_name") + " *"}
            fullWidth
            {...form.register("new_challenge.name", FormOptions.Name128Required(t_ff))}
            error={errors.new_challenge?.name}
            helperText={errors.new_challenge?.name?.message}
          />
          <TextField
            label={t("challenge_description.label")}
            fullWidth
            multiline
            minRows={3}
            {...form.register("new_challenge.description")}
            InputLabelProps={{ shrink: true }}
            placeholder={t("challenge_description.placeholder")}
          />
          <TextField
            label={t("golden_changes.label")}
            fullWidth
            multiline
            minRows={2}
            {...form.register("new_challenge.golden_changes")}
            InputLabelProps={{ shrink: true }}
            placeholder={t("golden_changes.placeholder")}
          />
          <Controller
            control={form.control}
            name="new_challenge.collectibles"
            render={({ field }) => (
              <StringListEditor
                label={t_fm("collectibles.label")}
                valueTypes={[
                  {
                    type: "enum",
                    options: getCollectibleOptions(),
                  },
                  { type: "enum", options: (item, index, value) => getCollectibleVariantOptions(item[0]) },
                  { type: "string", multiline: true },
                  { type: "string" },
                  { type: "string" },
                ]}
                valueLabels={[
                  t_fm("collectibles.label"),
                  t_fm("collectibles.variant"),
                  t_fm("collectibles.note"),
                  t_fm("collectibles.count"),
                  t_fm("collectibles.global_count"),
                ]}
                list={field.value}
                setList={field.onChange}
                valueCount={5}
                reorderable
                inline={[6, 6, 12, 6, 6]}
              />
            )}
          />
        </Stack>
        <Divider sx={{ my: 3 }} />
        <h4>{t_ts("your_run")}</h4>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {auth.hasHelperPriv ? (
              <PlayerSelect
                type="all"
                label={t_ts("verifier.player_select")}
                value={selectedPlayer}
                onChange={(e, v) => setSelectedPlayer(v)}
              />
            ) : (
              <PlayerChip player={selectedPlayer} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}></Grid>
          <Grid item xs>
            <TextField
              label={t_fs("proof_url") + " *"}
              fullWidth
              {...form.register("proof_url", { validate: validateUrl })}
              error={errors.proof_url}
              helperText={
                errors.proof_url?.message ? (
                  <Trans
                    t={t_ff}
                    i18nKey={"submission_url." + errors.proof_url?.message}
                    components={{ CustomLink: <StyledLink /> }}
                  />
                ) : null
              }
            />
          </Grid>
          <Grid item xs="auto" display="flex">
            <Button
              variant="outlined"
              onClick={() => setShowEmbed(!showEmbed)}
              sx={{ alignSelf: "stretch" }}
              disabled={proof_url === ""}
              color={showEmbed ? "success" : "primary"}
              fullWidth
            >
              {t_ts(showEmbed ? "hide_embed" : "test_embed")}
            </Button>
          </Grid>
          <Grid item xs={12} sx={{ "&&": { pt: 0 } }}>
            <FormHelperText>{t_ts("proof_note")}</FormHelperText>
          </Grid>
          {showEmbed && (
            <Grid item xs={12} sx={{ "&&": { pt: 1 } }}>
              <ProofEmbed url={form.watch("proof_url")} />
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              label={t_fs("raw_session_url") + (needsRawSession ? " *" : " (Optional)")}
              fullWidth
              {...form.register("raw_session_url", {
                validate: needsRawSession ? validateUrl : validateUrlNotRequired,
              })}
              error={errors.raw_session_url}
              helperText={
                errors.raw_session_url?.message ? (
                  <Trans
                    t={t_ff}
                    i18nKey={"submission_url." + errors.raw_session_url?.message}
                    components={{ CustomLink: <StyledLink /> }}
                  />
                ) : null
              }
            />
            <FormHelperText>{t_ts("raw_session_note")}</FormHelperText>
            {sameUrl && (
              <Typography variant="caption" color="error">
                {t_ts("raw_session_same_url_info")}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t_fs("player_notes")}
              multiline
              fullWidth
              minRows={2}
              {...form.register("player_notes")}
            />
            <CharsCountLabel text={form.watch("player_notes")} maxChars={5000} />
          </Grid>
          <Grid item xs={12} sm={12}>
            <FormControlLabel control={<Checkbox />} {...form.register("is_fc")} label={t_ts("is_fc")} />
          </Grid>
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
                  label={t_fs("is_personal")}
                  checked={field.value}
                  control={<Checkbox />}
                />
              )}
            />
            <TooltipInfoButton title={t_fs("personal_note")} />
          </Grid>
          <Grid item xs={12} sm={12} sx={{ "&&": { pt: 0 } }}>
            <Controller
              control={form.control}
              name="frac"
              render={({ field }) => (
                <DifficultyFracGrid
                  value={field.value}
                  onChange={field.onChange}
                  disabled={suggested_difficulty_id === null}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              {...form.register("time_taken", FormOptions.TimeTaken(t_ff))}
              label={t_fs("time_taken")}
              fullWidth
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
              placeholder="(hh:)mm:ss"
              error={!!errors.time_taken}
            />
            {errors.time_taken && (
              <Typography variant="caption" color="error">
                {errors.time_taken.message}
              </Typography>
            )}
          </Grid>
          <Grid item xs>
            <Controller
              control={form.control}
              name="date_achieved"
              render={({ field }) => (
                <DateAchievedTimePicker
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs="auto" display="flex" alignItems="center" justifyContent="center">
            <TooltipInfoButton title={t_ts("date_achieved_note")} />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Button variant="contained" fullWidth onClick={onSubmit}>
              {t("button")}
            </Button>
          </Grid>
          <NotificationNotice />
        </Grid>
      </form>
    </>
  );
}

/* COMPONENTS */

export function MultiUserSubmissionMapRow({
  mapData,
  multiVideo = false,
  index,
  updateMapDataRow,
  deleteRow,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "submit.tabs.multi" });
  const { t: t_fs } = useTranslation(undefined, { keyPrefix: "forms.submission" });
  const { t: t_a } = useTranslation(undefined);
  const { settings } = useAppSettings();
  const darkmode = settings.visual.darkmode;
  const [expanded, setExpanded] = useState(
    mapData.challenge?.difficulty.sort >= DIFF_CONSTS.RAW_SESSION_REQUIRED_SORT ? true : false || multiVideo
  );

  useEffect(() => {
    if (multiVideo) setExpanded(true);
  }, [multiVideo]);

  const lobbyInfo = getMapLobbyInfo(mapData.map);
  const color = lobbyInfo?.major ? lobbyInfo?.major?.color : lobbyInfo?.minor?.color ?? "inherit";
  const border = lobbyInfo?.major || lobbyInfo?.minor ? "20px solid " + color : "none";

  const needsRawSession =
    mapData.challenge && mapData.challenge.difficulty.sort >= DIFF_CONSTS.RAW_SESSION_REQUIRED_SORT;
  const hasRawSession = mapData.raw_session_url !== "" && mapData.raw_session_url !== null;
  const bgColor = needsRawSession && !hasRawSession ? (darkmode ? "#4a0000" : "#ffe7e7") : "inherit";

  const validTimeTaken = mapData.time_taken === "" || durationToSeconds(mapData.time_taken) !== null;

  return (
    <>
      <TableRow sx={{ borderLeft: border, bgcolor: bgColor }}>
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
            disabled={
              mapData.challenge === null || mapData.challenge.requires_fc || !mapData.challenge.has_fc
            }
            onChange={(e, v) => updateMapDataRow(index, { ...mapData, is_fc: v })}
            label={t_fs("is_fc")}
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
      <TableRow
        sx={{
          borderBottom: expanded ? "1px solid lightgrey" : "unset",
          display: expanded ? "table-row" : "none",
          bgcolor: bgColor,
        }}
      >
        <TableCell sx={{ py: expanded ? 1 : 0, borderBottom: "unset" }} colSpan={6}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Table size="small">
              <TableBody>
                {multiVideo && (
                  <TableRow
                    sx={{
                      "& > *": {
                        borderBottom: "unset",
                      },
                    }}
                  >
                    <TableCell colSpan={7}>
                      <TextField
                        label={t_fs("proof_url")}
                        value={mapData.proof_url}
                        onChange={(e) => updateMapDataRow(index, { ...mapData, proof_url: e.target.value })}
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                )}
                <TableRow
                  sx={{
                    "& > *": {
                      borderBottom: "unset",
                    },
                  }}
                >
                  <TableCell colSpan={5}>
                    <TextField
                      label={t_fs("player_notes")}
                      value={mapData.player_notes}
                      onChange={(e) => updateMapDataRow(index, { ...mapData, player_notes: e.target.value })}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <DifficultySelectControlled
                      label={t_a("components.difficulty_select.label")}
                      difficultyId={mapData.suggested_difficulty_id}
                      setDifficultyId={(id) =>
                        updateMapDataRow(index, { ...mapData, suggested_difficulty_id: id })
                      }
                      isSuggestion
                      fullWidth
                    />
                  </TableCell>
                  <TableCell width={1}>
                    <Tooltip title={t("remove_map")}>
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
                <TableRow
                  sx={{
                    "& > *": {
                      borderBottom: "unset",
                    },
                  }}
                >
                  <TableCell colSpan={99}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <DateAchievedTimePicker
                          value={mapData.date_achieved}
                          onChange={(value) => {
                            updateMapDataRow(index, { ...mapData, date_achieved: value });
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          value={mapData.time_taken}
                          onChange={(e) =>
                            updateMapDataRow(index, { ...mapData, time_taken: e.target.value })
                          }
                          label={t_fs("time_taken")}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          placeholder="(hh:)mm:ss"
                          error={!validTimeTaken}
                        />
                      </Grid>
                    </Grid>
                  </TableCell>
                </TableRow>
                {mapData.challenge &&
                  mapData.challenge.difficulty.sort >= DIFF_CONSTS.RAW_SESSION_REQUIRED_SORT && (
                    <TableRow
                      sx={{
                        "& > *": {
                          borderBottom: "unset",
                        },
                      }}
                    >
                      <TableCell colSpan={7}>
                        <TextField
                          label={t_fs("raw_session_url") + " *"}
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
const MemoMultiUserSubmissionMapRow = memo(MultiUserSubmissionMapRow, (prevProps, newProps) => {
  const propsEqual =
    prevProps.mapData.map.id === newProps.mapData.map.id &&
    prevProps.mapData.challenge?.id === newProps.mapData.challenge?.id &&
    prevProps.mapData.is_fc === newProps.mapData.is_fc &&
    prevProps.mapData.player_notes === newProps.mapData.player_notes &&
    prevProps.mapData.suggested_difficulty_id === newProps.mapData.suggested_difficulty_id &&
    prevProps.mapData.raw_session_url === newProps.mapData.raw_session_url &&
    prevProps.mapData.proof_url === newProps.mapData.proof_url &&
    prevProps.mapData.date_achieved === newProps.mapData.date_achieved &&
    prevProps.mapData.time_taken === newProps.mapData.time_taken &&
    prevProps.multiVideo === newProps.multiVideo &&
    prevProps.index === newProps.index;

  // console.log("ListItem propsEqual:", propsEqual);
  return propsEqual;
});

function NotificationNotice({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "submit.notifications" });
  const auth = useAuth();
  const hasDiscord = auth.user?.discord_id !== null;
  const notifsEnabled = hasDiscord && hasFlag(auth.user.notifications, NOTIFICATIONS.sub_verified.flag);
  return (
    <>
      {(notifsEnabled || true) && (
        <Grid item xs={12} sm={12}>
          <Typography variant="caption" color="textSecondary">
            {t("your_settings")}{" "}
          </Typography>
          <Typography variant="caption" color={notifsEnabled ? "success.main" : "error.main"}>
            {t(notifsEnabled ? "enabled" : "disabled")}
          </Typography>
        </Grid>
      )}
    </>
  );
}

const disallowedUrls = ["discord.com", "imgur.com"];
const disallowedVariantUrls = ["youtube.com/playlist", "youtube.com/live/", "b23.tv/", "space.bilibili.com/"];
//Returns the translation key for the error message, or true if the URL is valid
function validateUrl(url, required = true) {
  //Trim url
  url = url.trim();

  //Check if the URL is empty
  if (url === "") {
    if (required) {
      return "required";
    } else {
      return true;
    }
  }

  //Check if the URL is a valid URL
  try {
    new URL(url);
  } catch (e) {
    return "invalid";
  }

  //Check if the URL contains disallowed strings
  if (disallowedUrls.some((disallowed) => url.includes(disallowed))) {
    return "disallowed";
  }
  if (disallowedVariantUrls.some((disallowed) => url.includes(disallowed))) {
    return "disallowed_variant";
  }

  return true;
}

function validateUrlNotRequired(url) {
  console.log("validateUrlNotRequired", url);
  return validateUrl(url, false);
}
