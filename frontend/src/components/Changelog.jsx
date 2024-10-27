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
import { displayDate, extractDifficultiesFromChangelog, getDifficultyName } from "../util/data_util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faTrash } from "@fortawesome/free-solid-svg-icons";
import { CustomModal, ModalButtons, useModal } from "../hooks/useModal";
import { useAuth } from "../hooks/AuthProvider";
import { toast } from "react-toastify";
import { DifficultyMoveDisplay } from "../pages/Suggestions";
import { useTranslation } from "react-i18next";

export function Changelog({ type, id, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.changelog" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
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
  const forObj = t_g(type, { count: 1 });

  const canManage = auth.hasVerifierPriv || (type === "player" && id === auth.user?.player_id);

  return (
    <Accordion {...props}>
      <AccordionSummary
        expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        {forObj} {t("name")} ({changelog.length})
      </AccordionSummary>
      <AccordionDetails>
        {changelog.length === 0 ? (
          <Typography variant="body2">{t("no_changes_yet")}</Typography>
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
        options={{ title: t("entry_delete_modal_title") }}
        actions={[ModalButtons.cancel, ModalButtons.delete]}
      >
        <Typography variant="body1">{t("entry_delete_confirm")}</Typography>
      </CustomModal>
    </Accordion>
  );
}

export function ChangelogEntry({ entry, deleteEntry, canManage = false }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  if (entry.challenge_id !== null && entry.description.startsWith("Moved from"))
    return <ChangelogEntryMovedChallenge entry={entry} deleteEntry={deleteEntry} canManage={canManage} />;

  return (
    <Paper elevation={4} sx={{ p: 1 }}>
      <Grid container>
        <Grid item xs="auto" display="flex" alignItems="center">
          <PlayerChip player={entry.author} size="small" />
        </Grid>
        <Grid item xs="auto" md></Grid>
        <Grid item xs="auto" display="flex" alignItems="center">
          <Typography variant="body1" sx={{ ml: { xs: 1, md: 0 } }}>
            {displayDate(entry.date, t_g)}
          </Typography>
        </Grid>
        {canManage && (
          <Grid item xs="auto" display="flex" alignItems="center">
            <IconButton color="error" onClick={() => deleteEntry(entry.id)} sx={{ ml: 1 }}>
              <FontAwesomeIcon icon={faTrash} style={{ fontSize: "65%" }} />
            </IconButton>
          </Grid>
        )}
        <Grid item xs={12} display="flex" alignItems="center">
          <Typography variant="body1" sx={{ flex: 1, ml: 1 }}>
            {entry.description}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}

function ChangelogEntryMovedChallenge({ entry, deleteEntry, canManage = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.changelog" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const query = useGetAllDifficulties();

  if (query.isLoading) return <LoadingSpinner />;
  else if (query.isError) return <ErrorDisplay error={query.error} />;

  const result = extractDifficultiesFromChangelog(entry, getQueryData(query));
  if (!result) return <ChangelogEntry entry={entry} deleteEntry={deleteEntry} canManage={canManage} />;

  const [fromDiff, toDiff] = result;

  return (
    <Paper elevation={4} sx={{ p: 1 }}>
      <Grid container>
        <Grid item xs="auto" display="flex" alignItems="center">
          <PlayerChip player={entry.author} size="small" />
        </Grid>
        <Grid item xs="auto" md></Grid>
        <Grid item xs="auto" display="flex" alignItems="center">
          <Typography variant="body1" sx={{ ml: { xs: 1, md: 0 } }}>
            {displayDate(entry.date, t_g)}
          </Typography>
        </Grid>
        {canManage && (
          <Grid item xs="auto" display="flex" alignItems="center">
            <IconButton color="error" onClick={() => deleteEntry(entry.id)} sx={{ ml: 1 }}>
              <FontAwesomeIcon icon={faTrash} style={{ fontSize: "65%" }} />
            </IconButton>
          </Grid>
        )}
        <Grid item xs={12} display="flex" alignItems="center">
          <Stack direction="row" alignItems="center" gap={1} sx={{ ml: { xs: 0, md: 1 } }}>
            <Typography variant="body1">{t("moved_from")}</Typography>
            <DifficultyMoveDisplay from={fromDiff} to={toDiff} />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
