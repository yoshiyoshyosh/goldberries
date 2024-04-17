import {
  BorderedBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledExternalLink,
} from "../components/BasicComponents";
import {
  Container,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { getQueryData, useGetVerifierList } from "../hooks/useApi";
import { PlayerChip } from "../components/GoldberriesComponents";
import { useEffect, useState } from "react";
import { FAQData } from "../util/other_data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faScroll } from "@fortawesome/free-solid-svg-icons";
import Markdown from "react-markdown";
import { useTheme } from "@emotion/react";
import { RecentSubmissions } from "../components/RecentSubmissions";

export function PageIndex() {
  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: 2,
        pb: 3,
        "&&": {
          // p: 0,
        },
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
              <RulesComponent />
            </BorderedBox>
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
              <FAQComponent />
            </BorderedBox>
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
    <Stack direction="row" spacing={1}>
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
