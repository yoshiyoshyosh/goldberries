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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { ErrorDisplay, LoadingSpinner } from "../components/BasicComponents";
import { DifficultyChip } from "../components/GoldberriesComponents";
import { getGamebananaEmbedUrl } from "../util/data_util";
import { GoldberriesBreadcrumbs } from "../components/Breadcrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faComment,
  faExternalLinkAlt,
  faFlagCheckered,
  faInfoCircle,
  faLandmark,
  faShield,
} from "@fortawesome/free-solid-svg-icons";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import { CustomModal, useModal } from "../hooks/useModal";
import { useAuth } from "../hooks/AuthProvider";
import { FormChallengeWrapper } from "../components/forms/Challenge";
import { useGetChallenge } from "../hooks/useApi";

const displayNoneOnMobile = {
  display: {
    xs: "none",
    sm: "table-cell",
  },
};

export function PageChallenge({}) {
  const { id } = useParams();

  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 2 }}>
        <ChallengeDisplay id={parseInt(id)} />
      </Paper>
    </Container>
  );
}

export function ChallengeDisplay({ id }) {
  const auth = useAuth();
  const query = useGetChallenge(id);

  const editChallengeModal = useModal();

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const challenge = query.data.data;

  return (
    <>
      <GoldberriesBreadcrumbs campaign={challenge.map.campaign} map={challenge.map} challenge={challenge} />
      <Divider sx={{ my: 2 }}>
        <Chip label="Challenge" size="small" />
      </Divider>
      {auth.hasVerifierPriv && (
        <Button onClick={editChallengeModal.open} variant="outlined">
          Verifier - Edit Challenge
        </Button>
      )}
      <ChallengeDetailsList challenge={challenge} />
      <Divider sx={{ my: 2 }}>
        <Chip label="Submissions" size="small" />
      </Divider>
      <ChallengeSubmissionTable challenge={challenge} />

      <CustomModal modalHook={editChallengeModal} options={{ hideFooter: true }}>
        <FormChallengeWrapper id={id} onSave={editChallengeModal.close} />
      </CustomModal>
    </>
  );
}

export function ChallengeDetailsList({ challenge }) {
  const embedUrl = getGamebananaEmbedUrl(challenge.map.campaign.url);

  return (
    <List dense>
      <ListSubheader>Challenge Details</ListSubheader>
      <ListItem>
        <ListItemIcon>
          <FontAwesomeIcon icon={faBook} />
        </ListItemIcon>
        <ListItemText primary={challenge.map.campaign.name} secondary="Campaign" />
        {embedUrl && (
          <ListItemSecondaryAction
            sx={{
              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            <Link to={challenge.map.campaign.url} target="_blank">
              <img src={embedUrl} alt="Campaign Banner" style={{ borderRadius: "5px" }} />
            </Link>
          </ListItemSecondaryAction>
        )}
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <FontAwesomeIcon icon={faLandmark} />
        </ListItemIcon>
        <ListItemText primary={challenge.map.name} secondary="Map" />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <FontAwesomeIcon icon={faFlagCheckered} />
        </ListItemIcon>
        <ListItemText
          primary={
            <Stack direction="row" spacing={1} useFlexGap alignItems="center">
              {challenge.objective.name}
              <Tooltip title={challenge.objective.description}>
                <FontAwesomeIcon icon={faInfoCircle} />
              </Tooltip>
            </Stack>
          }
          secondary="Objective"
        />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <FontAwesomeIcon icon={faShield} />
        </ListItemIcon>
        <ListItemText primary={<DifficultyChip difficulty={challenge.difficulty} prefix="Difficulty: " />} />
      </ListItem>
    </List>
  );
}

export function ChallengeSubmissionTable({ challenge, compact = false, ...props }) {
  return (
    <TableContainer component={Paper} {...props}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell width={1}></TableCell>
            <TableCell width={compact ? 1 : undefined}>Player</TableCell>
            {compact ? null : (
              <TableCell width={1} align="center" sx={displayNoneOnMobile}>
                <FontAwesomeIcon icon={faComment} />
              </TableCell>
            )}
            <TableCell width={1} align="center" sx={displayNoneOnMobile}>
              <FontAwesomeIcon icon={faYoutube} />
            </TableCell>
            {compact ? null : (
              <TableCell
                width={1}
                align="center"
                sx={{
                  whiteSpace: {
                    xs: "normal",
                    sm: "nowrap",
                  },
                }}
              >
                Suggestion
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {challenge.submissions.map((submission, index) => (
            <ChallengeSubmissionRow submission={submission} index={index} compact={compact} />
          ))}
          {challenge.submissions.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>No submissions</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function ChallengeSubmissionRow({ submission, index, compact }) {
  return (
    <TableRow>
      <TableCell width={1} sx={{ pr: 0 }}>
        #{index + 1}
      </TableCell>
      <TableCell width={compact ? 1 : undefined}>
        <Stack direction="row" gap={1}>
          <Link to={"/submission/" + submission.id}>
            <FontAwesomeIcon icon={faBook} />
          </Link>
          <Link to={"/player/" + submission.player.id} style={{ whiteSpace: "nowrap" }}>
            {submission.player.name}
          </Link>
        </Stack>
      </TableCell>
      {compact ? null : (
        <TableCell width={1} align="center" sx={displayNoneOnMobile}>
          {submission.player_notes && (
            <Tooltip title={submission.player_notes}>
              <FontAwesomeIcon icon={faComment} />
            </Tooltip>
          )}
        </TableCell>
      )}
      <TableCell width={1} align="center" sx={displayNoneOnMobile}>
        <Link to={submission.proof_url} target="_blank">
          <FontAwesomeIcon icon={faExternalLinkAlt} />
        </Link>
      </TableCell>
      {compact ? null : (
        <TableCell width={1} align="center">
          <DifficultyChip difficulty={submission.suggested_difficulty} />
        </TableCell>
      )}
    </TableRow>
  );
}
