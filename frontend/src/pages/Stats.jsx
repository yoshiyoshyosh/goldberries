import {
  Button,
  Divider,
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
} from "@mui/material";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledLink,
  getErrorFromMultiple,
} from "../components/BasicComponents";
import {
  getQueryData,
  useGetAllDifficulties,
  useGetStatsMonthlyTierClears,
  useGetStatsMostGoldened,
  useGetStatsPlayerTierClearCounts,
} from "../hooks/useApi";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { CampaignIcon, PlayerLink } from "../components/GoldberriesComponents";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DIFFICULTY_COLORS } from "../util/constants";
import { useTheme } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { getCampaignName, getDifficultyName, getMapName } from "../util/data_util";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

const STATS_TABS = [
  {
    i18key: "historical_clears.label",
    value: "historical-clears",
    component: <TabMonthlyTierClears />,
    subtabs: [],
  },
  {
    i18key: "most_goldened.label",
    value: "most-goldened",
    component: <TabMostGoldened />,
    subtabs: [],
  },
];

export function PageStats() {
  const { t } = useTranslation(undefined, { keyPrefix: "stats" });
  const { t: t_tabs } = useTranslation(undefined, { keyPrefix: "stats.tabs" });
  const navigate = useNavigate();
  const { tab, subtab } = useParams();
  const [selectedTab, setSelectedTab] = useState(tab || "historical-clears");
  const [selectedSubtab, setSelectedSubtab] = useState(
    subtab || STATS_TABS.find((t) => t.value === selectedTab).subtabs[0]
  );

  const updateSelectedTab = (tab) => {
    setSelectedTab(tab);
    setSelectedSubtab(STATS_TABS.find((t) => t.value === tab).subtabs[0]);
    navigate(`/stats/${tab}`, { replace: true });
  };
  const updateSelectedSubtab = (subtab) => {
    setSelectedSubtab(subtab);
    navigate(`/stats/${selectedTab}/${subtab}`, { replace: true });
  };

  const hasSubtabs = selectedTab ? STATS_TABS.find((t) => t.value === selectedTab).subtabs.length > 0 : false;
  const getSubtabs = () => {
    if (selectedTab === null || selectedTab === undefined) {
      return [];
    }
    const tab = STATS_TABS.find((t) => t.value === selectedTab);
    if (tab === undefined) {
      return [];
    }
    return tab.subtabs;
  };
  const getCurrentComponent = () => {
    if (selectedTab === null || selectedTab === undefined) {
      return <></>;
    }
    const tab = STATS_TABS.find((t) => t.value === selectedTab);
    if (tab === undefined) {
      return <></>;
    }

    if (selectedSubtab === null || selectedSubtab === undefined) {
      return tab.component;
    }
    const subtab = tab.subtabs.find((t) => t.value === selectedSubtab);
    if (subtab === undefined) {
      return tab.component;
    }
    return subtab.component;
  };

  return (
    <BasicContainerBox maxWidth="lg">
      <HeadTitle title={t("title")} />
      {/* <Typography variant="h3" textAlign="center">
        {t("header")}
      </Typography> */}
      <Tabs
        // variant="fullWidth"
        value={selectedTab}
        onChange={(_, newValue) => updateSelectedTab(newValue)}
        sx={{ borderBottom: "1px solid grey", mb: 1 }}
      >
        {STATS_TABS.map((tab) => (
          <Tab key={tab.value} label={t_tabs(tab.i18key)} value={tab.value} />
        ))}
      </Tabs>

      {hasSubtabs && (
        <Tabs
          // variant="fullWidth"
          value={selectedSubtab}
          onChange={(_, newValue) => updateSelectedSubtab(newValue)}
          sx={{ borderBottom: "1px solid grey", my: 1 }}
        >
          {getSubtabs().map((subtab) => (
            <Tab key={subtab.value} label={t_tabs(subtab.i18key)} value={subtab.value} />
          ))}
        </Tabs>
      )}

      {selectedTab && getCurrentComponent()}
    </BasicContainerBox>
  );
}

function TabTotalClears() {
  const tier_indices = [2, 5, 8, 11, 14, 15, 16, 17, 18];
  const tier_names = [
    "Tier 0",
    "Tier 1",
    "Tier 2",
    "Tier 3",
    "Tier 4",
    "Tier 5",
    "Tier 6",
    "Tier 7",
    "Standard",
  ];

  const query = useGetStatsPlayerTierClearCounts();

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const data = getQueryData(query);

  const columns = [
    // {
    //   field: "id",
    //   headerName: "Player ID",
    //   width: 90,
    //   valueGetter: (value, row) => row.player.id,
    // },
    {
      field: "name",
      headerName: "Name",
      // width: 130,
      flex: 1.5,
      resizable: false,
      disableReorder: true,
      valueGetter: (value, row) => row.player.name,
      renderCell: (params) => {
        return <PlayerLink player={params.row.player} />;
      },
    },
  ];
  tier_indices.forEach((tier_index, i) => {
    columns.push({
      field: `tier_${tier_index}`,
      headerName: tier_names[i],
      // width: 90,
      flex: 1,
      align: "center",
      headerAlign: "center",
      type: "number",
      sortingOrder: ["desc", null],
      resizable: false,
      disableColumnMenu: true,
      disableReorder: true,
      valueGetter: (value, row) => row.clears[tier_index],
    });
  });
  columns.push({
    field: `total`,
    headerName: "Total",
    flex: 1,
    align: "center",
    headerAlign: "center",
    type: "number",
    sortingOrder: ["desc", null],
    resizable: false,
    disableColumnMenu: true,
    disableReorder: true,
    // valueGetter: (value, row) => row.total,
  });

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 1 }}>
        Total Clears by Player
      </Typography>
      <DataGrid
        rows={data}
        columns={columns}
        sx={{
          [`& .${gridClasses.row}.even`]: {
            backgroundColor: "rgba(255, 255, 255, 0.07)",
          },
          [`& .${gridClasses.row}.odd`]: {
            backgroundColor: "rgba(255, 255, 255, 0.00)",
          },
        }}
        getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd")}
        autosizeOptions={{
          columns: ["name"],
          includeOutliers: true,
          includeHeaders: true,
        }}
        disableRowSelectionOnClick
        getRowId={(row) => row.player.id}
      />
    </>
  );
}

function TabMonthlyTierClears() {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.historical_clears" });
  const queryDiff = useGetAllDifficulties();

  if ([queryDiff].some((q) => q.isLoading)) {
    return <LoadingSpinner />;
  } else if ([queryDiff].some((q) => q.isError)) {
    const error = getErrorFromMultiple(queryDiff);
    return <ErrorDisplay error={error} />;
  }

  const rawDiffs = getQueryData(queryDiff);

  let difficulties = rawDiffs.filter((d) => d.id !== 13);

  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h4" gutterBottom>
        {t("header")}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t("text")}
      </Typography>
      <Stack direction="column" gap={1}>
        <Typography variant="h5">{t("total_tiered")}</Typography>
        <TabMonthlyTierClearsSingleChart difficulty={null} />
      </Stack>
      {difficulties.map((difficulty) => (
        <Stack key={difficulty.id} direction="column" gap={1}>
          <Typography variant="h5">{getDifficultyName(difficulty)}</Typography>
          <TabMonthlyTierClearsSingleChart difficulty={difficulty} />
        </Stack>
      ))}
    </Stack>
  );
}

function TabMonthlyTierClearsSingleChart({ difficulty }) {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.historical_clears" });
  const theme = useTheme();
  const queryData = useGetStatsMonthlyTierClears();

  if ([queryData].some((q) => q.isLoading)) {
    return <LoadingSpinner />;
  } else if ([queryData].some((q) => q.isError)) {
    const error = getErrorFromMultiple(queryData);
    return <ErrorDisplay error={error} />;
  }

  const monthlyClears = getQueryData(queryData);

  const getChartDifficultyColor = (id) => {
    if (id === "total") {
      return theme.palette.text.primary;
    } else if (id === 18) {
      return theme.palette.text.primary;
    } else {
      return DIFFICULTY_COLORS[id].color;
    }
  };

  const data = [];
  monthlyClears.forEach((entry, index) => {
    //Clean the date string. Current it looks like "2024-08-01 00:00"
    //It should look like "2024-08"
    const cleanedDate = entry.date.substring(0, 7);
    const id = difficulty?.id || "total";
    const value =
      id === "total"
        ? Object.keys(entry)
            .filter((key) => !isNaN(key))
            .reduce((acc, key) => (key === "18" ? acc : acc + entry[key]), 0)
        : entry[id] || 0;
    data.push({
      [id]: value,
      date: cleanedDate,
      index: index,
    });
  });

  return (
    <Stack direction="column" gap={1}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} fill={theme.palette.stats.chartBackdrop} />
          <XAxis dataKey="date" tick={{ fill: theme.palette.text.primary }} angle={0} />
          <YAxis tick={{ fill: theme.palette.text.primary }} />
          <Legend />
          <Tooltip allowEscapeViewBox contentStyle={{ color: "black" }} itemStyle={{ color: "black" }} />
          <Line
            type="monotone"
            dataKey={difficulty?.id || "total"}
            stroke={getChartDifficultyColor(difficulty?.id || "total")}
            strokeWidth={3}
            name={difficulty ? getDifficultyName(difficulty) : t("total_tiered")}
          />
        </LineChart>
      </ResponsiveContainer>
    </Stack>
  );
}

function TabMostGoldened() {
  const { t } = useTranslation(undefined, { keyPrefix: "stats.tabs.most_goldened" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const [date, setDate] = useState(new Date().toISOString());
  //Format date into a string like 2024-08-02
  const dateFormatted = date ? date.split("T")[0] : null;

  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h4" gutterBottom>
        {t("header")}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t("text")}
      </Typography>
      <Typography variant="body1">{t("time_machine")}</Typography>
      <DatePicker
        label={t("date")}
        value={date ? dayjs(date) : null}
        onChange={(value) => {
          if (value.isValid()) {
            setDate(value.toISOString());
          }
        }}
        minDate={dayjs(new Date(2018, 9, 12, 12))}
        maxDate={dayjs(new Date())}
        sx={{ mt: 1, maxWidth: "200px" }}
      />
      <Divider sx={{ my: 1 }} />
      <TabMostGoldenedCampaigns date={dateFormatted} />
      <Divider sx={{ my: 1 }} />
      <TabMostGoldenedMaps date={dateFormatted} />
    </Stack>
  );
}
const SHOW_AMOUNT = 10;
function TabMostGoldenedCampaigns({ date }) {
  const { t } = useTranslation(undefined, { keyPrefix: "stats" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const [expanded, setExpanded] = useState(false);
  const query = useGetStatsMostGoldened(date);

  if ([query].some((q) => q.isLoading)) {
    return <LoadingSpinner />;
  } else if ([query].some((q) => q.isError)) {
    const error = getErrorFromMultiple(query);
    return <ErrorDisplay error={error} />;
  }

  const { campaigns, maps } = getQueryData(query);
  const campaignsSliced = expanded ? campaigns : campaigns.slice(0, SHOW_AMOUNT);

  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h5">{t_g("campaign", { count: 30 })}</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={1} sx={{ pr: 0 }}></TableCell>
              <TableCell>{t_g("campaign", { count: 1 })}</TableCell>
              <TableCell width={1}>{t_g("submission", { count: 30 })}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaignsSliced.map((campaignEntry, index) => (
              <TableRow>
                <TableCell sx={{ pr: 0 }}>
                  <Typography variant="body1" fontWeight="bold">
                    #{index + 1}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StyledLink to={`/campaign/${campaignEntry.campaign.id}`}>
                    <Stack direction="row" gap={1} alignItems="center">
                      <Typography variant="body1">{getCampaignName(campaignEntry.campaign, t_g)}</Typography>
                      <CampaignIcon campaign={campaignEntry.campaign} height="1.3em" />
                    </Stack>
                  </StyledLink>
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    {campaignEntry.submission_count}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {campaigns.length > SHOW_AMOUNT && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Button size="small" fullWidth onClick={() => setExpanded(!expanded)}>
                    {t(expanded ? "show_less" : "show_all", { count: campaigns.length })}
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
function TabMostGoldenedMaps({ date }) {
  const { t } = useTranslation(undefined, { keyPrefix: "stats" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const [expanded, setExpanded] = useState(false);
  const query = useGetStatsMostGoldened(date);

  if ([query].some((q) => q.isLoading)) {
    return <LoadingSpinner />;
  } else if ([query].some((q) => q.isError)) {
    const error = getErrorFromMultiple(query);
    return <ErrorDisplay error={error} />;
  }

  const { campaigns, maps } = getQueryData(query);
  const mapsSliced = expanded ? maps : maps.slice(0, SHOW_AMOUNT);

  return (
    <Stack direction="column" gap={1}>
      <Typography variant="h5">{t_g("map", { count: 30 })}</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={1} sx={{ pr: 0 }}></TableCell>
              <TableCell>{t_g("map", { count: 1 })}</TableCell>
              <TableCell>{t_g("campaign", { count: 1 })}</TableCell>
              <TableCell width={1}>{t_g("submission", { count: 30 })}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mapsSliced.map((mapEntry, index) => (
              <TableRow>
                <TableCell sx={{ pr: 0 }}>
                  <Typography variant="body1" fontWeight="bold">
                    #{index + 1}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StyledLink to={`/map/${mapEntry.map.id}`}>
                    <Stack direction="row" gap={1} alignItems="center">
                      <Typography variant="body1">
                        {getMapName(mapEntry.map, mapEntry.map.campaign)}
                      </Typography>
                    </Stack>
                  </StyledLink>
                </TableCell>
                <TableCell>
                  <StyledLink to={`/map/${mapEntry.map.id}`}>
                    <Stack direction="row" gap={1} alignItems="center">
                      <Typography variant="body1">
                        {getCampaignName(mapEntry.map.campaign, t_g, true)}
                      </Typography>
                      <CampaignIcon campaign={mapEntry.map.campaign} height="1.3em" />
                    </Stack>
                  </StyledLink>
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    {mapEntry.submission_count}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {maps.length > SHOW_AMOUNT && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Button size="small" fullWidth onClick={() => setExpanded(!expanded)}>
                    {t(expanded ? "show_less" : "show_all", { count: maps.length })}
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
