import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { getQueryData, useGetObjectiveSubmissionCount, useGetObjectives } from "../hooks/useApi";
import { ErrorDisplay, LoadingSpinner, TooltipLineBreaks, getErrorFromMultiple } from "./BasicComponents";
import { useTheme } from "@emotion/react";
import { useMediaQuery } from "@uidotdev/usehooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckSquare,
  faEyeSlash,
  faGreaterThan,
  faGreaterThanEqual,
  faLessThanEqual,
  faQuestionCircle,
  faSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

/*
  filter structure:
  {
    hide_objectives: [id, id, id], //IDs of all objectives to hide
    archived: bool, //true if archived maps should be shown
    arbitrary: bool, //true if arbitrary objectives/challenges should be shown
    clear_state: int, //0 for all, 1 for Only C, 2 for Only FC, 3 for Only FC or C/FC, 4 for Only C or C/FC
    sub_count: int, //count of submissions to filter for
    sub_count_is_min: bool, //true if sub_count is a minimum, false if it is a maximum (both inclusive)
    start_date: string, //start date for date range
    end_date: string, //end date for date range
  }
*/
export function SubmissionFilter({ type, id, filter, setFilter }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.submission_filter" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const theme = useTheme();
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));
  const [localFilter, setLocalFilter] = useState(filter);

  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setFilter(localFilter);
  };
  const open = Boolean(anchorEl);
  const elemId = open ? "submission-filter" : undefined;

  const changedFilter = (key, newValue) => {
    setLocalFilter((prev) => ({ ...prev, [key]: newValue }));
  };
  const changedObjectiveFilter = (id, newValue) => {
    setLocalFilter((prev) => {
      const hide_objectives = prev.hide_objectives.includes(id)
        ? prev.hide_objectives.filter((i) => i !== id)
        : [...prev.hide_objectives, id];
      return { ...prev, hide_objectives };
    });
  };
  const changedAllObjectives = (newValue) => {
    setLocalFilter((prev) => {
      const hide_objectives = newValue ? [] : sortedObjectives.map((o) => o.id);
      return { ...prev, hide_objectives };
    });
  };

  const queryObjectives = useGetObjectives();
  const objectives = getQueryData(queryObjectives);
  const sortedObjectives = objectives ? objectives.sort((a, b) => a.id - b.id) : [];

  const isPlayer = type === "player";
  const queryObjectiveSubmissionCount = useGetObjectiveSubmissionCount(type, id);
  const objectiveSubmissionCount = getQueryData(queryObjectiveSubmissionCount);

  const isLoading = queryObjectives.isLoading || queryObjectiveSubmissionCount.isLoading;
  const isError = queryObjectives.isError || queryObjectiveSubmissionCount.isError;
  const error = isError ? getErrorFromMultiple(queryObjectives, queryObjectiveSubmissionCount) : null;

  const disabledFilters = [];
  if (!localFilter.archived) disabledFilters.push("Archived Maps");
  if (!localFilter.arbitrary) disabledFilters.push("Arbitrary Challenges");
  sortedObjectives.forEach((objective) => {
    if (localFilter.hide_objectives.includes(objective.id)) disabledFilters.push(objective.name);
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
                      checked={!localFilter.hide_objectives.includes(objective.id)}
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
                checked={localFilter.archived}
                onChange={(e) => changedFilter("archived", e.target.checked)}
                control={<Checkbox />}
                label={t("show_archived")}
                sx={{ whiteSpace: "nowrap", mr: 0 }}
              />
              <FormControlLabel
                checked={localFilter.arbitrary}
                onChange={(e) => changedFilter("arbitrary", e.target.checked)}
                control={<Checkbox />}
                label={t("show_arbitrary")}
                sx={{ whiteSpace: "nowrap", mr: 0 }}
              />
              <TextField
                select
                label={t("clear_state.label")}
                fullWidth
                value={localFilter.clear_state ?? 0}
                onChange={(e) => changedFilter("clear_state", e.target.value)}
                SelectProps={{
                  MenuProps: { disableScrollLock: true },
                }}
                sx={{ mt: 1 }}
              >
                <MenuItem value="0">{t("clear_state.all")}</MenuItem>
                <MenuItem value="1">{t("clear_state.only_c")}</MenuItem>
                <MenuItem value="2">{t("clear_state.only_fc")}</MenuItem>
                <MenuItem value="3">{t("clear_state.no_c")}</MenuItem>
                <MenuItem value="4">{t("clear_state.no_fc")}</MenuItem>
              </TextField>
              {!isPlayer && (
                <>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {t("submission_count.label")}{" "}
                    <Tooltip arrow placement="top" title={t("submission_count.explanation")}>
                      <FontAwesomeIcon icon={faQuestionCircle} />
                    </Tooltip>
                  </Typography>
                  <Grid container spacing={0.5}>
                    <Grid item xs={6}>
                      <TextField
                        type="number"
                        fullWidth
                        value={localFilter.sub_count ?? ""}
                        onChange={(e) => changedFilter("sub_count", e.target.value)}
                        placeholder={t("submission_count.none")}
                      />
                    </Grid>
                    <Grid item xs={6} display="flex">
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => changedFilter("sub_count_is_min", !localFilter.sub_count_is_min)}
                        fullWidth
                        startIcon={
                          <FontAwesomeIcon
                            icon={localFilter.sub_count_is_min ? faGreaterThanEqual : faLessThanEqual}
                          />
                        }
                        sx={{ alignSelf: "stretch" }}
                      >
                        {localFilter.sub_count_is_min ? t("submission_count.min") : t("submission_count.max")}
                      </Button>
                    </Grid>
                  </Grid>
                </>
              )}
              <Typography variant="body1" sx={{ mt: 1 }}>
                {t("date_range.label")}{" "}
                <TooltipLineBreaks arrow placement="top" title={t("date_range.explanation")}>
                  <FontAwesomeIcon icon={faQuestionCircle} />
                </TooltipLineBreaks>
              </Typography>
              <DatePicker
                label={t("date_range.start_date")}
                value={localFilter.start_date ? dayjs(localFilter.start_date) : null}
                onChange={(value) => {
                  if (value && value.isValid()) {
                    changedFilter("start_date", value.toISOString());
                  } else {
                    changedFilter("start_date", null);
                  }
                }}
                minDate={dayjs(new Date(2018, 9, 12, 12))}
                maxDate={dayjs(new Date())}
                sx={{ mt: 1 }}
              />
              <DatePicker
                label={t("date_range.end_date")}
                value={localFilter.end_date ? dayjs(localFilter.end_date) : null}
                onChange={(value) => {
                  if (value && value.isValid()) {
                    changedFilter("end_date", value.toISOString());
                  } else {
                    changedFilter("end_date", null);
                  }
                }}
                minDate={dayjs(new Date(2018, 9, 12, 12))}
                maxDate={dayjs(new Date())}
                sx={{ mt: 1 }}
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
