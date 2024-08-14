import { Stack, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  getErrorFromMultiple,
} from "../components/BasicComponents";
import {
  getQueryData,
  useGetAllDifficulties,
  useGetStatsMonthlyTierClears,
  useGetStatsPlayerTierClearCounts,
} from "../hooks/useApi";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { PlayerLink } from "../components/GoldberriesComponents";
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
import { getDifficultyName } from "../util/data_util";

const STATS_TABS = [
  {
    i18key: "historical_clears.label",
    value: "historical-clears",
    component: <TabMonthlyTierClears />,
    subtabs: [],
  },
];

export function PageStats() {
  const { t } = useTranslation(undefined, { keyPrefix: "stats" });
  const { t: t_tabs } = useTranslation(undefined, { keyPrefix: "stats.tabs" });
  const { tab, subtab } = useParams();
  const [selectedTab, setSelectedTab] = useState(tab || "historical-clears");
  const [selectedSubtab, setSelectedSubtab] = useState(
    subtab || STATS_TABS.find((t) => t.value === selectedTab).subtabs[0]
  );

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
      <Typography variant="h3" textAlign="center">
        {t("header")}
      </Typography>
      <Tabs
        // variant="fullWidth"
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
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
          onChange={(_, newValue) => setSelectedSubtab(newValue)}
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
  const theme = useTheme();
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
  const { t } = useTranslation(undefined, { keyPrefix: "player.chart" });
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
    if (id === 18) {
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
    data.push({
      [difficulty.id]: entry[difficulty.id] || 0,
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
          {
            <Line
              type="monotone"
              dataKey={difficulty.id}
              stroke={getChartDifficultyColor(difficulty.id)}
              strokeWidth={3}
              name={getDifficultyName(difficulty)}
            />
          }
        </LineChart>
      </ResponsiveContainer>
    </Stack>
  );
}
