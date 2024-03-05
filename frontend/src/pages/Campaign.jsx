import { Link, useParams } from "react-router-dom";
import { getQueryData, useGetCampaignView } from "../hooks/useApi";
import { BasicContainerBox, ErrorDisplay, LoadingSpinner } from "../components/BasicComponents";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
} from "@mui/material";
import { TopGoldenList } from "../components/TopGoldenList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faLink, faUser } from "@fortawesome/free-solid-svg-icons";
import "../css/Campaign.css";
import { useEffect } from "react";
import { getGamebananaEmbedUrl, getMapAuthor, getMapLobbyInfo } from "../util/data_util";
import { getDifficultyColors } from "../util/constants";

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

  if (tab === "top-golden-list") {
    return <PageCampaignTopGoldenList id={id} />;
  }

  return <CampaignDisplay id={parseInt(id)} tab={tab} />;
}

export function CampaignDisplay({ id }) {
  const query = useGetCampaignView(id);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const response = getQueryData(query);

  return (
    <>
      <Box sx={{ mx: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: "10px",
            border: "1px solid #cccccc99",
            boxShadow: 1,
            width: {
              xs: "100%",
              sm: "600px",
            },
          }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <FontAwesomeIcon icon={faBook} size="2x" />
            <Typography variant="h4">{response.campaign.name}</Typography>
          </Stack>
          <CampaignDetailsList campaign={response.campaign} sx={{}} />
        </Box>
        <Divider sx={{ my: 2 }} />
      </Box>
      <CampaignTableView
        campaign={response.campaign}
        players={response.players}
        submissions={response.submissions}
      />
    </>
  );
}

export function CampaignDetailsList({ campaign, ...props }) {
  const embedUrl = getGamebananaEmbedUrl(campaign.url);
  const author = {
    name: campaign.author_gb_name,
    id: campaign.author_gb_id,
  };
  return (
    <List dense {...props}>
      <ListSubheader>Campaign Details</ListSubheader>
      <ListItem>
        <ListItemIcon>
          <FontAwesomeIcon icon={faBook} />
        </ListItemIcon>
        <ListItemText primary={campaign.name} secondary="Campaign" />
        {embedUrl && (
          <ListItemSecondaryAction
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            <Link to={campaign.url} target="_blank">
              <img src={embedUrl} alt="Campaign Banner" style={{ borderRadius: "5px" }} />
            </Link>
          </ListItemSecondaryAction>
        )}
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <FontAwesomeIcon icon={faUser} />
        </ListItemIcon>
        <ListItemText
          primary={
            author.name !== null ? (
              <Link to={"https://gamebanana.com/members/" + author.id}>{author.name}</Link>
            ) : (
              "<Unknown Author>"
            )
          }
          secondary="Author"
        />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <FontAwesomeIcon icon={faLink} />
        </ListItemIcon>
        <ListItemText
          primary={<Link to={`/campaign/${campaign.id}/top-golden-list`}>Top Golden List</Link>}
        />
      </ListItem>
    </List>
  );
}

//#region Campaign Table View

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
            top: "0",
            zIndex: 3,
          }}
        >
          {campaign.name}
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
          sx={{ position: "sticky", top: "0", zIndex: 1 }}
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
  const lobbyInfo = getMapLobbyInfo(map, campaign);

  let style = {
    height: STYLE_CONSTS.submission.height + "px",
    width: STYLE_CONSTS.map.width + "px",
    color: lobbyInfo.major ? lobbyInfo.major.color : "white",
    borderLeft: lobbyInfo.minor
      ? STYLE_CONSTS.map.borderLeft + "px solid " + lobbyInfo.minor.color
      : "1px solid white",
    fontWeight: "bold",
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
      let colors = getDifficultyColors(challenge.difficulty_id);
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
    let colors = getDifficultyColors(map.challenges[0].difficulty_id);
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
      {campaign.maps.map((map) => {
        const submission = submissions[map.id];
        if (submission === undefined) {
          currentSpace += 1;
          return;
        }
        let space = currentSpace;
        currentSpace = 0;
        let lobbyInfo = getMapLobbyInfo(map, campaign);
        let lobbyColor = lobbyInfo.major?.color ?? lobbyInfo.minor?.color ?? null;
        return (
          <CampaignTableSubmissionBox
            key={map.id}
            submission={submission}
            spacing={space}
            color={lobbyColor}
          />
        );
      })}
    </Stack>
  );
}
function CampaignTableSubmissionBox({ submission, color, spacing = 0 }) {
  let hasColor = color !== undefined && color !== null;
  color = hasColor ? color : "#ffd966";
  color = !hasColor && submission.is_fc ? "#f9cb9c" : color;

  let style = {
    width: STYLE_CONSTS.player.width + "px",
    height: STYLE_CONSTS.submission.height + "px",
    marginTop: spacing * STYLE_CONSTS.submission.height + "px",
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
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const response = getQueryData(query);

  return (
    <Box sx={{ mx: 2 }}>
      <Typography variant="h4">
        Top Golden List: <Link to={`/campaign/${id}`}>{response.campaign.name}</Link>
      </Typography>
      <TopGoldenList type="campaign" id={id} />
    </Box>
  );
}

//#endregion
