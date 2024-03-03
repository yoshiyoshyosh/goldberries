import { Link, useParams } from "react-router-dom";
import { getQueryData, useGetCampaignView } from "../hooks/useApi";
import { BasicContainerBox, ErrorDisplay, LoadingSpinner } from "../components/BasicComponents";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { TopGoldenList } from "../components/TopGoldenList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import "../css/Campaign.css";
import { useEffect } from "react";
import { getMapLobbyInfo } from "../util/data_util";
import { getDifficultyColors } from "../util/constants";

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
        <Stack direction="row" alignItems="center" gap={1}>
          <FontAwesomeIcon icon={faBook} size="2x" />
          <Typography variant="h4">{response.campaign.name}</Typography>
        </Stack>
        <ul>
          <li>
            <Link to={`/campaign/${id}/top-golden-list`}>Top Golden List</Link>
          </li>
        </ul>
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

export function CampaignTableView({ campaign, players, submissions }) {
  //players is an object with player id => player object
  //flatten this object to an array
  const playersArray = Object.values(players);
  //Sort the playersArray by how many submissions they have
  playersArray.sort((a, b) => {
    let submissionCountA = Object.keys(submissions[a.id] ?? {}).length;
    let submissionCountB = Object.keys(submissions[b.id] ?? {}).length;
    return submissionCountB - submissionCountA;
  });

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
    <Stack direction="row">
      <Stack direction="column">
        <div
          className="campaign-view-box name relative-size"
          style={{ fontWeight: "bold", fontSize: "150%" }}
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
          <Stack direction="column">
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
            style={{ fontSize: "28px", fontWeight: "bold", width: "250px", minWidth: "250px" }}
          >
            Total:
          </div>
          <div
            className="campaign-view-box name"
            style={{ fontSize: "28px", fontWeight: "bold", width: "150px", minWidth: "150px" }}
          >
            {totalSubmissions}
          </div>
        </Stack>
      </Stack>
      <Stack direction="column">
        <Stack direction="row">
          {playersArray.map((player) => (
            <CampaignTablePlayerBox key={player.id} player={player} />
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
      </Stack>
    </Stack>
  );
}
function CampaignTableLobbyBox({ name, color, span }) {
  let style = {
    color: color,
    backgroundColor: "black",
    height: span * 50 + "px",
    fontSize: "75px",
    fontWeight: "bold",
    writingMode: "vertical-lr",
    textOrientation: "upright",
    width: "120px",
    minWidth: "120px",
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
    color: lobbyInfo.major ? lobbyInfo.major.color : "white",
    borderLeft: lobbyInfo.minor ? "15px solid " + lobbyInfo.minor.color : "1px solid white",
    fontWeight: "bold",
  };

  let regularCount = 0;
  let regularStyle = {};
  let hasFC = map.challenges.length > 1;
  let fcCount = 0;
  let fcStyle = {};
  let testStyle = false;

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

  let boxWidth = hasFC ? 75 : 150;
  let countStyle = {
    color: "white",
    fontSize: "28px",
    fontWeight: "bold",
    width: boxWidth + "px",
    minWidth: boxWidth + "px",
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
function CampaignTablePlayerBox({ player }) {
  return (
    <Link to={`/player/${player.id}`} style={{ textDecoration: "none" }}>
      <div className="campaign-view-box name" style={{ fontSize: "20px", fontWeight: "bold" }}>
        {player.name}
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
      <div
        className="campaign-view-box name relative-size"
        style={{ marginTop: currentSpace * 50 + "px", fontSize: "28px", fontWeight: "bold" }}
      >
        {submissionCount}
      </div>
    </Stack>
  );
}
function CampaignTableSubmissionBox({ submission, color, spacing = 0 }) {
  let hasColor = color !== undefined && color !== null;
  color = hasColor ? color : "#ffd966";
  color = !hasColor && submission.is_fc ? "#f9cb9c" : color;

  return (
    <Link
      to={`/submission/${submission.id}`}
      style={{ marginTop: spacing * 50 + "px", backgroundColor: color, textDecoration: "none" }}
    >
      <div className="campaign-view-box submission">{submission.is_fc ? "FC" : ""}</div>
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
