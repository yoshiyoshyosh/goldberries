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

export function PageCampaign() {
  const { id, tab } = useParams();

  if (tab === "top-golden-list") {
    return <PageCampaignTopGoldenList id={id} />;
  }

  return (
    <Box sx={{ mx: 2 }}>
      <CampaignDisplay id={parseInt(id)} tab={tab} />
    </Box>
  );
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

  useEffect(() => {
    document.body.parentElement.style.overflowX = "auto";
    return () => {
      document.body.parentElement.style.overflowX = "hidden";
    };
  }, []);

  return (
    <Stack direction="row">
      <Stack direction="column">
        <div className="campaign-view-box name relative-size">{campaign.name}</div>
        <Stack direction="column">
          {campaign.maps.map((map) => (
            <CampaignTableMapBox key={map.id} campaign={campaign} map={map} />
          ))}
        </Stack>
        <div className="campaign-view-box name relative-size">Total Submissions: {totalSubmissions}</div>
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
function CampaignTableMapBox({ campaign, map }) {
  const lobbyInfo = getMapLobbyInfo(map, campaign);
  console.log("Map: ", map.name, "lobbyInfo: ", lobbyInfo);

  let style = {
    color: lobbyInfo.major ? lobbyInfo.major.color : "white",
    borderLeft: lobbyInfo.minor ? "15px solid " + lobbyInfo.minor.color : "inherit",
  };

  return (
    <Link to={`/map/${map.id}`} style={{ textDecoration: "none" }}>
      <div className="campaign-view-box map" style={style}>
        {map.name}
      </div>
    </Link>
  );
}
function CampaignTablePlayerBox({ player }) {
  return (
    <Link to={`/player/${player.id}`}>
      <div className="campaign-view-box name">{player.name}</div>
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
        return <CampaignTableSubmissionBox key={map.id} submission={submission} spacing={space} />;
      })}
      <div className="campaign-view-box name relative-size" style={{ marginTop: currentSpace * 50 + "px" }}>
        {submissionCount}
      </div>
    </Stack>
  );
}
function CampaignTableSubmissionBox({ submission, color, spacing = 0 }) {
  color = color ?? "#ffd966";
  color = submission.is_fc ? "#f9cb9c" : color;

  return (
    <Link
      to={`/submission/${submission.id}`}
      style={{ marginTop: spacing * 50 + "px", backgroundColor: color }}
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
