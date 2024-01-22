import { Box } from "@mui/material";
import { useQuery } from "react-query";
import { fetchGoldenList } from "../util/api";
import { useState } from "react";

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
  });

  if (goldenListQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (goldenListQuery.isError) {
    return <div>Error: {goldenListQuery.error.message}</div>;
  }

  return (
    <div>
      <h1>Golden List</h1>
      <p>Here are the {type} goldens</p>
      <ul>
        {goldenListQuery.data.data.map((campaign) => (
          <CampaignEntry key={campaign.id} campaign={campaign} />
        ))}
      </ul>
    </div>
  );
}

function CampaignEntry({ campaign }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(!isOpen);
  };
  const contentClass = campaign.maps.length > 0 ? "gb-api-has-content" : "";
  return (
    <li>
      <span className={contentClass} onClick={toggle}>
        {campaign.name}
      </span>
      {isOpen && (
        <ul>
          {campaign.maps.map((map) => (
            <MapEntry key={map.id} map={map} />
          ))}
        </ul>
      )}
    </li>
  );
}

function MapEntry({ map }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const contentClass = map.challenges.length > 0 ? "gb-api-has-content" : "";
  return (
    <li>
      <span className={contentClass} onClick={toggle}>
        {map.name}
      </span>
      {isOpen && (
        <ul>
          {map.challenges.map((challenge) => (
            <ChallengeEntry key={challenge.id} challenge={challenge} />
          ))}
        </ul>
      )}
    </li>
  );
}

function ChallengeEntry({ challenge }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const contentClass = challenge.submissions.length > 0 ? "gb-api-has-content" : "";
  const fcAddition = challenge.requires_fc ? "[FC]" : challenge.has_fc ? "[C/FC]" : "[C]";
  const subtierAddition =
    challenge.difficulty.subtier !== null ? " [" + challenge.difficulty.subtier + "]" : "";

  return (
    <li>
      <span className={contentClass} onClick={toggle}>
        {challenge.objective.name} {fcAddition} - {challenge.difficulty.name}
        {subtierAddition}
      </span>
      {isOpen && (
        <ul>
          {challenge.submissions.map((submission) => (
            <SubmissionEntry key={submission.id} submission={submission} />
          ))}
        </ul>
      )}
    </li>
  );
}

function SubmissionEntry({ submission }) {
  const playerName = submission.player ? submission.player.name : "<NULL>";
  return (
    <li>
      <a href={submission.proof_url}>{playerName}</a>
    </li>
  );
}
