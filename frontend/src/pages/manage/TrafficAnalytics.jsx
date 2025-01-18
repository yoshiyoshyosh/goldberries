import { faChartPie, faCog, faSpinner } from "@fortawesome/free-solid-svg-icons";
import {
  Button,
  ButtonGroup,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  BasicContainerBox,
  CustomIconButton,
  HeadTitle,
  LoadingSpinner,
  TooltipLineBreaks,
} from "../../components/BasicComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getQueryData, useGetTrafficStatsGlobal, useGetTrafficStatsGlobalRequests } from "../../hooks/useApi";
import { useLocalStorage } from "@uidotdev/usehooks";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import { useTheme } from "@emotion/react";

const defaultTab = "global";
export function PageTrafficAnalytics({}) {
  const theme = useTheme();
  const { tab } = useParams();
  const [selectedTab, setSelectedTab] = useState(tab || defaultTab);
  const navigate = useNavigate();
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));

  const [now, setNow] = useState(getLast15MinuteStep());
  const [next, setNext] = useState(getNext15MinuteStep());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [timeInterval, setTimeInterval] = useState("all");

  const setTab = (tab) => {
    setSelectedTab(tab);
    if (tab === defaultTab) {
      navigate("/traffic", { replace: true });
    } else {
      navigate(`/traffic/${tab}`, { replace: true });
    }
  };

  return (
    <BasicContainerBox maxWidth="lg" sx={{ "&&": { pl: 2, pr: 2 }, backgroundColor: "#1e1e1e" }}>
      <HeadTitle title="Traffic Analytics" />
      <Grid container spacing={2}>
        <Grid item xs="auto">
          <Tabs
            value={selectedTab}
            onChange={(e, tab) => setTab(tab)}
            // variant="scrollable"
            // scrollButtons="auto"
            orientation={isMdScreen ? "vertical" : "horizontal"}
            sx={{
              borderBottom: isMdScreen ? "" : "1px solid grey",
              borderRight: !isMdScreen ? "" : "1px solid grey",
              mb: 2,
              height: "100%",
            }}
          >
            <Tab
              value="global"
              label="Global Traffic"
              icon={<FontAwesomeIcon icon={faChartPie} size="sm" />}
              // iconPosition="end"
              sx={{ minHeight: "40px" }}
            />
          </Tabs>
        </Grid>
        <Grid item xs>
          <Stack direction="row" sx={{ mb: 2 }} justifyContent="space-between">
            <Typography variant="subtitle2">
              Last refreshed: {now.toLocaleTimeString()} <MinuteCountdown next={next} />
            </Typography>
            <TrafficFilterSelector
              now={now}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              timeInterval={timeInterval}
              setTimeInterval={setTimeInterval}
            />
          </Stack>
          {selectedTab === "global" && (
            <GlobalDataTab now={now} startDate={startDate} endDate={endDate} timeInterval={timeInterval} />
          )}
        </Grid>
      </Grid>
    </BasicContainerBox>
  );
}
function MinuteCountdown({ next }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = next - now;

  const minutes = Math.floor(diff / 1000 / 60);
  const singular = minutes === 1;
  const s = singular ? "" : "s";

  if (minutes <= 0) {
    const seconds = Math.floor(diff / 1000);
    const singular = seconds === 1;
    const s = singular ? "" : "s";

    if (seconds <= 0) {
      return <Typography variant="subtitle2">New data available!</Typography>;
    }

    return (
      <Typography variant="subtitle2">
        {seconds} second{s} until new data
      </Typography>
    );
  }

  return (
    <Typography variant="subtitle2">
      {minutes} minute{s} until new data
    </Typography>
  );
}

function TrafficFilterSelector({
  now,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  timeInterval,
  setTimeInterval,
}) {
  const [customMode, setCustomMode] = useLocalStorage("traffic_filter_custom_mode", false);

  const presets = [
    { label: "No Time Interval", value: 0, short: "all", interval: "all" },
    { label: "Last 24 Hours, hourly", value: 1, short: "24h", interval: "hour" },
    { label: "Last Month, daily", value: 2, short: "1m", interval: "day" },
    { label: "Last Year, monthly", value: 3, short: "1y", interval: "month" },
  ];
  const getDataForPreset = (preset) => {
    const end = new Date(now);
    const start = new Date(now);

    if (preset === 1) {
      start.setDate(end.getDate() - 1);
      return { startDate: start.toISOString(), endDate: end.toISOString(), interval: "hour" };
    } else if (preset === 2) {
      start.setMonth(end.getMonth() - 1);
      return { startDate: start.toISOString(), endDate: end.toISOString(), interval: "day" };
    } else if (preset === 3) {
      start.setFullYear(end.getFullYear() - 1);
      return { startDate: start.toISOString(), endDate: end.toISOString(), interval: "month" };
    } else {
      return { startDate: null, endDate: null, interval: "all" };
    }
  };

  const clickedPreset = (preset) => {
    const { startDate, endDate, interval } = getDataForPreset(preset);
    setStartDate(startDate);
    setEndDate(endDate);
    setTimeInterval(interval);
  };

  return (
    <Stack direction="row" gap={2} alignItems="center">
      {customMode && (
        <>
          <Stack direction="column" gap={1} alignItems="center">
            <Typography variant="subtitle1">Time Period (Custom Mode)</Typography>
          </Stack>
        </>
      )}
      {!customMode && (
        <Stack direction="row" gap={2} alignItems="center">
          <Typography variant="subtitle1">Time Period</Typography>
          <ButtonGroup size="small">
            {presets.map((preset) => (
              <Button
                key={preset.value}
                variant={timeInterval === preset.interval ? "contained" : "outlined"}
                onClick={() => clickedPreset(preset.value)}
              >
                {preset.short}
              </Button>
            ))}
          </ButtonGroup>
        </Stack>
      )}
      <CustomIconButton
        variant={customMode ? "outlined" : "contained"}
        onClick={() => setCustomMode(!customMode)}
      >
        <FontAwesomeIcon icon={faCog} />
      </CustomIconButton>
    </Stack>
  );
}

function GlobalDataTab({ now, startDate, endDate, timeInterval }) {
  const [initialNow, setInitialNow] = useState(now);
  const query = useGetTrafficStatsGlobal(startDate, endDate, timeInterval);
  const data = getQueryData(query);

  const requestsQuery = useGetTrafficStatsGlobalRequests(startDate, endDate);
  const requestsData = getQueryData(requestsQuery);

  useEffect(() => {
    //If the now state changes, refetch the data
    if (now !== initialNow) {
      query.refetch();
      setInitialNow(now);
    }
  }, [now]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <BasicGlobalStats data={data?.basic} isLoading={query.isLoading} interval={timeInterval} />
        <Divider sx={{ my: 2 }} />
        <UserAgentStats data={data?.user_agents} isLoading={query.isLoading} interval={timeInterval} />
        <Divider sx={{ my: 2 }} />
        <MostRecentRequestsTable data={requestsData?.last_requests} isLoading={requestsQuery.isLoading} />
      </Grid>
    </Grid>
  );
}

function BasicGlobalStats({ data, isLoading, interval }) {
  const types = {
    avg_serve_time: {
      label: "Average Serve Time",
      unit: "ms",
      color: "#00dbff",
      axis: "right",
    },
    total_requests: {
      label: "Requests",
      unit: null,
      color: "#ffa700",
      axis: "left",
    },
    total_new_requests: {
      label: "New Requests",
      unit: null,
      color: "#dfff00",
      axis: "left",
    },
  };

  if (interval === "all") {
    return (
      <Grid container spacing={2}>
        {Object.keys(types).map((key) => (
          <Grid item xs={12} sm={4} md={3} key={key}>
            <SimpleNumberDisplay
              label={types[key].label}
              value={isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : data[key].toLocaleString()}
              unit={types[key].unit}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  //Interval not "all" -> array with dates for each assoc array of values
  const chartData = [...data];
  chartData.reverse();

  return (
    <Stack direction="column" spacing={2}>
      <LineChart
        dataset={chartData}
        xAxis={[
          {
            dataKey: "date",
            scaleType: "band",
            valueFormatter: (d) => dateToLabel(d, interval),
            label: "Date",
          },
        ]}
        yAxis={[{ label: "Requests" }]}
        series={[
          { dataKey: "total_requests", label: "Requests", color: "#ffa700" },
          { dataKey: "total_new_requests", label: "New Requests", color: "#dfff00" },
        ]}
        slotProps={{
          legend: {},
        }}
        sx={{
          [`& .${axisClasses.left} .${axisClasses.label}`]: {
            transform: "translateX(-12px)",
          },
        }}
        height={300}
      />
      <LineChart
        dataset={chartData}
        xAxis={[
          {
            dataKey: "date",
            scaleType: "band",
            valueFormatter: (d) => dateToLabel(d, interval),
            label: "Date",
          },
        ]}
        yAxis={[{ label: "Average Serve Time [ms]" }]}
        series={[
          {
            dataKey: "avg_serve_time",
            label: "Average Serve Time [ms]",
            color: "#00dbff",
            valueFormatter: (v) => v + " ms",
          },
        ]}
        // grid={{ vertical: true, horizontal: true }}
        slotProps={{}}
        sx={{
          [`& .${axisClasses.left} .${axisClasses.label}`]: {
            transform: "translateX(-12px)",
          },
        }}
        height={300}
      />
    </Stack>
  );
}

function UserAgentStats({ data, isLoading, interval }) {
  const userAgents = {
    chrome: { label: "Chrome", color: "#4285f4" },
    chrome_mobile: { label: "Chrome Mobile", color: "#85b1fb" },
    firefox: { label: "Firefox", color: "#ff7139" },
    firefox_mobile: { label: "Firefox Mobile", color: "#ff966c" },
    safari: { label: "Safari", color: "#3aff29" },
    safari_mobile: { label: "Safari Mobile", color: "#7eff73" },
    chromium: { label: "Chromium", color: "#4245f4" },
    opera_old: { label: "Opera (Old)", color: "#f4192c" },
    opera: { label: "Opera", color: "#f4192c" },
    seamonkey: { label: "SeaMonkey", color: "#ff39f3" },
    bot_node: { label: "Node.js Bot", color: "#ff39f3" },
    null: { label: "Unknown", color: "#ffffff" },
  };

  const getUserAgent = (ua) => {
    const res = userAgents[ua];
    if (res) return res;
    return userAgents.null;
  };

  if (isLoading) {
    return (
      <Stack direction="column" gap={2}>
        <Typography variant="h5">User Agents</Typography>
        <LoadingSpinner />
      </Stack>
    );
  }

  if (interval === "all") {
    const chartData = data.map((entry) => {
      const ua = getUserAgent(entry.user_agent);
      return { value: entry.count, label: ua.label, color: ua.color };
    });

    const totalCount = chartData.reduce((acc, cur) => acc + cur.value, 0);
    return (
      <Stack direction="column" gap={2}>
        <Typography variant="h5">User Agents</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <PieChart
              series={[
                {
                  arcLabel: (item) => item.label,
                  arcLabelMinAngle: 45,
                  data: chartData,
                  highlightScope: { faded: "global", highlighted: "item" },
                  faded: {
                    // innerRadius: 30,
                    additionalRadius: -10,
                    color: "gray",
                  },
                },
              ]}
              slotProps={{
                legend: {
                  hidden: true,
                },
              }}
              margin={{ right: 0 }}
              height={400}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User Agent</TableCell>
                    <TableCell align="center">%</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chartData.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell component="th" scope="row">
                        {row.label}
                      </TableCell>
                      <TableCell align="center">{((row.value / totalCount) * 100).toFixed(2)}%</TableCell>
                      <TableCell align="right">{row.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Stack>
    );
  }

  //Interval not "all" -> array with dates for each assoc array of values
  const chartData = [...data];
  chartData.reverse();

  return (
    <Stack direction="column" gap={2}>
      <Typography variant="h5">User Agents</Typography>
      <LineChart
        dataset={chartData}
        xAxis={[
          {
            dataKey: "date",
            scaleType: "band",
            valueFormatter: (d) => dateToLabel(d, interval),
            label: "Date",
          },
        ]}
        yAxis={[{ label: "Requests" }]}
        series={[
          ...Object.keys(userAgents).map((key) => {
            const ua = getUserAgent(key);
            return { dataKey: key, label: ua.label, color: ua.color };
          }),
        ]}
        slotProps={{
          legend: {
            hidden: true,
          },
        }}
        sx={{
          [`& .${axisClasses.left} .${axisClasses.label}`]: {
            transform: "translateX(-12px)",
          },
        }}
        height={300}
      />
    </Stack>
  );
}

function SimpleNumberDisplay({ label, value, unit = null }) {
  return (
    <Paper elevation={4} sx={{ p: 2 }}>
      <Stack spacing={1} direction="column">
        <Typography variant="subtitle2" sx={{ color: "grey" }}>
          {label}
        </Typography>
        <Stack direction="row" alignItems="flex-end" spacing={0.25}>
          <Typography variant="h5">{value}</Typography>
          {unit && (
            <Typography variant="subtitle2" sx={{ "&&": { mb: 0.25 } }}>
              {unit}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

function MostRecentRequestsTable({ data, isLoading }) {
  return (
    <Stack direction="column" gap={2}>
      <Typography variant="h5">Most Recent Requests</Typography>
      {isLoading ? <LoadingSpinner /> : <SimpleRequestsTable entries={data} />}
    </Stack>
  );
}
function SimpleRequestsTable({ entries, showMax = 10 }) {
  const [showAll, setShowAll] = useState(false);
  //Fields: date, method, page, query, status, referrer, user_agent, serve_time
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ px: 1 }} align="center">
              Date
            </TableCell>
            <TableCell sx={{ px: 0.5 }} align="center">
              Method
            </TableCell>
            <TableCell sx={{ px: 1 }}>Page</TableCell>
            <TableCell sx={{ px: 1 }}>Query</TableCell>
            <TableCell sx={{ px: 1 }} align="center">
              Status
            </TableCell>
            <TableCell sx={{ px: 1 }}>Referrer</TableCell>
            <TableCell sx={{ px: 1 }} align="center">
              User Agent
            </TableCell>
            <TableCell sx={{ px: 1 }} align="center">
              Serve Time
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.slice(0, showAll ? entries.length : showMax).map((row) => (
            <TableRow key={row.date}>
              <TableCell sx={{ fontFamily: "monospace" }}>
                {new Date(row.date).toLocaleTimeString()}
              </TableCell>
              <TableCell sx={{ px: 0.5 }} align="center">
                <MethodDisplay method={row.method} />
              </TableCell>
              <TableCell sx={{ fontFamily: "monospace", px: 1 }}>{row.page}</TableCell>
              <TableCell
                sx={{
                  px: 1,
                  fontFamily: "monospace",
                  maxWidth: "200px",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                <TooltipLineBreaks title={row.query ?? "-"}>{row.query ?? "-"}</TooltipLineBreaks>
              </TableCell>
              <TableCell sx={{ px: 1 }} align="center">
                <StatusDisplay status={row.status} />
              </TableCell>
              <TableCell sx={{ fontFamily: "monospace", px: 1 }}>{row.referrer ?? "-"}</TableCell>
              <TableCell sx={{ fontFamily: "monospace", px: 1 }} align="center">
                {row.user_agent ? row.user_agent.replace("_mobile", "_m") : "-"}
              </TableCell>
              <TableCell sx={{ fontFamily: "monospace", px: 1 }} align="center">
                {row.serve_time}
              </TableCell>
            </TableRow>
          ))}

          {entries.length > showMax && (
            <TableRow>
              <TableCell colSpan={99} align="center">
                <Button fullWidth variant="outlined" onClick={() => setShowAll(!showAll)}>
                  {!showAll && <>Show '{entries.length - showMax}' More</>}
                  {showAll && <>Show Less</>}
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
function MethodDisplay({ method }) {
  const methods = {
    GET: { color: "green" },
    POST: { color: "blue" },
    PUT: { color: "orange" },
    DELETE: { color: "red" },
  };

  return (
    <Typography
      variant="body2"
      sx={{
        background: methods[method].color,
        color: "white",
        textAlign: "center",
        borderRadius: "4px",
        fontFamily: "monospace",
      }}
    >
      {method}
    </Typography>
  );
}
function StatusDisplay({ status }) {
  const statuses = {
    200: { color: "green", foreground: "white" },
    300: { color: "yellow", foreground: "black" },
    400: { color: "orange", foreground: "white" },
    500: { color: "red", foreground: "white" },
  };

  const statusCategory = Math.floor(status / 100) * 100;

  return (
    <Typography
      variant="body2"
      sx={{
        background: statuses[statusCategory].color,
        color: statuses[statusCategory].foreground,
        textAlign: "center",
        borderRadius: "4px",
        fontFamily: "monospace",
      }}
    >
      {status}
    </Typography>
  );
}

// Helper functions
function getLast15MinuteStep() {
  const now = new Date(); // Get the current date and time

  // Get the current minutes
  let minutes = now.getMinutes();

  // Round down to the nearest multiple of 15 minutes
  let roundedMinutes = Math.floor(minutes / 15) * 15;

  // Set the rounded minutes back to the Date object
  now.setMinutes(roundedMinutes);

  // Set seconds and milliseconds to 0 for clarity
  now.setSeconds(0);
  now.setMilliseconds(0);

  return now;
}
function getNext15MinuteStep() {
  const last15MinuteStep = getLast15MinuteStep();
  const nextStep = new Date(last15MinuteStep);
  nextStep.setMinutes(nextStep.getMinutes() + 15);
  return nextStep;
}

function dateToLabel(date, interval) {
  //If interval === hour, show just: "HH:mm"
  //If interval === day, show just: "DD/MM"
  //If interval === month, show just: "MM/YYYY"
  //date is a string in the format "YYYY-MM-DD HH:mm:ss"
  const d = new Date(date);
  //Set date to UTC
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());

  if (interval === "hour") {
    return d.toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" });
  }
  if (interval === "day") {
    return d.toLocaleDateString("default", { day: "2-digit", month: "2-digit" });
  }
  if (interval === "month") {
    return d.toLocaleDateString("default", { month: "short", year: "numeric" });
  }
  return date;
}
