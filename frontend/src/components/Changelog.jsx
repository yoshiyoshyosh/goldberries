import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  getQueryData,
  useDeleteChangelogEntry,
  useGetAllDifficulties,
  useGetChangelog,
} from "../hooks/useApi";
import { ErrorDisplay, LoadingSpinner } from "./BasicComponents";
import { PlayerChip } from "./GoldberriesComponents";
import { displayDate, getDifficultyName } from "../util/data_util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faExpand, faTrash } from "@fortawesome/free-solid-svg-icons";
import { CustomModal, ModalButtons, useModal } from "../hooks/useModal";
import { useAuth } from "../hooks/AuthProvider";
import { toast } from "react-toastify";
import { get } from "react-hook-form";
import { DifficultyMoveDisplay } from "../pages/Suggestions";

export function Changelog({ type, id }) {
  const auth = useAuth();
  const query = useGetChangelog(type, id);
  const { mutate: deleteChangelogEntry } = useDeleteChangelogEntry(() => {
    toast.success("Changelog entry deleted");
  });

  const deleteEntryModal = useModal(null, (cancelled, id) => {
    if (cancelled) return;
    deleteChangelogEntry(id);
  });

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const changelog = getQueryData(query);
  const changelogReverse = [...changelog].reverse();

  //type but capitalize the first letter
  const forObj = type.charAt(0).toUpperCase() + type.slice(1);

  const canManage = auth.hasVerifierPriv || (type === "player" && id === auth.user?.player_id);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        {forObj} Changelog ({changelog.length})
      </AccordionSummary>
      <AccordionDetails>
        {changelog.length === 0 ? (
          <Typography variant="body2">No changes yet</Typography>
        ) : (
          <Stack direction="column" gap={1}>
            {changelogReverse.map((entry) => (
              <ChangelogEntry
                key={entry.id}
                entry={entry}
                deleteEntry={deleteEntryModal.open}
                canManage={canManage}
              />
            ))}
          </Stack>
        )}
      </AccordionDetails>
      <CustomModal
        modalHook={deleteEntryModal}
        options={{ title: "Delete Entry?" }}
        actions={[ModalButtons.Cancel, ModalButtons.Delete]}
      >
        <Typography variant="body1">Are you sure you want to delete this changelog entry?</Typography>
      </CustomModal>
    </Accordion>
  );
}

export function ChangelogEntry({ entry, deleteEntry, canManage = false }) {
  if (entry.challenge_id !== null && entry.description.startsWith("Moved from"))
    return <ChangelogEntryMovedChallenge entry={entry} deleteEntry={deleteEntry} canManage={canManage} />;

  return (
    <Box component={Paper} sx={{ p: 1 }}>
      <Grid container>
        <Grid item xs="auto" display="flex" alignItems="center" sx={{ order: { xs: 1, md: 1 } }}>
          <PlayerChip player={entry.author} size="small" />
        </Grid>
        <Grid item xs={12} md="auto" display="flex" alignItems="center" sx={{ order: { xs: 5, md: 2 } }}>
          <Typography variant="body1" sx={{ flex: 1, ml: 1 }}>
            {entry.description}
          </Typography>
        </Grid>
        <Grid item xs="auto" md sx={{ order: { xs: 2, md: 3 } }}></Grid>
        <Grid item xs="auto" display="flex" alignItems="center" sx={{ order: { xs: 3, md: 4 } }}>
          <Typography variant="body1" sx={{ ml: { xs: 1, md: 0 } }}>
            {displayDate(entry.date)}
          </Typography>
        </Grid>
        {canManage && (
          <Grid item xs="auto" display="flex" alignItems="center" sx={{ order: { xs: 4, md: 5 } }}>
            <IconButton color="error" onClick={() => deleteEntry(entry.id)} sx={{ ml: 1 }}>
              <FontAwesomeIcon icon={faTrash} style={{ fontSize: "65%" }} />
            </IconButton>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

function ChangelogEntryMovedChallenge({ entry, deleteEntry, canManage = false }) {
  const query = useGetAllDifficulties();

  if (query.isLoading) return <LoadingSpinner />;
  else if (query.isError) return <ErrorDisplay error={query.error} />;

  const description = entry.description;
  //Description will look like this: "Moved from 'Tier 7' to 'High Tier 3'
  //Find the two strings enclosed in single quotes
  const regex = /'([^']+)'/g;
  const matches = description.match(regex);

  if (matches.length !== 2)
    return <ChangelogEntry entry={entry} deleteEntry={deleteEntry} canManage={canManage} />;

  const [from, to] = matches.map((match) => match.replace(/'/g, ""));

  //Then, find the associated difficulties
  const difficulties = getQueryData(query);
  const fromDiff = difficulties.find((diff) => getDifficultyName(diff) === from);
  const toDiff = difficulties.find((diff) => getDifficultyName(diff) === to);

  return (
    <Box component={Paper} sx={{ p: 1 }}>
      <Grid container>
        <Grid item xs="auto" display="flex" alignItems="center" sx={{ order: { xs: 1, md: 1 } }}>
          <PlayerChip player={entry.author} size="small" />
        </Grid>
        <Grid item xs={12} md="auto" display="flex" alignItems="center" sx={{ order: { xs: 5, md: 2 } }}>
          <Stack direction="row" alignItems="center" gap={1} sx={{ ml: { xs: 0, md: 1 } }}>
            <Typography variant="body1">Moved from</Typography>
            <DifficultyMoveDisplay from={fromDiff} to={toDiff} />
          </Stack>
        </Grid>
        <Grid item xs="auto" md sx={{ order: { xs: 2, md: 3 } }}></Grid>
        <Grid item xs="auto" display="flex" alignItems="center" sx={{ order: { xs: 3, md: 4 } }}>
          <Typography variant="body1" sx={{ ml: { xs: 1, md: 0 } }}>
            {displayDate(entry.date)}
          </Typography>
        </Grid>
        {canManage && (
          <Grid item xs="auto" display="flex" alignItems="center" sx={{ order: { xs: 4, md: 5 } }}>
            <IconButton color="error" onClick={() => deleteEntry(entry.id)} sx={{ ml: 1 }}>
              <FontAwesomeIcon icon={faTrash} style={{ fontSize: "65%" }} />
            </IconButton>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
