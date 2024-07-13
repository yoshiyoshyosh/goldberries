import { Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { BasicContainerBox, ErrorDisplay, LoadingSpinner } from "../components/BasicComponents";
import { getQueryData, useGetStaticStats } from "../hooks/useApi";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import { PlayerChip, PlayerLink } from "../components/GoldberriesComponents";

export function PageStats() {
  const { tab } = useParams();
  const [selectedTab, setSelectedTab] = useState(tab || "total-clears");

  return (
    <BasicContainerBox maxWidth="lg">
      <Typography variant="h3" textAlign="center">
        Stats
      </Typography>
      <Tabs
        variant="fullWidth"
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        sx={{ borderBottom: "1px solid grey" }}
      >
        <Tab label="Historical Clears" value="historical-clears" />
        <Tab label="Total Clears [Tier]" value="total-clears-by-tier" />
        <Tab label="Total Clears [Player]" value="total-clears-by-player" />
      </Tabs>
      {selectedTab === "historical-clears" && <></>}
      {selectedTab === "total-clears-by-tier" && <TabTotalClears />}
      {selectedTab === "total-clears-by-player" && <TabTotalClears />}
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

  const query = useGetStaticStats("table_tier_clear_counts");

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
