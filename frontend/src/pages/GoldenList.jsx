import {
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import "../css/GoldenList.css";
import {
  BasicBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledExternalLink,
  StyledLink,
} from "../components/BasicComponents";
import {
  getCampaignName,
  getChallengeFcShort,
  getChallengeName,
  getChallengeNameShort,
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
import { Link } from "react-router-dom";
import { getDifficultyColors } from "../util/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLemon } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@emotion/react";

export function PageGoldenList({ type }) {
  const [showArchived, setShowArchived] = useState(false);
  const [showArbitrary, setShowArbitrary] = useState(false);
  const title =
    type === "hard" ? "Hard Golden List" : type === null ? "All Campaigns" : "Standard Golden List";

  return (
    <>
      <Box sx={{ mx: { xs: 1, sm: 2 }, "&&": { mr: 4 } }}>
        <HeadTitle title={title} />
        <BasicBox sx={{ pb: 0, mb: 1 }}>
          <Typography variant="h4">{title}</Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <FormControlLabel
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              control={<Checkbox />}
              label="Show Archived"
            />
            <FormControlLabel
              checked={showArbitrary}
              onChange={(e) => setShowArbitrary(e.target.checked)}
              control={<Checkbox />}
              label="Show Arbitrary"
            />
          </Stack>
        </BasicBox>
        <GoldenList type={type} showArchived={showArchived} showArbitrary={showArbitrary} />
      </Box>
    </>
  );
}

export function GoldenList({ type, id = null, showArchived = false, showArbitrary = false }) {
  const query = useGetGoldenList(type, id, showArchived, showArbitrary);

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

  return (
    <Stack direction="column" alignItems="stretch" gap={3}>
      <BasicBox>
        <Typography variant="body2">
          {totalSubmissionCount} submissions across {campaigns.length} campaigns
        </Typography>
      </BasicBox>
      {campaigns.map((campaign, index) => {
        if (
          lastCampaign === null ||
          lastCampaign.name.toUpperCase().charAt(0) !== campaign.name.toUpperCase().charAt(0)
        ) {
          lastCampaign = campaign;
          const newLetter = campaign.name.charAt(0).toUpperCase();
          return (
            <>
              <LetterDivider key={newLetter} letter={newLetter} />
              <CampaignEntry key={campaign.id} campaign={campaign} type={type} />
            </>
          );
        }
        lastCampaign = campaign;
        return <CampaignEntry key={campaign.id} campaign={campaign} type={type} />;
      })}
    </Stack>
  );
}

function CampaignEntry({ campaign, type }) {
  const theme = useTheme();
  const [selectedMapIndex, setSelectedMapIndex] = useState(0);

  return (
    <BasicBox className={"campaign-box" + (theme.palette.mode === "dark" ? " dark" : "")}>
      <Grid container rowSpacing={0} columnSpacing={1}>
        <Grid
          item
          xs={12}
          className="campaign-box-header"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" gap={1} alignItems="center">
            <CampaignIcon campaign={campaign} />
            <Link to={"/campaign/" + campaign.id} style={{ color: "inherit", textDecoration: "none" }}>
              <Typography variant="h6">{campaign.name}</Typography>
            </Link>
            <Link
              to={"/search/" + campaign.author_gb_name}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <Typography variant="body2">by {campaign.author_gb_name}</Typography>
            </Link>
            <StyledExternalLink href={campaign.url}>
              <FontAwesomeIcon icon={faLemon} fontSize="1em" />
            </StyledExternalLink>
          </Stack>
          {campaign.maps.length > 1 && (
            <CampaignGoldenDifficultiesBar campaign={campaign} sx={{ width: "300px" }} />
          )}
        </Grid>
        <Grid container item xs={12} rowSpacing={1} columnSpacing={1} sx={{ pr: 1 }}>
          {campaign.maps.length > 1 && (
            <Grid item xs={12}>
              <MapSelectAlt
                campaign={campaign}
                type={type}
                selectedMap={selectedMapIndex}
                onSelectMap={setSelectedMapIndex}
              />
            </Grid>
          )}
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
  return (
    <Divider sx={{ my: 0 }}>
      <Chip label={letter} />
    </Divider>
  );
}

function MapSelectAlt({ campaign, type, selectedMap, onSelectMap }) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs variant="scrollable" value={selectedMap} onChange={(e, v) => onSelectMap(v)}>
        {campaign.maps.map((map, index) => (
          <Tab key={map.id} label={getMapName(map, campaign, false)} />
        ))}
      </Tabs>
    </Box>
  );
}

function MapSelectEntry({ campaign, map, type, selected, onClick }) {
  return (
    <div className={"map-select-entry" + (selected ? " selected" : "")} onClick={onClick}>
      <Typography fontWeight="bold">{getMapName(map, campaign)}</Typography>
    </div>
  );
}

function MapEntry({ campaign, map, type }) {
  return (
    <Stack direction="column" spacing={1}>
      {map.challenges.map((challenge, index) => (
        <>
          {index !== 0 ? <Divider key={challenge.id + 99999} /> : null}
          <ChallengeEntry key={challenge.id} challenge={challenge} type={type} />
        </>
      ))}
    </Stack>
  );
}

function ChallengeEntry({ challenge, type }) {
  return (
    <Grid container rowSpacing={1} columnSpacing={1}>
      <Grid component={Stack} item xs={12} sm={1} direction="row" gap={1}>
        <DifficultyChip difficulty={challenge.difficulty} sx={{ width: "100%", textAlign: "center" }} />
      </Grid>
      <Grid
        component={Stack}
        item
        xs={12}
        sm={challenge.description !== null ? 2 : 1}
        direction="row"
        gap={1}
      >
        {getChallengeFcShort(challenge)}
        <span>({challenge.submissions.length})</span>
        {challenge.description !== null && <span>{challenge.description}</span>}
      </Grid>
      <Grid item xs={12} sm={challenge.description !== null ? 9 : 10}>
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
  return (
    <Link className="submission-link" to={"/submission/" + submission.id}>
      <span className="submission-player-name" style={{ ...getPlayerNameColorStyle(submission.player) }}>
        {submission.player.name}
      </span>
      {submission.is_fc ? <span> [FC]</span> : null}
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
  const width = (count / total) * 100;
  const colors = getDifficultyColors(difficulty.id);
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
          backgroundColor: colors.group_color,
          color: colors.contrast_color,
        }}
      >
        <span>{count}</span>
      </Box>
    </Tooltip>
  );
}
