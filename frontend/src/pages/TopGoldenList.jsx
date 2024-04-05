import { Box, Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";
import { TopGoldenList } from "../components/TopGoldenList";
import { useParams } from "react-router-dom";
import { useLocalStorage } from "../hooks/useStorage";
import { BasicBox, HeadTitle } from "../components/BasicComponents";
import { useTheme } from "@emotion/react";

export function PageTopGoldenList({}) {
  const { type, id } = useParams();
  const theme = useTheme();
  const [showArchived, setShowArchived] = useLocalStorage("top_filter_archived", false);
  const [showArbitrary, setShowArbitrary] = useLocalStorage("top_filter_arbitrary", false);

  const selectedType = type ? type : "all";

  const title = "Top Golden List";

  return (
    <Box
      sx={{
        mx: {
          xs: 1,
          sm: 2,
        },
      }}
    >
      <HeadTitle title={title} />
      <BasicBox
        sx={{
          pb: 0,
          mb: 1,
        }}
      >
        <Typography variant="h4">Top Golden List</Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          <FormControlLabel
            control={<Checkbox checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />}
            label="Show Archived"
          />
          <FormControlLabel
            control={
              <Checkbox checked={showArbitrary} onChange={(e) => setShowArbitrary(e.target.checked)} />
            }
            label="Show Arbitrary"
          />
        </Stack>
      </BasicBox>
      <TopGoldenList type={type} id={id} archived={showArchived} arbitrary={showArbitrary} />
    </Box>
  );
}
