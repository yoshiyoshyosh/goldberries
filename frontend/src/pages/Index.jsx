import { BasicContainerBox, BorderedBox, ErrorDisplay, LoadingSpinner } from "../components/BasicComponents";
import {
  Container,
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
import { getQueryData, useGetRecentSubmissions, useGetVerifierList } from "../hooks/useApi";
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
import { FAQData } from "../util/other_data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faNewspaper, faPaperPlane, faScroll } from "@fortawesome/free-solid-svg-icons";

export function PageIndex() {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Stack direction="column" spacing={2}>
            <BorderedBox>
              <WelcomeComponent />
            </BorderedBox>
            <BorderedBox>
              <FAQComponent />
            </BorderedBox>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Stack direction="column" spacing={2}>
            <BorderedBox>
              <RecentSubmissions />
            </BorderedBox>
            <BorderedBox>
              <UsefulLinksComponent />
            </BorderedBox>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

export function RecentSubmissions({ playerId = null }) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useLocalStorage(
    "recent_submissions_per_page_" + (playerId === null ? "general" : "player"),
    10
  );
  const [type, setType] = useLocalStorage("recent_submissions_type", "verified");
  const query = useGetRecentSubmissions(type, page, perPage, null, playerId);

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
            <VerificationStatusChip size="small" />
            <Switch checked={type === "verified"} onChange={onChangeType} />
            <VerificationStatusChip isVerified size="small" />
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
          hasPlayer={playerId !== null}
        />
      )}
    </>
  );
}

export function RecentSubmissionsTable({ data, page, perPage, setPage, setPerPage, hasPlayer = false }) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Submission</TableCell>
            {!hasPlayer && <TableCell align="center">Player</TableCell>}
            <TableCell align="center">Difficulty</TableCell>
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
              {!hasPlayer && (
                <TableCell align="center">
                  <PlayerChip player={submission.player} size="small" />
                </TableCell>
              )}
              <TableCell align="center">
                <DifficultyChip difficulty={submission.challenge.difficulty} />
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
    </TableContainer>
  );
}

export function WelcomeComponent() {
  return (
    <>
      <Typography variant="h4">Celeste Modded Done Deathless!</Typography>
      <Typography variant="body1" gutterBottom>
        The main goal of this list is to maintain all the golden clears of maps or deathless clears of map
        packs, as well as motivating people to go for goldens and making the deathless completion scene of
        Celeste more active in general. The list shows all the maps that have been completed without dying, as
        well as names of people who did the goldens. If you want to be added to the list or you know of some
        golden clears that haven't been added to the list, feel free to DM the people mentioned below. This
        list initially took an inspiration from other golden berry lists: Farewell golden list by DJTom3,
        D-Side golden list by Zerex and talia, and CC-Side golden list by Ezel142.
      </Typography>
      <Typography variant="body1" gutterBottom>
        If you have any questions or suggestions, feel free to join the Molden Team Discord server and ask
        there, or contact any of the team members directly.
      </Typography>
      <Typography variant="h6">Team Members</Typography>
      <TeamMemberList />
    </>
  );
}
export function TeamMemberList() {
  const query = useGetVerifierList();

  if (query.isLoading || query.isFetching) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const verifiers = getQueryData(query);

  return (
    <Stack direction="column" spacing={1}>
      {verifiers.map((verifier) => (
        <PlayerChip key={verifier.id} player={verifier} size="small" />
      ))}
    </Stack>
  );
}

export function UsefulLinksComponent() {
  return (
    <>
      <Typography variant="h6">Useful Links</Typography>
      <ul style={{ listStyleType: "none" }}>
        <li>
          <FontAwesomeIcon icon={faDiscord} color="#5865f2" />{" "}
          <a href="https://discord.gg/celeste" target="_blank" rel="noreferrer">
            Celeste's Discord
          </a>
        </li>
        <li>
          <FontAwesomeIcon icon={faDiscord} color="#5865f2" />{" "}
          <a href="https://discord.gg/GeJvmMycaC" target="_blank" rel="noreferrer">
            Modded Golden Team Discord
          </a>
        </li>
        <li>
          <FontAwesomeIcon icon={faScroll} />{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/1FesTb6qkgMz-dCn7YdioRydToWSQNTg1axFEIHU4FF8/edit#gid=0"
            target="_blank"
            rel="noreferrer"
          >
            Farewell Golden Collectors' List
          </a>
        </li>
        <li>
          <FontAwesomeIcon icon={faScroll} />{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/1a32h6LErb1PAyYGsIO8hY-Y1pd-3r4co3M6RnuIRTZE/edit?usp=drivesdk"
            target="_blank"
            rel="noreferrer"
          >
            Celeste Survivors List (Deathless runs of vanilla Celeste)
          </a>
        </li>
      </ul>
    </>
  );
}

export function RulesComponent() {
  return (
    <>
      <Typography variant="h4">Rules</Typography>
      <Typography variant="h6">Submissions</Typography>
      <ul>
        <li>Rule 1</li>
        <li>Rule 2</li>
        <li>Rule 3</li>
      </ul>
      <Typography variant="h6">Maps</Typography>
      <ul>
        <li>Rule 1</li>
        <li>Rule 2</li>
        <li>Rule 3</li>
      </ul>
      <Typography variant="h6">Other Stuff</Typography>
      <ul>
        <li>Rule 1</li>
        <li>Rule 2</li>
        <li>Rule 3</li>
      </ul>
    </>
  );
}

export function FAQComponent() {
  return (
    <>
      <Typography variant="h6">Frequently Asked Questions</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableBody>
            {FAQData.map((faq) => (
              <TableRow key={faq.question}>
                <TableCell>
                  <b>{faq.question}</b>
                </TableCell>
                <TableCell>{faq.answer}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
