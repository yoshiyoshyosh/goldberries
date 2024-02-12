import { BasicContainerBox, ErrorDisplay, LoadingSpinner } from "../components/BasicComponents";
import {
  Divider,
  Grid,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { getQueryData, useGetRecentSubmissions } from "../hooks/useApi";
import { getCampaignName } from "../util/data_util";
import {
  DifficultyChip,
  PlayerChip,
  SubmissionIcon,
  VerificationStatusChip,
} from "../components/GoldberriesComponents";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLocalStorage } from "@uidotdev/usehooks";

export function PageIndex() {
  return (
    <BasicContainerBox maxWidth="md">
      <Typography variant="h4">Celeste Modded Done Deathless!</Typography>
      <Typography variant="body1">This is a website</Typography>
      <Divider sx={{ my: 2 }} />
      <RecentSubmissions />
    </BasicContainerBox>
  );
}

export function RecentSubmissions({}) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [type, setType] = useLocalStorage("recent_submissions_type", "verified");
  const query = useGetRecentSubmissions(type, page, perPage, null);

  const onChangeType = (event) => {
    setPage(1);
    setType(event.target.checked ? "verified" : "pending");
  };

  const data = getQueryData(query);

  return (
    <>
      <Grid container>
        <Grid item xs={12} sm>
          <Typography variant="h5">Recent Submissions</Typography>
        </Grid>
        <Grid item xs={12} sm="auto">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">Pending</Typography>
            <Switch checked={type === "verified"} onChange={onChangeType} />
            <Typography variant="body2">Verified</Typography>
          </Stack>
        </Grid>
      </Grid>
      {query.isLoading && <LoadingSpinner />}
      {query.isError && <ErrorDisplay error={query.error} />}
      {query.isSuccess && (
        <RecentSubmissionsTable
          data={data}
          page={page}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
        />
      )}
    </>
  );
}

export function RecentSubmissionsTable({ data, page, perPage, setPage, setPerPage }) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Submission</TableCell>
            <TableCell align="center">Player</TableCell>
            <TableCell align="center">Difficulty</TableCell>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }} align="center">
              Status
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Link to={"/campaign/" + submission.challenge.map.campaign.id}>
                    {submission.challenge.map.campaign.name}
                  </Link>
                  <Typography>-</Typography>
                  <Link to={"/map/" + submission.challenge.map.id}>{submission.challenge.map.name}</Link>
                  <Typography>-</Typography>
                  <SubmissionIcon submission={submission} />
                </Stack>
              </TableCell>
              <TableCell align="center">
                <PlayerChip player={submission.player} size="small" />
              </TableCell>
              <TableCell align="center">
                <DifficultyChip difficulty={submission.challenge.difficulty} />
              </TableCell>
              <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }} align="center">
                <VerificationStatusChip
                  isVerified={submission.is_verified}
                  isRejected={submission.is_rejected}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={data.max_count}
        page={page - 1}
        rowsPerPage={perPage}
        onPageChange={(event, newPage) => setPage(newPage + 1)}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Submissions per page:"
        onRowsPerPageChange={(event) => {
          setPerPage(event.target.value);
          setPage(1);
        }}
      />
    </TableContainer>
  );
}
