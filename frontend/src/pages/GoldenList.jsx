import {
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { memo, useCallback, useEffect, useState } from "react";
import "../css/GoldenList.css";
import {
  BasicBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledExternalLink,
} from "../components/BasicComponents";
import {
  getChallengeSuffix,
  getDifficultyName,
  getMapName,
  getPlayerNameColorStyle,
} from "../util/data_util";
import { getQueryData, useGetGoldenList } from "../hooks/useApi";
import {
  CampaignIcon,
  ChallengeFcIcon,
  DifficultyChip,
  SubmissionFcIcon,
} from "../components/GoldberriesComponents";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getNewDifficultyColors } from "../util/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faLemon } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@emotion/react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { useTranslation } from "react-i18next";

export function PageGoldenList({}) {
  const { t } = useTranslation(undefined, { keyPrefix: "golden_list" });
  const { type } = useParams();
  const navigate = useNavigate();
  const [showArchived, setShowArchived] = useLocalStorage("golden_list_show_archived", false);
  const [showArbitrary, setShowArbitrary] = useLocalStorage("golden_list_show_arbitrary", false);
  const [selectedType, setSelectedType] = useState(type ?? "hard");
  const title = selectedType === "hard" ? t("hard") : selectedType === "all" ? t("all") : t("standard");

  const onChangeType = (type) => {
    if (type === "hard") {
      navigate("/campaign-list", { replace: true });
    } else {
      navigate("/campaign-list/" + type, { replace: true });
    }
    setSelectedType(type);
  };

  return (
    <>
      <Box
        sx={{
          mx: { xs: 1, sm: 2 },
          "&&": {
            mr: {
              xs: 1,
              sm: 3,
            },
          },
        }}
      >
        <HeadTitle title={title} />
        <BasicBox sx={{ pb: 0, mb: 1 }}>
          <Stack direction="column" gap={1}>
            <Typography variant="h4">{t("campaign_list")}</Typography>
            <GoldenListFilter
              type={selectedType}
              setType={onChangeType}
              showArchived={showArchived}
              setShowArchived={setShowArchived}
              showArbitrary={showArbitrary}
              setShowArbitrary={setShowArbitrary}
            />
          </Stack>
        </BasicBox>
        <GoldenList type={selectedType} showArchived={showArchived} showArbitrary={showArbitrary} />
      </Box>
    </>
  );
}

function GoldenListFilter({ type, setType, showArchived, setShowArchived, showArbitrary, setShowArbitrary }) {
  const { t } = useTranslation(undefined, { keyPrefix: "golden_list" });
  return (
    <Stack direction="column" gap={1}>
      <TextField
        label={t("list_type")}
        select
        value={type}
        onChange={(e) => setType(e.target.value)}
        sx={{ mt: 1 }}
        SelectProps={{
          MenuProps: {
            disableScrollLock: true,
          },
        }}
      >
        <MenuItem value="hard">{t("hard")}</MenuItem>
        <MenuItem value="standard">{t("standard")}</MenuItem>
        <MenuItem value="all">{t("all")}</MenuItem>
      </TextField>
      <Stack direction="row" gap={1} alignItems="center">
        <FormControlLabel
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
          control={<Checkbox />}
          label={t("show_archived")}
        />
        <FormControlLabel
          checked={showArbitrary}
          onChange={(e) => setShowArbitrary(e.target.checked)}
          control={<Checkbox />}
          label={t("show_arbitrary")}
        />
      </Stack>
    </Stack>
  );
}

export function GoldenList({ type, id = null, showArchived = false, showArbitrary = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "golden_list" });
  const query = useGetGoldenList(type, id, showArchived, showArbitrary);
  const currentKey = "" + type + id + showArchived + showArbitrary;
  const [renderUpTo, setRenderUpTo] = useState({ key: currentKey, index: 0 });

  const groupSize = 7;
  const renderDelay = 21;

  useEffect(() => {
    setRenderUpTo({ key: currentKey, index: 0 });
  }, [type, id, showArchived, showArbitrary]);

  const onFinishRender = useCallback((index) => {
    if (index === renderUpTo.index) {
      setTimeout(() => {
        setRenderUpTo((prev) => {
          return { key: prev.key, index: prev.index + 1 };
        });
      }, renderDelay);
    }
  });

  if (query.isLoading || query.isFetching) {
    return (
      <BasicBox>
        <LoadingSpinner />
      </BasicBox>
    );
  }

  if (query.isError) {
    return (
      <BasicBox>
        <ErrorDisplay error={query.error} />
      </BasicBox>
    );
  }

  const campaigns = getQueryData(query);
  const totalSubmissionCount = campaigns.reduce(
    (acc, campaign) =>
      acc +
      campaign.maps.reduce(
        (acc, map) => acc + map.challenges.reduce((acc, challenge) => acc + challenge.submissions.length, 0),
        0
      ),
    0
  );

  let lastCampaign = null;
  //Split campaigns into groups of groupSize
  const campaignsGroups = campaigns.reduce((acc, campaign) => {
    if (acc.length === 0 || acc[acc.length - 1].length >= groupSize) {
      acc.push([]);
    }
    acc[acc.length - 1].push(campaign);
    return acc;
  }, []);

  return (
    <Stack direction="column" alignItems="stretch" gap={1.25}>
      <BasicBox>
        <Stack direction="column" gap={1}>
          <Typography variant="body2">
            {t("state.submissions", { count: totalSubmissionCount, campaigns: campaigns.length })}
          </Typography>
          {renderUpTo.index < campaignsGroups.length && (
            <Typography variant="body2">
              {t("state.campaigns", { current: renderUpTo.index * groupSize, total: campaigns.length })}
            </Typography>
          )}
          {renderUpTo.index >= campaignsGroups.length && (
            <Typography variant="body2" color={(theme) => theme.palette.success.main}>
              {t("state.done_loading")} <FontAwesomeIcon icon={faCheckCircle} />
            </Typography>
          )}
        </Stack>
      </BasicBox>
      <BasicBox>
        <Stack direction="column" gap={1}>
          <Stack direction="row" gap={0.5} alignItems="center" flexWrap="wrap">
            {"abcdefghijklm".split("").map((l) => {
              const letter = l.toUpperCase();
              const countCampaigns = campaigns.filter(
                (c) => c.name.toUpperCase().charAt(0) === letter
              ).length;
              return (
                <StyledExternalLink
                  key={letter}
                  href={"#" + letter}
                  target="_self"
                  style={{ textDecoration: "none" }}
                >
                  <BasicBox sx={{ p: 0.5, borderRadius: 0, minWidth: "29px" }}>
                    <Stack direction="column" gap={0} alignItems="center">
                      <span>{letter}</span>
                      <span>{countCampaigns}</span>
                    </Stack>
                  </BasicBox>
                </StyledExternalLink>
              );
            })}
          </Stack>
          <Stack direction="row" gap={0.5} alignItems="center" flexWrap="wrap">
            {"nopqrstuvwxyz".split("").map((l) => {
              const letter = l.toUpperCase();
              const countCampaigns = campaigns.filter(
                (c) => c.name.toUpperCase().charAt(0) === letter
              ).length;
              return (
                <StyledExternalLink
                  key={letter}
                  href={"#" + letter}
                  target="_self"
                  style={{ textDecoration: "none" }}
                >
                  <BasicBox sx={{ p: 0.5, borderRadius: 0, minWidth: "29px" }}>
                    <Stack direction="column" gap={0} alignItems="center">
                      <span>{letter}</span>
                      <span>{countCampaigns}</span>
                    </Stack>
                  </BasicBox>
                </StyledExternalLink>
              );
            })}
          </Stack>
        </Stack>
      </BasicBox>
      {campaignsGroups.map((campaignsGroup, index) => {
        const lastCampaignInPreviousGroup = lastCampaign;
        lastCampaign = campaignsGroup[campaignsGroup.length - 1];
        if (currentKey !== renderUpTo.key) return null;
        return (
          <MemoDynamicRenderCampaignList
            key={type + index}
            index={index}
            campaignsGroup={campaignsGroup}
            type={type}
            lastCampaign={lastCampaignInPreviousGroup}
            render={index <= renderUpTo.index}
            onFinishRender={onFinishRender}
          />
        );
      })}
    </Stack>
  );
}

function DynamicRenderCampaignList({ index, campaignsGroup, type, lastCampaign, render, onFinishRender }) {
  useEffect(() => {
    if (render) {
      onFinishRender(index);
    }
  }, [render]);

  if (!render) {
    return (
      <Stack direction="row" gap={1} alignItems="center">
        <span>({index + 1})</span>
        <LoadingSpinner />
      </Stack>
    );
  }

  // console.log("--- Actually rendering DynamicRenderCampaignList", index);
  let previousCampaign = lastCampaign;

  return (
    <>
      {campaignsGroup.map((campaign) => {
        if (
          previousCampaign === null ||
          previousCampaign.name.toUpperCase().charAt(0) !== campaign.name.toUpperCase().charAt(0)
        ) {
          previousCampaign = campaign;
          const newLetter = campaign.name.charAt(0).toUpperCase();
          return (
            <>
              <LetterDivider key={newLetter} letter={newLetter} />
              <CampaignEntry key={campaign.id} campaign={campaign} type={type} />
            </>
          );
        }
        previousCampaign = campaign;
        return <CampaignEntry key={campaign.id} campaign={campaign} type={type} />;
      })}
    </>
  );
}
const MemoDynamicRenderCampaignList = memo(DynamicRenderCampaignList, (prevProps, newProps) => {
  const isSame = prevProps.index === newProps.index && prevProps.render === newProps.render; //&&
  // prevProps.campaignsGroup.length === newProps.campaignsGroup.length &&
  // prevProps.campaignsGroup.every((c, i) => c.id === newProps.campaignsGroup[i].id);
  return isSame;
});

function CampaignEntry({ campaign, type }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const theme = useTheme();
  const [selectedMapIndex, setSelectedMapIndex] = useState(0);

  return (
    <BasicBox className={"campaign-box" + (theme.palette.mode === "dark" ? " dark" : "")}>
      <Grid container rowSpacing={0} columnSpacing={1}>
        <Grid item xs={12} className="campaign-box-header">
          <Grid container columnGap={1} sx={{ minHeight: "49px" }} wrap="nowrap">
            <Grid
              item
              xs={12}
              md={10}
              display="flex"
              alignItems="center"
              flexWrap={{ xs: "wrap", md: "nowrap" }}
              columnGap={1}
            >
              <CampaignIcon campaign={campaign} />
              <Link
                to={"/campaign/" + campaign.id}
                style={{ color: "inherit", textDecoration: "none", whiteSpace: "nowrap" }}
              >
                <Typography variant="h6">{campaign.name}</Typography>
              </Link>
              {campaign.author_gb_name ? (
                <Link
                  to={"/search/" + campaign.author_gb_name}
                  style={{ color: "inherit", textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  <Typography variant="body2">by {campaign.author_gb_name}</Typography>
                </Link>
              ) : (
                <Typography variant="body2">by {t_g("unknown_author")}</Typography>
              )}
              {campaign.url && (
                <StyledExternalLink href={campaign.url}>
                  <FontAwesomeIcon icon={faLemon} fontSize="1em" />
                </StyledExternalLink>
              )}
              {(campaign.maps.length > 1 || campaign.name !== campaign.maps[0].name) && (
                <MapSelectAlt
                  campaign={campaign}
                  type={type}
                  selectedMap={selectedMapIndex}
                  onSelectMap={setSelectedMapIndex}
                />
              )}
            </Grid>
            {campaign.maps.length > 1 && (
              <Grid
                item
                xs={12}
                md={2}
                display={{ xs: "none", md: "flex" }}
                alignItems="center"
                justifyContent="stretch"
                order={{ xs: 2, md: 3 }}
              >
                <CampaignGoldenDifficultiesBar campaign={campaign} sx={{ flex: "1" }} />
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid container item xs={12} rowSpacing={1} columnSpacing={1} sx={{ pr: 1 }}>
          <Grid item xs={12} sm={12} sx={{ pr: 2 }}>
            {selectedMapIndex !== null && (
              <MapEntry campaign={campaign} map={campaign.maps[selectedMapIndex]} type={type} />
            )}
          </Grid>
        </Grid>
      </Grid>
    </BasicBox>
  );
}

function LetterDivider({ letter }) {
  const theme = useTheme();
  const backgroundColor = theme.palette.mode === "dark" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.75)";
  return (
    <a id={letter}>
      <Divider sx={{ my: 0 }}>
        <Chip label={letter} sx={{ backgroundColor: backgroundColor }} />
      </Divider>
    </a>
  );
}

function MapSelectAlt({ campaign, type, selectedMap, onSelectMap }) {
  return (
    <Tabs
      variant="scrollable"
      value={selectedMap}
      onChange={(e, v) => onSelectMap(v)}
      sx={{ borderBottom: 1, borderColor: "divider" }}
    >
      {campaign.maps.map((map, index) => (
        <Tab key={map.id} label={getMapName(map, campaign, false)} sx={{ textTransform: "none" }} />
      ))}
    </Tabs>
  );
}

function MapEntry({ campaign, map, type }) {
  return (
    <Stack direction="column" spacing={1}>
      {map.challenges.map((challenge, index) => (
        <>
          {index !== 0 ? <Divider key={challenge.id + "div"} /> : null}
          <ChallengeEntry key={challenge.id} challenge={challenge} type={type} />
        </>
      ))}
    </Stack>
  );
}

function ChallengeEntry({ challenge, type }) {
  const s = challenge.submissions.length === 1 ? "" : "s";
  return (
    <Grid container rowSpacing={1} columnSpacing={1}>
      <Grid component={Stack} item xs={12} md={1} direction="row" gap={1}>
        <Stack direction="column" alignItems="stretch" gap={1} width="100%">
          <DifficultyChip difficulty={challenge.difficulty} sx={{ width: "100%", textAlign: "center" }} />
          {getChallengeSuffix(challenge) !== null && (
            <div style={{ textAlign: "center" }}>{getChallengeSuffix(challenge)}</div>
          )}
        </Stack>
      </Grid>
      <Grid component={Stack} item xs={12} md={1} direction="row" gap={1}>
        {/* {getChallengeFcShort(challenge)} */}
        <Stack direction="row" alignItems="center" gap={1} style={{ margin: "auto", marginTop: 0 }}>
          <ChallengeFcIcon challenge={challenge} showClear height="1.3em" />
          <span>{challenge.submissions.length}</span>
        </Stack>
      </Grid>
      <Grid item xs={12} md={getChallengeSuffix(challenge) !== null ? 10 : 10}>
        <Stack direction="row" columnGap={3} rowGap={1} flexWrap="wrap">
          {challenge.submissions.map((submission) => (
            <SubmissionEntry key={submission.id} submission={submission} />
          ))}
        </Stack>
      </Grid>
    </Grid>
  );
}

function SubmissionEntry({ submission }) {
  const { settings } = useAppSettings();
  return (
    <Link className="submission-link" to={"/submission/" + submission.id}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          className="submission-player-name"
          style={{ ...getPlayerNameColorStyle(submission.player, settings) }}
        >
          {submission.player.name}
        </span>
        {/* {submission.is_fc ? <span> [FC]</span> : null} */}
        {submission.is_fc ? (
          <SubmissionFcIcon submission={submission} disableTooltip style={{ marginLeft: "4px" }} />
        ) : null}
      </div>
    </Link>
  );
}

function CampaignGoldenDifficultiesBar({ campaign, sx = {}, ...props }) {
  //First, count all difficulties in all the campaign->maps->challenges
  //difficulty is an object with id, name and sort
  const difficulties = campaign.maps.flatMap((map) =>
    map.challenges.map((challenge) => challenge.difficulty)
  );
  const difficultiesList = difficulties.reduce((acc, difficulty) => {
    const existing = acc.find((d) => d.difficulty.id === difficulty.id);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ difficulty, count: 1 });
    }
    return acc;
  }, []);

  //Then, create a list of all difficulties with their count, sorted by difficulty.sort DESC
  difficultiesList.sort((a, b) => b.difficulty.sort - a.difficulty.sort);

  //Then, render a bar, where all difficulties are shown as bars with their share % of the total as width
  return (
    <Stack
      direction="row"
      gap={0}
      columnGap={0.5}
      alignItems="center"
      className="difficulty-bar"
      sx={sx}
      {...props}
    >
      {difficultiesList.map((diff) => (
        <DifficultyBar
          key={diff.difficulty.id}
          difficulty={diff.difficulty}
          count={diff.count}
          total={difficulties.length}
        />
      ))}
    </Stack>
  );
}
function DifficultyBar({ difficulty, count, total }) {
  const { settings } = useAppSettings();

  const width = (count / total) * 100;
  const colors = getNewDifficultyColors(settings, difficulty.id);
  const name = getDifficultyName(difficulty);
  return (
    <Tooltip title={name}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: width + "%",
          backgroundColor: colors.color,
          color: colors.contrast_color,
        }}
      >
        <span>{count}</span>
      </Box>
    </Tooltip>
  );
}
