import { Box, Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";
import { TopGoldenList } from "../components/TopGoldenList";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useLocalStorage } from "../hooks/useStorage";

export function PageTopGoldenList({}) {
  const { type, id } = useParams();
  const [showArchived, setShowArchived] = useLocalStorage("top_filter_archived", false);
  const [showArbitrary, setShowArbitrary] = useLocalStorage("top_filter_arbitrary", false);

  const selectedType = type ? type : "all";

  return (
    <Box
      sx={{
        mx: {
          xs: 1,
          sm: 2,
        },
      }}
    >
      <Typography variant="h4">Top Golden List</Typography>
      <Stack direction="row" spacing={2} sx={{ my: 1 }}>
        <FormControlLabel
          control={<Checkbox checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />}
          label="Show Archived"
        />
        <FormControlLabel
          control={<Checkbox checked={showArbitrary} onChange={(e) => setShowArbitrary(e.target.checked)} />}
          label="Show Arbitrary"
        />
      </Stack>
      <TopGoldenList type={type} id={id} archived={showArchived} arbitrary={showArbitrary} />
    </Box>
  );
}
