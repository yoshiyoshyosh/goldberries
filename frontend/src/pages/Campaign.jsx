import { Link, useNavigate, useParams } from "react-router-dom";
import { getQueryData, useGetCampaign, useGetCampaignView, useGetCampaignViewPlayer } from "../hooks/useApi";
import {
  BasicBox,
  BasicContainerBox,
  BorderedBox,
  ErrorDisplay,
  HeadTitle,
  InfoBox,
  InfoBoxIconTextLine,
  LoadingSpinner,
  StyledExternalLink,
  StyledLink,
} from "../components/BasicComponents";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
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
  Typography,
  useMediaQuery,
} from "@mui/material";
import { TopGoldenList } from "../components/TopGoldenList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faCheckCircle,
  faExternalLink,
  faLink,
  faListDots,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import "../css/Campaign.css";
import { useEffect, useState } from "react";
import {
  getCampaignName,
  getChallengeNameShort,
  getGamebananaEmbedUrl,
  getMapLobbyInfo,
  getMapName,
} from "../util/data_util";
import { getNewDifficultyColors } from "../util/constants";
import { useLocalStorage } from "../hooks/useStorage";
import { Changelog } from "../components/Changelog";
import {
  CampaignIcon,
  ChallengeFcIcon,
  DifficultyChip,
  GamebananaEmbed,
  PlayerChip,
  PlayerLink,
  SubmissionFcIcon,
} from "../components/GoldberriesComponents";
import { useTheme } from "@emotion/react";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { useTranslation } from "react-i18next";
import { LinearProgressWithLabel } from "./ServerCosts";

const STYLE_CONSTS = {
  player: {
    width: 150,
    height: 70,
  },
  submission: {
    height: 50,
  },
  map: {
    width: 250,
    borderLeft: 25,
    counter: 150,
  },
  total: {
    height: 70,
  },
  lobby: {
    width: 120,
    fontSize: 75,
  },
};

export function PageCampaign() {
  const { id, tab } = useParams();
  const navigate = useNavigate();

  const setTab = (newTab) => {
    if (newTab === "players") {
      navigate(`/campaign/${id}`, { replace: true });
    } else {
      navigate(`/campaign/${id}/${newTab}`, { replace: true });
    }
  };

  if (tab === "top-golden-list") {
    return <PageCampaignTopGoldenList id={id} />;
  }

  return (
    <BasicContainerBox maxWidth="md">
      <CampaignDisplay id={parseInt(id)} tab={tab ?? "players"} setTab={setTab} />
    </BasicContainerBox>
  );
}

export function CampaignDisplay({ id, tab, setTab = () => {} }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const theme = useTheme();
  const query = useGetCampaignView(id);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const response = getQueryData(query);
  const { campaign, players } = response;
  const title = getCampaignName(campaign, t_g);
  const hasFullGameChallenges = campaign.challenges.length > 0;

  return (
    <>
      <HeadTitle title={title} />
      <Stack direction="row" alignItems="center" gap={1}>
        {campaign.icon_url === null && <FontAwesomeIcon icon={faBook} size="2x" />}
        <CampaignIcon campaign={campaign} height="1.7em" />
        <Typography variant="h4">{campaign.name}</Typography>
      </Stack>

      <Stack direction="row" alignItems="center" gap={1} justifyContent="space-around" sx={{ mt: 1 }}>
        <GamebananaEmbed campaign={campaign} size="large" />
      </Stack>

      <CampaignDetailsList campaign={campaign} sx={{ mt: 0 }} />

      <Divider sx={{ mt: 2 }} />

      <Tabs variant="fullWidth" value={tab} onChange={(event, newTab) => setTab(newTab)} sx={{ mt: 0 }}>
        <Tab label="Players" value="players" />
        <Tab label="Maps" value="maps" />
        {hasFullGameChallenges && <Tab label="Challenges" value="challenges" />}
      </Tabs>
      <Divider sx={{ my: 0 }} />

      {tab === "players" && <CampaignPlayerTable campaign={campaign} players={players} sx={{ mt: 2 }} />}
      {tab === "maps" && <CampaignMapList campaign={campaign} sx={{ mt: 2 }}></CampaignMapList>}
      {tab === "challenges" && (
        <CampaignChallengeList campaign={campaign} sx={{ mt: 2 }}></CampaignChallengeList>
      )}

      <Divider sx={{ my: 2 }} />
      <Changelog type="campaign" id={id} />
    </>
  );
}

//#region Campaign Info

export function CampaignDetailsList({ campaign, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "campaign" });
  const { t: t_c } = useTranslation(undefined, { keyPrefix: "challenge" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  const hasMajorSort = campaign.sort_major_name !== null;
  const hasMinorSort = campaign.sort_minor_name !== null;

  const notArchivedMaps = campaign.maps.filter((map) => !map.is_archived);
  const archivedMapsCount = campaign.maps.length - notArchivedMaps.length;
  const archivedAddition = archivedMapsCount > 0 ? " (+ " + archivedMapsCount + " archived Map)" : "";

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
        <InfoBox>
          <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faListDots} />} text={"Map Count"} />
          <InfoBoxIconTextLine text={notArchivedMaps.length + " Maps" + archivedAddition} isSecondary />
        </InfoBox>
        {hasMajorSort && (
          <SortInfoBox
            name={campaign.sort_major_name}
            labels={campaign.sort_major_labels}
            colors={campaign.sort_major_colors}
          />
        )}
      </Grid>
      <Grid item xs={12} sm={6} display="flex" flexDirection="column" rowGap={1}>
        <InfoBox>
          <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faUser} />} text={t("author")} />
          <InfoBoxIconTextLine
            text={
              <StyledExternalLink href={"https://gamebanana.com/members/" + campaign.author_gb_id}>
                {campaign.author_gb_name}
              </StyledExternalLink>
            }
            isSecondary
          />
        </InfoBox>
        <InfoBox>
          <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faExternalLink} />} text={t_g("url")} />
          <InfoBoxIconTextLine
            text={<StyledExternalLink href={campaign.url}>{campaign.url}</StyledExternalLink>}
            isSecondary
          />
        </InfoBox>
        {hasMinorSort && (
          <SortInfoBox
            name={campaign.sort_minor_name}
            labels={campaign.sort_minor_labels}
            colors={campaign.sort_minor_colors}
          />
        )}
      </Grid>
    </Grid>
  );
}
function SortInfoBox({ name, labels, colors }) {
  const textShadow =
    "black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px";
  return (
    <InfoBox>
      <InfoBoxIconTextLine text={name} />
      <InfoBoxIconTextLine
        text={
          <Stack direction="row" alignItems="center" columnGap={1} rowGap={0} flexWrap="wrap">
            {labels.map((label, index) => (
              <Typography key={index} variant="body1" color={colors[index]} sx={{ textShadow }}>
                {label}
              </Typography>
            ))}
          </Stack>
        }
        isSecondary
      />
    </InfoBox>
  );
}

//#endregion

//#region Campaign Player Table

export function CampaignPlayerTable({ campaign, players, ...props }) {
  const [showAll, setShowAll] = useState(false);
  const [actuallyShowAll, setActuallyShowAll] = useState(false);

  useEffect(() => {
    if (showAll) {
      setActuallyShowAll(true);
    }
  }, [showAll]);

  const reducedPlayerAmount = 100;
  const playersToShow = actuallyShowAll
    ? Object.values(players)
    : Object.values(players).slice(0, reducedPlayerAmount);
  return (
    <TableContainer component={Paper} {...props}>
      <Table size="small">
        <TableHead>
          <TableCell width={1} sx={{ pl: 1 }}></TableCell>
          <TableCell width={1} sx={{ pl: 1, pr: 0 }}>
            Player
          </TableCell>
          <TableCell sx={{ pl: 0.5, pr: 1 }} colSpan={2}>
            Progress
          </TableCell>
          <TableCell width={1} sx={{ pl: 0, pr: 1, display: { xs: "none", md: "table-cell" } }}></TableCell>
          <TableCell width={1} sx={{ px: 1 }}></TableCell>
        </TableHead>
        <TableBody>
          {playersToShow.map((player, index) => (
            <CampaignPlayerTableRow key={player.id} index={index} campaign={campaign} playerEntry={player} />
          ))}
          {!actuallyShowAll && players.length > reducedPlayerAmount && (
            <>
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="caption">
                    + {Object.values(players).length - playersToShow.length} more players
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {showAll ? (
                    <LoadingSpinner />
                  ) : (
                    <Button size="small" fullWidth onClick={() => setShowAll(!showAll)}>
                      {showAll ? "Show Less" : "Show All"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
function CampaignPlayerTableRow({ index, campaign, playerEntry }) {
  const {
    palette: { campaignPage },
  } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const { player, stats, last_submission, highest_lobby_sweep, highest_lobby_sweep_fcs } = playerEntry;
  const mapsInCampaign = campaign.maps.filter((map) => !map.is_archived).length;
  const progressColor = stats.clears === mapsInCampaign ? "primary" : "success";
  const backgroundColor = stats.clears === mapsInCampaign ? campaignPage.sweepBackground : "transparent";
  const backgroundHover =
    stats.clears === mapsInCampaign
      ? campaignPage.sweepHightlightBackground
      : campaignPage.highlightBackground;
  const sweepColor =
    campaign.sort_major_name !== null ? campaign.sort_major_colors[highest_lobby_sweep] ?? "white" : null;
  const borderLeft = sweepColor ? "20px solid " + sweepColor : "none";

  const onClick = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <TableRow
        sx={{ backgroundColor, "&:hover": { backgroundColor: backgroundHover, cursor: "pointer" } }}
        onClick={onClick}
      >
        <TableCell width={1} align="center" sx={{ pl: 1, pr: 0, borderLeft }}>
          #{index + 1}
        </TableCell>
        <TableCell
          width={1}
          sx={{
            pl: 1,
            pr: 0,
            maxWidth: { xs: "120px", md: "150px" },
            minWidth: { xs: "120px", md: "150px" },
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <PlayerLink player={player} />
        </TableCell>
        <TableCell width={1} align="center" sx={{ pl: 0.5, pr: 0 }}>
          <Typography variant="caption">{((stats.clears / mapsInCampaign) * 100).toFixed(0)}%</Typography>
        </TableCell>
        <TableCell sx={{ pl: 1 }}>
          <LinearProgress
            variant="determinate"
            color={progressColor}
            value={(stats.clears / mapsInCampaign) * 100}
            max={100}
            sx={{ height: "6px", borderRadius: 1 }}
          />
        </TableCell>
        <TableCell width={1} align="right" sx={{ pl: 0, pr: 1, display: { xs: "none", md: "table-cell" } }}>
          <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-end">
            <span style={{ whiteSpace: "nowrap" }}>
              {stats.clears} / {mapsInCampaign}
            </span>
          </Stack>
        </TableCell>
        <TableCell width={1} sx={{ px: 1 }}>
          <Stack direction="row" gap={1} alignItems="center">
            <ChallengeFcIcon challenge={{ requires_fc: true, has_fc: false }} height="1.0em" />
            <span>{stats.full_clears}</span>
          </Stack>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={6} sx={{ pb: 2 }}>
            <CampaignPlayerTableRowExpanded player={player} campaign={campaign} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function CampaignPlayerTableRowExpanded({ player, campaign }) {
  const query = useGetCampaignViewPlayer(campaign.id, player.id);
  const validMaps = campaign.maps.filter((map) => !map.is_archived);
  const hasMajorSort = campaign.sort_major_name !== null;

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const mapData = getQueryData(query); //dictionary with map id => map object, map.challenges[0].submission[0] is the submission object

  return (
    <Stack direction="column" gap={1}>
      {/* <Typography variant="h6">Player Details</Typography> */}
      {hasMajorSort ? (
        campaign.sort_major_labels.map((major, index) => {
          const maps = campaign.maps.filter((map) => map.sort_major === index);
          const countCompleted = maps.reduce((acc, map) => {
            return acc + (mapData[map.id] !== undefined ? 1 : 0);
          }, 0);
          return (
            <>
              <Stack direction="row" gap={1} alignItems="center">
                <Typography variant="h6">{major}</Typography>
                <Typography variant="body1" color="text.secondary">
                  ({countCompleted} / {maps.length})
                </Typography>
              </Stack>
              <CampaignPlayerTableRowExpandedMapGroup
                key={index}
                majorSort={index}
                maps={maps}
                mapData={mapData}
                campaign={campaign}
              />
            </>
          );
        })
      ) : (
        <CampaignPlayerTableRowExpandedMapGroup maps={validMaps} mapData={mapData} campaign={campaign} />
      )}
    </Stack>
  );
}
function CampaignPlayerTableRowExpandedMapGroup({ maps, mapData, campaign }) {
  const hasMajorSort = campaign.sort_major_name !== null;
  const hasMinorSort = campaign.sort_minor_name !== null;
  const borderLeft = hasMajorSort ? "10px solid " + campaign.sort_major_colors[maps[0].sort_major] : "none";
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableBody>
          {maps.map((map) => {
            const hasSubmission = mapData[map.id] !== undefined;
            const submission = hasSubmission ? mapData[map.id].challenges[0].submissions[0] : null;
            const borderRight = hasMinorSort
              ? "15px solid " + campaign.sort_minor_colors[map.sort_minor]
              : "none";
            return (
              <TableRow key={map.id}>
                <TableCell sx={{ px: 2, borderLeft }}>
                  <StyledLink to={"/map/" + map.id}>{getMapName(map, campaign)}</StyledLink>
                </TableCell>
                <TableCell width={1} align="right" sx={{ px: 2, borderRight }}>
                  <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-end">
                    {hasSubmission ? (
                      <>
                        <SubmissionFcIcon submission={submission} />
                        <StyledLink to={"/submission/" + submission.id}>
                          <FontAwesomeIcon icon={faBook} />
                        </StyledLink>
                        <FontAwesomeIcon icon={faCheckCircle} color="green" />
                      </>
                    ) : (
                      <FontAwesomeIcon icon={faXmark} color="red" />
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

//#endregion

//#region Campaign Map List

export function CampaignMapList({ campaign, ...props }) {
  const hasMajorSort = campaign.sort_major_name !== null;

  if (hasMajorSort) {
    return campaign.sort_major_labels.map((major, index) => {
      const maps = campaign.maps.filter((map) => map.sort_major === index);
      return (
        <CampaignMapListMajorGroup key={index} majorSort={index} maps={maps} campaign={campaign} {...props} />
      );
    });
  }

  return <CampaignMapListBasic maps={campaign.maps} campaign={campaign} {...props} />;
}

function CampaignMapListMajorGroup({ maps, campaign, majorSort, sx = {}, ...props }) {
  const mapCount = maps.length;
  return (
    <Grid container sx={sx} columnSpacing={1} {...props}>
      <Grid item xs="auto">
        <Box sx={{ background: campaign.sort_major_colors[majorSort], height: "100%", width: "10px" }}></Box>
      </Grid>
      <Grid item xs>
        <Stack direction="column" gap={1}>
          <Stack direction="row" gap={1} alignItems="center">
            <Typography variant="h4">{campaign.sort_major_labels[majorSort]}</Typography>
            <Typography variant="body1" color="text.secondary">
              ({mapCount} Maps)
            </Typography>
          </Stack>
          <CampaignMapListBasic maps={maps} campaign={campaign} />
        </Stack>
      </Grid>
    </Grid>
  );
}
function CampaignMapListBasic({ maps, campaign, sx = {}, ...props }) {
  return (
    <Stack direction="column" gap={1} sx={sx} {...props}>
      {maps.map((map) => (
        <CampaignMapListMapEntry key={map.id} map={map} campaign={campaign} />
      ))}
    </Stack>
  );
}
function CampaignMapListMapEntry({ map, campaign, sx = {}, ...props }) {
  const { settings } = useAppSettings();
  const theme = useTheme();
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));
  const useTextFcIcons = settings.visual.topGoldenList.useTextFcIcons;
  const hasMinorSort = campaign.sort_minor_name !== null;
  const sortColor = hasMinorSort ? campaign.sort_minor_colors[map.sort_minor] : null;
  const textShadow =
    "black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px";
  return (
    <BorderedBox sx={{ p: 1, borderRadius: 1, ...sx }} {...props}>
      <Stack direction="row" gap={1} alignItems="center">
        <Stack direction="column" gap={0.25}>
          <StyledLink to={"/map/" + map.id}>
            <Typography variant="h6">{getMapName(map, campaign)}</Typography>
          </StyledLink>
          <Stack direction="column" gap={0.5} sx={{ pl: 2 }}>
            {map.challenges.map((challenge) => (
              <Stack direction="row" gap={2} alignItems="center">
                <StyledLink to={"/challenge/" + challenge.id} key={challenge.id}>
                  <Stack direction="row" gap={1} alignItems="center">
                    {getChallengeNameShort(
                      challenge,
                      true,
                      isMdScreen ? true : useTextFcIcons ? true : false
                    )}
                    <ChallengeFcIcon
                      challenge={challenge}
                      style={{ display: isMdScreen ? "block" : useTextFcIcons ? "none" : "block" }}
                    />
                  </Stack>
                </StyledLink>
                <DifficultyChip difficulty={challenge.difficulty} />
              </Stack>
            ))}
          </Stack>
        </Stack>
        {hasMinorSort && (
          <Typography variant="body1" sx={{ ml: "auto", color: sortColor, textShadow }}>
            {campaign.sort_minor_labels[map.sort_minor]}
          </Typography>
        )}
      </Stack>
    </BorderedBox>
  );
}

//#endregion

//#region Campaign Challenge List

function CampaignChallengeList({ campaign, ...props }) {
  return (
    <Stack direction="column" gap={1} {...props}>
      {campaign.challenges.map((challenge) => (
        <CampaignChallengeEntry key={challenge.id} challenge={challenge} campaign={campaign} />
      ))}
    </Stack>
  );
}
function CampaignChallengeEntry({ challenge, campaign, sx = {}, ...props }) {
  const theme = useTheme();
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));
  return (
    <BorderedBox sx={{ p: 1, borderRadius: 1, ...sx }} {...props}>
      <Stack direction="column" gap={0.25}>
        <StyledLink to={"/challenge/" + challenge.id}>
          <Typography variant="h6">{getChallengeNameShort(challenge, true, true)}</Typography>
        </StyledLink>
        {challenge.description && <Typography variant="body1">{challenge.description}</Typography>}
      </Stack>
    </BorderedBox>
  );
}

//#endregion

//#region Old Campaign Table View

function getPlayerSortInfo(player, campaign, submissions) {
  let sortInfo = {
    count: 0,
    fcCount: 0,
    maxPercent: false,
    major: [], // [ {count: 14, rainbow: false, fcCount: 12} ]
  };

  const hasMajor = campaign.sort_major_name !== null;

  if (hasMajor) {
    const lastMinor = campaign.sort_minor_labels.length - 1;
    //Loop backwards through lobbies
    for (let major = 0; major < campaign.sort_major_labels.length; major++) {
      //Check if the campaign.maps filtered by lastMinor has a length of 1
      const hasHeartSide =
        campaign.maps.filter((map) => {
          return map.sort_major === major && map.sort_minor === lastMinor;
        }).length === 1;

      //Filter all maps for the current major sort
      let maps = campaign.maps.filter((map) => {
        return map.sort_major === major;
      });
      //If there is a heart side, length -1 is the rainbow amount
      let mapsCount = hasHeartSide ? maps.length - 1 : maps.length;

      const count = maps.reduce((acc, map) => {
        return acc + (submissions[player.id][map.id] !== undefined ? 1 : 0);
      }, 0);
      const hasRainbow = count >= mapsCount;
      //Count submission.is_fc for each player. if they are different, return the difference
      const fcCount = maps.reduce((acc, map) => {
        return acc + (submissions[player.id][map.id]?.is_fc ? 1 : 0);
      }, 0);

      sortInfo.major.push({
        count: count,
        rainbow: hasRainbow,
        fcCount: fcCount,
      });
    }
  }

  let totalCount = Object.keys(submissions[player.id] ?? {}).length;
  let totalFcCount = Object.values(submissions[player.id] ?? {}).reduce((acc, submission) => {
    return acc + (submission.is_fc ? 1 : 0);
  }, 0);

  sortInfo.count = totalCount;
  sortInfo.maxPercent = campaign.maps.length === totalCount;
  sortInfo.fcCount = totalFcCount;

  return sortInfo;
}

function comparePlayers(playerA, playerB, campaign, submissions) {
  const hasMajor = campaign.sort_major_name !== null;
  const playerASortInfo = getPlayerSortInfo(playerA, campaign, submissions);
  const playerBSortInfo = getPlayerSortInfo(playerB, campaign, submissions);

  if (hasMajor) {
    //Loop backwards through lobbies
    for (let major = campaign.sort_major_labels.length - 1; major >= 0; major--) {
      let majorA = playerASortInfo.major[major];
      let majorB = playerBSortInfo.major[major];

      //XOR major.rainbow, return the difference
      if (majorA.rainbow !== majorB.rainbow) {
        return majorA.rainbow ? -1 : 1;
      }

      //If both have a rainbow, but one of them has more FCs, return the difference
      if (majorA.rainbow && majorB.rainbow && majorA.fcCount !== majorB.fcCount) {
        return majorB.fcCount - majorA.fcCount;
      }
    }
  }

  if (playerASortInfo.count !== playerBSortInfo.count) {
    return playerBSortInfo.count - playerASortInfo.count;
  }
  if (playerASortInfo.fcCount !== playerBSortInfo.fcCount) {
    return playerBSortInfo.fcCount - playerASortInfo.fcCount;
  }

  let playerAName = playerA.name.toLowerCase();
  let playerBName = playerB.name.toLowerCase();
  return playerAName.localeCompare(playerBName);
}

export function CampaignTableView({ campaign, players, submissions }) {
  //players is an object with player id => player object
  //flatten this object to an array
  const playersArray = Object.values(players);
  playersArray.sort((playerA, playerB) => comparePlayers(playerA, playerB, campaign, submissions));

  const totalSubmissions = playersArray.reduce((acc, player) => {
    let submissionCount = Object.keys(submissions[player.id] ?? {}).length;
    return acc + submissionCount;
  }, 0);

  const hasMajor = campaign.sort_major_name !== null;
  const mapCountsMajor = {};
  if (hasMajor) {
    campaign.maps.forEach((map) => {
      const lobbyInfo = getMapLobbyInfo(map, campaign);
      const major = lobbyInfo.major;
      if (major) {
        if (mapCountsMajor[major.label] === undefined) {
          mapCountsMajor[major.label] = {
            label: major.label,
            color: major.color,
            count: 0,
          };
        }
        mapCountsMajor[major.label].count += 1;
      }
    });
  }

  useEffect(() => {
    document.body.parentElement.style.overflowX = "auto";
    return () => {
      document.body.parentElement.style.overflowX = "hidden";
    };
  }, []);

  return (
    <Stack direction="row" sx={{ width: "max-content" }}>
      <Stack direction="column" sx={{ position: "sticky", left: "0", zIndex: 2 }}>
        <div
          className="campaign-view-box name relative-size"
          style={{
            fontWeight: "bold",
            fontSize: "150%",
            height: STYLE_CONSTS.player.height + "px",
            position: "sticky",
            top: "48px",
            zIndex: 3,
            width: (hasMajor ? 120 : 0) + STYLE_CONSTS.map.width + STYLE_CONSTS.map.counter + "px",
            padding: "0 5px",
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {campaign.name}
          </span>
        </div>
        <Stack direction="row">
          <Stack direction="column">
            {hasMajor &&
              Object.keys(mapCountsMajor).map((label) => {
                const info = mapCountsMajor[label];
                return (
                  <CampaignTableLobbyBox key={label} name={label} span={info.count} color={info.color} />
                );
              })}
          </Stack>
          <Stack id="campaign-view-map-list" direction="column">
            {campaign.maps.map((map) => {
              const mapSubmissions = [];
              playersArray.forEach((player) => {
                if (submissions[player.id][map.id] === undefined) {
                  return;
                }
                mapSubmissions.push(submissions[player.id][map.id]);
              });
              return (
                <CampaignTableMapBox
                  key={map.id}
                  campaign={campaign}
                  map={map}
                  submissions={mapSubmissions}
                />
              );
            })}
          </Stack>
        </Stack>
        <Stack direction="row">
          <div
            className="campaign-view-box name relative-size"
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              height: STYLE_CONSTS.total.height + "px",
              flex: 1,
            }}
          >
            Total:
          </div>
          <div
            className="campaign-view-box name"
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              width: STYLE_CONSTS.map.counter + "px",
              height: STYLE_CONSTS.total.height + "px",
            }}
          >
            {totalSubmissions}
          </div>
        </Stack>
      </Stack>
      <Stack direction="column">
        <Stack
          id="campaign-view-players-row"
          direction="row"
          sx={{ position: "sticky", top: "48px", zIndex: 1 }}
        >
          {playersArray.map((player) => (
            <CampaignTablePlayerBox
              key={player.id}
              player={player}
              campaign={campaign}
              submissions={submissions}
            />
          ))}
        </Stack>
        <Stack direction="row">
          {playersArray.map((player) => (
            <CampaignTableSubmissionColumn
              key={player.id}
              campaign={campaign}
              player={player}
              submissions={submissions[player.id]}
            />
          ))}
        </Stack>
        <Stack direction="row">
          {playersArray.map((player) => (
            <div
              className="campaign-view-box name relative-size"
              style={{
                width: STYLE_CONSTS.player.width + "px",
                height: STYLE_CONSTS.total.height + "px",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            >
              {Object.keys(submissions[player.id] ?? {}).length}
            </div>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
function CampaignTableLobbyBox({ name, color, span }) {
  let style = {
    color: color,
    backgroundColor: "black",
    height: span * STYLE_CONSTS.submission.height + "px",
    fontSize: STYLE_CONSTS.lobby.fontSize + "px",
    fontWeight: "bold",
    writingMode: "vertical-lr",
    textOrientation: "upright",
    width: STYLE_CONSTS.lobby.width + "px",
  };

  return (
    <div className="campaign-view-box map" style={style}>
      {name}
    </div>
  );
}
function CampaignTableMapBox({ campaign, map, submissions }) {
  const { settings } = useAppSettings();
  const lobbyInfo = getMapLobbyInfo(map, campaign);

  if (map.challenges.length === 0) {
    return null;
  }

  let style = {
    height: STYLE_CONSTS.submission.height + "px",
    width: STYLE_CONSTS.map.width + "px",
    color: lobbyInfo.major ? lobbyInfo.major.color : "white",
    borderLeft: lobbyInfo.minor
      ? STYLE_CONSTS.map.borderLeft + "px solid " + lobbyInfo.minor.color
      : "1px solid white",
    fontWeight: "bold",
    backgroundColor: map.is_archived ? "#592828" : "black",
  };

  let regularCount = 0;
  let regularStyle = {};
  let hasFC = map.challenges.length > 1;
  let fcCount = 0;
  let fcStyle = {};
  let testStyle = true;

  if (hasFC) {
    submissions.forEach((submission) => {
      if (submission.is_fc) {
        fcCount += 1;
      } else {
        regularCount += 1;
      }
    });

    for (let i = 0; i < map.challenges.length; i++) {
      let challenge = map.challenges[i];
      let colors = getNewDifficultyColors(settings, challenge.difficulty_id);
      if (challenge.requires_fc === false) {
        if (!testStyle) {
          regularStyle.color = colors.group_color;
        } else {
          regularStyle.border = "1px solid " + colors.contrast_color;
          regularStyle.color = colors.contrast_color;
          regularStyle.backgroundColor = colors.group_color;
        }
      } else {
        if (!testStyle) {
          fcStyle.color = colors.group_color;
        } else {
          fcStyle.border = "1px solid " + colors.contrast_color;
          fcStyle.color = colors.contrast_color;
          fcStyle.backgroundColor = colors.group_color;
        }
      }
    }
  } else {
    let challenge = map.challenges[0];
    if (challenge.has_fc) {
      hasFC = true;
      submissions.forEach((submission) => {
        if (submission.is_fc) {
          fcCount += 1;
        } else {
          regularCount += 1;
        }
      });
    } else {
      regularCount = submissions.length;
    }
    let colors = getNewDifficultyColors(settings, map.challenges[0].difficulty_id);
    if (!testStyle) {
      regularStyle.color = colors.group_color;
      if (hasFC) {
        fcStyle.color = colors.group_color;
      }
    } else {
      regularStyle.border = "1px solid " + colors.contrast_color;
      regularStyle.backgroundColor = colors.group_color;
      regularStyle.color = colors.contrast_color;
      if (hasFC) {
        fcStyle.border = "1px solid " + colors.contrast_color;
        fcStyle.backgroundColor = colors.group_color;
        fcStyle.color = colors.contrast_color;
      }
    }
  }

  let boxWidth = STYLE_CONSTS.map.counter;
  boxWidth = hasFC ? boxWidth / 2 : boxWidth;
  let countStyle = {
    color: "white",
    fontSize: "28px",
    fontWeight: "bold",
    width: boxWidth + "px",
    height: STYLE_CONSTS.submission.height + "px",
  };

  return (
    <Stack direction="row">
      <Link to={`/map/${map.id}`} style={{ textDecoration: "none" }}>
        <div className="campaign-view-box map" style={style}>
          {map.name}
        </div>
      </Link>
      <div className="campaign-view-box map" style={{ ...countStyle, ...regularStyle }}>
        {regularCount}
      </div>
      {hasFC && (
        <div className="campaign-view-box map" style={{ ...countStyle, ...fcStyle }}>
          {fcCount}
        </div>
      )}
    </Stack>
  );
}
function CampaignTablePlayerBox({ player, campaign, submissions }) {
  const style = {
    width: STYLE_CONSTS.player.width + "px",
    height: STYLE_CONSTS.player.height + "px",
    fontSize: "20px",
    fontWeight: "bold",
    backgroundColor: "black",
    color: "white",
  };

  const sortInfo = getPlayerSortInfo(player, campaign, submissions);
  if (sortInfo.maxPercent) {
    style.backgroundColor = "#ffd966";
    style.color = "black";
  } else {
    //Loop backwards through lobbies
    for (let major = sortInfo.major.length - 1; major >= 0; major--) {
      let majorInfo = sortInfo.major[major];
      if (majorInfo.rainbow) {
        let lobbyColor = campaign.sort_major_colors[major];
        style.backgroundColor = "black";
        style.color = lobbyColor;
        break;
      }
    }
  }

  return (
    <Link to={`/player/${player.id}`} style={{ textDecoration: "none" }}>
      <div className="campaign-view-box name" style={style}>
        <span
          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "0 5px" }}
        >
          {player.name}
        </span>
      </div>
    </Link>
  );
}
function CampaignTableSubmissionColumn({ campaign, player, submissions }) {
  let submissionCount = Object.keys(submissions ?? {}).length;
  let currentSpace = 0;
  return (
    <Stack direction="column">
      {campaign.maps.map((map, index) => {
        if (map.challenges.length === 0) {
          return;
        }
        const submission = submissions[map.id];
        if (submission === undefined) {
          currentSpace += 1;
          return;
        }
        let space = currentSpace;
        let endingSpace = 0;
        currentSpace = 0;
        let lobbyInfo = getMapLobbyInfo(map, campaign);
        let lobbyColor = lobbyInfo.major?.color ?? lobbyInfo.minor?.color ?? null;

        //Find the number of maps without submissions after the current one, if all are empty.
        let remainingMaps = campaign.maps.slice(index + 1);
        let hasAnotherSubmission = remainingMaps.some((map) => {
          return submissions[map.id] !== undefined;
        });
        if (!hasAnotherSubmission) {
          endingSpace = remainingMaps.length;
          //Remove endingSpace for each map that has no challenges
          remainingMaps.forEach((map) => {
            if (map.challenges.length === 0) {
              endingSpace -= 1;
            }
          });
        }

        return (
          <CampaignTableSubmissionBox
            key={map.id}
            submission={submission}
            spacing={space}
            endingSpacing={endingSpace}
            color={lobbyColor}
          />
        );
      })}
    </Stack>
  );
}
function CampaignTableSubmissionBox({ submission, color, spacing = 0, endingSpacing = 0 }) {
  let hasColor = color !== undefined && color !== null;
  color = hasColor ? color : "#ffd966";
  color = !hasColor && submission.is_fc ? "#f9cb9c" : color;

  let style = {
    width: STYLE_CONSTS.player.width + "px",
    height: STYLE_CONSTS.submission.height + "px",
    marginTop: spacing * STYLE_CONSTS.submission.height + "px",
    marginBottom: endingSpacing * STYLE_CONSTS.submission.height + "px",
    backgroundColor: color,
    textDecoration: "none",
  };

  return (
    <Link to={`/submission/${submission.id}`} style={style}>
      <div className="campaign-view-box submission" style={{ height: STYLE_CONSTS.submission.height + "px" }}>
        {submission.is_fc ? "[FC]" : ""}
      </div>
    </Link>
  );
}

export function PageCampaignTopGoldenList({ id }) {
  const query = useGetCampaignView(id);

  if (query.isLoading) {
    return (
      <BasicBox>
        <LoadingSpinner />
      </BasicBox>
    );
  } else if (query.isError) {
    return (
      <BasicBox>
        <ErrorDisplay error={query.error} />
      </BasicBox>
    );
  }

  const response = getQueryData(query);

  return (
    <Box sx={{ mx: 2 }}>
      <BasicBox sx={{ mb: 1 }}>
        <Typography variant="h4">
          Top Golden List: <StyledLink to={`/campaign/${id}`}>{response.campaign.name}</StyledLink>
        </Typography>
      </BasicBox>
      <TopGoldenList type="campaign" id={id} arbitrary archived />
    </Box>
  );
}

//#endregion
