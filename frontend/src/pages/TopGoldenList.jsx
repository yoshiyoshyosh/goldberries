import { Box, Checkbox, FormControlLabel, Grid, Stack, Typography } from "@mui/material";
import { TopGoldenList } from "../components/TopGoldenList";
import { useParams } from "react-router-dom";
import { useLocalStorage } from "../hooks/useStorage";
import { BasicBox, HeadTitle } from "../components/BasicComponents";
import { ChallengeFcIcon } from "../components/GoldberriesComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@emotion/react";

export function PageTopGoldenList({}) {
  const { type, id } = useParams();
  const [showArchived, setShowArchived] = useLocalStorage("top_filter_archived", false);
  const [showArbitrary, setShowArbitrary] = useLocalStorage("top_filter_arbitrary", false);
  const theme = useTheme();

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
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item xs={12} sm="auto">
          <BasicBox sx={{ height: "fit-content" }}>
            <Typography variant="h4">Top Golden List</Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
                }
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
        </Grid>
        <Grid item xs={12} sm="auto">
          <BasicBox>
            <Stack direction="column" spacing={2}>
              <Stack direction="row" gap={1} alignItems="center">
                <ChallengeFcIcon challenge={{ requires_fc: true, has_fc: false }} height="1.5em" />
                <span>- Golden clear with all optional collectibles (red berries, cassette, etc)</span>
              </Stack>
              <Stack direction="row" gap={1} alignItems="center">
                <ChallengeFcIcon challenge={{ requires_fc: false, has_fc: true }} height="1.5em" />
                <span>- Regular clear and Full Clear are the same difficulty placement</span>
              </Stack>
              <Stack direction="row" gap={1} alignItems="center">
                <span>[New]/[Old]</span>
                <span>- New or Old version of the map</span>
              </Stack>
            </Stack>
          </BasicBox>
        </Grid>
        <Grid item xs={12} sm="auto" display="flex" flexDirection="row" alignItems="center">
          <BasicBox>
            <Stack direction="column" gap={0.25} alignItems="center">
              <FontAwesomeIcon icon={faInfoCircle} fontSize="1.5em" color={theme.palette.error.main} />
              <Typography variant="body1" color="error">
                NOTE: This website is still in testing!
              </Typography>
              <Typography variant="body1">
                The data shown here might be incorrect or incomplete,
                <br />
                and will be wiped for the actual release of the website!
              </Typography>
            </Stack>
          </BasicBox>
        </Grid>
      </Grid>
      <TopGoldenList type={type} id={id} archived={showArchived} arbitrary={showArbitrary} isOverallList />
    </Box>
  );
}
