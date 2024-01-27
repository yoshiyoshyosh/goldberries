import {
  Chip,
  Container,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Paper,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { fetchMap } from "../util/api";
import { ChallengeDetailsList, ChallengeSubmissionTable } from "./Challenge";
import { faBook, faFlagCheckered, faLandmark, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getChallengeName, getGamebananaEmbedUrl, getMapAuthor, getMapLobbyInfo } from "../util/data_util";
import { useQuery } from "react-query";
import { ErrorDisplay, LoadingSpinner } from "../components/BasicComponents";
import { GoldberriesBreadcrumbs } from "../components/Breadcrumb";
import { DifficultyChip } from "./Submit";

export function PageMap() {
  const { id } = useParams();

  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 2 }}>
        <MapDisplay id={id} />
      </Paper>
    </Container>
  );
}

export function MapDisplay({ id }) {
  const query = useQuery({
    queryKey: ["map", id],
    queryFn: () => fetchMap(id),
  });

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const map = query.data.data;

  return (
    <>
      <GoldberriesBreadcrumbs campaign={map.campaign} map={map} />
      <Divider sx={{ my: 2 }}>
        <Chip label="Map" size="small" />
      </Divider>
      <MapDetailsList map={map} />
      {map.challenges.map((challenge) => {
        return (
          <>
            <Divider sx={{ my: 2 }}>
              <Link to={"/challenge/" + challenge.id}>
                <Chip label={"Challenge - " + getChallengeName(challenge)} size="small" />
              </Link>
            </Divider>
            <DifficultyChip difficulty={challenge.difficulty} prefix="Difficulty: " sx={{ mb: 1 }} />
            <ChallengeSubmissionTable key={challenge.id} challenge={challenge} />
          </>
        );
      })}
    </>
  );
}

export function MapDetailsList({ map }) {
  const embedUrl = getGamebananaEmbedUrl(map.campaign.url);
  const author = getMapAuthor(map);
  const lobbyInfo = getMapLobbyInfo(map);
  const majorInfo = lobbyInfo.major ? lobbyInfo.major.name + ": " + lobbyInfo.major.label : null;
  const minorInfo = lobbyInfo.minor ? lobbyInfo.minor.name + ": " + lobbyInfo.minor.label : null;
  return (
    <List dense>
      <ListSubheader>Map Details</ListSubheader>
      <ListItem>
        <ListItemIcon>
          <FontAwesomeIcon icon={faBook} />
        </ListItemIcon>
        <ListItemText primary={map.campaign.name} secondary="Campaign" />
        {embedUrl && (
          <ListItemSecondaryAction
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            <Link to={map.campaign.url} target="_blank">
              <img src={embedUrl} alt="Campaign Banner" style={{ borderRadius: "5px" }} />
            </Link>
          </ListItemSecondaryAction>
        )}
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <FontAwesomeIcon icon={faLandmark} />
        </ListItemIcon>
        <ListItemText primary={map.name} secondary="Map" />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <FontAwesomeIcon icon={faUser} />
        </ListItemIcon>
        <ListItemText
          primary={<Link to={"https://gamebanana.com/members/" + author.id}>{author.name}</Link>}
          secondary="Author"
        />
      </ListItem>
      {(majorInfo || minorInfo) && (
        <ListItem>
          <ListItemIcon>
            <FontAwesomeIcon icon={faFlagCheckered} />
          </ListItemIcon>
          <ListItemText primary={majorInfo ?? minorInfo} secondary={majorInfo ? minorInfo : null} />
        </ListItem>
      )}
    </List>
  );
}
