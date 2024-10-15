import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  FormControlLabel,
  Grid,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { getQueryData, useGetObjectiveSubmissionCount, useGetObjectives } from "../hooks/useApi";
import { ErrorDisplay, LoadingSpinner, getErrorFromMultiple } from "./BasicComponents";
import { useTheme } from "@emotion/react";
import { useMediaQuery } from "@uidotdev/usehooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare, faEyeSlash, faSquare } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

/*
  filter structure:
  {
    hide_objectives: [id, id, id], //IDs of all objectives to hide
    archived: bool, //true if archived maps should be shown
    arbitrary: bool, //true if arbitrary objectives/challenges should be shown
  }
*/
export function SubmissionFilter({ type, id, filter, setFilter }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.submission_filter" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const theme = useTheme();
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const elemId = open ? "submission-filter" : undefined;

  const changedBoolFilter = (key, newValue) => {
    setFilter((prev) => ({ ...prev, [key]: newValue }));
  };
  const changedObjectiveFilter = (id, newValue) => {
    setFilter((prev) => {
      const hide_objectives = prev.hide_objectives.includes(id)
        ? prev.hide_objectives.filter((i) => i !== id)
        : [...prev.hide_objectives, id];
      return { ...prev, hide_objectives };
    });
  };
  const changedAllObjectives = (newValue) => {
    setFilter((prev) => {
      const hide_objectives = newValue ? [] : sortedObjectives.map((o) => o.id);
      return { ...prev, hide_objectives };
    });
  };

  const queryObjectives = useGetObjectives();
  const objectives = getQueryData(queryObjectives);
  const sortedObjectives = objectives ? objectives.sort((a, b) => a.id - b.id) : [];

  const queryObjectiveSubmissionCount = useGetObjectiveSubmissionCount(type, id);
  const objectiveSubmissionCount = getQueryData(queryObjectiveSubmissionCount);

  const isLoading = queryObjectives.isLoading || queryObjectiveSubmissionCount.isLoading;
  const isError = queryObjectives.isError || queryObjectiveSubmissionCount.isError;
  const error = isError ? getErrorFromMultiple(queryObjectives, queryObjectiveSubmissionCount) : null;

  const disabledFilters = [];
  if (!filter.archived) disabledFilters.push("Archived Maps");
  if (!filter.arbitrary) disabledFilters.push("Arbitrary Challenges");
  sortedObjectives.forEach((objective) => {
    if (filter.hide_objectives.includes(objective.id)) disabledFilters.push(objective.name);
  });

  return (
    <Stack direction="row" gap={1} alignItems="center">
      <Button aria-describedby={elemId} variant="contained" onClick={handleClick}>
        {t("label")}
      </Button>
      <Popover
        id={elemId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "middle",
          horizontal: "right",
        }}
        disableScrollLock={isMdScreen ? false : true}
        slotProps={{
          paper: {
            sx: {
              width: "500px",
              maxWidth: "92%",
            },
          },
        }}
      >
        {isLoading && <LoadingSpinner />}
        {isError && <ErrorDisplay error={error} />}
        {!isLoading && !isError && (
          <Grid container rowSpacing={1} sx={{ p: 2 }}>
            <Grid item xs={12} md={6}>
              <Stack direction="column" gap={0}>
                <Typography variant="h6">{t_g("objective", { count: 30 })}</Typography>
                {sortedObjectives.map((objective) => {
                  const submissionCount = objectiveSubmissionCount[objective.id] || 0;
                  return (
                    <FormControlLabel
                      checked={!filter.hide_objectives.includes(objective.id)}
                      onChange={(e) => changedObjectiveFilter(objective.id, e.target.checked)}
                      control={<Checkbox />}
                      label={`${objective.name} (${submissionCount})`}
                      sx={{ whiteSpace: "nowrap", mr: 0 }}
                    />
                  );
                })}
                <ButtonGroup variant="outlined" color="primary">
                  <Button
                    startIcon={<FontAwesomeIcon icon={faCheckSquare} />}
                    onClick={() => changedAllObjectives(true)}
                  >
                    {t("all")}
                  </Button>
                  <Button
                    startIcon={<FontAwesomeIcon icon={faSquare} />}
                    onClick={() => changedAllObjectives(false)}
                  >
                    {t("all")}
                  </Button>
                </ButtonGroup>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">{t("additional_filters")}</Typography>
              <FormControlLabel
                checked={filter.archived}
                onChange={(e) => changedBoolFilter("archived", e.target.checked)}
                control={<Checkbox />}
                label={t("show_archived")}
                sx={{ whiteSpace: "nowrap", mr: 0 }}
              />
              <FormControlLabel
                checked={filter.arbitrary}
                onChange={(e) => changedBoolFilter("arbitrary", e.target.checked)}
                control={<Checkbox />}
                label={t("show_arbitrary")}
                sx={{ whiteSpace: "nowrap", mr: 0 }}
              />
            </Grid>
          </Grid>
        )}
      </Popover>

      <Stack direction="column" gap={0} alignItems="flex-start">
        {disabledFilters.length > 0 && (
          <Stack direction="row" gap={0.5} alignItems="center">
            <FontAwesomeIcon icon={faEyeSlash} color={theme.palette.text.secondary} size="xs" />
            <Typography variant="caption" color="text.secondary">
              {t("categories_hidden", { count: disabledFilters.length })}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

export function getDefaultFilter() {
  return {
    hide_objectives: [],
    archived: true,
    arbitrary: true,
  };
}
