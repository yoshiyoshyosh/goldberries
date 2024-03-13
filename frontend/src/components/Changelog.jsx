import { Accordion, AccordionDetails, AccordionSummary, Box, Paper, Stack, Typography } from "@mui/material";
import { getQueryData, useGetChangelog } from "../hooks/useApi";
import { ErrorDisplay, LoadingSpinner } from "./BasicComponents";
import { PlayerChip } from "./GoldberriesComponents";
import { displayDate } from "../util/data_util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faExpand } from "@fortawesome/free-solid-svg-icons";

export function Changelog({ type, id }) {
  const query = useGetChangelog(type, id);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const changelog = getQueryData(query);
  const changelogReverse = [...changelog].reverse();

  //type but capitalize the first letter
  const forObj = type.charAt(0).toUpperCase() + type.slice(1);

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
              <ChangelogEntry key={entry.id} entry={entry} />
            ))}
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export function ChangelogEntry({ entry }) {
  return (
    <Box component={Paper} sx={{ p: 1 }}>
      <Stack direction="row" alignItems="center">
        <PlayerChip player={entry.author} />
        <Typography variant="body1" sx={{ flex: 1 }}>
          {entry.description}
        </Typography>
        <Typography variant="body1">{displayDate(entry.date)}</Typography>
      </Stack>
    </Box>
  );
}
