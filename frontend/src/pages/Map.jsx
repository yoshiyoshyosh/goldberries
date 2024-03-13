import {
  Button,
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
import { ChallengeSubmissionTable } from "./Challenge";
import { faBook, faFlagCheckered, faLandmark, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getChallengeName, getGamebananaEmbedUrl, getMapAuthor, getMapLobbyInfo } from "../util/data_util";
import { useQuery } from "react-query";
import { ErrorDisplay, LoadingSpinner } from "../components/BasicComponents";
import { GoldberriesBreadcrumbs } from "../components/Breadcrumb";
import { DifficultyChip } from "../components/GoldberriesComponents";
import { CustomModal, useModal } from "../hooks/useModal";
import { FormMapWrapper } from "../components/forms/Map";
import { useAuth } from "../hooks/AuthProvider";
import { useGetMap } from "../hooks/useApi";
import { Changelog } from "../components/Changelog";

export function PageMap() {
  const { id } = useParams();

  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 2 }}>
        <MapDisplay id={parseInt(id)} />
      </Paper>
    </Container>
  );
}

export function MapDisplay({ id }) {
  const auth = useAuth();
  const query = useGetMap(id);

  const editMapModal = useModal();

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
      {auth.hasVerifierPriv && (
        <Button onClick={editMapModal.open} variant="outlined">
          Verifier - Edit Map
        </Button>
      )}
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

      <Divider sx={{ my: 2 }} />
      <Changelog type="map" id={id} />

      <CustomModal modalHook={editMapModal} options={{ hideFooter: true }}>
        <FormMapWrapper id={id} onSave={editMapModal.close} />
      </CustomModal>
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
