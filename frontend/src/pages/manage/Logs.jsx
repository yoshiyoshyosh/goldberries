import { useDebounce } from "@uidotdev/usehooks";
import { useLocalStorage } from "../../hooks/useStorage";
import { useEffect, useState } from "react";
import axios from "axios";
import { useMutation, useQuery } from "react-query";
import { useAuth } from "../../hooks/AuthProvider";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { jsonDateToJsDate } from "../../util/util";

export function PageLogs() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useLocalStorage("logs_filter", {
    time: "day",
    topic: "",
    level: "",
    search: "",
  });
  const searchDebounced = useDebounce(filter.search, 500);

  const fetchLogs = () => {
    const data = {
      time: filter.time,
      topic: filter.topic,
      level: filter.level,
      search: filter.search,
    };
    return axios.get("/logging.php", {
      params: data,
    });
  };

  const logsQuery = useQuery({
    queryKey: ["logs", filter.time, filter.topic, filter.level, searchDebounced],
    queryFn: fetchLogs,
  });
  const { mutate: deleteLog } = useMutation((id) => axios.delete("/logging.php", { params: { id } }), {
    onSuccess: () => {
      logsQuery.refetch();
      toast.success("Log deleted.");
    },
  });

  const handleFilterChange = (name, value) => {
    setFilter({ ...filter, [name]: value });
  };

  return (
    <Container maxWidth="md">
      <LogFilter filter={filter} setFilter={handleFilterChange} />
      {!logsQuery.isSuccess && logsQuery.isLoading && <p>Loading...</p>}
      {logsQuery.isError && <p>Error: {logsQuery.error.message}</p>}
      {logsQuery.isSuccess && logsQuery.data?.data.length === 0 && <p>No logs found.</p>}
      {logsQuery.isSuccess && logsQuery.data?.data.length > 0 && (
        <LogsTable logs={logsQuery.data.data} deleteLog={deleteLog} />
      )}
    </Container>
  );
}

function LogFilter({ filter, setFilter }) {
  const times = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
    { value: "all", label: "All" },
  ];
  const topics = [
    { value: "Login", label: "Login" },
    { value: "Registration", label: "Registration" },
    { value: "Account", label: "Account" },
  ];
  const levels = [
    { value: "debug", label: "Debug" },
    { value: "info", label: "Info" },
    { value: "warning", label: "Warning" },
    { value: "error", label: "Error" },
    { value: "critical", label: "Critical" },
  ];

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
        <TextField
          label="Time"
          select
          value={filter.time}
          onChange={(e) => setFilter("time", e.target.value)}
          sx={{ minWidth: 100 }}
          SelectProps={{ MenuProps: { disableScrollLock: true } }}
        >
          {times.map((time) => (
            <MenuItem key={time.value} value={time.value}>
              {time.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Topic"
          select
          value={filter.topic}
          onChange={(e) => setFilter("topic", e.target.value)}
          sx={{ minWidth: 100 }}
          SelectProps={{ MenuProps: { disableScrollLock: true } }}
        >
          <MenuItem value="">
            <em>All</em>
          </MenuItem>
          {topics.map((topic) => (
            <MenuItem key={topic.value} value={topic.value}>
              {topic.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Level"
          select
          value={filter.level}
          onChange={(e) => setFilter("level", e.target.value)}
          sx={{ minWidth: 100 }}
          SelectProps={{ MenuProps: { disableScrollLock: true } }}
        >
          <MenuItem value="">
            <em>All</em>
          </MenuItem>
          {levels.map((level) => (
            <MenuItem key={level.value} value={level.value}>
              {level.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Search"
          value={filter.search}
          onChange={(e) => setFilter("search", e.target.value)}
          fullWidth
        />
      </Stack>
    </Box>
  );
}

function LogsTable({ logs, deleteLog }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell align="center">Level</TableCell>
            <TableCell align="center">Topic</TableCell>
            <TableCell align="left">Message</TableCell>
            <TableCell align="center">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              <TableCell component="th" scope="row">
                {jsonDateToJsDate(log.date).toLocaleString()}
              </TableCell>
              <TableCell align="center" sx={{ textTransform: "capitalize" }}>
                {log.level}
              </TableCell>
              <TableCell align="center">{log.topic}</TableCell>
              <TableCell align="left">{log.message}</TableCell>
              <TableCell align="center">
                <Button
                  onClick={() => deleteLog(log.id)}
                  size="medium"
                  color="error"
                  variant="outlined"
                  sx={{ minWidth: 0 }}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
