import {
  Button,
  ButtonGroup,
  Divider,
  Grid,
  IconButton,
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
import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";
import { getChallengeName } from "../../util/data_util";
import { fetchChallenges } from "../../util/api";
import { useQuery } from "react-query";
import CustomizedMenu, {
  BasicContainerBox,
  ErrorDisplay,
  LoadingSpinner,
} from "../../components/BasicComponents";
import { useLocalStorage } from "../../hooks/useStorage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { get } from "react-hook-form";

export function PageManageChallenges() {
  const [page, setPage] = useLocalStorage("manage_challenges_page", 1);
  const [perPage, setPerPage] = useLocalStorage("manage_challenges_perPage", 50);
  const [search, setSearch] = useState("");

  return (
    <BasicContainerBox maxWidth="lg" sx={{ mt: 0, p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md>
          <Typography variant="h4" sx={{ mt: 0 }} gutterBottom>
            Manage Challenges
          </Typography>
        </Grid>
        <Grid item xs={12} md="auto">
          <ButtonGroup sx={{ mb: 2 }}>
            <Button variant="contained" color="primary" startIcon={<FontAwesomeIcon icon={faPlus} />}>
              New Campaign
            </Button>
            <Button variant="contained" color="primary" startIcon={<FontAwesomeIcon icon={faPlus} />}>
              New Map
            </Button>
            <Button variant="contained" color="primary" startIcon={<FontAwesomeIcon icon={faPlus} />}>
              New Challenge
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
      <ManageChallengesSearchField search={search} setSearch={setSearch} />
      <ManageChallengesTable
        page={page}
        perPage={perPage}
        search={search}
        setPage={setPage}
        setPerPage={setPerPage}
      />
    </BasicContainerBox>
  );
}

function ManageChallengesSearchField({ search, setSearch }) {
  const [searchInternal, setSearchInternal] = useLocalStorage("manage_challenges_search", search);

  const setSearchDebounced = useDebouncedCallback(setSearch, 250);

  return (
    <TextField
      label="Search"
      value={searchInternal}
      onChange={(event) => {
        setSearchInternal(event.target.value);
        setSearchDebounced(event.target.value);
      }}
      sx={{ mb: 2 }}
      fullWidth
      onFocus={(e) => {
        setSearchInternal("");
        setSearchDebounced("");
      }}
    />
  );
}

function ManageChallengesTable({ page, perPage, search, setPage, setPerPage }) {
  const query = useQuery({
    queryKey: ["manage_challenges", page, perPage, search],
    queryFn: () => fetchChallenges(page, perPage, search),
  });

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const { challenges, max_page: maxPage, max_count: maxCount } = query.data.data;

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="left">Campaign</TableCell>
            <TableCell align="left">Map</TableCell>
            <TableCell align="left">Challenge</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {challenges.map((challenge) => (
            <TableRow key={challenge.id}>
              <TableCell align="left">
                <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-start">
                  <Typography variant="body2">{challenge.map.campaign.name}</Typography>
                  <IconButton size="small" color="primary" aria-label="edit">
                    <FontAwesomeIcon size="xs" icon={faEdit} />
                  </IconButton>
                </Stack>
              </TableCell>
              <TableCell align="left">
                <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-start">
                  <Typography variant="body2">{challenge.map.name}</Typography>
                  <IconButton size="small" color="primary" aria-label="edit">
                    <FontAwesomeIcon size="xs" icon={faEdit} />
                  </IconButton>
                </Stack>
              </TableCell>
              <TableCell align="left">
                <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-start">
                  <Typography variant="body2">{getChallengeName(challenge)}</Typography>
                  <IconButton size="small" color="primary" aria-label="edit">
                    <FontAwesomeIcon size="xs" icon={faEdit} />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={maxCount}
        page={page - 1}
        onPageChange={(event, newPage) => {
          setPage(newPage + 1);
        }}
        rowsPerPage={perPage}
        onRowsPerPageChange={(event) => {
          setPerPage(parseInt(event.target.value, 10));
          setPage(1);
        }}
        rowsPerPageOptions={[10, 25, 50, 100, { value: -1, label: "All" }]}
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
