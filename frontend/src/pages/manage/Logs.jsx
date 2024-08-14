import { useDebounce, useLocalStorage } from "@uidotdev/usehooks";
import { useAuth } from "../../hooks/AuthProvider";
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { jsonDateToJsDate } from "../../util/util";
import { BasicContainerBox, ErrorDisplay, HeadTitle, LoadingSpinner } from "../../components/BasicComponents";
import { getQueryData, useDeleteLogEntry, useGetLogs } from "../../hooks/useApi";
import { useTranslation } from "react-i18next";

export function PageLogs() {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.logs" });
  const [filter, setFilter] = useLocalStorage("logs_filter", {
    page: 1,
    perPage: 25,
    level: "",
    topic: "",
    search: "",
    startDate: "",
    endDate: "",
  });
  const searchDebounced = useDebounce(filter.search, 500);

  const query = useGetLogs(
    filter.page,
    filter.perPage,
    filter.level === "" ? null : filter.level,
    filter.topic === "" ? null : filter.topic,
    searchDebounced === "" ? null : searchDebounced,
    filter.startDate === "" ? null : filter.startDate,
    filter.endDate === "" ? null : filter.endDate
  );
  const { mutate: deleteLog } = useDeleteLogEntry();

  const handleFilterChange = (name, value) => {
    setFilter({ ...filter, page: 1, [name]: value });
  };

  const handlePageChange = (newPage) => {
    setFilter({ ...filter, page: 1, page: newPage });
  };
  const handlePerPageChange = (newPerPage) => {
    setFilter({ ...filter, page: 1, perPage: newPerPage });
  };

  if (!query.isSuccess && query.isLoading) {
    return (
      <BasicContainerBox maxWidth="lg">
        <HeadTitle title={t("title")} />
        <LogFilter filter={filter} setFilter={handleFilterChange} />
        <LoadingSpinner />
      </BasicContainerBox>
    );
  } else if (query.isError) {
    return (
      <BasicContainerBox maxWidth="lg">
        <HeadTitle title={t("title")} />
        <LogFilter filter={filter} setFilter={handleFilterChange} />
        <ErrorDisplay error={query.error} />
      </BasicContainerBox>
    );
  }

  const { logs, max_count: maxCount, max_page: maxPage } = getQueryData(query);

  return (
    <BasicContainerBox maxWidth="lg">
      <HeadTitle title={t("title")} />
      <LogFilter filter={filter} setFilter={handleFilterChange} />
      {logs.length === 0 && <Typography variant="body2">{t("no_logs")}</Typography>}
      {logs.length > 0 && (
        <LogsTable
          logs={logs}
          maxCount={maxCount}
          deleteLog={deleteLog}
          page={filter.page}
          setPage={handlePageChange}
          perPage={filter.perPage}
          setPerPage={handlePerPageChange}
        />
      )}
    </BasicContainerBox>
  );
}

function LogFilter({ filter, setFilter }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.logs" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const levels = [
    { value: "debug", label: "Debug" },
    { value: "info", label: "Info" },
    { value: "warn", label: "Warning" },
    { value: "error", label: "Error" },
    { value: "critical", label: "Critical" },
  ];
  const topics = [
    { value: "Login", label: "Login" },
    { value: "Registration", label: "Registration" },
    { value: "Account", label: "Account" },
    { value: "divider" },
    { value: "Campaign", label: "Campaign" },
    { value: "Map", label: "Map" },
    { value: "Challenge", label: "Challenge" },
    { value: "Submission", label: "Submission" },
    { value: "divider" },
    { value: "Change", label: "Change" },
    { value: "Player", label: "Player" },
    { value: "divider" },
    { value: "Server Error", label: "Server Error" },
  ];

  const dateInputStyle = {
    borderRadius: "4px",
    border: "1px solid rgba(0,0,0,0.23)",
  };

  return (
    <Box
      sx={{
        my: 2,
      }}
    >
      <Stack
        sx={{
          my: 1,
        }}
        direction="row"
        spacing={2}
        useFlexGap
        flexWrap={{ xs: "wrap", sm: "nowrap" }}
      >
        {/* Date picker for startDate and endDate */}
        <input
          type="date"
          value={filter.startDate}
          onChange={(e) => setFilter("startDate", e.target.value)}
          style={dateInputStyle}
        />
        <input
          type="date"
          value={filter.endDate}
          onChange={(e) => setFilter("endDate", e.target.value)}
          style={dateInputStyle}
        />
        <TextField
          label={t("topic")}
          select
          value={filter.topic}
          onChange={(e) => setFilter("topic", e.target.value)}
          sx={{ minWidth: 100 }}
          SelectProps={{ MenuProps: { disableScrollLock: true } }}
        >
          <MenuItem value="">
            <em>{t_g("all")}</em>
          </MenuItem>
          <Divider />
          {topics.map((topic, index) => {
            if (topic.value === "divider") return <Divider key={index} />;
            return (
              <MenuItem key={topic.value} value={topic.value}>
                {topic.label}
              </MenuItem>
            );
          })}
        </TextField>
        <TextField
          label={t("level")}
          select
          value={filter.level}
          onChange={(e) => setFilter("level", e.target.value)}
          sx={{ minWidth: 100 }}
          SelectProps={{ MenuProps: { disableScrollLock: true } }}
        >
          <MenuItem value="">
            <em>{t_g("all")}</em>
          </MenuItem>
          {levels.map((level) => (
            <MenuItem key={level.value} value={level.value}>
              {level.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label={t("search")}
          value={filter.search}
          onChange={(e) => setFilter("search", e.target.value)}
          fullWidth
        />
      </Stack>
    </Box>
  );
}

function LogsTable({ logs, maxCount, deleteLog, page, setPage, perPage, setPerPage }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.logs" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const auth = useAuth();
  const canDelete = auth.isAdmin;

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t_g("date")}</TableCell>
            <TableCell>{t_g("time")}</TableCell>
            <TableCell align="center">{t("level")}</TableCell>
            <TableCell align="center">{t("topic")}</TableCell>
            <TableCell align="left">{t("message")}</TableCell>
            <TableCell align="center"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              <TableCell component="th" scope="row">
                {jsonDateToJsDate(log.date).toLocaleDateString(navigator.language)}
              </TableCell>
              <TableCell component="th" scope="row">
                {jsonDateToJsDate(log.date).toLocaleTimeString(navigator.language)}
              </TableCell>
              <TableCell align="center" sx={{ textTransform: "capitalize" }}>
                {log.level}
              </TableCell>
              <TableCell align="center">{log.topic}</TableCell>
              <TableCell align="left" sx={{ overflowWrap: "anywhere" }}>
                {log.message}
              </TableCell>
              <TableCell align="center">
                {canDelete && (
                  <Button
                    onClick={() => deleteLog(log.id)}
                    size="medium"
                    color="error"
                    variant="outlined"
                    sx={{ minWidth: 0 }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100, { value: -1, label: t_g("all") }]}
        component="div"
        count={maxCount}
        rowsPerPage={perPage}
        labelRowsPerPage={t_g("table_rows_per_page")}
        page={page - 1}
        onPageChange={(e, newPage) => setPage(newPage + 1)}
        onRowsPerPageChange={(e) => {
          setPerPage(e.target.value);
        }}
        slotProps={{
          select: {
            MenuProps: {
              disableScrollLock: true,
            },
          },
        }}
      />
    </TableContainer>
  );
}
