import { Box, Stack, styled } from "@mui/material";
import { useQuery } from "react-query";
import { fetchGoldenList } from "../util/api";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { getDifficultyColors } from "../util/constants";
import { VariableSizeList } from "react-window";
import "../css/GoldenList.css";
import { Link } from "react-router-dom";

export function PageGoldenList({ type }) {
  return (
    <Box>
      <GoldenList type={type} />
    </Box>
  );
}

export function GoldenList({ type }) {
  const goldenListQuery = useQuery({
    queryKey: ["goldenList", type],
    queryFn: () => fetchGoldenList(type),
    cacheTime: 0,
    staleTime: 0,
  });

  useEffect(() => {
    document.body.parentElement.style.overflowX = "scroll";
    return () => {
      document.body.parentElement.style.overflowX = "hidden";
    };
  }, []);

  if (goldenListQuery.isLoading || goldenListQuery.isFetching) {
    return (
      <div>
        <h1 style={{ textTransform: "capitalize", margin: "0 10px" }}>{type} Golden List</h1>
        <h3 style={{ marginLeft: "10px" }}>
          Loading <FontAwesomeIcon icon={faSpinner} spin />
        </h3>
      </div>
    );
  }

  if (goldenListQuery.isError) {
    return <div>Error: {goldenListQuery.error.message}</div>;
  }

  const getItemSize = (index) =>
    goldenListQuery.data.data[index].maps.reduce((acc, map) => acc + map.challenges.length, 0) * 50;
  const Row = ({ index, style }) => {
    const campaign = goldenListQuery.data.data[index];
    return <CampaignEntry key={campaign.id} campaign={campaign} style={style} type={type} />;
  };

  const totalSubmissionCount = goldenListQuery.data.data.reduce(
    (acc, campaign) =>
      acc +
      campaign.maps.reduce(
        (acc, map) => acc + map.challenges.reduce((acc, challenge) => acc + challenge.submissions.length, 0),
        0
      ),
    0
  );

  return (
    <div>
      <h1 style={{ textTransform: "capitalize", margin: "0 10px" }}>
        {type} Golden List ({totalSubmissionCount} Submissions)
      </h1>
      {goldenListQuery.data.data.map((campaign) => (
        <CampaignEntry key={campaign.id} campaign={campaign} type={type} />
      ))}
      {/* <VariableSizeList
        height={831}
        itemCount={goldenListQuery.data.data.length}
        itemSize={getItemSize}
        width="calc(100vw - (100% - 100vw))"
        overscanCount={10}
      >
        {Row}
      </VariableSizeList> */}
    </div>
  );
}

function CampaignEntry({ campaign, style, type }) {
  const challengeCount = campaign.maps.reduce((acc, map) => acc + map.challenges.length, 0);
  const displayName = campaign.name + " (by " + campaign.author_gb_name + ")";
  const fontSize = challengeCount > 1 ? "16px" : displayName.length > 40 ? "12px" : "16px";
  return (
    <Stack direction="row" spacing={0} style={style}>
      <a href={campaign.url} target="_blank" rel="noopener" style={{ textDecoration: "none" }}>
        <Box
          className="golden-list-info-box campaign"
          style={{ height: challengeCount * 50 + "px", fontSize: fontSize }}
        >
          {displayName}
        </Box>
      </a>
      <Box>
        {campaign.maps.map((map) => (
          <MapEntry key={map.id} map={map} type={type} />
        ))}
      </Box>
    </Stack>
  );
}

function MapEntry({ map, type }) {
  const fontSize = map.name.length > 40 ? "12px" : "16px";
  return (
    <Stack direction="row" spacing={0}>
      <Box
        className="golden-list-info-box map"
        style={{ height: map.challenges.length * 50 + "px", fontSize: fontSize }}
      >
        <span>{map.name}</span>
      </Box>
      <Box>
        {map.challenges.map((challenge) => (
          <ChallengeEntry key={challenge.id} challenge={challenge} type={type} />
        ))}
      </Box>
    </Stack>
  );
}

function ChallengeEntry({ challenge, type }) {
  const tier = type === "hard" ? challenge.difficulty.name + " " : "";
  const subtier =
    type === "hard" && challenge.difficulty.subtier !== null ? challenge.difficulty.subtier + " " : "";
  const fcAddition = challenge.requires_fc ? "[FC]" : challenge.has_fc ? "[C/FC]" : "[C]";
  const counter = "(" + challenge.submissions.length + ")";
  const subtierAddition =
    challenge.difficulty.subtier !== null ? " [" + challenge.difficulty.subtier + "]" : "";

  const colors = getDifficultyColors(challenge.difficulty_id);

  return (
    <Stack direction="row" spacing={0}>
      <Box
        className="golden-list-info-box challenge"
        style={{ backgroundColor: colors.color, color: colors.contrast_color }}
      >
        <span style={{ textTransform: "capitalize" }}>
          {subtier}
          {tier}
          {fcAddition} {counter}
        </span>
      </Box>
      {challenge.submissions.map((submission) => (
        <SubmissionEntry key={submission.id} submission={submission} />
      ))}
    </Stack>
  );
}

function SubmissionEntry({ submission }) {
  const playerName = submission.player ? submission.player.name : "<NULL>";
  return (
    <Link to={"/submission/" + submission.id} style={{ textDecoration: "none" }}>
      {/* <a href={submission.proof_url} target="_blank" rel="noopener" style={{ textDecoration: "none" }}> */}
      <Box
        className="golden-list-info-box submission"
        style={{ backgroundColor: !submission.is_fc ? "#ffd966" : "#f9cb9c" }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {playerName}
        </span>
      </Box>
      {/* </a> */}
    </Link>
  );
}
