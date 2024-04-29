import {
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  BasicBox,
  BasicContainerBox,
  ErrorDisplay,
  LoadingSpinner,
  StyledExternalLink,
  StyledLink,
} from "../components/BasicComponents";
import { GlobalStatsComponent, TiersCountDisplay } from "./Index";
import { getQueryData, useGetStats } from "../hooks/useApi";
import { useParams } from "react-router-dom";
import { ChallengeFcIcon, DifficultyChip, PlayerChip } from "../components/GoldberriesComponents";
import { getCampaignName, getMapName } from "../util/data_util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";

export function PageMonthlyRecap() {
  const { month } = useParams();

  //month is in format: YYYY-MM
  const selectedMonth = month ? month : new Date().toISOString().slice(0, 7);

  return (
    <BasicContainerBox maxWidth="md">
      <BasicBox sx={{ width: "100%" }}>
        <GlobalStatsComponent />
      </BasicBox>

      <Divider sx={{ my: 2 }} />

      <MonthlyRecap month={selectedMonth} />
    </BasicContainerBox>
  );
}

function MonthlyRecap({ month }) {
  const query = useGetStats("monthly_recap", month);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const data = getQueryData(query);
  const { tier_clears, submissions_t0, challenge_changes, newly_cleared_t3 } = data;
  console.log("Fetched:", data);

  return (
    <>
      <Typography variant="h5">Monthly Recap for '{month}'</Typography>

      <Typography variant="h6" sx={{ mt: 1 }}>
        New Clears
      </Typography>
      <TiersCountDisplay stats={tier_clears} hideEmpty equalWidths={3} />

      <Typography variant="h6" sx={{ mt: 3 }}>
        T0+ Clears
      </Typography>
      <SubmissionsT0Table submissions_t0={submissions_t0} />

      <Typography variant="h6" sx={{ mt: 3 }}>
        Newly Cleared T3+ Challenges
      </Typography>
      <SubmissionsT0Table submissions_t0={newly_cleared_t3} isFirstClear />
    </>
  );
}

function SubmissionsT0Table({ submissions_t0, isFirstClear = false }) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center">Tier</TableCell>
            <TableCell align="center">Clear</TableCell>
            <TableCell align="center">Link</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions_t0.map((submission) => {
            //if isFirstClear, submission is actually a challenge. the first clear is then in submissions[0]
            const actualSubmission = isFirstClear ? submission.submissions[0] : submission;
            const challenge = isFirstClear ? submission : actualSubmission.challenge;
            return (
              <SubmissionsT0Row
                key={actualSubmission.id}
                submission={actualSubmission}
                challenge={challenge}
                isFirstClear={isFirstClear}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
function SubmissionsT0Row({ submission, challenge, isFirstClear }) {
  const player = submission.player;
  const map = challenge.map;
  const campaign = map.campaign;
  return (
    <TableRow>
      <TableCell width={1}>
        <DifficultyChip difficulty={challenge.difficulty} useSubtierColors />
      </TableCell>
      <TableCell>
        <Stack direction="row" gap={1} alignItems="center">
          <PlayerChip player={player} size="small" />
          <span style={{ whiteSpace: "nowrap" }}>{isFirstClear ? "first cleared" : "on"}</span>
          <StyledLink to={"/campaign/" + campaign.id}>{getCampaignName(campaign)}</StyledLink>
          {map.name !== campaign.name && (
            <>
              {"/"}
              <StyledLink to={"/map/" + map.id}>{getMapName(map)}</StyledLink>
            </>
          )}
          {challenge.description && (
            <Typography variant="body2" color="textSecondary">
              [{challenge.description}]
            </Typography>
          )}
          <ChallengeFcIcon challenge={challenge} height="1.3em" />
        </Stack>
      </TableCell>
      <TableCell width={1}>
        <Stack direction="row" gap={1} alignItems="center">
          <StyledLink to={"/submission/" + submission.id}>
            <FontAwesomeIcon icon={faBook} />
          </StyledLink>
          <StyledExternalLink href={submission.proof_url} style={{ color: "inherit" }}>
            ▶
          </StyledExternalLink>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
