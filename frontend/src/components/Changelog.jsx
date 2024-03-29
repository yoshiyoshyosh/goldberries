import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { getQueryData, useDeleteChangelogEntry, useGetChangelog } from "../hooks/useApi";
import { ErrorDisplay, LoadingSpinner } from "./BasicComponents";
import { PlayerChip } from "./GoldberriesComponents";
import { displayDate } from "../util/data_util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faExpand, faTrash } from "@fortawesome/free-solid-svg-icons";
import { CustomModal, ModalButtons, useModal } from "../hooks/useModal";
import { useAuth } from "../hooks/AuthProvider";
import { toast } from "react-toastify";

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
  return (
    <Box component={Paper} sx={{ p: 1 }}>
      <Stack direction="row" alignItems="center">
        <PlayerChip player={entry.author} />
        <Typography variant="body1" sx={{ flex: 1, ml: 1 }}>
          {entry.description}
        </Typography>
        <Typography variant="body1">{displayDate(entry.date)}</Typography>
        {canManage && (
          <IconButton color="error" onClick={() => deleteEntry(entry.id)} sx={{ ml: 1 }}>
            <FontAwesomeIcon icon={faTrash} style={{ fontSize: "75%" }} />
          </IconButton>
        )}
      </Stack>
    </Box>
  );
}
