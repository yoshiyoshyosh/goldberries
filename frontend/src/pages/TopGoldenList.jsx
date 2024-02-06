import { Box, Stack, Typography } from "@mui/material";
import { TopGoldenList } from "../components/TopGoldenList";
import { Link, useParams } from "react-router-dom";

export function PageTopGoldenList({}) {
  const { type, id } = useParams();

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
        <Typography variant="body1">Quick links for testing:</Typography>
        <Link to="/top-golden-list">Full List</Link>
        <Link to="/top-golden-list/campaign/778">Winter Collab</Link>
        <Link to="/top-golden-list/player/573">viddie</Link>
        <Link to="/top-golden-list/player/64">Parrot</Link>
        <Link to="/top-golden-list/player/388">Clantis</Link>
        <Link to="/top-golden-list/player/429">ninz</Link>
        <Link to="/top-golden-list/hitlist">Golden Hit-List</Link>
      </Stack>
      <Typography variant="body" gutterBottom>
        (type: {selectedType}, id: {id})
      </Typography>
      <TopGoldenList type={type} id={id} />
    </Box>
  );
}
