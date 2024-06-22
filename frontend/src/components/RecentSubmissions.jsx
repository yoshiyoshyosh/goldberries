import { useTheme } from "@emotion/react";
import { getQueryData, useGetRecentSubmissions } from "../hooks/useApi";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  Grid,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArbitraryIcon,
  CampaignIcon,
  DifficultyChip,
  ObjectiveIcon,
  PlayerChip,
  SubmissionFcIcon,
  SubmissionIcon,
  VerificationStatusChip,
} from "./GoldberriesComponents";
import { ErrorDisplay, StyledLink } from "./BasicComponents";
import { getChallengeCampaign, getChallengeDescription, getChallengeIsArbitrary } from "../util/data_util";
import { Link, useNavigate } from "react-router-dom";

export function RecentSubmissions({ playerId = null }) {
  const [verified, setVerified] = useLocalStorage("recent_submissions_verified", 1);
  const verifiedValue = verified === 0 ? null : verified === -1 ? false : true;

  const onChangeVerified = (value) => {
    setVerified(value);
  };

  return (
    <>
      <Grid container>
        <Grid item xs={12} sm>
          <Typography variant="h5">Recent Submissions</Typography>
        </Grid>
        <Grid item xs={12} sm="auto">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ pb: 1 }}>
            <Typography variant="body1">Show:</Typography>
            <TextField
              select
              variant="standard"
              value={verified}
              onChange={(e) => onChangeVerified(e.target.value)}
              SelectProps={{
                MenuProps: {
                  disableScrollLock: true,
                },
              }}
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                border: (t) => "1px solid " + t.palette.box.border,
                borderRadius: "5px",
              }}
            >
              <MenuItem value={1}>
                <VerificationStatusChip isVerified={true} size="small" sx={{ mx: 1 }} />
              </MenuItem>
              <MenuItem value={0}>
                <VerificationStatusChip isVerified={null} size="small" sx={{ mx: 1 }} />
              </MenuItem>
              <MenuItem value={-1}>
                <VerificationStatusChip isVerified={false} size="small" sx={{ mx: 1 }} />
              </MenuItem>
            </TextField>
          </Stack>
        </Grid>
      </Grid>
      <RecentSubmissionsHeadless verified={verifiedValue} playerId={playerId} />
    </>
  );
}

export function RecentSubmissionsHeadless({
  verified,
  playerId,
  showChip = false,
  hideIfEmpty = false,
  chipSx = {},
}) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useLocalStorage(
    "recent_submissions_per_page_" + (playerId === null ? "general" : "player"),
    10
  );
  const query = useGetRecentSubmissions(verified, page, perPage, null, playerId);

  useEffect(() => {
    setPage(1);
  }, [verified, playerId]);

  const data = getQueryData(query) ?? {
    submissions: null,
    page: 1,
    max_count: perPage,
  };

  if (hideIfEmpty && data.submissions !== null && data.submissions.length === 0) {
    return null;
  }

  return (
    <>
      {showChip && (
        <VerificationStatusChip
          isVerified={verified}
          sx={{ mb: 1, ...chipSx }}
          suffix=" Submissions"
          size="small"
        />
      )}
      {/* {query.isLoading && <LoadingSpinner />} */}
      {query.isError && <ErrorDisplay error={query.error} />}
      {(query.isLoading || query.isSuccess) && (
        <RecentSubmissionsTable
          verified={verified}
          data={data}
          page={page}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
          hasPlayer={playerId !== null}
        />
      )}
    </>
  );
}
export function RecentSubmissionsTable({
  verified,
  data,
  page,
  perPage,
  setPage,
  setPerPage,
  hasPlayer = false,
}) {
  const verifiedStr = verified === null ? "pending" : verified ? "verified" : "rejected";
  const hasMoreThanOnePage = data.max_count > perPage;
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        {data.submissions !== null && data.submissions.length !== 0 && (
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: 1.5, pr: 0.5 }}>Submission</TableCell>
              {!hasPlayer && (
                <TableCell align="center" sx={{ pr: 0.5, pl: 1 }}>
                  Player
                </TableCell>
              )}
              <TableCell align="center" sx={{ pr: 1, pl: 1 }}>
                Difficulty
              </TableCell>
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {data.submissions === null ? (
            Array.from({ length: perPage }).map((_, index) => (
              <RecentSubmissionsTableRowFakeout key={index} hasPlayer={hasPlayer} />
            ))
          ) : data.submissions.length === 0 ? (
            <>
              <TableRow>
                <TableCell colSpan={hasPlayer ? 4 : 3} align="center">
                  <Typography variant="body1">No {verifiedStr} submissions found</Typography>
                </TableCell>
              </TableRow>
            </>
          ) : (
            data.submissions.map((submission) => (
              <RecentSubmissionsTableRow key={submission.id} submission={submission} hasPlayer={hasPlayer} />
            ))
          )}
        </TableBody>
      </Table>
      {data.submissions !== null && data.submissions.length !== 0 && hasMoreThanOnePage && (
        <TablePagination
          component="div"
          count={data.max_count ?? -1}
          page={page - 1}
          rowsPerPage={perPage}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          rowsPerPageOptions={[10, 15, 25, 50, 100]}
          labelRowsPerPage="Submissions per page:"
          onRowsPerPageChange={(event) => {
            setPerPage(event.target.value);
            setPage(1);
          }}
          slotProps={{
            select: {
              MenuProps: {
                disableScrollLock: true,
              },
            },
          }}
        />
      )}
    </TableContainer>
  );
}
function RecentSubmissionsTableRowFakeout({ hasPlayer }) {
  return (
    <TableRow>
      <TableCell sx={{ width: "99%", pl: 1.5, pr: 0.5 }}>
        <Skeleton variant="text" width={25 + Math.random() * 75 + "%"} />
      </TableCell>
      {!hasPlayer && (
        <TableCell sx={{ pl: 1, pr: 0.5 }}>
          <Skeleton variant="text" width={90} height={24} />
        </TableCell>
      )}
      <TableCell sx={{ pl: 0.5, pr: 1 }}>
        <Skeleton variant="text" width={70} height={24} />
      </TableCell>
    </TableRow>
  );
}
function RecentSubmissionsTableRow({ submission, hasPlayer }) {
  const theme = useTheme();
  const challenge = submission.challenge;
  const new_challenge = submission.new_challenge;
  const map = challenge?.map;
  const campaign = getChallengeCampaign(challenge);
  const campaignNameSame = campaign?.name === map?.name;

  return (
    <TableRow
      key={submission.id}
      sx={{
        "&:hover": { backgroundColor: theme.palette.background.lightShade, cursor: "pointer" },
        transition: "0.1s background",
      }}
    >
      <TableCell sx={{ width: "99%", p: 0 }}>
        <Link
          to={"/submission/" + submission.id}
          style={{ display: "block", textDecoration: "none", color: "inherit", padding: "5px 4px 5px 12px" }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {challenge ? (
              <>
                <CampaignIcon campaign={campaign} />
                {!campaignNameSame && (
                  <>
                    <StyledLink to={"/campaign/" + campaign.id}>{campaign.name}</StyledLink>
                    {map && <Typography>-</Typography>}
                  </>
                )}
                {map && <StyledLink to={"/map/" + map.id}>{map.name}</StyledLink>}
                {challenge.description && (
                  <Typography variant="body2" color={theme.palette.text.secondary}>
                    [{getChallengeDescription(challenge)}]
                  </Typography>
                )}
                <ObjectiveIcon objective={challenge.objective} height="1.3em" />
              </>
            ) : (
              <Typography variant="body2" color={theme.palette.text.secondary}>
                <Tooltip
                  title={new_challenge.description ?? "This is a new challenge not yet in the database!"}
                >
                  New Challenge: {new_challenge.name}
                </Tooltip>
              </Typography>
            )}
            <SubmissionFcIcon submission={submission} height="1.3em" />
          </Stack>
        </Link>
      </TableCell>
      {!hasPlayer && (
        <TableCell align="center" sx={{ pl: 1, pr: 0.5, py: 0 }}>
          <PlayerChip player={submission.player} size="small" />
        </TableCell>
      )}
      <TableCell align="center" sx={{ p: 0 }}>
        <Link
          to={"/submission/" + submission.id}
          style={{ display: "block", textDecoration: "none", color: "inherit", padding: "4px 8px 4px 8px" }}
        >
          <DifficultyChip difficulty={challenge ? challenge.difficulty : submission.suggested_difficulty} />
        </Link>
      </TableCell>
    </TableRow>
  );
}
