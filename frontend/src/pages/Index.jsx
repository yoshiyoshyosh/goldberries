import {
  BorderedBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledExternalLink,
  getErrorFromMultiple,
} from "../components/BasicComponents";
import {
  Container,
  Grid,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { getQueryData, useGetAllDifficulties, useGetStats, useGetVerifierList } from "../hooks/useApi";
import { DifficultyChip, DifficultyValueChip, PlayerChip } from "../components/GoldberriesComponents";
import { useEffect, useState } from "react";
import { FAQData } from "../util/other_data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faScroll } from "@fortawesome/free-solid-svg-icons";
import Markdown from "react-markdown";
import { Global, useTheme } from "@emotion/react";
import { RecentSubmissions } from "../components/RecentSubmissions";
import { DIFFICULTY_COLORS } from "../util/constants";

export function PageIndex() {
  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: 2,
        pb: 3,
      }}
    >
      <HeadTitle title="Welcome!" />
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Stack direction="column" spacing={2}>
            <BorderedBox>
              <WelcomeComponent />
            </BorderedBox>
            <BorderedBox>
              <GlobalStatsComponent />
            </BorderedBox>
            <BorderedBox>
              <PublicTestNotice />
            </BorderedBox>
            {/* <BorderedBox>
              <RulesComponent />
            </BorderedBox> */}
          </Stack>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Stack direction="column" spacing={2}>
            <BorderedBox>
              <RecentSubmissions />
            </BorderedBox>
            <BorderedBox>
              <UsefulLinksComponent />
            </BorderedBox>
            <BorderedBox>
              <IssueTrackerNotice />
            </BorderedBox>
            {/* <BorderedBox>
              <FAQComponent />
            </BorderedBox> */}
          </Stack>
        </Grid>
      </Grid>
    </Container>
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
  const verfiersSorted = verifiers.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Stack direction="row" gap={1} flexWrap="wrap">
      {verfiersSorted.map((verifier) => (
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
          <StyledExternalLink href="https://discord.gg/celeste" target="_blank" rel="noreferrer">
            Celeste's Discord
          </StyledExternalLink>
        </li>
        <li>
          <FontAwesomeIcon icon={faDiscord} color="#5865f2" />{" "}
          <StyledExternalLink href="https://discord.gg/GeJvmMycaC" target="_blank" rel="noreferrer">
            Modded Golden Team Discord
          </StyledExternalLink>
        </li>
        <li>
          <FontAwesomeIcon icon={faScroll} />{" "}
          <StyledExternalLink
            href="https://docs.google.com/spreadsheets/d/1FesTb6qkgMz-dCn7YdioRydToWSQNTg1axFEIHU4FF8/edit#gid=0"
            target="_blank"
            rel="noreferrer"
          >
            Farewell Golden Collectors' List
          </StyledExternalLink>
        </li>
        <li>
          <FontAwesomeIcon icon={faScroll} />{" "}
          <StyledExternalLink
            href="https://docs.google.com/spreadsheets/d/1a32h6LErb1PAyYGsIO8hY-Y1pd-3r4co3M6RnuIRTZE/edit?usp=drivesdk"
            target="_blank"
            rel="noreferrer"
          >
            Celeste Survivors List (Deathless runs of vanilla Celeste)
          </StyledExternalLink>
        </li>
      </ul>
    </>
  );
}

function RulesFaqContainer() {
  const [tab, setTab] = useState("rules");

  return (
    <>
      <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)}>
        <Tab label="Rules" value="rules" />
        <Tab label="FAQ" value="faq" />
      </Tabs>
      {tab === "rules" && <RulesComponent />}
      {tab === "faq" && <FAQComponent />}
    </>
  );
}

export function RulesComponent() {
  const theme = useTheme();
  const [markdown, setMarkdown] = useState("");

  const MarginH1 = ({ children }) => <h1 style={{ marginTop: "5px", marginBottom: "5px" }}>{children}</h1>;
  const MarginH2 = ({ children }) => <h2 style={{ marginTop: "5px", marginBottom: "5px" }}>{children}</h2>;
  const MarginOl = ({ children }) => <ol style={{ marginTop: "5px", marginBottom: "5px" }}>{children}</ol>;
  const MarginUl = ({ children }) => <ul style={{ marginTop: "5px", marginBottom: "5px" }}>{children}</ul>;
  const Anchor = ({ children, href }) => (
    <StyledExternalLink
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{ color: theme.palette.links.main }}
    >
      {children}
    </StyledExternalLink>
  );

  useEffect(() => {
    fetch("/md/rules.md")
      .then((response) => response.text())
      .then((text) => setMarkdown(text));
  }, []);

  if (markdown === "") return <LoadingSpinner />;

  return (
    <Markdown components={{ h1: MarginH1, ol: MarginOl, ul: MarginUl, h2: MarginH2, a: Anchor }}>
      {markdown}
    </Markdown>
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

function PublicTestNotice() {
  return (
    <>
      <Typography variant="h5">Public Test</Typography>
      <Typography variant="body1" gutterBottom>
        The public test for this website has started! If you want to help test the website, please do so!
        Create an account, claim your player (from the data migrated from the spreadsheet) and just look
        around and checkout all the features. Other than for the player-claiming process feel free to make
        meme submissions/suggestions, as the data currently in the system will be wiped for the actual release
        anyways.
      </Typography>
      <Typography variant="body1" gutterBottom>
        Things you can test:
      </Typography>
      <ul>
        <li>Create an account</li>
        <li>Claim your player, or create a new one (pls no meme with this)</li>
        <li>Top Golden List</li>
        <li>Campaign List</li>
        <li>Create Submissions</li>
        <li>Change your account settings</li>
        <li>Change app settings</li>
        <li>Create Suggestions and vote on them</li>
        <li>Search for stuff</li>
        <li>... and a lot more</li>
      </ul>
      <Typography variant="body1" gutterBottom>
        Please note that the current data is outdated by ~6 months and the accuracy distorted through many
        tests.
      </Typography>
    </>
  );
}

function IssueTrackerNotice() {
  return (
    <>
      <Typography variant="h5">Report Issues</Typography>
      <Typography variant="body1" gutterBottom>
        If you find any issues, please report them by either creating a{" "}
        <StyledExternalLink href="https://github.com/yoshiyoshyosh/goldberries/issues">
          new issue on GitHub
        </StyledExternalLink>{" "}
        or by @-ing viddie in the Modded Golden Team Discord server, preferably in the{" "}
        <StyledExternalLink href="https://discord.com/channels/790156040653897749/1196193088843030708">
          dedicated channel
        </StyledExternalLink>{" "}
        for this website.
      </Typography>
      <Typography variant="body1" gutterBottom>
        Known Issues (that aren't tracked on GitHub):
      </Typography>
      <ul>
        <li>The navigation kinda sucks on mobile, needs to be revamped entirely</li>
      </ul>
    </>
  );
}

export function GlobalStatsComponent() {
  const query = useGetStats("all");

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const { overall, difficulty } = getQueryData(query);
  const { campaigns, maps, challenges, submissions, players, real_campaigns } = overall;

  //difficulty is an object with key => value being id => submission count

  return (
    <>
      <Typography variant="h6">Global Stats</Typography>
      <TableContainer component={Paper} sx={{ mb: 1 }}>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell align="center">Total Campaigns</TableCell>
              <TableCell align="center">
                <b>{campaigns}</b> with <b>{campaigns - real_campaigns}</b> stand-alone maps
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center">Total Maps</TableCell>
              <TableCell align="center">
                <b>{maps}</b> with <b>{challenges}</b> Challenges
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center">Total Submissions</TableCell>
              <TableCell align="center">
                <b>{submissions}</b> from <b>{players}</b> Players
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6">Difficulty Stats</Typography>
      <Typography variant="body2" gutterBottom>
        Number of submissions in each tier
      </Typography>
      <TiersCountDisplay stats={difficulty} />
    </>
  );
}

export function TiersCountDisplay({ stats, differences, hideEmpty = false, equalWidths = 0 }) {
  const query = useGetAllDifficulties();

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const difficulties = getQueryData(query);

  return (
    <Grid container rowSpacing={1} columnSpacing={2}>
      {difficulties.map((diff) => {
        if (diff.id === 13) return null; //Skip "tier 3 (guard)"
        const count = stats[diff.id] || 0;
        const difference = differences ? differences[diff.id] : null;
        const isEmpty = count === 0;
        let width = 12;
        if (diff.id === 18 || diff.id === 19) width = 6;
        else if (diff.sort > 6) width = 4;
        else if (diff.sort > 2) width = 3;
        return (
          <Grid item key={diff.id} xs={12} md={width}>
            <DifficultyValueChip
              difficulty={diff}
              value={count + (difference ? ` (+${difference})` : "")}
              useSubtierColors
              useDarkening
              sx={{ width: 1, fontSize: "1em", opacity: isEmpty && hideEmpty ? 0.15 : 1 }}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}
